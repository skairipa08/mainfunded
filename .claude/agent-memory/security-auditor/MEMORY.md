# Security Memory

- Recurring pattern: `app/api/corporate/*` routes were implemented with mock/demo data and often lacked mandatory auth checks.
- Preferred control for this repo: use `requireUser()` (or stricter role checks where available) plus `withRateLimit(request, RATE_LIMITS.api)` at route entry.
- Public status endpoint caution: `app/api/applications/[id]/status/route.ts` should avoid returning applicant PII; keep response limited to status metadata unless secondary verification is added.
- Abuse surface: public CORS endpoints (e.g. analytics collectors) need event allowlists and rate limiting to reduce spam/log-cost amplification.
- Test caveat: Vitest currently discovers duplicated tests under `.claude/worktrees/*`; this can produce false red runs unrelated to main source changes.
- New module convention: mentorship endpoints under `app/api/mentorship/*` and `app/api/webhooks/mentorship/route.ts` consistently apply `zod` validation, `requireUser()` on user-initiated flows, and signature verification (`timingSafeEqual`) for external webhooks.
