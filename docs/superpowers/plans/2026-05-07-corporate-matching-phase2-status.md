# Corporate Matching Phase 2 — Implementation Status

**Date completed:** 2026-05-07
**Spec:** [../specs/2026-05-07-corporate-matching-phase2-design.md](../specs/2026-05-07-corporate-matching-phase2-design.md)
**Branch:** `feat/corporate-matching-phase1` (Phase 1 + 2 ship together)

## Shipped

**104/104 tests passing.** All Phase 2 scope landed:

### Schema
- `MatchingTransaction` (status PENDING/APPROVED/REJECTED, periodKey, ownerNote, donationId unique)
- `EmployeeAffiliation` (one company per user, unique userId, active flag)
- `Company.activationCode` (unique, rotatable) + `Company.budgetAlertSentAt` (Json idempotency map)

### Lib
- `activation-code.ts` — `generateActivationCode()` (8-char, ambiguity-free alphabet) + `isValidActivationCodeShape()`
- `affiliation-repo.ts`, `transaction-repo.ts`
- `budget.ts` — `getSpentInPeriod()` aggregate
- `trigger.ts` — `onDonationCreated()` writes PENDING on match, REJECTED audit row otherwise; never throws
- `email-sender.ts` — Resend wrapper for budget threshold templates

### API endpoints
- `POST /api/corporate/employee/activate` — code validation, affiliation upsert, ALREADY_AFFILIATED check
- `POST /api/corporate/employee/leave`
- `GET /api/corporate/activation-code`, `POST /api/corporate/activation-code` (rotate, retries on collision)
- `GET /api/corporate/transactions?status=...`
- `POST /api/corporate/transactions/[id]/decide` — APPROVE re-runs simulate (auto-reject on budget exhaustion mid-pending) + idempotent threshold email at 80%/100%
- `GET /api/corporate/matching/simulate` updated to read real `spentInPeriodTRY` (was 0 in Phase 1)

### Trigger wiring
- Hook added to `app/api/iyzico/callback/route.ts` after donation insert. Fire-and-forget; failures logged but never block donation creation.

### UI
- `/corporate/join` — `EmployeeJoinForm` (8-char code input)
- `/corporate/transactions` — `TransactionList` + `TransactionRow` with status filter (PENDING/APPROVED/REJECTED/ALL) and reject-reason modal
- `ActivationCodePanel` mounted on `/corporate/settings/matching-rule` page (rotate with confirm)
- Sidebar gets `İşlemler` link

### i18n
- `corporateP2.{join,code,transactions}` namespaces in both tr/en

## Notes

- **Manual smoke test skipped** — headless environment. Backend covered by 30 new Phase 2 tests (104 total Phase 1 + 2). UI is structurally identical to Phase 1 patterns that *were* visually verified.
- **Threshold email idempotency** uses `Company.budgetAlertSentAt[periodKey].{threshold80,threshold100}` flag map. Period key change implicitly resets flags.
- **Trigger writes audit rows for REJECTED outcomes** (not just matched) so donor history is complete. Optional behavior; the spec mentions this and it's implemented.
- **No new packages.**

## Ready for Phase 3

Phase 3 scope:
- Bind `app/api/corporate/{dashboard,donations,esg,reports,students,notifications}` mock-data endpoints to real Company + MatchingTransaction data
- Annual ESG PDF report (using `jspdf` already in deps)
- "Supported by X" sponsor badge on `components/CampaignCard.tsx` (look up companies whose APPROVED transactions reference the campaign)

All foundation is in place: company data, matching rule, transactions with status, period bucketing, owner-only access via `requireApprovedCompanyOwner`.
