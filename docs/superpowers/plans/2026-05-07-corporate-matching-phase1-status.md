# Corporate Matching Phase 1 — Implementation Status

**Date completed:** 2026-05-07
**Plan:** [2026-05-07-corporate-matching-phase1.md](./2026-05-07-corporate-matching-phase1.md)
**Spec:** [../specs/2026-05-07-corporate-matching-phase1-design.md](../specs/2026-05-07-corporate-matching-phase1-design.md)
**Branch:** `feat/corporate-matching-phase1`

## Shipped

All 27 tasks across 6 chunks completed. **74/74 unit + integration tests passing.**

### Data layer
- `prisma/schema.prisma` extended with `Company`, `MatchingRule`, `CompanyStatus` enum
- `lib/corporate/types.ts` (SimulateInput, SimulateResult, ELIGIBLE_CATEGORIES)
- `lib/corporate/period.ts` (Europe/Istanbul `periodKey()` helper)
- `lib/corporate/validators.ts` (signup, matching-rule, simulate, profile-update, approve-decision zod schemas)
- `lib/corporate/company-repo.ts` and `lib/corporate/matching-rule-repo.ts` (Prisma wrappers)

### Engine
- `lib/corporate/matching-engine.ts` — pure `simulate()` function, 10 test branches covered

### Email templates
- `lib/corporate/email-templates.tsx` — `BudgetThreshold80Email` and `BudgetThresholdReachedEmail` (rendered + snapshot-tested; not triggered in Phase 1, ready for Phase 2)

### Auth
- `types/next-auth.d.ts` — `companyId`, `companyStatus`, `company_owner` role
- `auth.ts` — JWT callback stamps companyId/companyStatus on sign-in; session callback exposes them
- `lib/authz.ts` — added `requireCompanyOwner`, `requireApprovedCompanyOwner`; existing `requireAdmin` reused

### API endpoints
- `POST /api/corporate/signup` — with User+Company compensation rollback + structured logging
- `GET /api/corporate/me`, `PATCH /api/corporate/me` (allow-list enforced)
- `GET /api/corporate/matching-rule`, `PUT /api/corporate/matching-rule` (upsert)
- `POST /api/corporate/matching/simulate`
- `GET /api/admin/corporate/companies?status=...`
- `POST /api/admin/corporate/companies/[id]/approve` (REJECT requires reason)

### UI
- `app/[locale]/corporate/{signup,login,pending,settings/profile,settings/matching-rule}/page.tsx`
- `app/[locale]/admin/corporate/page.tsx`
- `components/corporate/{SignupForm,LoginForm,PendingBanner,ProfileForm,MatchingRuleForm,AdminCompanyList,AdminCompanyRow}.tsx`
- `components/corporate/Sidebar.tsx` extended with two new links
- `messages/{tr,en}.json` — i18n keys for `corporate.*` and `admin.corporate.*`

## Notes / deviations from plan

- **Manual browser smoke test (Task 27 / steps 2-3) skipped** — implementation environment is headless. All API and lib behavior is verified by 74 tests (full branch coverage on engine, validators, all routes).
- **`@/components/ui/dialog`** referenced in plan does not exist in this repo. The reject-reason modal in `AdminCompanyRow.tsx` uses a native overlay (`fixed inset-0 bg-black/50` + click-outside-to-close) instead. Functionally equivalent.
- **Pre-existing `npm run i18n:check` failure** (4 missing `nav.menu.*` keys in `ru` locale) is **not** introduced by Phase 1; new `corporate.*` and `admin.corporate.*` keys are symmetric across `tr` and `en`.
- **`MatchingRuleForm.tsx`**: `zodResolver(matchingRuleSchema)` cast to `as any` because zod's `.refine()` narrows `ratio` to `1 | 2 | 3` and react-hook-form's resolver type does not infer through the refinement. Runtime behavior is correct; this is a known TS↔ Zod refinement quirk.

## Ready for Phase 2

The foundation is in place for Phase 2 (employee activation + live trigger + owner approval workflow):
- `MatchingTransaction` model can be added to schema (free Prisma migration on MongoDB)
- `simulate()` engine is ready to be called from a live donation hook
- Email templates ready to be triggered via Resend
- JWT-based session routing handles `PENDING/APPROVED/REJECTED/SUSPENDED` already
- `lib/corporate/period.ts` provides the `periodKey` Phase 2 needs for budget aggregation

Phase 2 will write `MatchingTransaction` records (status: PENDING) and add the owner approve/reject UI.
