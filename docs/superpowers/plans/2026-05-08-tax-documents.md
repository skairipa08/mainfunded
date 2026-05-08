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
