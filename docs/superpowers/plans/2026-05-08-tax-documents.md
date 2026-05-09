# Tax Document Automation Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build automated per-donation receipts and yearly consolidated summary PDFs with QR-based public verification, donor document center, and admin audit trail. Hybrid legal model — official receipts for foundation/tax-exempt-company-backed campaigns; informational confirmation documents for individual student campaigns.

**Architecture:** MongoDB-native (no Prisma). Async pipeline: iyzico paid → enqueue `document_jobs` row → Vercel Cron drains queue (atomic claim/lock with backoff retry) → render PDF with `@react-pdf/renderer` + embedded QR → upload via existing `lib/storage` (Cloudinary) → persist `tax_documents` row + `document_audit_log` event. Frozen `donor_snapshot` and `campaign_title_snapshot` keep historical documents immutable. HMAC-SHA256 binds verification code to document fields against DB tampering.

**Tech Stack:** Next.js 14 App Router, MongoDB driver, NextAuth v5, `@react-pdf/renderer` (new), `qrcode` (already installed), existing `@/lib/storage` Cloudinary wrapper, vitest, zod, existing `@/lib/rate-limit`.

**Spec:** [docs/superpowers/specs/2026-05-08-tax-documents-design.md](../specs/2026-05-08-tax-documents-design.md)

**Conventions confirmed by reading existing code:**
- Tests live in `__tests__/`. Pattern: `vi.mock('../lib/db')` with hoisted `mockDb`, `vi.mock('../lib/authz')`, `vi.mock('../lib/rate-limit')`. See [`__tests__/expenditures.test.ts:1-50`](../../../__tests__/expenditures.test.ts#L1-L50).
- DB access via `import { getDb } from '@/lib/db'` and `db.collection('...')` raw collection ops — no ORM.
- Cron handlers live under `app/api/cron/<name>/route.ts` and are gated by `CRON_SECRET` header. See existing [`app/api/cron/process-subscriptions/route.ts`](../../../app/api/cron/process-subscriptions/route.ts).
- Storage helper signature: `storage.upload(buffer, path, contentType)` + `storage.getSignedUrl(path)`. See [`lib/storage/index.ts:1-60`](../../../lib/storage/index.ts#L1-L60).
- API responses use `successResponse / errorResponse / handleRouteError` from `@/lib/api-response`.
- Auth helpers: `requireUser`, `requireAdminOrOps` from `@/lib/authz`.
- Domain string convention: collection names snake_case; ID fields use a typed prefix (`don_`, `doc_`, `job_`). Public IDs are not Mongo `_id`.

---

## Chunk 1: Foundation — types, classify, numbering, verification, qr, storage, indexes

### Task 1: Install dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install `@react-pdf/renderer`**

Run: `npm install @react-pdf/renderer@^3.4.0`

Expected: package added to `dependencies`. Note: `qrcode` and `@types/qrcode` are already installed (verified in `package.json`).

- [ ] **Step 2: Verify install**

Run: `npm ls @react-pdf/renderer`
Expected: prints version `3.4.x` with no `UNMET DEPENDENCY` warning.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(tax-documents): add @react-pdf/renderer dependency"
```

---

### Task 2: Add tax-documents env vars to `.env.example`

**Files:**
- Modify: `.env.example`

- [ ] **Step 1: Append new env vars at end of `.env.example`**

```env

# Tax document automation (P09)
# Required: HMAC secret for verification code binding (32 bytes base64 recommended)
TAX_DOCUMENT_HMAC_SECRET=
# FundEd's tax identification number (VKN) — printed on every receipt
TAX_DOCUMENT_FUND_ED_VKN=
# Reference number of the tax exemption decision (printed on official receipts only)
TAX_DOCUMENT_TAX_EXEMPTION_REF=
# Required by all /api/cron/* endpoints — set the same value in Vercel cron headers
CRON_SECRET=
```

- [ ] **Step 2: Commit**

```bash
git add .env.example
git commit -m "chore(tax-documents): document new env vars"
```

> Note: `CRON_SECRET` may already exist if other cron handlers use it — if a `CRON_SECRET=` line is present, do not duplicate it. The other three vars are new.

---

### Task 3: Define shared types

**Files:**
- Create: `lib/tax-documents/types.ts`

- [ ] **Step 1: Create the types file**

Create `lib/tax-documents/types.ts`:

```typescript
export type DocumentType = 'receipt' | 'annual_summary';
export type DocumentClass = 'official' | 'informal';
export type DonorType = 'individual' | 'corporate';
export type DocumentStatus = 'queued' | 'processing' | 'issued' | 'void';
export type JobStatus = 'queued' | 'processing' | 'done' | 'failed';
export type AuditEvent =
  | 'queued'
  | 'issued'
  | 'failed'
  | 'downloaded'
  | 'verified'
  | 'voided';
export type ActorRole = 'system' | 'donor' | 'admin' | 'public';

export interface DonorSnapshot {
  full_name: string;
  email: string;
  tax_id?: string;
  company_name?: string;
  address?: string;
}

export interface TaxProfile {
  profile_type: DonorType;
  full_name?: string;
  tax_id?: string;
  company_name?: string;
  address?: string;
}

export interface TaxDocument {
  document_id: string;
  document_number: string;
  document_type: DocumentType;
  document_class: DocumentClass;
  donor_id: string;
  donor_type: DonorType;
  donor_snapshot: DonorSnapshot;
  donation_ids: string[];
  campaign_id?: string;
  campaign_title_snapshot?: string;
  amount_total: number;
  currency: string;
  donation_date?: Date;
  tax_year: number;
  verification_code: string;
  verification_payload_hmac: string;
  pdf_url: string;
  pdf_storage_path: string;
  pdf_hash_sha256: string;
  status: DocumentStatus;
  voided_at?: Date;
  void_reason?: string;
  created_at: Date;
  issued_at?: Date;
}

export interface DocumentJob {
  job_id: string;
  type: DocumentType;
  payload: {
    donation_id?: string;
    donor_id?: string;
    tax_year?: number;
  };
  status: JobStatus;
  attempts: number;
  last_error?: string;
  run_after: Date;
  locked_by?: string;
  locked_until?: Date;
  created_at: Date;
  completed_at?: Date;
}

export interface DocumentAuditLogEntry {
  event_id: string;
  document_id: string;
  event: AuditEvent;
  actor_id?: string;
  actor_role: ActorRole;
  ip?: string;
  user_agent?: string;
  meta?: Record<string, unknown>;
  at: Date;
}

export interface ClassifyInput {
  beneficiary_type?: 'individual' | 'foundation' | 'company';
  linked_company_tax_exempt?: boolean;
}
```

- [ ] **Step 2: TypeScript sanity check**

Run: `npx tsc --noEmit`
Expected: No new errors. (Pre-existing errors in unrelated files are acceptable.)

- [ ] **Step 3: Commit**

```bash
git add lib/tax-documents/types.ts
git commit -m "feat(tax-documents): shared types"
```

---

### Task 4: classify() — official vs informal

**Files:**
- Create: `__tests__/tax-document-classify.test.ts`
- Create: `lib/tax-documents/classify.ts`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/tax-document-classify.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { classify } from '../lib/tax-documents/classify';

describe('classify()', () => {
  it('returns "official" when beneficiary_type is foundation', () => {
    expect(classify({ beneficiary_type: 'foundation' })).toBe('official');
  });

  it('returns "official" when linked_company_tax_exempt is true', () => {
    expect(
      classify({ beneficiary_type: 'company', linked_company_tax_exempt: true })
    ).toBe('official');
  });

  it('returns "informal" when company is linked but not tax_exempt', () => {
    expect(
      classify({ beneficiary_type: 'company', linked_company_tax_exempt: false })
    ).toBe('informal');
  });

  it('returns "informal" for individual student campaigns', () => {
    expect(classify({ beneficiary_type: 'individual' })).toBe('informal');
  });

  it('returns "informal" when no beneficiary_type provided (legacy)', () => {
    expect(classify({})).toBe('informal');
  });

  it('is deterministic — same input → same output', () => {
    const input = { beneficiary_type: 'foundation' as const };
    expect(classify(input)).toBe(classify(input));
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

Run: `npx vitest run __tests__/tax-document-classify.test.ts`
Expected: FAIL — "Cannot find module '../lib/tax-documents/classify'".

- [ ] **Step 3: Implement classify()**

Create `lib/tax-documents/classify.ts`:

```typescript
import type { ClassifyInput, DocumentClass } from './types';

export function classify(input: ClassifyInput): DocumentClass {
  if (input.beneficiary_type === 'foundation') return 'official';
  if (input.beneficiary_type === 'company' && input.linked_company_tax_exempt === true) {
    return 'official';
  }
  return 'informal';
}
```

- [ ] **Step 4: Run tests — verify they pass**

Run: `npx vitest run __tests__/tax-document-classify.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/tax-documents/classify.ts __tests__/tax-document-classify.test.ts
git commit -m "feat(tax-documents): document class classifier"
```

---

### Task 5: numbering.ts — atomic sequential document numbers

Sequential numbers per year (`FE-2026-000123`). Implementation uses an atomic `findOneAndUpdate` against a `document_counters` collection so that race-condition-free allocation is guaranteed even under concurrent worker invocations.

**Files:**
- Create: `__tests__/tax-document-numbering.test.ts`
- Create: `lib/tax-documents/numbering.ts`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/tax-document-numbering.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { allocateDocumentNumber } from '../lib/tax-documents/numbering';

const { mockDb, mockCollection } = vi.hoisted(() => {
  const mockCollection: any = {
    findOneAndUpdate: vi.fn(),
  };
  return {
    mockCollection,
    mockDb: { collection: vi.fn().mockReturnValue(mockCollection) },
  };
});

vi.mock('../lib/db', () => ({
  getDb: vi.fn().mockResolvedValue(mockDb),
}));

describe('allocateDocumentNumber()', () => {
  beforeEach(() => {
    mockCollection.findOneAndUpdate.mockReset();
    mockDb.collection.mockClear();
  });

  it('returns FE-<year>-000001 when counter does not exist yet', async () => {
    // MongoDB driver v6+ returns the document directly (no `.value` wrapper)
    mockCollection.findOneAndUpdate.mockResolvedValueOnce({
      _id: 'tax_documents:2026',
      seq: 1,
    });

    const result = await allocateDocumentNumber(2026);

    expect(result).toBe('FE-2026-000001');
    expect(mockDb.collection).toHaveBeenCalledWith('document_counters');
    expect(mockCollection.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'tax_documents:2026' },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: 'after' }
    );
  });

  it('zero-pads the sequential portion to 6 digits', async () => {
    mockCollection.findOneAndUpdate.mockResolvedValueOnce({
      _id: 'tax_documents:2026',
      seq: 42,
    });

    expect(await allocateDocumentNumber(2026)).toBe('FE-2026-000042');
  });

  it('uses the year provided to scope the counter', async () => {
    mockCollection.findOneAndUpdate.mockResolvedValueOnce({
      _id: 'tax_documents:2027',
      seq: 1,
    });

    await allocateDocumentNumber(2027);

    expect(mockCollection.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ _id: 'tax_documents:2027' }),
      expect.anything(),
      expect.anything()
    );
  });

  it('handles seq above 999_999 by overflowing the field width', async () => {
    mockCollection.findOneAndUpdate.mockResolvedValueOnce({
      _id: 'tax_documents:2026',
      seq: 1_000_000,
    });

    expect(await allocateDocumentNumber(2026)).toBe('FE-2026-1000000');
  });

  it('throws when findOneAndUpdate returns null (counter unavailable)', async () => {
    mockCollection.findOneAndUpdate.mockResolvedValueOnce(null);

    await expect(allocateDocumentNumber(2026)).rejects.toThrow(
      /failed to allocate/i
    );
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

Run: `npx vitest run __tests__/tax-document-numbering.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement numbering.ts**

Create `lib/tax-documents/numbering.ts`:

```typescript
import { getDb } from '@/lib/db';

interface CounterDoc {
  _id: string;
  seq: number;
}

export async function allocateDocumentNumber(taxYear: number): Promise<string> {
  const db = await getDb();
  const counterId = `tax_documents:${taxYear}`;

  // MongoDB driver v6+: findOneAndUpdate returns the document directly (no .value).
  const doc = (await db
    .collection<CounterDoc>('document_counters')
    .findOneAndUpdate(
      { _id: counterId },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: 'after' }
    )) as CounterDoc | null;

  if (!doc || typeof doc.seq !== 'number') {
    throw new Error(
      `Failed to allocate document number for ${taxYear} (counter returned no document)`
    );
  }

  const padded = String(doc.seq).padStart(6, '0');
  return `FE-${taxYear}-${padded}`;
}
```

- [ ] **Step 4: Run tests — verify they pass**

Run: `npx vitest run __tests__/tax-document-numbering.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/tax-documents/numbering.ts __tests__/tax-document-numbering.test.ts
git commit -m "feat(tax-documents): atomic sequential document numbering"
```

---

### Task 6: verification.ts — code generation + HMAC binding

**Files:**
- Create: `__tests__/tax-document-verification.test.ts`
- Create: `lib/tax-documents/verification.ts`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/tax-document-verification.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import {
  generateVerificationCode,
  computePayloadHmac,
  verifyPayloadHmac,
} from '../lib/tax-documents/verification';

const ORIGINAL_SECRET = process.env.TAX_DOCUMENT_HMAC_SECRET;

describe('generateVerificationCode()', () => {
  it('returns a string of length 43 (base64url of 32 bytes)', () => {
    const code = generateVerificationCode();
    expect(code).toHaveLength(43);
  });

  it('uses URL-safe characters only', () => {
    const code = generateVerificationCode();
    expect(code).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('produces different codes on successive calls', () => {
    const a = generateVerificationCode();
    const b = generateVerificationCode();
    expect(a).not.toBe(b);
  });
});

describe('computePayloadHmac() / verifyPayloadHmac()', () => {
  beforeEach(() => {
    process.env.TAX_DOCUMENT_HMAC_SECRET = 'test-secret-32-bytes-base64-or-anything';
  });

  it('produces a hex string of 64 chars (sha256)', () => {
    const hmac = computePayloadHmac({
      document_number: 'FE-2026-000001',
      donor_id: 'user_123',
      amount_total: 100,
      tax_year: 2026,
    });
    expect(hmac).toMatch(/^[0-9a-f]{64}$/);
  });

  it('matching payload + same secret verifies as true', () => {
    const payload = {
      document_number: 'FE-2026-000001',
      donor_id: 'user_123',
      amount_total: 100,
      tax_year: 2026,
    };
    const hmac = computePayloadHmac(payload);
    expect(verifyPayloadHmac(payload, hmac)).toBe(true);
  });

  it('tampered amount fails verification', () => {
    const payload = {
      document_number: 'FE-2026-000001',
      donor_id: 'user_123',
      amount_total: 100,
      tax_year: 2026,
    };
    const hmac = computePayloadHmac(payload);
    expect(verifyPayloadHmac({ ...payload, amount_total: 200 }, hmac)).toBe(false);
  });

  it('different secret produces different hmac', () => {
    const payload = {
      document_number: 'FE-2026-000001',
      donor_id: 'user_123',
      amount_total: 100,
      tax_year: 2026,
    };
    const a = computePayloadHmac(payload);
    process.env.TAX_DOCUMENT_HMAC_SECRET = 'different-secret';
    const b = computePayloadHmac(payload);
    expect(a).not.toBe(b);
  });

  it('throws when TAX_DOCUMENT_HMAC_SECRET is unset', () => {
    delete process.env.TAX_DOCUMENT_HMAC_SECRET;
    expect(() =>
      computePayloadHmac({
        document_number: 'FE-2026-000001',
        donor_id: 'u',
        amount_total: 1,
        tax_year: 2026,
      })
    ).toThrow(/TAX_DOCUMENT_HMAC_SECRET/);
  });

  afterAll(() => {
    if (ORIGINAL_SECRET === undefined) delete process.env.TAX_DOCUMENT_HMAC_SECRET;
    else process.env.TAX_DOCUMENT_HMAC_SECRET = ORIGINAL_SECRET;
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

Run: `npx vitest run __tests__/tax-document-verification.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement verification.ts**

Create `lib/tax-documents/verification.ts`:

```typescript
import crypto from 'crypto';

export interface HmacPayload {
  document_number: string;
  donor_id: string;
  amount_total: number;
  tax_year: number;
}

export function generateVerificationCode(): string {
  // 32 bytes → base64url is 43 chars (no padding)
  return crypto.randomBytes(32).toString('base64url');
}

function getSecret(): string {
  const secret = process.env.TAX_DOCUMENT_HMAC_SECRET;
  if (!secret) {
    throw new Error(
      'TAX_DOCUMENT_HMAC_SECRET is not set; cannot compute verification HMAC'
    );
  }
  return secret;
}

function canonicalize(payload: HmacPayload): string {
  // Same canonical form for both `receipt` and `annual_summary`.
  // Field order is fixed; do NOT JSON.stringify (key ordering risk).
  return [
    payload.document_number,
    payload.donor_id,
    String(payload.amount_total),
    String(payload.tax_year),
  ].join('|');
}

export function computePayloadHmac(payload: HmacPayload): string {
  return crypto
    .createHmac('sha256', getSecret())
    .update(canonicalize(payload))
    .digest('hex');
}

export function verifyPayloadHmac(
  payload: HmacPayload,
  expected: string
): boolean {
  const actual = computePayloadHmac(payload);
  if (actual.length !== expected.length) return false;
  // Both values are hex; explicit encoding avoids future ambiguity.
  return crypto.timingSafeEqual(
    Buffer.from(actual, 'hex'),
    Buffer.from(expected, 'hex')
  );
}
```

- [ ] **Step 4: Run tests — verify they pass**

Run: `npx vitest run __tests__/tax-document-verification.test.ts`
Expected: PASS, 8 tests (3 in `generateVerificationCode` block + 5 in `computePayloadHmac/verifyPayloadHmac` block; `afterAll` is teardown, not a test).

- [ ] **Step 5: Commit**

```bash
git add lib/tax-documents/verification.ts __tests__/tax-document-verification.test.ts
git commit -m "feat(tax-documents): verification code generation + HMAC binding"
```

---

### Task 7: qr.ts — QR PNG buffer

Small wrapper around the already-installed `qrcode` package. No dedicated test file — covered indirectly through the generator integration test in Chunk 2.

**Files:**
- Create: `lib/tax-documents/qr.ts`

- [ ] **Step 1: Create qr.ts**

```typescript
import QRCode from 'qrcode';

export async function generateQrPngBuffer(text: string): Promise<Buffer> {
  // Level Q = ~25% error correction; safe for printed paper without overrun.
  return QRCode.toBuffer(text, {
    type: 'png',
    errorCorrectionLevel: 'Q',
    margin: 1,
    width: 240,
  });
}

export function buildVerifyUrl(verificationCode: string): string {
  const base = process.env.AUTH_URL || 'https://funded.org';
  return `${base.replace(/\/$/, '')}/verify/${verificationCode}`;
}
```

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add lib/tax-documents/qr.ts
git commit -m "feat(tax-documents): QR png buffer + verify URL builder"
```

---

### Task 8: storage.ts — Cloudinary helpers scoped to tax documents

Reuse the existing `@/lib/storage` provider; only add a thin namespacing helper that builds folder paths and returns hashed buffers.

**Files:**
- Create: `lib/tax-documents/storage.ts`

- [ ] **Step 1: Create storage.ts**

```typescript
import crypto from 'crypto';
import { storage } from '@/lib/storage';

export function buildPdfStoragePath(
  taxYear: number,
  documentNumber: string
): string {
  // e.g. "tax_documents/2026/FE-2026-000123.pdf"
  return `tax_documents/${taxYear}/${documentNumber}.pdf`;
}

export function sha256Hex(buf: Buffer): string {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

export interface PdfUploadResult {
  url: string;
  storage_path: string;
  hash_sha256: string;
}

export async function uploadPdf(
  buf: Buffer,
  taxYear: number,
  documentNumber: string
): Promise<PdfUploadResult> {
  const storage_path = buildPdfStoragePath(taxYear, documentNumber);
  const hash_sha256 = sha256Hex(buf);

  const result = await storage.upload(buf, storage_path, 'application/pdf');
  if (!result.success || !result.url) {
    throw new Error(
      `Cloudinary upload failed for ${storage_path}: ${result.error || 'unknown'}`
    );
  }

  return { url: result.url, storage_path, hash_sha256 };
}

export function getSignedPdfUrl(storage_path: string): string {
  return storage.getSignedUrl(storage_path);
}
```

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add lib/tax-documents/storage.ts
git commit -m "feat(tax-documents): Cloudinary storage helpers"
```

---

### Task 9: Add MongoDB indexes for new collections

**Files:**
- Modify: `lib/db.ts` (extend `createIndexes()`)

- [ ] **Step 1: Append new indexes to `createIndexes()`**

Locate the `createIndexes()` function in `lib/db.ts`. The function has a single outer `try { ... } catch (error: any) { ... }`. Inside that `try`, just **after the last existing `db.collection('...').createIndex(...)` call** (currently the `mentor_certificates` index near the end of the try block), append the following block:

```typescript
    // Tax Documents indexes (P09)
    await db.collection('tax_documents').createIndex('document_id', { unique: true });
    await db.collection('tax_documents').createIndex('document_number', { unique: true });
    await db.collection('tax_documents').createIndex('verification_code', { unique: true });
    await db.collection('tax_documents').createIndex({ donor_id: 1, tax_year: -1 });
    await db.collection('tax_documents').createIndex({ donor_id: 1, document_type: 1, tax_year: 1 });
    await db.collection('tax_documents').createIndex('donation_ids');
    await db.collection('tax_documents').createIndex({ status: 1, created_at: -1 });

    await db.collection('document_jobs').createIndex('job_id', { unique: true });
    await db.collection('document_jobs').createIndex({ status: 1, run_after: 1 });
    await db.collection('document_jobs').createIndex({ locked_until: 1 });
    await db.collection('document_jobs').createIndex({ 'payload.donation_id': 1 }, { sparse: true });

    await db.collection('document_audit_log').createIndex('event_id', { unique: true });
    await db.collection('document_audit_log').createIndex({ document_id: 1, at: -1 });
    await db.collection('document_audit_log').createIndex({ at: -1 });

    // Note: `document_counters` uses string `_id`s ("tax_documents:<year>"); MongoDB's default
    // _id index is sufficient — no extra index needed.
```

- [ ] **Step 2: Run the indexes script in dev to confirm no syntax errors**

Run: `npm run db:indexes`
Expected: completes without throwing. This connects to the real MongoDB cluster pointed at by `MONGO_URL`; if the dev machine has no MongoDB reachable, skip and rely on Step 3's TypeScript check (the index call signatures are validated at type level).

- [ ] **Step 3: TypeScript check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add lib/db.ts
git commit -m "feat(tax-documents): mongo indexes for tax_documents, document_jobs, audit log, counters"
```

---

### Chunk 1 wrap-up

After Task 9, run the full Chunk 1 test set and confirm green:

- [ ] **Step 1: Run all new tests**

Run: `npx vitest run __tests__/tax-document-classify.test.ts __tests__/tax-document-numbering.test.ts __tests__/tax-document-verification.test.ts`
Expected: 19 tests pass, 0 fail.

- [ ] **Step 2: Confirm no untested module is missing**

Listed deliverables for Chunk 1:
- `lib/tax-documents/types.ts`
- `lib/tax-documents/classify.ts` + tests
- `lib/tax-documents/numbering.ts` + tests
- `lib/tax-documents/verification.ts` + tests
- `lib/tax-documents/qr.ts` (covered in Chunk 2 integration)
- `lib/tax-documents/storage.ts` (covered in Chunk 2 integration)
- Indexes registered in `lib/db.ts`
- New env vars in `.env.example`

If any file is missing, return to its task. Otherwise proceed to Chunk 2.

---

## Chunk 2: PDF rendering — fonts, templates, render-to-buffer wrapper

Goal of this chunk: produce a working `renderDocumentToBuffer(<ReceiptDocument …/>)` callable that returns a valid PDF Buffer with Turkish characters intact. No DB or queue logic; pure rendering. Chunk 3 wires this into the job pipeline.

---

### Task 10: Bundle Roboto Turkish-capable font

`@react-pdf/renderer` cannot render Turkish characters with its default fonts; we need to register a font that supports Latin Extended-A. Roboto (Apache-2.0) is the smallest reliable option.

**Files:**
- Create: `lib/tax-documents/fonts/Roboto-Regular.ttf`
- Create: `lib/tax-documents/fonts/Roboto-Bold.ttf`
- Create: `lib/tax-documents/fonts/LICENSE.txt`
- Create: `lib/tax-documents/fonts/README.md`

- [ ] **Step 1: Download Roboto font files (pinned to a known-good commit)**

The `googlefonts/roboto` repo has been restructured before; pin to a SHA that we know contains `src/hinted/Roboto-Regular.ttf`. SHA `3b4a25f1d` (2022 release) is stable.

Run:

```powershell
$fontDir = "lib/tax-documents/fonts"
$sha = "3b4a25f1d"
New-Item -ItemType Directory -Force -Path $fontDir | Out-Null
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/googlefonts/roboto/$sha/src/hinted/Roboto-Regular.ttf" -OutFile "$fontDir/Roboto-Regular.ttf"
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/googlefonts/roboto/$sha/src/hinted/Roboto-Bold.ttf" -OutFile "$fontDir/Roboto-Bold.ttf"
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/googlefonts/roboto/$sha/LICENSE" -OutFile "$fontDir/LICENSE.txt"
```

Expected: three files present, total ~330 KB. If any download fails, fall back to fetching from `https://fonts.google.com/specimen/Roboto` (manual ZIP download) — record any deviation in the commit message so a future maintainer knows where the bytes came from.

- [ ] **Step 2: Add font README**

Create `lib/tax-documents/fonts/README.md`:

```markdown
# Bundled fonts

Roboto Regular + Bold — Apache-2.0 licensed (`LICENSE.txt`). Used by tax-document
PDFs to render Turkish characters (ı, ğ, ş, ç, ö, ü, İ).

Source: https://github.com/googlefonts/roboto

If updating: keep both Regular and Bold weights together; renderer registers both.
```

- [ ] **Step 3: Verify Next.js does not exclude TTFs from bundling**

Run: `findstr /sni "ttf" next.config.js next.config.mjs 2>nul || echo "no ttf rules"`
Expected: no exclusion rules. If a rule exists, the executor must add a webpack `asset/resource` allowance for TTF files.

- [ ] **Step 4: Commit**

```bash
git add lib/tax-documents/fonts/
git commit -m "chore(tax-documents): bundle Roboto Turkish-capable font (Apache-2.0)"
```

---

### Task 11: PDF document templates (`render.tsx`)

Two `Document` components: `<ReceiptDocument />` and `<AnnualSummaryDocument />`. Both share a `<DocumentHeader />`, `<DonorBlock />`, `<LegalNoteBlock />`, and `<FooterWithQr />` sub-component for DRY.

> **IMPORTANT:** All Turkish legal-text placeholders in this file must be reviewed by a Turkish accountant before production deploy. The strings below are placeholders aligned to the spec; the release gate is in the spec's "Open questions" section.

**Files:**
- Create: `lib/tax-documents/render.tsx`

- [ ] **Step 1: Create render.tsx**

```tsx
import * as React from 'react';
import path from 'path';
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import type {
  DocumentClass,
  DonorSnapshot,
  DonorType,
} from './types';

// Register Turkish-capable fonts ONCE per Node process.
let fontsRegistered = false;
function ensureFonts() {
  if (fontsRegistered) return;
  Font.register({
    family: 'Roboto',
    fonts: [
      { src: path.join(process.cwd(), 'lib/tax-documents/fonts/Roboto-Regular.ttf'), fontWeight: 'normal' },
      { src: path.join(process.cwd(), 'lib/tax-documents/fonts/Roboto-Bold.ttf'), fontWeight: 'bold' },
    ],
  });
  fontsRegistered = true;
}

const styles = StyleSheet.create({
  page: { fontFamily: 'Roboto', fontSize: 10, padding: 36, color: '#1a1a1a' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  brandTitle: { fontSize: 16, fontWeight: 'bold' },
  documentMeta: { textAlign: 'right' },
  documentTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginVertical: 16 },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', marginTop: 14, marginBottom: 4, color: '#444' },
  fieldRow: { flexDirection: 'row', marginBottom: 2 },
  fieldLabel: { width: 130, color: '#555' },
  fieldValue: { flex: 1 },
  legalBlock: { marginTop: 18, padding: 10, borderWidth: 0.5, borderColor: '#888', fontSize: 9, color: '#333' },
  warningBlock: { marginTop: 18, padding: 10, borderWidth: 0.5, borderColor: '#c0392b', fontSize: 9, color: '#922' },
  table: { marginTop: 8, borderTopWidth: 0.5, borderColor: '#aaa' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderColor: '#aaa', paddingVertical: 4 },
  tableHeader: { fontWeight: 'bold', backgroundColor: '#f4f4f4' },
  cellDate: { width: 80 },
  cellTitle: { flex: 1 },
  cellAmount: { width: 90, textAlign: 'right' },
  cellNumber: { width: 110 },
  totalsRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 6, fontWeight: 'bold' },
  footer: { position: 'absolute', bottom: 30, left: 36, right: 36, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  qr: { width: 90, height: 90 },
  qrCaption: { fontSize: 7, color: '#666', marginTop: 2, textAlign: 'center' },
  signatureLine: { width: 160, borderTopWidth: 0.5, borderColor: '#444', textAlign: 'center', paddingTop: 4, fontSize: 9 },
});

export interface RenderReceiptProps {
  document_number: string;
  document_class: DocumentClass;
  donor_snapshot: DonorSnapshot;
  donor_type: DonorType;
  campaign_title: string;
  amount_total: number;
  currency: string;
  donation_date: Date;
  qr_png_data_url: string; // data: URI of the QR PNG buffer
  fund_ed_vkn: string;
  tax_exemption_ref?: string; // present only on official documents
}

const formatTRY = (n: number, ccy: string) =>
  new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + ' ' + ccy;

const formatDate = (d: Date) =>
  new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);

function DocumentHeader({ documentNumber, fundEdVkn }: { documentNumber: string; fundEdVkn: string }) {
  return (
    <View style={styles.headerRow}>
      <View>
        <Text style={styles.brandTitle}>FundEd</Text>
        <Text>Educational Crowdfunding Platform</Text>
        <Text>VKN: {fundEdVkn}</Text>
      </View>
      <View style={styles.documentMeta}>
        <Text>Belge No: {documentNumber}</Text>
        <Text>Düzenlenme: {formatDate(new Date())}</Text>
      </View>
    </View>
  );
}

function DonorBlock({ donor, donorType }: { donor: DonorSnapshot; donorType: DonorType }) {
  return (
    <View>
      <Text style={styles.sectionTitle}>Bağışçı Bilgileri</Text>
      {donorType === 'corporate' ? (
        <>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Şirket Ünvanı:</Text>
            <Text style={styles.fieldValue}>{donor.company_name || donor.full_name}</Text>
          </View>
          {donor.tax_id && (
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>VKN:</Text>
              <Text style={styles.fieldValue}>{donor.tax_id}</Text>
            </View>
          )}
        </>
      ) : (
        <>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Ad Soyad:</Text>
            <Text style={styles.fieldValue}>{donor.full_name}</Text>
          </View>
          {donor.tax_id && (
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>TCKN:</Text>
              <Text style={styles.fieldValue}>{donor.tax_id}</Text>
            </View>
          )}
        </>
      )}
      <View style={styles.fieldRow}>
        <Text style={styles.fieldLabel}>E-posta:</Text>
        <Text style={styles.fieldValue}>{donor.email}</Text>
      </View>
      {donor.address && (
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Adres:</Text>
          <Text style={styles.fieldValue}>{donor.address}</Text>
        </View>
      )}
    </View>
  );
}

function LegalNoteBlock({ documentClass, taxExemptionRef }: { documentClass: DocumentClass; taxExemptionRef?: string }) {
  if (documentClass === 'official') {
    return (
      <View style={styles.legalBlock}>
        <Text>
          Bu belge, GVK md. 89/4 ve KVK md. 10/1-c hükümleri uyarınca yapılan bağışların
          vergi indirimine konu edilmesi amacıyla düzenlenmiştir.
          {taxExemptionRef ? ` Vergi muafiyet karar referansı: ${taxExemptionRef}.` : ''}
        </Text>
      </View>
    );
  }
  return (
    <View style={styles.warningBlock}>
      <Text>
        Bu belge resmî vergi indirim makbuzu değildir; yalnızca bağış işleminizin teyididir.
        Vergi indirimi hakkı için lütfen vergi danışmanınıza başvurun.
      </Text>
    </View>
  );
}

function FooterWithQr({ qrPng }: { qrPng: string }) {
  return (
    <View style={styles.footer} fixed>
      <View>
        <Text style={styles.signatureLine}>Yetkili İmza</Text>
      </View>
      <View>
        <Image src={qrPng} style={styles.qr} />
        <Text style={styles.qrCaption}>Doğrulama QR'ı</Text>
      </View>
    </View>
  );
}

export function ReceiptDocument(props: RenderReceiptProps) {
  ensureFonts();
  const heading = props.document_class === 'official' ? 'BAĞIŞ MAKBUZU' : 'BAĞIŞ TEYİT BELGESİ';
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <DocumentHeader documentNumber={props.document_number} fundEdVkn={props.fund_ed_vkn} />
        <Text style={styles.documentTitle}>{heading}</Text>
        <DonorBlock donor={props.donor_snapshot} donorType={props.donor_type} />

        <Text style={styles.sectionTitle}>Bağış Detayı</Text>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Kampanya:</Text>
          <Text style={styles.fieldValue}>{props.campaign_title}</Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Tarih:</Text>
          <Text style={styles.fieldValue}>{formatDate(props.donation_date)}</Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Tutar:</Text>
          <Text style={[styles.fieldValue, { fontWeight: 'bold' }]}>
            {formatTRY(props.amount_total, props.currency)}
          </Text>
        </View>

        <LegalNoteBlock documentClass={props.document_class} taxExemptionRef={props.tax_exemption_ref} />
        <FooterWithQr qrPng={props.qr_png_data_url} />
      </Page>
    </Document>
  );
}

export interface RenderAnnualSummaryProps {
  document_number: string;
  document_class: DocumentClass;
  donor_snapshot: DonorSnapshot;
  donor_type: DonorType;
  tax_year: number;
  amount_total: number;
  currency: string;
  rows: Array<{
    date: Date;
    campaign_title: string;
    amount: number;
    currency: string;
    receipt_number: string;
  }>;
  qr_png_data_url: string;
  fund_ed_vkn: string;
  tax_exemption_ref?: string;
}

export function AnnualSummaryDocument(props: RenderAnnualSummaryProps) {
  ensureFonts();
  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <DocumentHeader documentNumber={props.document_number} fundEdVkn={props.fund_ed_vkn} />
        <Text style={styles.documentTitle}>YILLIK BAĞIŞ ÖZETİ — {props.tax_year}</Text>
        <DonorBlock donor={props.donor_snapshot} donorType={props.donor_type} />

        <Text style={styles.sectionTitle}>Bağışlar</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.cellDate}>Tarih</Text>
            <Text style={styles.cellTitle}>Kampanya</Text>
            <Text style={styles.cellNumber}>Makbuz No</Text>
            <Text style={styles.cellAmount}>Tutar</Text>
          </View>
          {props.rows.map((r, i) => (
            <View key={i} style={styles.tableRow} wrap={false}>
              <Text style={styles.cellDate}>{formatDate(r.date)}</Text>
              <Text style={styles.cellTitle}>{r.campaign_title}</Text>
              <Text style={styles.cellNumber}>{r.receipt_number}</Text>
              <Text style={styles.cellAmount}>{formatTRY(r.amount, r.currency)}</Text>
            </View>
          ))}
        </View>
        <View style={styles.totalsRow}>
          <Text>Toplam: {formatTRY(props.amount_total, props.currency)}</Text>
        </View>

        <LegalNoteBlock documentClass={props.document_class} taxExemptionRef={props.tax_exemption_ref} />
        <FooterWithQr qrPng={props.qr_png_data_url} />
      </Page>
    </Document>
  );
}
```

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit`
Expected: no new errors. (`@react-pdf/renderer` ships its own types.)

- [ ] **Step 3: Commit**

```bash
git add lib/tax-documents/render.tsx
git commit -m "feat(tax-documents): React-PDF templates (Receipt + Annual Summary)"
```

---

### Task 12: render.ts — `renderToBuffer` wrapper

**Files:**
- Create: `lib/tax-documents/render.ts`

- [ ] **Step 1: Create the wrapper**

```typescript
import { pdf } from '@react-pdf/renderer';
import type { ReactElement } from 'react';

export async function renderDocumentToBuffer(element: ReactElement): Promise<Buffer> {
  const stream = await pdf(element).toBuffer();
  // pdf().toBuffer() returns a NodeJS.ReadableStream in some versions, Buffer in others.
  // Normalize to Buffer.
  if (Buffer.isBuffer(stream)) return stream;
  return await streamToBuffer(stream as NodeJS.ReadableStream);
}

function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (c: Buffer | string) => {
      chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c));
    });
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}
```

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add lib/tax-documents/render.ts
git commit -m "feat(tax-documents): renderDocumentToBuffer wrapper"
```

---

### Chunk 2 wrap-up

- [ ] **Step 1: Smoke render**

Open a Node REPL in the project root and verify the renderer runs end-to-end on a synthetic input:

```powershell
node -e "
const React = require('react');
const { ReceiptDocument } = require('./lib/tax-documents/render');
const { renderDocumentToBuffer } = require('./lib/tax-documents/render');
renderDocumentToBuffer(React.createElement(ReceiptDocument, {
  document_number: 'FE-2026-000001',
  document_class: 'informal',
  donor_snapshot: { full_name: 'Şahin Çetin', email: 't@x.com' },
  donor_type: 'individual',
  campaign_title: 'Öğrenci Kampanyası',
  amount_total: 100,
  currency: 'TRY',
  donation_date: new Date(),
  qr_png_data_url: 'data:image/png;base64,iVBORw0KGgo=',
  fund_ed_vkn: '1234567890',
})).then(b => console.log('PDF bytes:', b.length)).catch(e => { console.error(e); process.exit(1); });
"
```

Expected: prints `PDF bytes: <some number > 1000>`. If it fails with "font not found", verify the path in `render.tsx`'s `Font.register` call resolves under `process.cwd()`. (Skip this step if running on a machine where `node` cannot reach the local FS in this layout — Chunk 3's generator tests cover the renderer indirectly via mocks.)

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit`
Expected: 0 new errors.

If green, proceed to Chunk 3.

---

## Chunk 3: Job queue, generator orchestrator, worker cron, iyzico wiring

Goal of this chunk: turn an enqueued `document_jobs` row into a persisted, audit-logged `tax_documents` row using the rendering primitives from Chunk 2. The existing `iyzico` callback path is wired in this chunk's last task so that paid donations actually trigger the pipeline.

---

### Task 13: jobs.ts — DB-backed queue with atomic claim/lock

**Files:**
- Create: `__tests__/tax-document-job-queue.test.ts`
- Create: `lib/tax-documents/jobs.ts`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/tax-document-job-queue.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

const { mockDb, mockJobsCol, mockDocsCol } = vi.hoisted(() => {
  const mockJobsCol: any = {
    findOne: vi.fn(),
    insertOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    updateOne: vi.fn(),
  };
  const mockDocsCol: any = {
    findOne: vi.fn(),
  };
  const collections: Record<string, any> = {
    document_jobs: mockJobsCol,
    tax_documents: mockDocsCol,
  };
  return {
    mockJobsCol,
    mockDocsCol,
    mockDb: { collection: vi.fn((n: string) => collections[n]) },
  };
});

vi.mock('../lib/db', () => ({ getDb: vi.fn().mockResolvedValue(mockDb) }));

import {
  enqueueReceiptJob,
  claimNextJob,
  completeJob,
  failJob,
} from '../lib/tax-documents/jobs';

describe('enqueueReceiptJob()', () => {
  beforeEach(() => {
    Object.values(mockJobsCol).forEach((fn: any) => fn.mockReset?.());
    mockDocsCol.findOne.mockReset();
  });

  it('inserts a queued job when no existing job and no existing document', async () => {
    mockJobsCol.findOne.mockResolvedValueOnce(null);
    mockDocsCol.findOne.mockResolvedValueOnce(null);
    mockJobsCol.insertOne.mockResolvedValueOnce({ acknowledged: true });

    await enqueueReceiptJob('don_123');

    expect(mockJobsCol.insertOne).toHaveBeenCalledTimes(1);
    const arg = mockJobsCol.insertOne.mock.calls[0][0];
    expect(arg).toMatchObject({
      type: 'receipt',
      payload: { donation_id: 'don_123' },
      status: 'queued',
      attempts: 0,
    });
    expect(arg.job_id).toMatch(/^job_/);
  });

  it('skips when a non-terminal job already exists for the donation', async () => {
    mockJobsCol.findOne.mockResolvedValueOnce({
      job_id: 'job_existing',
      status: 'queued',
    });

    await enqueueReceiptJob('don_123');

    expect(mockJobsCol.insertOne).not.toHaveBeenCalled();
  });

  it('skips when a tax_documents row already references this donation', async () => {
    mockJobsCol.findOne.mockResolvedValueOnce(null);
    mockDocsCol.findOne.mockResolvedValueOnce({ document_id: 'doc_existing' });

    await enqueueReceiptJob('don_123');

    expect(mockJobsCol.insertOne).not.toHaveBeenCalled();
  });
});

describe('claimNextJob()', () => {
  beforeEach(() => {
    mockJobsCol.findOneAndUpdate.mockReset();
  });

  it('returns null when no claimable job', async () => {
    mockJobsCol.findOneAndUpdate.mockResolvedValueOnce(null);
    expect(await claimNextJob('worker-A')).toBeNull();
  });

  it('atomically transitions a queued job to processing with a lock', async () => {
    const fakeJob = {
      job_id: 'job_42',
      type: 'receipt',
      payload: { donation_id: 'don_1' },
      status: 'processing',
      attempts: 0,
    };
    mockJobsCol.findOneAndUpdate.mockResolvedValueOnce(fakeJob);

    const claimed = await claimNextJob('worker-A');

    expect(claimed).toEqual(fakeJob);
    const filter = mockJobsCol.findOneAndUpdate.mock.calls[0][0];
    const update = mockJobsCol.findOneAndUpdate.mock.calls[0][1];
    expect(filter.status).toBe('queued');
    expect(filter.run_after).toBeDefined();
    expect(update.$set.status).toBe('processing');
    expect(update.$set.locked_by).toBe('worker-A');
    expect(update.$set.locked_until).toBeInstanceOf(Date);
  });
});

describe('completeJob() / failJob()', () => {
  beforeEach(() => {
    mockJobsCol.updateOne.mockReset();
  });

  it('completeJob sets status=done and clears the lock', async () => {
    mockJobsCol.updateOne.mockResolvedValueOnce({ matchedCount: 1 });

    await completeJob('job_42');

    const update = mockJobsCol.updateOne.mock.calls[0][1];
    expect(update.$set.status).toBe('done');
    expect(update.$set.completed_at).toBeInstanceOf(Date);
    expect(update.$unset).toEqual({ locked_by: '', locked_until: '' });
  });

  it('failJob below max attempts re-queues with exponential backoff', async () => {
    mockJobsCol.updateOne.mockResolvedValueOnce({ matchedCount: 1 });

    // currentAttempts=0 → nextAttempts=1 → schedule[0] = 60_000 ms (1 minute).
    await failJob('job_42', 0, new Error('Cloudinary down'));

    const update = mockJobsCol.updateOne.mock.calls[0][1];
    expect(update.$set.status).toBe('queued');
    expect(update.$set.last_error).toContain('Cloudinary down');
    expect(update.$inc).toEqual({ attempts: 1 });
    // Backoff schedule: attempt 1 → 1m, 2 → 5m, 3 → 30m, 4 → 2h, 5 → 12h.
    const runAfter = update.$set.run_after as Date;
    const deltaMs = runAfter.getTime() - Date.now();
    expect(deltaMs).toBeGreaterThan(50_000); // ~1 minute
    expect(deltaMs).toBeLessThan(70_000);
  });

  it('failJob honors second-attempt backoff (5 minutes)', async () => {
    mockJobsCol.updateOne.mockResolvedValueOnce({ matchedCount: 1 });

    // currentAttempts=1 → nextAttempts=2 → schedule[1] = 5*60_000 ms (5 minutes).
    await failJob('job_42', 1, new Error('still flaky'));

    const update = mockJobsCol.updateOne.mock.calls[0][1];
    const deltaMs = (update.$set.run_after as Date).getTime() - Date.now();
    expect(deltaMs).toBeGreaterThan(280_000); // ~5 minutes
    expect(deltaMs).toBeLessThan(320_000);
  });

  it('failJob at max attempts marks job as failed terminal', async () => {
    mockJobsCol.updateOne.mockResolvedValueOnce({ matchedCount: 1 });

    await failJob('job_42', 5, new Error('still broken'));

    const update = mockJobsCol.updateOne.mock.calls[0][1];
    expect(update.$set.status).toBe('failed');
    expect(update.$unset).toEqual({ locked_by: '', locked_until: '' });
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

Run: `npx vitest run __tests__/tax-document-job-queue.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement jobs.ts**

Create `lib/tax-documents/jobs.ts`:

```typescript
import { randomUUID } from 'crypto';
import { getDb } from '@/lib/db';
import type { DocumentJob, DocumentType } from './types';

const MAX_ATTEMPTS = 5;
const LOCK_TTL_MS = 5 * 60 * 1000;

// Backoff in milliseconds for attempt N (1-based). Cap at 12h.
function backoffMs(attempts: number): number {
  const schedule = [60_000, 5 * 60_000, 30 * 60_000, 2 * 60 * 60_000, 12 * 60 * 60_000];
  const idx = Math.max(0, Math.min(attempts - 1, schedule.length - 1));
  return schedule[idx];
}

function newJobId(): string {
  return `job_${randomUUID().replace(/-/g, '').slice(0, 22)}`;
}

export async function enqueueReceiptJob(donation_id: string): Promise<void> {
  const db = await getDb();

  // Idempotency layer 1: an in-flight job already exists.
  const existingJob = await db.collection('document_jobs').findOne({
    'payload.donation_id': donation_id,
    status: { $in: ['queued', 'processing'] },
  });
  if (existingJob) return;

  // Idempotency layer 2: a tax_documents row already references this donation.
  const existingDoc = await db.collection('tax_documents').findOne({
    donation_ids: donation_id,
    document_type: 'receipt',
  });
  if (existingDoc) return;

  const job: DocumentJob = {
    job_id: newJobId(),
    type: 'receipt',
    payload: { donation_id },
    status: 'queued',
    attempts: 0,
    run_after: new Date(),
    created_at: new Date(),
  };
  await db.collection('document_jobs').insertOne(job as any);
}

export async function enqueueAnnualSummaryJob(donor_id: string, tax_year: number): Promise<void> {
  const db = await getDb();

  const existingJob = await db.collection('document_jobs').findOne({
    type: 'annual_summary',
    'payload.donor_id': donor_id,
    'payload.tax_year': tax_year,
    status: { $in: ['queued', 'processing'] },
  });
  if (existingJob) return;

  const existingDoc = await db.collection('tax_documents').findOne({
    donor_id,
    document_type: 'annual_summary',
    tax_year,
  });
  if (existingDoc) return;

  const job: DocumentJob = {
    job_id: newJobId(),
    type: 'annual_summary',
    payload: { donor_id, tax_year },
    status: 'queued',
    attempts: 0,
    run_after: new Date(),
    created_at: new Date(),
  };
  await db.collection('document_jobs').insertOne(job as any);
}

export async function claimNextJob(workerId: string): Promise<DocumentJob | null> {
  const db = await getDb();
  const now = new Date();
  const lockUntil = new Date(now.getTime() + LOCK_TTL_MS);

  const job = (await db.collection('document_jobs').findOneAndUpdate(
    {
      status: 'queued',
      run_after: { $lte: now },
      $or: [
        { locked_until: { $exists: false } },
        { locked_until: { $lt: now } },
      ],
    },
    {
      $set: {
        status: 'processing',
        locked_by: workerId,
        locked_until: lockUntil,
      },
    },
    { returnDocument: 'after', sort: { run_after: 1 } }
  )) as DocumentJob | null;

  return job ?? null;
}

export async function completeJob(job_id: string): Promise<void> {
  const db = await getDb();
  await db.collection('document_jobs').updateOne(
    { job_id },
    {
      $set: { status: 'done', completed_at: new Date() },
      $unset: { locked_by: '', locked_until: '' },
    }
  );
}

export async function failJob(job_id: string, currentAttempts: number, error: Error): Promise<void> {
  const db = await getDb();
  const nextAttempts = currentAttempts + 1;
  const isTerminal = nextAttempts > MAX_ATTEMPTS;

  if (isTerminal) {
    await db.collection('document_jobs').updateOne(
      { job_id },
      {
        $set: {
          status: 'failed',
          last_error: error.message,
          completed_at: new Date(),
        },
        $inc: { attempts: 1 },
        $unset: { locked_by: '', locked_until: '' },
      }
    );
    return;
  }

  await db.collection('document_jobs').updateOne(
    { job_id },
    {
      $set: {
        status: 'queued',
        last_error: error.message,
        run_after: new Date(Date.now() + backoffMs(nextAttempts)),
      },
      $inc: { attempts: 1 },
      $unset: { locked_by: '', locked_until: '' },
    }
  );
}
```

- [ ] **Step 4: Run tests — verify they pass**

Run: `npx vitest run __tests__/tax-document-job-queue.test.ts`
Expected: PASS, 9 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/tax-documents/jobs.ts __tests__/tax-document-job-queue.test.ts
git commit -m "feat(tax-documents): MongoDB-backed job queue with atomic claim/backoff"
```

---

### Task 14: generate.ts — orchestrator that turns a job into an issued document

**Files:**
- Create: `__tests__/tax-document-generate.test.ts`
- Create: `lib/tax-documents/audit.ts` (small helper for audit log)
- Create: `lib/tax-documents/generate.ts`

- [ ] **Step 1: Create audit helper first**

Create `lib/tax-documents/audit.ts`:

```typescript
import { randomUUID } from 'crypto';
import { getDb } from '@/lib/db';
import type { ActorRole, AuditEvent, DocumentAuditLogEntry } from './types';

export async function writeAuditEntry(entry: {
  document_id: string;
  event: AuditEvent;
  actor_role: ActorRole;
  actor_id?: string;
  ip?: string;
  user_agent?: string;
  meta?: Record<string, unknown>;
}): Promise<void> {
  const db = await getDb();
  const row: DocumentAuditLogEntry = {
    event_id: `evt_${randomUUID().replace(/-/g, '').slice(0, 22)}`,
    document_id: entry.document_id,
    event: entry.event,
    actor_role: entry.actor_role,
    actor_id: entry.actor_id,
    ip: entry.ip,
    user_agent: entry.user_agent,
    meta: entry.meta,
    at: new Date(),
  };
  await db.collection('document_audit_log').insertOne(row as any);
}
```

- [ ] **Step 2: Write failing generator tests**

Create `__tests__/tax-document-generate.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

const { mockDb, collections } = vi.hoisted(() => {
  const make = () => ({
    findOne: vi.fn(),
    insertOne: vi.fn().mockResolvedValue({ acknowledged: true }),
    findOneAndUpdate: vi.fn(),
    updateOne: vi.fn().mockResolvedValue({ matchedCount: 1 }),
    find: vi.fn(),
  });
  const collections: Record<string, any> = {
    donations: make(),
    campaigns: make(),
    companies: make(),
    users: make(),
    tax_documents: make(),
    document_jobs: make(),
    document_audit_log: make(),
    document_counters: make(),
  };
  return { collections, mockDb: { collection: vi.fn((n: string) => collections[n]) } };
});

vi.mock('../lib/db', () => ({ getDb: vi.fn().mockResolvedValue(mockDb) }));

vi.mock('../lib/tax-documents/render', () => ({
  renderDocumentToBuffer: vi.fn().mockResolvedValue(Buffer.from('%PDF-1.4 fake', 'utf-8')),
}));

vi.mock('../lib/tax-documents/qr', () => ({
  generateQrPngBuffer: vi.fn().mockResolvedValue(Buffer.from('PNG fake', 'utf-8')),
  buildVerifyUrl: vi.fn((code: string) => `https://funded.org/verify/${code}`),
}));

vi.mock('../lib/tax-documents/storage', () => ({
  uploadPdf: vi.fn().mockResolvedValue({
    url: 'https://cdn.example.com/x.pdf',
    storage_path: 'tax_documents/2026/FE-2026-000001.pdf',
    hash_sha256: 'abc123',
  }),
  buildPdfStoragePath: vi.fn(),
  getSignedPdfUrl: vi.fn(),
}));

import { generateReceiptForJob } from '../lib/tax-documents/generate';

beforeEach(() => {
  Object.values(collections).forEach((c: any) =>
    Object.values(c).forEach((fn: any) => fn.mockReset?.())
  );
  // Defaults that most tests expect:
  collections.tax_documents.insertOne.mockResolvedValue({ acknowledged: true });
  collections.document_audit_log.insertOne.mockResolvedValue({ acknowledged: true });
  collections.document_counters.findOneAndUpdate.mockResolvedValue({
    _id: 'tax_documents:2026',
    seq: 1,
  });
});

describe('generateReceiptForJob()', () => {
  it('persists tax_documents row and audit entry on success', async () => {
    process.env.TAX_DOCUMENT_HMAC_SECRET = 'secret';
    process.env.TAX_DOCUMENT_FUND_ED_VKN = '1234567890';

    collections.donations.findOne.mockResolvedValueOnce({
      donation_id: 'don_1',
      donor_id: 'user_1',
      amount: 250,
      currency: 'TRY',
      campaign_id: 'cam_1',
      created_at: new Date('2026-03-15'),
      donor_name: 'Ali Yılmaz',
      donor_email: 'ali@example.com',
    });
    collections.campaigns.findOne.mockResolvedValueOnce({
      campaign_id: 'cam_1',
      title: 'Bursiyer Mehmet',
      beneficiary_type: 'individual',
    });
    collections.users.findOne.mockResolvedValueOnce({
      _id: 'user_1',
      email: 'ali@example.com',
      name: 'Ali Yılmaz',
      tax_profile: { profile_type: 'individual' },
    });

    const job = {
      job_id: 'job_1',
      type: 'receipt' as const,
      payload: { donation_id: 'don_1' },
      status: 'processing' as const,
      attempts: 0,
      run_after: new Date(),
      created_at: new Date(),
    };

    await generateReceiptForJob(job);

    expect(collections.tax_documents.insertOne).toHaveBeenCalledTimes(1);
    const inserted = collections.tax_documents.insertOne.mock.calls[0][0];
    expect(inserted).toMatchObject({
      document_type: 'receipt',
      document_class: 'informal', // individual campaign
      donor_type: 'individual',
      donation_ids: ['don_1'],
      amount_total: 250,
      currency: 'TRY',
      tax_year: 2026,
      status: 'issued',
    });
    expect(inserted.document_number).toMatch(/^FE-2026-\d{6}$/);
    expect(inserted.donor_snapshot.full_name).toBe('Ali Yılmaz');

    expect(collections.document_audit_log.insertOne).toHaveBeenCalled();
    const audit = collections.document_audit_log.insertOne.mock.calls[0][0];
    expect(audit.event).toBe('issued');
    expect(audit.actor_role).toBe('system');
  });

  it('classifies as official when campaign is foundation-backed', async () => {
    process.env.TAX_DOCUMENT_HMAC_SECRET = 'secret';
    process.env.TAX_DOCUMENT_FUND_ED_VKN = '1234567890';

    collections.donations.findOne.mockResolvedValueOnce({
      donation_id: 'don_2',
      donor_id: 'user_1',
      amount: 1000,
      currency: 'TRY',
      campaign_id: 'cam_2',
      created_at: new Date('2026-04-01'),
      donor_email: 'ali@example.com',
    });
    collections.campaigns.findOne.mockResolvedValueOnce({
      campaign_id: 'cam_2',
      title: 'Vakıf Kampanyası',
      beneficiary_type: 'foundation',
    });
    collections.users.findOne.mockResolvedValueOnce({
      _id: 'user_1',
      email: 'ali@example.com',
      name: 'Ali',
    });

    await generateReceiptForJob({
      job_id: 'job_2',
      type: 'receipt',
      payload: { donation_id: 'don_2' },
      status: 'processing',
      attempts: 0,
      run_after: new Date(),
      created_at: new Date(),
    });

    const inserted = collections.tax_documents.insertOne.mock.calls[0][0];
    expect(inserted.document_class).toBe('official');
  });

  it('throws when donation is missing', async () => {
    collections.donations.findOne.mockResolvedValueOnce(null);
    await expect(
      generateReceiptForJob({
        job_id: 'job_3',
        type: 'receipt',
        payload: { donation_id: 'missing' },
        status: 'processing',
        attempts: 0,
        run_after: new Date(),
        created_at: new Date(),
      })
    ).rejects.toThrow(/donation/i);
  });
});
```

- [ ] **Step 3: Run tests — verify they fail**

Run: `npx vitest run __tests__/tax-document-generate.test.ts`
Expected: FAIL — `generateReceiptForJob` not exported.

- [ ] **Step 4: Implement generate.ts**

Create `lib/tax-documents/generate.ts`:

```typescript
import { randomUUID } from 'crypto';
import * as React from 'react';
import { getDb } from '@/lib/db';
import { classify } from './classify';
import { allocateDocumentNumber } from './numbering';
import {
  generateVerificationCode,
  computePayloadHmac,
} from './verification';
import { generateQrPngBuffer, buildVerifyUrl } from './qr';
import { renderDocumentToBuffer } from './render';
import { ReceiptDocument, AnnualSummaryDocument } from './render';
import { uploadPdf } from './storage';
import { writeAuditEntry } from './audit';
import type {
  DocumentJob,
  DonorSnapshot,
  DonorType,
  TaxDocument,
} from './types';

function newDocumentId(): string {
  return `doc_${randomUUID().replace(/-/g, '').slice(0, 22)}`;
}

interface ResolvedDonor {
  donor_id: string;
  donor_type: DonorType;
  donor_snapshot: DonorSnapshot;
}

async function resolveDonor(
  donor_id: string,
  donation: any
): Promise<ResolvedDonor> {
  const db = await getDb();
  const user = await db.collection('users').findOne({ _id: donor_id as any });
  const tp = user?.tax_profile as any | undefined;
  const donor_type: DonorType = tp?.profile_type === 'corporate' ? 'corporate' : 'individual';

  const snapshot: DonorSnapshot = {
    full_name: tp?.full_name || donation.donor_name || user?.name || 'Bağışçı',
    email: donation.donor_email || user?.email || 'unknown@local',
    tax_id: tp?.tax_id,
    company_name: tp?.company_name,
    address: tp?.address,
  };

  return { donor_id, donor_type, donor_snapshot: snapshot };
}

export async function generateReceiptForJob(job: DocumentJob): Promise<void> {
  if (job.type !== 'receipt' || !job.payload.donation_id) {
    throw new Error(`generateReceiptForJob called with wrong job shape: ${job.job_id}`);
  }

  const db = await getDb();
  const donation = await db.collection('donations').findOne({
    donation_id: job.payload.donation_id,
  });
  if (!donation) {
    throw new Error(`Donation not found: ${job.payload.donation_id}`);
  }

  const campaign = donation.campaign_id
    ? await db.collection('campaigns').findOne({ campaign_id: donation.campaign_id })
    : null;

  let companyTaxExempt: boolean | undefined;
  if (campaign?.linked_company_id) {
    const company = await db.collection('companies').findOne({
      _id: campaign.linked_company_id as any,
    });
    companyTaxExempt = company?.tax_exempt === true;
  }

  const document_class = classify({
    beneficiary_type: campaign?.beneficiary_type,
    linked_company_tax_exempt: companyTaxExempt,
  });

  const donor = await resolveDonor(donation.donor_id, donation);
  const tax_year = (donation.created_at instanceof Date
    ? donation.created_at
    : new Date(donation.created_at)
  ).getUTCFullYear();

  const document_number = await allocateDocumentNumber(tax_year);
  const document_id = newDocumentId();
  const verification_code = generateVerificationCode();
  const amount_total = Number(donation.amount) || 0;
  const verification_payload_hmac = computePayloadHmac({
    document_number,
    donor_id: donor.donor_id,
    amount_total,
    tax_year,
  });

  const qrBuf = await generateQrPngBuffer(buildVerifyUrl(verification_code));
  const qrDataUrl = `data:image/png;base64,${qrBuf.toString('base64')}`;

  const pdfBuf = await renderDocumentToBuffer(
    React.createElement(ReceiptDocument, {
      document_number,
      document_class,
      donor_snapshot: donor.donor_snapshot,
      donor_type: donor.donor_type,
      campaign_title: campaign?.title || 'Kampanya',
      amount_total,
      currency: donation.currency || 'TRY',
      donation_date: donation.created_at instanceof Date
        ? donation.created_at
        : new Date(donation.created_at),
      qr_png_data_url: qrDataUrl,
      fund_ed_vkn: process.env.TAX_DOCUMENT_FUND_ED_VKN || '',
      tax_exemption_ref: document_class === 'official'
        ? process.env.TAX_DOCUMENT_TAX_EXEMPTION_REF
        : undefined,
    })
  );

  const upload = await uploadPdf(pdfBuf, tax_year, document_number);

  const row: TaxDocument = {
    document_id,
    document_number,
    document_type: 'receipt',
    document_class,
    donor_id: donor.donor_id,
    donor_type: donor.donor_type,
    donor_snapshot: donor.donor_snapshot,
    donation_ids: [donation.donation_id],
    campaign_id: campaign?.campaign_id,
    campaign_title_snapshot: campaign?.title,
    amount_total,
    currency: donation.currency || 'TRY',
    donation_date: donation.created_at instanceof Date
      ? donation.created_at
      : new Date(donation.created_at),
    tax_year,
    verification_code,
    verification_payload_hmac,
    pdf_url: upload.url,
    pdf_storage_path: upload.storage_path,
    pdf_hash_sha256: upload.hash_sha256,
    status: 'issued',
    created_at: new Date(),
    issued_at: new Date(),
  };

  await db.collection('tax_documents').insertOne(row as any);
  await writeAuditEntry({
    document_id,
    event: 'issued',
    actor_role: 'system',
    meta: { job_id: job.job_id, donation_id: donation.donation_id },
  });
}

// Annual-summary generation — body added in Chunk 4 alongside the cron handler.
// Stub kept here so generate.ts has a single home for orchestrators.
export async function generateAnnualSummaryForJob(_job: DocumentJob): Promise<void> {
  throw new Error('generateAnnualSummaryForJob not yet implemented (Chunk 4 task)');
}
```

- [ ] **Step 5: Run tests — verify they pass**

Run: `npx vitest run __tests__/tax-document-generate.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 6: Commit**

```bash
git add lib/tax-documents/audit.ts lib/tax-documents/generate.ts __tests__/tax-document-generate.test.ts
git commit -m "feat(tax-documents): generator orchestrator + audit helper"
```

---

### Task 15: Worker cron handler `/api/cron/process-documents`

**Files:**
- Create: `app/api/cron/process-documents/route.ts`
- Modify: `vercel.json` (register cron)

- [ ] **Step 1: Read existing cron handler for pattern**

Run: `code app/api/cron/process-subscriptions/route.ts` (or open in your editor)
Confirm the pattern: header `Authorization: Bearer <CRON_SECRET>` is required; returns JSON with counts.

- [ ] **Step 2: Create the worker handler**

Create `app/api/cron/process-documents/route.ts`:

```typescript
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { claimNextJob, completeJob, failJob } from '@/lib/tax-documents/jobs';
import {
  generateReceiptForJob,
  generateAnnualSummaryForJob,
} from '@/lib/tax-documents/generate';

const MAX_PER_INVOCATION = 10;

export async function GET(request: NextRequest) {
  return handle(request);
}
export async function POST(request: NextRequest) {
  return handle(request);
}

async function handle(request: NextRequest) {
  const auth = request.headers.get('authorization') || '';
  const expected = `Bearer ${process.env.CRON_SECRET || ''}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const workerId = `cron-${randomUUID().slice(0, 8)}`;
  let processed = 0;
  let failed = 0;

  for (let i = 0; i < MAX_PER_INVOCATION; i++) {
    const job = await claimNextJob(workerId);
    if (!job) break;

    try {
      if (job.type === 'receipt') {
        await generateReceiptForJob(job);
      } else if (job.type === 'annual_summary') {
        await generateAnnualSummaryForJob(job);
      } else {
        throw new Error(`Unknown job type: ${(job as any).type}`);
      }
      await completeJob(job.job_id);
      processed++;
    } catch (err: any) {
      console.error('[cron/process-documents] job failed', { job: job.job_id, err: err?.message });
      await failJob(job.job_id, job.attempts, err instanceof Error ? err : new Error(String(err)));
      failed++;
    }
  }

  return NextResponse.json({ ok: true, worker: workerId, processed, failed });
}
```

- [ ] **Step 3: Register cron in `vercel.json`**

Open `vercel.json`. Inside the existing `crons` array (or create one if absent), add:

```json
{
  "path": "/api/cron/process-documents",
  "schedule": "*/1 * * * *"
}
```

If the project's Vercel plan does not allow per-minute scheduling, downgrade to `*/15 * * * *` and rely on the on-demand dashboard fallback introduced in Chunk 4 (donor can refresh their belgeler page to nudge generation if the cron has not run yet). Document the decision in the commit message.

- [ ] **Step 4: Smoke test the handler locally (optional)**

If the dev environment can reach MongoDB, manually insert a stub job and curl the handler:

```powershell
$env:CRON_SECRET = "dev-secret"
# (Insert a fake job via mongo shell, then:)
curl -H "Authorization: Bearer dev-secret" http://localhost:3000/api/cron/process-documents
```

Expected: 200 with JSON `{ ok: true, processed, failed }`.

- [ ] **Step 5: Commit**

```bash
git add app/api/cron/process-documents/route.ts vercel.json
git commit -m "feat(tax-documents): cron worker /api/cron/process-documents"
```

---

### Task 16: Wire iyzico paid callback to enqueue receipt job

The callback already updates `donation.payment_status` to `paid`. We add an enqueue side-effect right after that transition succeeds. This is the only place in the codebase where a donation transitions to paid.

**Files:**
- Modify: `app/api/iyzico/callback/route.ts`

- [ ] **Step 1: Find the success-write site**

Run: `grep -n "payment_status" app/api/iyzico/callback/route.ts`
Identify the `updateOne` (or `findOneAndUpdate`) call that sets `payment_status: 'paid'`. Note its location.

- [ ] **Step 2: Add enqueue call**

After the update succeeds (and before returning the response), add:

```typescript
// Enqueue tax document receipt generation. Idempotent — safe across callback retries.
try {
  const { enqueueReceiptJob } = await import('@/lib/tax-documents/jobs');
  await enqueueReceiptJob(donation.donation_id);
} catch (e) {
  console.error('[iyzico/callback] failed to enqueue tax doc job', e);
  // Do NOT fail the callback — receipt generation is best-effort.
}
```

The dynamic `import()` keeps the donations callback bundle lean and isolates failures.

- [ ] **Step 3: Run callback handler tests if any exist**

Run: `npx vitest run __tests__ --silent | findstr /i iyzico`
If a callback test exists, run it explicitly. If not, manual end-to-end testing in Chunk 4 will validate.

- [ ] **Step 4: TypeScript check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 5: Commit**

```bash
git add app/api/iyzico/callback/route.ts
git commit -m "feat(tax-documents): enqueue receipt job on paid donation"
```

---

### Chunk 3 wrap-up

- [ ] **Step 1: Run full Chunk 3 test suite**

Run: `npx vitest run __tests__/tax-document-job-queue.test.ts __tests__/tax-document-generate.test.ts`
Expected: all green (9 + 3 = 12 tests).

- [ ] **Step 2: Run full project test suite (regression check)**

Run: `npx vitest run`
Expected: no previously-passing test now failing. Pre-existing failures unrelated to tax-documents are acceptable.

- [ ] **Step 3: Lint + typecheck**

Run: `npx tsc --noEmit && npm run lint -- --quiet 2>nul`
Expected: 0 type errors. Lint warnings non-blocking.

If green, proceed to Chunk 4.

---
