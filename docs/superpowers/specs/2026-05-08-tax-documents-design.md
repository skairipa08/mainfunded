# Tax Document Automation — Design

**Date:** 2026-05-08
**Status:** Draft (pending spec review)
**Project key:** P09 — Vergi Belgesi Otomasyonu

## Purpose

Generate per-donation receipts and annual consolidated summaries as PDFs, with QR-based public verification, a donor-facing document center, and an admin audit trail. Aligned with Turkish donation-receipt practice (GVK 89/4, KVK 10/1-c) but legally hybrid — official receipts are issued only when the campaign is associated with a tax-exempt corporate/foundation beneficiary; individual student campaigns produce informational donation confirmations.

## Stack note

The original brief mentioned PostgreSQL; the project actually uses **MongoDB + Next.js 14 App Router + Cloudinary + iyzico**. This design uses MongoDB. PDF rendering uses `@react-pdf/renderer`. The `qrcode` package is already installed. No new infrastructure (Redis/BullMQ) is introduced — the queue is MongoDB-backed and driven by Vercel Cron.

## Hybrid legal model

| Campaign beneficiary | Document class | Heading | Legal note on document |
|---|---|---|---|
| Foundation / tax-exempt company-backed | `official` | "BAĞIŞ MAKBUZU" | "GVK md.89/4 / KVK md.10/1-c kapsamında vergi indirimine konudur. Vergi muafiyet karar no: …" |
| Individual student | `informal` | "BAĞIŞ TEYİT BELGESİ" | "Bu belge resmî vergi indirim makbuzu değildir, yalnızca bağış işleminin teyididir." |

Classification rule (deterministic, side-effect-free):
- If campaign document has `beneficiary_type === 'foundation'` OR campaign is linked to an approved company in `companies` collection with `tax_exempt === true` → `official`.
- Otherwise → `informal`.

The document carries a frozen `donor_snapshot` and `campaign_title_snapshot`, so post-issue edits to the donor profile or campaign do not retroactively change historical documents.

## Architecture

```
[iyzico callback]
  └─► donation.payment_status = 'paid'
        └─► enqueue document_jobs({ type: 'receipt', donation_id })

[Vercel Cron — every 60s] /api/cron/process-documents
  └─► claimNext (atomic findOneAndUpdate w/ lock)
       ├─ render PDF (@react-pdf/renderer + Roboto Turkish font)
       ├─ generate QR (qrcode → PNG buffer → embed in PDF)
       ├─ upload Cloudinary (folder: tax_documents/<year>/)
       ├─ insert tax_documents row
       ├─ insert document_audit_log("issued")
       └─ mark job 'done'

[Donor dashboard]   /dashboard/belgeler             → list + download
[Public verify]     /verify/<verification_code>     → minimal status page
[Annual cron]       /api/cron/annual-summaries      → 15 January, year-rollover
[Admin audit]       /admin/tax-documents            → table + audit timeline modal
```

## Data model (MongoDB)

### `tax_documents`

```ts
{
  document_id: string;                  // "doc_<ulid>" — public id
  document_number: string;              // "FE-2026-000123" — sequential, year-prefixed
  document_type: 'receipt' | 'annual_summary';
  document_class: 'official' | 'informal';

  donor_id: string;                     // canonical NextAuth user.id
  donor_type: 'individual' | 'corporate';
  donor_snapshot: {
    full_name: string;
    email: string;
    tax_id?: string;                    // TCKN or VKN
    company_name?: string;
    address?: string;
  };

  donation_ids: string[];               // length 1 for receipt, N for annual_summary
  campaign_id?: string;                 // present on receipt
  campaign_title_snapshot?: string;

  amount_total: number;
  currency: string;                     // 'TRY' | 'USD' | 'EUR'
  donation_date?: Date;                 // present on receipt
  tax_year: number;                     // 2026, etc.

  verification_code: string;            // 32 char URL-safe
  verification_payload_hmac: string;    // HMAC-SHA256 binding code↔fields

  pdf_url: string;                      // Cloudinary signed URL
  pdf_hash_sha256: string;              // tamper detection

  status: 'queued' | 'processing' | 'issued' | 'void';
  voided_at?: Date;
  void_reason?: string;

  created_at: Date;
  issued_at?: Date;
}
```

Indexes: `{ document_id: 1 }` unique, `{ donor_id: 1, tax_year: -1 }`, `{ verification_code: 1 }` unique, `{ document_number: 1 }` unique.

### `document_jobs`

```ts
{
  job_id: string;                       // "job_<ulid>"
  type: 'receipt' | 'annual_summary';
  payload: { donation_id?: string; donor_id?: string; tax_year?: number };
  status: 'queued' | 'processing' | 'done' | 'failed';
  attempts: number;                     // capped at 5
  last_error?: string;
  run_after: Date;                      // exponential backoff target
  locked_by?: string;                   // worker invocation id
  locked_until?: Date;                  // releases stale locks
  created_at: Date;
  completed_at?: Date;
}
```

Indexes: `{ status: 1, run_after: 1 }`, `{ locked_until: 1 }`.

### `document_audit_log`

```ts
{
  event_id: string;
  document_id: string;
  event: 'queued' | 'issued' | 'failed' | 'downloaded' | 'verified' | 'voided';
  actor_id?: string;
  actor_role: 'system' | 'donor' | 'admin' | 'public';
  ip?: string;
  user_agent?: string;
  meta?: Record<string, unknown>;
  at: Date;
}
```

Indexes: `{ document_id: 1, at: -1 }`, `{ at: -1 }`.

### `users.tax_profile` (additive, optional)

```ts
tax_profile?: {
  profile_type: 'individual' | 'corporate';
  full_name?: string;
  tax_id?: string;
  company_name?: string;
  address?: string;
}
```

Filled at checkout (opt-in toggle "Vergi belgesi istiyorum") or from dashboard. Never required for donation completion. Snapshot is taken into `tax_documents.donor_snapshot` at issue time.

## File layout

```
lib/tax-documents/
  index.ts              # public surface
  classify.ts           # campaign → official|informal
  numbering.ts          # atomic sequential counter, year reset
  verification.ts       # generateCode, verifyHmac
  qr.ts                 # generateQrPng(verifyUrl) → Buffer
  storage.ts            # uploadToCloudinary(buf, path)
  jobs.ts               # enqueue, claimNext, complete, fail (retry/backoff)
  generate.ts           # orchestrator: jobs → render → store → persist → audit
  render.tsx            # <ReceiptDocument /> + <AnnualSummaryDocument />
  render.ts             # renderToBuffer wrapper
  types.ts              # shared types
  fonts/Roboto-*.ttf    # bundled Turkish-capable font

app/api/cron/process-documents/route.ts          # NEW — every 60s, CRON_SECRET-gated
app/api/cron/annual-summaries/route.ts           # NEW — yearly (15 Jan), CRON_SECRET-gated
app/api/donations/my/[donation_id]/receipt/route.ts  # MODIFIED — adds ?format=pdf branch
app/api/tax-documents/route.ts                   # NEW — donor list
app/api/tax-documents/[document_id]/download/route.ts  # NEW — redirect to signed url + audit
app/api/verify/[code]/route.ts                   # NEW — public, rate-limited verify
app/api/admin/tax-documents/route.ts             # NEW — admin list + filters
app/api/admin/tax-documents/[id]/audit/route.ts  # NEW — audit timeline
app/api/admin/tax-documents/[id]/void/route.ts   # NEW — admin void

app/[locale]/dashboard/belgeler/page.tsx         # NEW — donor document center
app/[locale]/verify/[code]/page.tsx              # NEW — public verify page
app/[locale]/admin/tax-documents/page.tsx        # NEW — admin table + modal

components/tax-documents/
  DocumentList.tsx
  AnnualSummaryButton.tsx
  VerifyResult.tsx
  AdminAuditTimeline.tsx
  TaxProfileForm.tsx           # used in checkout + dashboard

vercel.json                    # MODIFIED — cron schedules registered
```

## Service contracts

### `classify(campaign): 'official' | 'informal'`
- Pure function, no I/O.
- Inputs: `campaign.beneficiary_type`, optional linked `company.tax_exempt`.
- Single source of truth; both API and PDF renderer call it.

### `enqueueReceiptJob(donation_id)`
- Idempotent: if a `document_jobs` row with `payload.donation_id` already exists in non-terminal status, no-op.
- Called from iyzico callback `payment_status` transition to `paid`.

### `claimNext(workerId): Job | null`
- Atomic `findOneAndUpdate({ status: 'queued', run_after: { $lte: now }, OR: locked_until expired }, { $set: { status: 'processing', locked_by, locked_until: now+5min } })`.

### `generateReceiptDocument(job)`
- Pulls donation + campaign, runs `classify`, builds `donor_snapshot`.
- Allocates `document_number` via `numbering.next(tax_year)` (atomic counter document).
- Generates `verification_code` and `verification_payload_hmac`.
- Renders PDF, hashes, uploads, persists, audit-logs.
- All steps wrapped in try/catch — failure path: `jobs.fail(job, error)` increments attempts and reschedules with exponential backoff (1m, 5m, 30m, 2h, 12h). After 5 attempts → `failed` terminal status, surfaced in admin view.

### `verify(code, requestMeta)`
- Rate-limited (10 req/min/IP via existing `lib/security.ts`).
- Returns minimal payload: document_number, donor_name (truncated to first name + initial), amount, currency, date, status.
- Does NOT return tax_id, full address, or PDF URL. Audit-logged with IP/UA.

## API surface

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/api/cron/process-documents` | CRON_SECRET header | Drains queue, max 10 jobs per invocation |
| POST | `/api/cron/annual-summaries` | CRON_SECRET header | Runs on 15 Jan; idempotent per (donor, year) |
| GET | `/api/donations/my/[id]/receipt?format=pdf` | donor session | Existing JSON branch preserved; `?format=pdf` returns redirect to signed Cloudinary URL or 202 if not yet issued |
| GET | `/api/tax-documents?year=&type=` | donor session | List donor's documents |
| GET | `/api/tax-documents/[id]/download` | donor session | Audit-logs `downloaded`, redirects to signed URL |
| GET | `/api/verify/[code]` | public | Rate-limited; returns sanitized status |
| GET | `/api/admin/tax-documents` | admin | Filters: donor, year, type, class, status |
| GET | `/api/admin/tax-documents/[id]/audit` | admin | Audit timeline |
| POST | `/api/admin/tax-documents/[id]/void` | admin | Body: `{ reason }`; sets status='void', audit-logs |

## UI

### `/dashboard/belgeler` (donor)
- Year selector (default: current year).
- Filter: All / Receipts / Annual summaries.
- Table: number, date, campaign (or "Yıllık Özet"), amount, status, [İndir] button.
- "Yıllık Özet PDF İndir" button — if not yet generated for current year, button disabled with tooltip "1 Ocak'tan sonra üretilir".
- Tax profile editor (TaxProfileForm).

### `/verify/[code]` (public)
- Header: "Belge Doğrulama".
- If valid + issued: green check, document number, masked donor name, amount, currency, date, document class label.
- If voided: red X, "Bu belge iptal edilmiştir", void date.
- If not found / invalid: generic "Belge bulunamadı" (no enumeration leak).

### `/admin/tax-documents` (admin)
- Server-paginated table.
- Filters as above.
- Row click → modal with audit timeline (chronological events with actor, IP, UA).
- Per-row "Void" action (confirmation + reason input).

### Checkout flow change
- Existing donation form gets a collapsible section "Vergi belgesi istiyorum (opsiyonel)".
- Inside: profile_type radio (Bireysel / Kurumsal), conditional fields (TCKN or VKN+şirket), address.
- Persisted on `users.tax_profile`. Form is bypassable.

## Annual summary (cron)

Trigger: `0 6 15 1 *` (15 January 06:00 UTC).
For each donor with at least one `payment_status === 'paid'` donation in the previous tax_year:
1. Skip if a `tax_documents` row with `document_type === 'annual_summary'` and matching `tax_year` already exists (idempotency).
2. Enqueue an `annual_summary` job.
3. Worker aggregates donations, builds summary PDF (one page if ≤30 donations, paginated otherwise), issues document.

Donors can also trigger manual generation from the dashboard if their summary is missing 24h after the cron run.

## Audit log events

| Event | Actor | Triggered by |
|---|---|---|
| `queued` | system | enqueueReceiptJob |
| `issued` | system | successful generate |
| `failed` | system | terminal job failure (after retries) |
| `downloaded` | donor | dashboard download endpoint |
| `verified` | public | `/api/verify/[code]` hit |
| `voided` | admin | admin void endpoint |

Public verify hits are throttled but always logged (with IP) — useful for fraud detection.

## Error handling & edge cases

| Case | Behavior |
|---|---|
| Refund / chargeback after issue | Admin voids document; donor dashboard shows "İptal edildi" badge; verify page shows void state. New "düzeltme" document is NOT auto-issued. |
| Donor edits tax_profile after issue | No effect on existing documents (snapshot frozen). New documents use latest profile. |
| Campaign deleted after issue | `campaign_title_snapshot` preserves the title. `campaign_id` may dangle; UI tolerates missing campaign. |
| iyzico callback fires twice | enqueueReceiptJob is idempotent on `donation_id`. |
| Cron worker crash mid-job | `locked_until` expires after 5 min; next worker reclaims. |
| Cloudinary upload fails | Job fails with retry; no `tax_documents` row written until upload + persist both succeed (transactional sequence). |
| PDF render fails on weird donor name | Renderer falls back to safe ASCII transliteration; original name preserved in DB. |
| Verify code collision | 32-char URL-safe random + unique index; collision probability negligible; insert error retries with new code. |
| Concurrent annual summary cron + manual trigger | Idempotency check on `(donor_id, tax_year, document_type='annual_summary')`. |

## Security

- `verification_code`: 32 bytes from `crypto.randomBytes`, base64url. Not derivable from donation_id.
- `verification_payload_hmac`: HMAC-SHA256 of canonical `(document_number|donor_id|amount_total|tax_year)` using `TAX_DOCUMENT_HMAC_SECRET` env. Validated server-side on every verify hit — protects against DB tampering.
- `pdf_hash_sha256`: stored at issue time; admin diagnostic endpoint can re-hash and compare.
- Cloudinary URLs: signed, 1-hour expiry on each download (re-signed per request).
- CRON_SECRET: required header on `/api/cron/*`. Already an established pattern.
- Public verify: aggressive rate limit (10/min/IP), returns generic "not found" to prevent enumeration.

## Test strategy

Tests live in `__tests__/` following existing convention.

| Test | Asserts |
|---|---|
| `tax-document-classify.test.ts` | foundation/company-tax-exempt → official; otherwise informal; deterministic |
| `tax-document-numbering.test.ts` | sequential within year, resets at year boundary, atomic under concurrency |
| `tax-document-job-queue.test.ts` | claim/lock/release; retry with backoff; max attempts; stale lock recovery |
| `tax-document-verification.test.ts` | code uniqueness; HMAC validation; tampered HMAC rejected |
| `tax-document-receipt-generate.test.ts` | end-to-end: enqueue → process → tax_documents row + audit log; idempotency |
| `tax-document-annual-summary.test.ts` | aggregation correctness; idempotency on (donor, year); empty-year skip |
| `tax-document-void.test.ts` | admin void writes audit; verify endpoint returns void state |
| `tax-document-verify-api.test.ts` | rate limit, masked output, audit log written, no enumeration leak |

## Out of scope (YAGNI)

- Multi-language documents (TR only for now)
- e-Signature / KEP integration (audit log + HMAC + hash sufficient for v1)
- Real-time websocket notification when document ready (cron polling sufficient)
- Document regeneration / amendment (issue is immutable; correction = void + new document)
- Bulk admin export of all documents (existing donations export covers operational needs)
- WebHook notifications to external accounting systems

## Migration / rollout

1. Deploy code; cron registered but no documents in DB.
2. Add Cloudinary folder, env vars (`TAX_DOCUMENT_HMAC_SECRET`, `TAX_DOCUMENT_FUND_ED_VKN`, `TAX_DOCUMENT_TAX_EXEMPTION_REF`).
3. Backfill script (one-off, dev-only): enqueue receipt jobs for all already-paid donations from current tax year. Cron drains.
4. Donor dashboard link enabled after backfill completes.
5. Annual summary cron is a no-op until 15 January 2027.

## Open questions for implementation phase

These do not block design approval; they are explicit reminders for the writing-plans step:

- Final wording of legal note blocks must be reviewed by a Turkish accountant before production deploy. Spec includes placeholder text; legal sign-off is a release gate.
- Roboto Turkish font license file commit (Apache-2.0; bundle `LICENSE.txt` with font).
- Cloudinary folder access policy (private + signed URLs); confirm current Cloudinary plan supports per-asset signing.
