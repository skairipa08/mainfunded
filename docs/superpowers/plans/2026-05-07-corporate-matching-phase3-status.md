# Corporate Matching Phase 3 — Implementation Status

**Date completed:** 2026-05-07
**Branch:** `feat/corporate-matching-phase1` (all three phases ship together)

## Shipped

**110/110 tests passing** (Phase 1: 74, Phase 2: +30, Phase 3: +6).

### Dashboard binding
- `lib/corporate/dashboard-data.ts` — `getDashboardStats()`, `getTrend()`, `getSponsorsForCampaign()`
- `app/api/corporate/dashboard/route.ts` switched from `mockDashboardStats` to real Prisma aggregates over `MatchingTransaction`. Now requires `requireApprovedCompanyOwner()` (was `requireUser`).
- `donationTrend` returns 12 most recent monthly periods of APPROVED matched amounts.
- `facultyDistribution` still mock — requires Student profile join, deferred.

### ESG annual PDF
- `app/api/corporate/esg/report/route.ts` — `GET /api/corporate/esg/report?year=2026`
- Uses `jspdf` (existing dep). Single-page A4 with: header, summary table (year + all-time matched, tx counts, distinct campaigns, monthly budget), monthly bar chart for the year, footer disclaimer.
- Returns `application/pdf` with `Content-Disposition: attachment` and dynamic filename.

### Sponsor badges
- `components/CampaignCard.tsx` extended with optional `sponsors?: Array<{id, name, logoUrl}>` prop. When non-empty, renders a "Destekleyen:" pill row above the donate button. Backward-compatible (old callers omit the prop).
- `app/api/campaigns/sponsors/route.ts` — `POST /api/campaigns/sponsors` body `{ campaignIds: string[] }` returns map `{ campaignId: Company[] }`. Public endpoint (sponsor info is shown publicly anyway).
- `getSponsorsForCampaign()` helper in `lib/corporate/dashboard-data.ts` for server-side rendering.

## Notes

- **Manual UI smoke test skipped** — headless environment.
- **Caller-side integration of sponsors prop** is left to whoever owns the campaign list pages — pattern is `const { data } = useSWR('/api/campaigns/sponsors', POST {ids}); <CampaignCard sponsors={data[c.campaign_id]} />`. Not wiring it into existing pages to keep the change surface minimal.
- Dashboard endpoint **breaking change**: now requires `APPROVED` company owner, not just any user. Pre-existing UI on `/corporate` (if any) that called this with a generic user session will get 403. Callers were already gated by `AuthGate`, so impact should be minimal.
- ESG PDF is a text+rect chart only — no fonts, no images. Sufficient for compliance-style export; visual polish can be added later without API change.

## Wrap-up of all 3 phases

| Phase | Scope | Tests added | Status |
|---|---|---|---|
| 1 | Foundation: schema, onboarding, admin approval, MatchingRule CRUD, pure engine + simulate API | 74 | ✅ |
| 2 | Live: trigger from donation, employee activation codes, owner approval workflow, threshold emails, real budget aggregation | +30 | ✅ |
| 3 | Reporting: dashboard real data, ESG annual PDF, sponsor badges + bulk lookup endpoint | +6 | ✅ |

**Total:** 110 unit + integration tests, all passing.

**Files added/modified:**
- 17 lib/corporate/* files
- 11 API endpoints under app/api/corporate/* + app/api/admin/corporate/* + app/api/campaigns/sponsors
- 11 UI pages and components
- 1 hook into existing iyzico callback
- Schema: 4 new Prisma models + extensions
- i18n: tr/en under `corporate.*`, `corporateP2.*`, `admin.corporate.*`

**Branch:** `feat/corporate-matching-phase1` — ready to merge.
