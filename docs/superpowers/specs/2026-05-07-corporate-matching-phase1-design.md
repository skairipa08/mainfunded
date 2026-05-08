# Corporate Matching System — Phase 1 Design

**Date:** 2026-05-07
**Status:** Draft (pending spec review)
**Phase:** 1 of 3 (Foundation)

## Purpose

Phase 1 establishes the data layer, company onboarding, and the pure matching engine that Phase 2 (employee activation + approval workflow) and Phase 3 (dashboard wiring + ESG PDF + sponsor badges) will build on.

This is one of three sub-projects decomposed from the original brief, which described 8+ independent subsystems that cannot fit a single spec.

## Phase 1 boundary

**In scope:**
- `Company` and `MatchingRule` Prisma models
- Self-service company signup with single-owner account model
- Admin approval workflow (`PENDING` → `APPROVED` / `REJECTED`)
- `MatchingRule` CRUD UI (`/corporate/settings/matching-rule`)
- Pure matching engine as a side-effect-free function
- `POST /api/corporate/matching/simulate` for engine smoke-testing
- Email templates for budget thresholds (rendered + tested, **not triggered** in Phase 1)

**Out of scope (later phases):**
- Employee activation code system
- Live donation trigger that creates `MatchingTransaction` records
- Owner approval/rejection workflow on real transactions
- Dashboard data binding (existing `app/api/corporate/dashboard` keeps mock data)
- Annual ESG PDF report
- "Supported by X" sponsor badges on campaign cards
- Multi-user company teams (admin/manager/viewer roles)

## Stack note

The original brief mentioned PostgreSQL; the project actually uses **MongoDB + Prisma**. Phase 1 uses MongoDB without migration. If a PostgreSQL move is needed later, it is a separate, project-wide decision.

## Architecture decisions

| Decision | Choice | Rationale |
|---|---|---|
| Onboarding model | Self-service + single owner | Production-ready; team/multi-user deferred |
| Matching rule cardinality | One rule per company | Covers ~90% of CSR cases; category differentiation can be added later |
| Budget exhaustion | Hard reject + 80%/100% email alerts | Predictable; pro-rata creates user-confusion |
| Engine boundary | Pure function + simulate API | Unit-testable; live trigger lives in Phase 2 |
| Data layer | Hybrid Prisma | New models in `schema.prisma`; existing `User` collection stays MongoDB-native |
| `MatchingTransaction` model | Defined in Phase 2 only | YAGNI — never written in Phase 1; MongoDB+Prisma migration is free |

## File layout

```
prisma/schema.prisma                                       # Company, MatchingRule appended
lib/corporate/
  matching-engine.ts                                       # NEW — pure simulate() fn
  company-repo.ts                                          # NEW — Prisma wrappers
  matching-rule-repo.ts                                    # NEW
  validators.ts                                            # NEW — zod schemas
  email-templates.ts                                       # NEW — 80%/100% (not triggered)
  types.ts                                                 # NEW — SimulateInput/Result types
  mock-data.ts                                             # EXISTING — untouched (Phase 3 binds)
lib/authz.ts                                               # +requireCompanyOwner, +requireApprovedCompanyOwner, +requireAdmin
types/next-auth.d.ts                                       # +role, +companyId on session
app/[locale]/corporate/
  signup/page.tsx                                          # NEW
  login/page.tsx                                           # NEW
  pending/page.tsx                                         # NEW
  settings/profile/page.tsx                                # NEW
  settings/matching-rule/page.tsx                          # NEW
app/[locale]/admin/corporate/page.tsx                      # NEW
app/api/corporate/
  signup/route.ts                                          # NEW
  me/route.ts                                              # NEW (GET, PATCH)
  matching-rule/route.ts                                   # NEW (GET, PUT)
  matching/simulate/route.ts                               # NEW
app/api/admin/corporate/
  companies/route.ts                                       # NEW (GET ?status=PENDING)
  companies/[id]/approve/route.ts                          # NEW (POST)
components/corporate/
  SignupForm.tsx                                           # NEW
  LoginForm.tsx                                            # NEW
  ProfileForm.tsx                                          # NEW
  MatchingRuleForm.tsx                                     # NEW
  PendingBanner.tsx                                        # NEW
  AdminCompanyList.tsx                                     # NEW
  AdminCompanyRow.tsx                                      # NEW
  AuthGate.tsx, Header.tsx, Sidebar.tsx, StatCard.tsx      # EXISTING — Sidebar gets new links
messages/{tr,en}.json                                      # +corporate.*, +admin.corporate.*
__tests__/
  lib/corporate/matching-engine.test.ts
  lib/corporate/validators.test.ts
  lib/corporate/email-templates.test.ts
  api/corporate/signup.test.ts
  api/corporate/matching-rule.test.ts
  api/corporate/simulate.test.ts
  api/admin/corporate-approve.test.ts
```

Existing `app/api/corporate/{dashboard,donations,esg,reports,students,notifications}` endpoints keep returning `lib/corporate/mock-data.ts`. They are out of Phase 1 scope.

No new packages are introduced. All dependencies (Prisma, zod, NextAuth, Resend, bcryptjs, react-hook-form, vitest) already exist in `package.json`.

## Data models

Appended to `prisma/schema.prisma`:

```prisma
model Company {
  id              String          @id @default(auto()) @map("_id") @db.ObjectId
  name            String
  legalName       String?
  taxId           String          @unique
  logoUrl         String?
  contactEmail    String
  contactPhone    String?
  websiteUrl      String?
  ownerUserId     String          @unique
  status          CompanyStatus   @default(PENDING)
  approvedAt      DateTime?
  approvedBy      String?
  rejectedReason  String?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  matchingRule    MatchingRule?

  @@index([ownerUserId])
  @@index([status])
  @@map("companies")
}

enum CompanyStatus {
  PENDING
  APPROVED
  REJECTED
  SUSPENDED
}

model MatchingRule {
  id                  String    @id @default(auto()) @map("_id") @db.ObjectId
  companyId           String    @unique @db.ObjectId
  company             Company   @relation(fields: [companyId], references: [id])
  ratio               Int
  monthlyBudgetTRY    Int
  eligibleCategories  String[]
  active              Boolean   @default(true)
  effectiveFrom       DateTime  @default(now())
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  @@map("matching_rules")
}
```

**Field constraints (zod-enforced in `lib/corporate/validators.ts`):**
- `ratio` ∈ {1, 2, 3}
- `monthlyBudgetTRY` ≥ 1
- `eligibleCategories` ⊆ `['tuition', 'books', 'laptop', 'housing', 'travel', 'emergency']` (must match `lib/validators/campaign.ts:7` enum)

**Existing User collection (MongoDB-native, no Prisma model):**
- New field `role: 'DONOR' | 'STUDENT' | 'ADMIN' | 'COMPANY_OWNER'` (default `DONOR` if absent)
- Surfaced in NextAuth session via callback; typed in `types/next-auth.d.ts`

## Routes and components

### Page routes (under `app/[locale]/`)

| Route | Access | Purpose |
|---|---|---|
| `/corporate/signup` | Public | Company registration form |
| `/corporate/login` | Public | NextAuth credentials login |
| `/corporate/pending` | Auth + status:PENDING | "Awaiting admin approval" landing |
| `/corporate/settings/profile` | Auth + status:APPROVED | Company profile editor |
| `/corporate/settings/matching-rule` | Auth + status:APPROVED | Matching rule editor |
| `/admin/corporate` | Auth + role:ADMIN | Approve/reject queue |

### API routes

| Method + path | Auth | Purpose |
|---|---|---|
| `POST /api/corporate/signup` | Public | Create User + Company (PENDING) |
| `GET /api/corporate/me` | COMPANY_OWNER | Returns `{company, matchingRule}` |
| `PATCH /api/corporate/me` | COMPANY_OWNER + APPROVED | Update mutable profile fields (allow-list below) |
| `GET /api/corporate/matching-rule` | COMPANY_OWNER + APPROVED | Returns rule or null |
| `PUT /api/corporate/matching-rule` | COMPANY_OWNER + APPROVED | Upsert rule |
| `POST /api/corporate/matching/simulate` | COMPANY_OWNER + APPROVED | Run engine |
| `GET /api/admin/corporate/companies` | ADMIN | `?status=PENDING` queue |
| `POST /api/admin/corporate/companies/[id]/approve` | ADMIN | Decision + reason |

All endpoints follow the existing pattern from `app/api/corporate/dashboard/route.ts:14-44`:
- `withRateLimit(request, RATE_LIMITS.api)` first
- New authz helpers (see Auth section)
- zod validation from `lib/corporate/validators.ts`
- Response envelope `{ success, data, meta }` or `{ success: false, error }`

## Matching engine

**Pure function** — `lib/corporate/matching-engine.ts`:

```ts
export type SimulateInput = {
  donationAmountTRY: number;
  category: string;
  rule: MatchingRule;
  spentInPeriodTRY: number;
};

export type SimulateResult =
  | { matched: true;  matchedAmountTRY: number; ratioApplied: number; remainingBudgetTRY: number }
  | { matched: false; reason: 'RULE_INACTIVE' | 'CATEGORY_INELIGIBLE' | 'BUDGET_EXHAUSTED' | 'INVALID_INPUT' };

export function simulate(input: SimulateInput): SimulateResult;
```

**Deterministic order:**
1. `donationAmountTRY <= 0` → `INVALID_INPUT`
2. `rule.active === false` → `RULE_INACTIVE`
3. `!rule.eligibleCategories.includes(category)` → `CATEGORY_INELIGIBLE`
4. `wouldMatch = donationAmount * rule.ratio`
5. `remaining = rule.monthlyBudgetTRY - spentInPeriodTRY`
6. `remaining <= 0` → `BUDGET_EXHAUSTED`
7. `wouldMatch > remaining` → `BUDGET_EXHAUSTED` (hard reject; no pro-rata)
8. Otherwise `{ matched: true, matchedAmountTRY: wouldMatch, ratioApplied: rule.ratio, remainingBudgetTRY: remaining - wouldMatch }`

The engine has zero I/O. The simulate API resolves `rule` and `spentInPeriodTRY` before calling `simulate()`.

**`NO_RULE_DEFINED`** is an API-layer error, not an engine result — the engine requires `rule: MatchingRule` and never sees the "no rule" case.

**Phase 1 `spentInPeriodTRY` is always 0** because no `MatchingTransaction` records exist yet. Phase 2 will replace this with a real aggregation over `MatchingTransaction` filtered by `companyId`, `periodKey`, and `status: APPROVED`.

**Period key format:** `'YYYY-MM'` (e.g. `'2026-05'`), generated server-side. Computed in **Europe/Istanbul timezone** (the platform's primary market) using `Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit' })` so the month boundary aligns with local CSR reporting expectations. Phase 2 budget aggregations and end-of-month tests must use the same helper (`lib/corporate/period.ts:periodKey(date)`).

### Simulate API

`POST /api/corporate/matching/simulate`:
- Body: `{ donationAmountTRY: number, category: string }`
- Auth: `requireApprovedCompanyOwner()`
- Resolves rule via `prisma.matchingRule.findUnique({ where: { companyId } })`
- Returns `404 NO_RULE_DEFINED` if missing
- Otherwise calls `simulate()` with `spentInPeriodTRY: 0` and returns `SimulateResult`

This API is for engine validation/QA, not user-facing operation. Phase 2's live trigger will use the same engine function.

## Email templates (Phase 1 prepared, not triggered)

`lib/corporate/email-templates.ts` exports:
- `budgetThreshold80(company, spent, limit)`
- `budgetThresholdReached(company, periodKey)`

Built with `@react-email/components` (already in dependencies). Phase 1 only renders + snapshot-tests them. Phase 2's transaction trigger calls `sendBudgetAlert()` (also Phase 2) which uses these templates via Resend.

## Auth and authorization

### Signup flow (`POST /api/corporate/signup`)

1. Validate body via zod (`name`, `taxId`, `contactEmail`, `password`, optional `legalName`, `contactPhone`, `websiteUrl`, `logoUrl`)
2. Check `Company.taxId` uniqueness (Prisma `@unique`) — return 409 if duplicate
3. Check User email uniqueness in MongoDB native — return 409 if duplicate
4. `bcrypt.hash(password)` → create User: `{ email, passwordHash, role: 'COMPANY_OWNER', emailVerified: null }`
5. Create Company: `{ ownerUserId: user._id, status: 'PENDING', ...formData }` via Prisma
6. **Compensation pattern** (no MongoDB transaction): if step 5 fails, delete the User created in step 4. Replica-set transactions are not assumed (most local dev runs standalone MongoDB). If the compensation `User.delete` *also* fails (rare — connection lost mid-rollback), log a structured error via `lib/logger.ts` with tag `signup.orphan_user` containing the User `_id`; an admin can clean up manually. Phase 1 does not auto-recover this case.
7. Response: `{ companyId, status: 'PENDING' }`. **No auto-login** — user is sent to `/corporate/login`

### Login redirect (server-side, NextAuth callback)

On sign-in, the JWT callback resolves the user's company status **once** and stamps `companyId` and `companyStatus` into the JWT. Subsequent requests read these from the session token without re-querying the DB. Status changes (admin approval, rejection) require the user to re-login to refresh their JWT — acceptable trade-off in Phase 1 (status transitions are infrequent).

Redirect targets:
- `PENDING` → `/corporate/pending`
- `APPROVED` → `/corporate/settings/matching-rule`
- `REJECTED` → `/corporate/login?error=rejected` (shows `rejectedReason`)
- `SUSPENDED` → `/corporate/login?error=suspended`

Existing `middleware.ts` (i18n + auth gate) is not modified.

### New authz helpers (added to `lib/authz.ts`)

```ts
export async function requireCompanyOwner(): Promise<{ user: User; company: Company }>
export async function requireApprovedCompanyOwner(): Promise<{ user: User; company: Company }>
export async function requireAdmin(): Promise<User>
```

Helpers return `{ user, company }` only — they do **not** preload `MatchingRule`. Routes that need the rule (`GET /api/corporate/me`, `PUT /api/corporate/matching-rule`, `POST /api/corporate/matching/simulate`) fetch it explicitly via `prisma.matchingRule.findUnique({ where: { companyId } })`. This keeps the helper lightweight and routes' DB access explicit.

Each throws on failure; routes catch and translate to 401/403 via the existing `lib/api-error.ts` pattern.

### Admin approval (`POST /api/admin/corporate/companies/[id]/approve`)

- `requireAdmin()`
- Body: `{ decision: 'APPROVE' | 'REJECT', reason?: string }` — zod refinement: `reason` is **required when `decision === 'REJECT'`**, optional when `APPROVE`
- `APPROVE`: sets `status = 'APPROVED'`, `approvedAt = now()`, `approvedBy = adminUserId`. **No empty `MatchingRule` is auto-created** — owner creates it via PUT (first call = upsert insert)
- `REJECT`: sets `status = 'REJECTED'`, `rejectedReason = reason`. No email triggered in Phase 1 (Phase 2 will send a notification)

### `PATCH /api/corporate/me` mutable field allow-list

Mutable post-approval (validated in `lib/corporate/validators.ts`):
- `name`, `legalName`, `logoUrl`, `contactEmail`, `contactPhone`, `websiteUrl`

**Immutable** (rejected with 400 if present in body):
- `taxId` — would let an approved company swap legal identity, bypassing admin re-approval
- `ownerUserId`, `status`, `approvedAt`, `approvedBy`, `rejectedReason`, `id`, `createdAt`, `updatedAt`

zod schema uses `.strict()` and the mutable allow-list explicitly so unknown keys are rejected.

## Testing strategy

Vitest is already configured (`vitest.config.ts`). No new packages.

### Unit tests

| File | Coverage |
|---|---|
| `__tests__/lib/corporate/matching-engine.test.ts` | Every `simulate()` branch: matched, RULE_INACTIVE, CATEGORY_INELIGIBLE, BUDGET_EXHAUSTED (zero remaining), BUDGET_EXHAUSTED (insufficient remaining), INVALID_INPUT (zero/negative). `remainingBudgetTRY` correctness. |
| `__tests__/lib/corporate/validators.test.ts` | zod schemas: signup, matching-rule (ratio ∈ {1,2,3}, budget > 0, categories subset of 6), simulate body. Boundary + invalid inputs. |
| `__tests__/lib/corporate/email-templates.test.ts` | Snapshot render of both threshold templates — verify company name, periodKey, amounts appear. |

### Integration tests (API routes)

| File | Coverage |
|---|---|
| `__tests__/api/corporate/signup.test.ts` | Valid signup → User + Company created with status PENDING. Duplicate `taxId` → 409. Duplicate email → 409. Invalid body → 400. Compensation: Company creation failure → User deleted. |
| `__tests__/api/corporate/matching-rule.test.ts` | Auth: anonymous → 401, DONOR role → 403, PENDING company → 403. PUT first call → upsert insert; second call → update. GET with no rule → null. |
| `__tests__/api/corporate/simulate.test.ts` | APPROVED + rule → matched. No rule → `NO_RULE_DEFINED`. One test each for `RULE_INACTIVE` and `CATEGORY_INELIGIBLE`. |
| `__tests__/api/admin/corporate-approve.test.ts` | Non-admin → 403. APPROVE → status APPROVED + `approvedAt` set. REJECT + reason → status REJECTED + `rejectedReason` set. |

### Test isolation

**Decision:** Phase 1 unit tests for `matching-engine`, `validators`, and `email-templates` use **no DB** (pure functions / pure renders). API integration tests use a **mocked Prisma client** via `vi.mock('@/lib/prisma')` returning in-memory fixtures, plus `vi.mock('next-auth')` for session injection. This avoids requiring a running MongoDB during `npm run test` and matches the lightest pattern in the repo. The first task of the implementation plan is a 5-minute scan of `__tests__/` to confirm — if integration tests in the repo already require a real DB, the plan adopts that instead. The decision is bounded: pick the established pattern, do not invent a third.

### Manual smoke test (after implementation)

`npm run dev` and walk through:
1. `/corporate/signup` → register → redirected to `/corporate/login`
2. Login → `/corporate/pending`
3. Admin login → `/admin/corporate` → approve the company
4. Re-login as company owner → `/corporate/settings/matching-rule` → save rule
5. `POST /api/corporate/matching/simulate` (curl) → `matched: true`
6. Set rule `active: false` → simulate returns `RULE_INACTIVE`

### Not tested in Phase 1

- Logo upload (delegated to existing `/api/uploads` contract)
- Email delivery (templates only render-tested; live send is Phase 2)

## Open follow-ups for later phases

- **Phase 2:** Employee activation code, donation trigger, owner approval workflow on real `MatchingTransaction` records, email delivery for thresholds and approval requests
- **Phase 3:** Bind existing `app/api/corporate/{dashboard,reports,esg}` endpoints to real Company data, generate annual ESG PDF, render "Supported by X" badges on `components/CampaignCard.tsx`
