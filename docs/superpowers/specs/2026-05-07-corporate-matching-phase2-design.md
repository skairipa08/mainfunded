# Corporate Matching System — Phase 2 Design

**Date:** 2026-05-07
**Phase:** 2 of 3 (Activation + live trigger + owner approval)
**Builds on:** [Phase 1 spec](./2026-05-07-corporate-matching-phase1-design.md), shipped on `feat/corporate-matching-phase1`.

## Purpose

Phase 1 shipped the foundation: data layer, onboarding, admin approval, MatchingRule CRUD, pure engine, simulate API. Phase 2 wires the engine to real donations and makes the matching program **live**: employees opt in, donations trigger the engine automatically, the company owner approves or rejects each match, and approved transactions consume the monthly budget.

## Phase 2 boundary

**In scope:**
- `MatchingTransaction` Prisma model + repo
- `EmployeeAffiliation` model — links one User to one Company via activation code
- `Company.activationCode` field — single rotating code per company
- Employee activation flow: `/corporate/join` page where employees enter the code; `POST /api/corporate/employee/activate`
- Owner-side activation code management: view + rotate, on `/corporate/settings/matching-rule` (or dedicated tab)
- Live trigger hook called from donation creation: takes `(donationId, donorUserId, campaignId, amount, category)` and creates a PENDING `MatchingTransaction` if eligible
- Owner approval queue: `/corporate/transactions` page lists PENDING transactions; APPROVE / REJECT each
- Budget aggregation: `simulate()` and the trigger now compute `spentInPeriodTRY` from APPROVED transactions in current period
- Email delivery (Resend) — actually send the threshold templates from Phase 1 when a transaction crosses 80% or 100% of `monthlyBudgetTRY`
- Tests: full branch coverage on trigger + approval workflow

**Out of scope (Phase 3):**
- Dashboard data binding (existing `/api/corporate/dashboard` keeps mock data until Phase 3)
- "Supported by X" sponsor badge on `components/CampaignCard.tsx`
- Annual ESG PDF generator
- Multi-employee/team management for companies
- Per-period bonus matching, multi-currency

## Decisions (made without further input — all reversible)

| Decision | Choice | Why |
|---|---|---|
| Activation code shape | One rotating per-company code, format `[A-Z0-9]{8}` | Simple, employees can paste it; rotation invalidates leaked codes (existing affiliations are unaffected) |
| EmployeeAffiliation cardinality | One company per user (unique `userId`) | Simplest mental model; multi-company affiliation is a v3 concern |
| Activation reversal | Employee can leave (sets `active=false`) | Required for compliance / employees changing jobs |
| Trigger location | New helper `lib/corporate/trigger.ts:onDonationCreated()` called from existing donation creation path | Minimal coupling; donation flow remains the source of truth |
| Trigger failure mode | Trigger errors are logged but **never** block the donation | Donations must succeed even if matching is broken |
| Approval status enum | `PENDING → APPROVED \| REJECTED` (terminal); `EXPIRED` after 30 days uncategorized | Owner inaction shouldn't block budget; auto-expire is a Phase 3 cron candidate but Phase 2 just exposes the field, no auto-cron yet |
| Budget recheck on approve | Re-run `simulate()` at approve time with fresh `spentInPeriodTRY` | Owner could approve out-of-order; recheck prevents over-spend |
| Email delivery | `lib/corporate/email-sender.ts` wraps Resend; threshold-emit logic owns "fire once per threshold per period" via `Company.budgetAlertSentAt[periodKey]` map | Idempotent — owners do not get spammed |
| Period crossing | When `periodKey` changes, threshold flags reset implicitly because we key by period | No cron needed |

## Data model changes

Append to `prisma/schema.prisma`:

```prisma
model MatchingTransaction {
  id                  String                @id @default(auto()) @map("_id") @db.ObjectId
  companyId           String                @db.ObjectId
  company             Company               @relation(fields: [companyId], references: [id])
  ruleId              String                @db.ObjectId
  donationId          String                @unique @db.ObjectId  // 1:1 — never two transactions for same donation
  campaignId          String                @db.ObjectId
  donorUserId         String
  category            String
  donationAmountTRY   Int
  matchedAmountTRY    Int
  ratioApplied        Int
  status              MatchingStatus        @default(PENDING)
  rejectReason        String?
  ownerNote           String?
  approvedAt          DateTime?
  rejectedAt          DateTime?
  periodKey           String                // 'YYYY-MM' Europe/Istanbul
  createdAt           DateTime              @default(now())

  @@index([companyId, periodKey, status])
  @@index([companyId, status])
  @@index([donorUserId])
  @@map("matching_transactions")
}

enum MatchingStatus {
  PENDING
  APPROVED
  REJECTED
}

model EmployeeAffiliation {
  id            String    @id @default(auto()) @map("_id") @db.ObjectId
  userId        String    @unique  // → MongoDB User._id
  companyId     String    @db.ObjectId
  company       Company   @relation(fields: [companyId], references: [id])
  active        Boolean   @default(true)
  activatedAt   DateTime  @default(now())
  deactivatedAt DateTime?

  @@index([companyId, active])
  @@map("employee_affiliations")
}
```

Add to existing `Company` model:

```prisma
model Company {
  // ... existing fields
  activationCode      String?               @unique  // rotates; null until first generation
  budgetAlertSentAt   Json?                 // { "2026-05": { "threshold80": true, "threshold100": false } }
  affiliations        EmployeeAffiliation[]
  transactions        MatchingTransaction[]
}
```

(`Json?` field on MongoDB is supported as a `Bson` document; Prisma maps it to JS object.)

## File layout (additions)

```
lib/corporate/
  trigger.ts                              # NEW — onDonationCreated() entry point
  transaction-repo.ts                     # NEW — Prisma wrappers
  affiliation-repo.ts                     # NEW
  activation-code.ts                      # NEW — generate + rotate code
  email-sender.ts                         # NEW — Resend wrapper for budget threshold emails
  budget.ts                               # NEW — getSpentInPeriod(companyId, periodKey)
app/api/corporate/
  employee/activate/route.ts              # NEW — POST { code }
  employee/leave/route.ts                 # NEW — POST (deactivate own affiliation)
  activation-code/route.ts                # NEW — GET (return current), POST (rotate)
  transactions/route.ts                   # NEW — GET ?status=PENDING|APPROVED|REJECTED
  transactions/[id]/decide/route.ts       # NEW — POST { decision, reason?, ownerNote? }
app/[locale]/corporate/
  join/page.tsx                           # NEW — employee enters code
  transactions/page.tsx                   # NEW — owner approval queue
components/corporate/
  EmployeeJoinForm.tsx                    # NEW
  ActivationCodePanel.tsx                 # NEW — show + rotate
  TransactionList.tsx                     # NEW
  TransactionRow.tsx                      # NEW
__tests__/
  lib/corporate/trigger.test.ts
  lib/corporate/budget.test.ts
  lib/corporate/activation-code.test.ts
  api/corporate/employee-activate.test.ts
  api/corporate/transactions.test.ts
  api/corporate/decide-transaction.test.ts
```

Hook into existing donation flow: **find** the place where a Donation is inserted into MongoDB and add a fire-and-forget call to `onDonationCreated(...)`. The implementation plan's first task is to locate that file.

## Trigger contract

```ts
// lib/corporate/trigger.ts
export type DonationCreatedEvent = {
  donationId: string;
  donorUserId: string;
  campaignId: string;
  amountTRY: number;
  category: string;
};

export async function onDonationCreated(event: DonationCreatedEvent): Promise<void>;
```

**Behavior:**
1. Look up `EmployeeAffiliation` for `donorUserId`. If none or `active === false` → return silently.
2. Look up `Company` by affiliation. If `status !== 'APPROVED'` → return silently.
3. Look up `MatchingRule` by company. If null or `active === false` → return silently.
4. Compute `periodKey` and `spentInPeriodTRY` (aggregate APPROVED transactions in this period).
5. Run `simulate({ donationAmountTRY: amountTRY, category, rule, spentInPeriodTRY })`.
6. **All cases write a row** — including `INVALID_INPUT` / `RULE_INACTIVE` / etc.:
   - If `matched: true` → insert `MatchingTransaction { status: PENDING, matchedAmountTRY, ratioApplied }`
   - If `matched: false` → insert `MatchingTransaction { status: REJECTED, rejectReason, matchedAmountTRY: 0, ratioApplied: rule.ratio }` so the donor still sees an audit row in their history
7. Errors caught and logged via `lib/logger.ts`; **never throw**.

Trigger never sends emails — email is owner-side, fired by approval (see below).

## Approval workflow

`POST /api/corporate/transactions/[id]/decide`:
- `requireApprovedCompanyOwner()` enforces company match against `MatchingTransaction.companyId`.
- Body: `{ decision: 'APPROVE' | 'REJECT', reason?: string, ownerNote?: string }`. zod refinement: `reason` required when `REJECT`.
- Idempotency: only PENDING transactions can be decided. Decided ones return 409.
- On APPROVE:
  1. **Re-run `simulate()`** with current `spentInPeriodTRY`. If now `BUDGET_EXHAUSTED`, write `status: REJECTED, rejectReason: 'BUDGET_EXHAUSTED_AT_APPROVAL'` and return that to UI.
  2. Otherwise update to `APPROVED`, set `approvedAt`.
  3. Compute new `spentInPeriodTRY` (incl. the just-approved match). Check thresholds:
     - 80%-100% range → check `Company.budgetAlertSentAt[periodKey].threshold80` flag; if false, send `BudgetThreshold80Email`, set flag.
     - ≥ 100% → check `threshold100` flag; if false, send `BudgetThresholdReachedEmail`, set flag.
- On REJECT: set `status: REJECTED`, `rejectedAt`, store `reason`, `ownerNote`. No emails.

## Budget aggregation

`lib/corporate/budget.ts`:

```ts
export async function getSpentInPeriod(
  companyId: string,
  periodKey: string
): Promise<number>;
```

Uses Prisma aggregate: `prisma.matchingTransaction.aggregate({ where: { companyId, periodKey, status: 'APPROVED' }, _sum: { matchedAmountTRY: true } })`.

## Email sender

`lib/corporate/email-sender.ts`:

```ts
export async function sendBudgetAlert(
  kind: '80' | '100',
  company: Company,
  periodKey: string,
  spentTRY: number
): Promise<void>;
```

Uses `Resend` SDK (existing `lib/email-service.ts` may already wrap it — check on first task). Pure email infrastructure call; idempotency is the caller's responsibility (managed via `Company.budgetAlertSentAt`).

## Auth changes

- **No new role.** Employees keep their existing role (typically `'user'` for donors).
- Session does NOT carry affiliation info — every donation lookup re-queries `EmployeeAffiliation` (cheap with index, infrequent path).
- Owner approval routes use `requireApprovedCompanyOwner()` from Phase 1.

## i18n additions

`messages/{tr,en}.json`:
- `corporate.join.*` — page title, code field, success/error
- `corporate.activationCode.*` — current code, rotate button
- `corporate.transactions.*` — list headers, approve/reject buttons, status labels, reasons
- `corporate.errors.*` — `INVALID_CODE`, `ALREADY_AFFILIATED`, `COMPANY_NOT_APPROVED`, `BUDGET_EXHAUSTED_AT_APPROVAL`

## Testing strategy

Same vitest pattern as Phase 1 (`vi.mock('../../../lib/prisma')`, etc.). New tests:

- `trigger.test.ts` — every branch of `onDonationCreated`: no affiliation, deactivated affiliation, company not approved, no rule, rule inactive, category ineligible, budget exhausted, matched. Verify rows are written with correct status.
- `budget.test.ts` — aggregate sums correctly with mocked Prisma.
- `activation-code.test.ts` — generated codes match `[A-Z0-9]{8}`, rotation produces a different code.
- `employee-activate.test.ts` — invalid code → 400, already affiliated → 409, valid → creates affiliation.
- `transactions.test.ts` — owner sees only their company's; status filter works.
- `decide-transaction.test.ts` — pending → approve flow, pending → reject (with/without reason), already-decided → 409, budget recheck path, threshold email fired exactly once per period.

## Migration / no breaking changes

- Phase 1 endpoints remain unchanged.
- The simulate API in Phase 1 still works; in Phase 2 it now reads real `spentInPeriodTRY` instead of always 0. This is a behavior change but no API contract change.
- No data migration needed (MongoDB schemas grow forward).
