# FundEd P0 Implementation Blueprint

**Stack**: Next.js 14 App Router + NextAuth + MongoDB/Mongoose + Stripe  
**Date**: 2026-01-19

---

## A) P0 Implementation Steps (6 Steps)

### Step 1: Auth Middleware + User Model
**Goal**: Secure foundation with userId enforcement everywhere.

**Files**:
- `src/models/User.ts` - extend with role field
- `src/lib/auth/session.ts` - getServerSession wrapper
- `src/lib/auth/guards.ts` - requireAuth, requireAdmin helpers
- `src/middleware.ts` - route protection

**Acceptance**:
- [ ] All `/api/verification/*` routes require auth
- [ ] All `/api/admin/*` routes require admin role
- [ ] Unauthenticated requests → 401
- [ ] Non-admin to admin routes → 403

**Risk**: Low

---

### Step 2: Data Models + Indexes
**Goal**: Mongoose schemas with optimistic locking.

**Files**:
- `src/models/Verification.ts`
- `src/models/VerificationDocument.ts`
- `src/models/VerificationEvent.ts`
- `src/models/AuditLog.ts`
- `src/models/StripeEvent.ts`

**Acceptance**:
- [ ] All models created with versionKey enabled
- [ ] Indexes created (userId, status, hash)
- [ ] PII fields marked for encryption
- [ ] Test: 1000 records load < 1s

**Risk**: Low

---

### Step 3: Upload System
**Goal**: Secure document upload with hash dedup.

**Files**:
- `src/app/api/verification/documents/route.ts`
- `src/app/api/verification/documents/[id]/route.ts`
- `src/lib/upload/validation.ts`
- `src/lib/upload/storage.ts`

**Acceptance**:
- [ ] Magic byte validation rejects wrong types
- [ ] SHA256 hash stored per document
- [ ] Duplicate hash flagged
- [ ] Signed URLs expire in 15 min
- [ ] Max 8MB images, 10MB PDF

**Risk**: Medium

---

### Step 4: Verification API
**Goal**: Full user verification flow with ownership checks.

**Files**:
- `src/app/api/verification/route.ts` (GET/POST)
- `src/app/api/verification/submit/route.ts`
- `src/lib/verification/service.ts`
- `src/lib/verification/transitions.ts`

**Acceptance**:
- [ ] Create draft works
- [ ] Submit validates required docs
- [ ] IDOR tests pass (user A can't see B)
- [ ] Optimistic lock prevents race conditions
- [ ] Events logged to VerificationEvent

**Risk**: Medium

---

### Step 5: Admin API + Queue
**Goal**: Admin review with audit logging.

**Files**:
- `src/app/api/admin/verifications/route.ts`
- `src/app/api/admin/verifications/[id]/route.ts`
- `src/app/api/admin/verifications/[id]/action/route.ts`
- `src/app/(admin)/admin/verifications/page.tsx`
- `src/app/(admin)/admin/verifications/[id]/page.tsx`

**Acceptance**:
- [ ] Queue loads with filters
- [ ] Approve/Reject/NeedMoreInfo works
- [ ] AuditLog created for every action
- [ ] Email sent on status change

**Risk**: Medium

---

### Step 6: Security Tests + Hardening
**Goal**: Validate all security controls.

**Files**:
- `src/__tests__/security/idor.test.ts`
- `src/__tests__/security/upload.test.ts`
- `src/__tests__/security/ratelimit.test.ts`

**Acceptance**:
- [ ] 12/12 IDOR tests pass
- [ ] 8/8 upload tests pass
- [ ] Rate limits enforced
- [ ] No PII in logs

**Risk**: High (blocking for launch)

---

## B) Mongoose Data Models

### Verification.ts

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export const VERIFICATION_STATUSES = [
  'DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED',
  'NEEDS_MORE_INFO', 'UNDER_INVESTIGATION', 'SUSPENDED',
  'EXPIRED', 'REVOKED', 'PERMANENTLY_BANNED', 'ABANDONED'
] as const;

export type VerificationStatus = typeof VERIFICATION_STATUSES[number];

export interface IVerification extends Document {
  userId: mongoose.Types.ObjectId;
  status: VerificationStatus;
  statusChangedAt: Date;
  expiresAt?: Date;
  reapplyEligibleAt?: Date;
  
  // Profile (encrypt these in production)
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  phoneHash: string;
  country: string;
  city?: string;
  
  // Education
  institutionName: string;
  institutionCountry: string;
  institutionType: 'university' | 'college' | 'vocational' | 'high_school';
  studentIdHash: string;
  enrollmentYear: number;
  expectedGraduation: number;
  degreeProgram: string;
  degreeLevel: 'bachelor' | 'master' | 'phd' | 'associate' | 'certificate';
  
  // Risk
  riskScore: number;
  riskFlags: string[];
  
  // Assignment
  assignedTo?: mongoose.Types.ObjectId;
  assignedAt?: Date;
  
  // Timestamps
  submittedAt?: Date;
  reviewedAt?: Date;
}

const VerificationSchema = new Schema<IVerification>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: { type: String, enum: VERIFICATION_STATUSES, default: 'DRAFT', index: true },
  statusChangedAt: { type: Date, default: Date.now },
  expiresAt: Date,
  reapplyEligibleAt: Date,
  
  firstName: { type: String, required: true, maxlength: 50 },
  lastName: { type: String, required: true, maxlength: 50 },
  dateOfBirth: { type: Date, required: true },
  phoneHash: { type: String, required: true, index: true },
  country: { type: String, required: true, maxlength: 2 },
  city: { type: String, maxlength: 100 },
  
  institutionName: { type: String, required: true, maxlength: 200 },
  institutionCountry: { type: String, required: true, maxlength: 2 },
  institutionType: { type: String, enum: ['university', 'college', 'vocational', 'high_school'], required: true },
  studentIdHash: { type: String, required: true },
  enrollmentYear: { type: Number, required: true },
  expectedGraduation: { type: Number, required: true },
  degreeProgram: { type: String, required: true, maxlength: 150 },
  degreeLevel: { type: String, enum: ['bachelor', 'master', 'phd', 'associate', 'certificate'], required: true },
  
  riskScore: { type: Number, default: 0 },
  riskFlags: { type: [String], default: [] },
  
  assignedTo: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
  assignedAt: Date,
  
  submittedAt: Date,
  reviewedAt: Date,
}, { 
  timestamps: true,
  optimisticConcurrency: true  // Enables __v based locking
});

// Compound indexes
VerificationSchema.index({ studentIdHash: 1, institutionName: 1 });
VerificationSchema.index({ status: 1, assignedTo: 1 });
VerificationSchema.index({ expiresAt: 1 }, { sparse: true });

export default mongoose.models.Verification || 
  mongoose.model<IVerification>('Verification', VerificationSchema);
```

### VerificationDocument.ts

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export const DOCUMENT_TYPES = [
  'STUDENT_ID', 'ENROLLMENT_LETTER', 'GOVERNMENT_ID',
  'SELFIE_WITH_ID', 'TRANSCRIPT', 'PROOF_OF_ADDRESS', 'OTHER'
] as const;

export interface IVerificationDocument extends Document {
  verificationId: mongoose.Types.ObjectId;
  documentType: typeof DOCUMENT_TYPES[number];
  storagePath: string;
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
  sha256Hash: string;
  isVerified: boolean;
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  rejectReason?: string;
  uploadedAt: Date;
}

const VerificationDocumentSchema = new Schema<IVerificationDocument>({
  verificationId: { type: Schema.Types.ObjectId, ref: 'Verification', required: true, index: true },
  documentType: { type: String, enum: DOCUMENT_TYPES, required: true },
  storagePath: { type: String, required: true },
  fileName: { type: String, required: true },
  mimeType: { type: String, required: true },
  fileSizeBytes: { type: Number, required: true },
  sha256Hash: { type: String, required: true, index: true },
  isVerified: { type: Boolean, default: false },
  verifiedBy: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
  verifiedAt: Date,
  rejectReason: String,
  uploadedAt: { type: Date, default: Date.now },
});

export default mongoose.models.VerificationDocument || 
  mongoose.model<IVerificationDocument>('VerificationDocument', VerificationDocumentSchema);
```

### VerificationEvent.ts (Immutable Ledger)

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export const EVENT_TYPES = [
  'CREATED', 'UPDATED', 'SUBMITTED', 'DOCUMENT_UPLOADED', 'DOCUMENT_DELETED',
  'APPROVED', 'REJECTED', 'NEEDS_MORE_INFO', 'SUSPENDED', 'REVOKED',
  'BANNED', 'EXPIRED', 'REACTIVATED', 'ASSIGNED', 'ESCALATED',
  'NOTE_ADDED', 'FLAG_ADDED', 'FLAG_REMOVED'
] as const;

export interface IVerificationEvent extends Document {
  verificationId: mongoose.Types.ObjectId;
  eventType: typeof EVENT_TYPES[number];
  eventData: Record<string, any>;
  actorType: 'USER' | 'ADMIN' | 'SYSTEM';
  actorId?: mongoose.Types.ObjectId;
  actorIp?: string;
  occurredAt: Date;
}

const VerificationEventSchema = new Schema<IVerificationEvent>({
  verificationId: { type: Schema.Types.ObjectId, ref: 'Verification', required: true, index: true },
  eventType: { type: String, enum: EVENT_TYPES, required: true },
  eventData: { type: Schema.Types.Mixed, default: {} },
  actorType: { type: String, enum: ['USER', 'ADMIN', 'SYSTEM'], required: true },
  actorId: Schema.Types.ObjectId,
  actorIp: String,
  occurredAt: { type: Date, default: Date.now, index: true },
}, { 
  timestamps: false,
  strict: true,
});

// Prevent updates/deletes
VerificationEventSchema.pre('updateOne', function() { throw new Error('Events are immutable'); });
VerificationEventSchema.pre('deleteOne', function() { throw new Error('Events are immutable'); });

export default mongoose.models.VerificationEvent || 
  mongoose.model<IVerificationEvent>('VerificationEvent', VerificationEventSchema);
```

### StripeEvent.ts (Webhook Idempotency)

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IStripeEvent extends Document {
  eventId: string;
  eventType: string;
  receivedAt: Date;
  processedAt?: Date;
  processingStatus: 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'FAILED';
  payload: Record<string, any>;
  errorMessage?: string;
  retryCount: number;
}

const StripeEventSchema = new Schema<IStripeEvent>({
  eventId: { type: String, required: true, unique: true },
  eventType: { type: String, required: true },
  receivedAt: { type: Date, default: Date.now },
  processedAt: Date,
  processingStatus: { type: String, enum: ['PENDING', 'PROCESSING', 'PROCESSED', 'FAILED'], default: 'PENDING' },
  payload: { type: Schema.Types.Mixed, required: true },
  errorMessage: String,
  retryCount: { type: Number, default: 0 },
});

StripeEventSchema.index({ processingStatus: 1 }, { partialFilterExpression: { processingStatus: { $in: ['PENDING', 'FAILED'] } } });

export default mongoose.models.StripeEvent || 
  mongoose.model<IStripeEvent>('StripeEvent', StripeEventSchema);
```

---

## C) State Machine + Transitions

### States

| Status | Description |
|--------|-------------|
| DRAFT | User editing |
| PENDING_REVIEW | Awaiting admin |
| APPROVED | Verified ✓ |
| REJECTED | Denied |
| NEEDS_MORE_INFO | Docs requested |
| UNDER_INVESTIGATION | Fraud review |
| SUSPENDED | Temp hold |
| EXPIRED | Needs re-verify |
| REVOKED | Permanent deny |
| PERMANENTLY_BANNED | No access |
| ABANDONED | Timeout |

### Transitions Table

```typescript
// src/lib/verification/transitions.ts

export const ALLOWED_TRANSITIONS: Record<string, { to: string[]; actor: ('USER' | 'ADMIN' | 'SYSTEM')[] }> = {
  DRAFT: { to: ['PENDING_REVIEW', 'ABANDONED'], actor: ['USER', 'SYSTEM'] },
  PENDING_REVIEW: { to: ['APPROVED', 'REJECTED', 'NEEDS_MORE_INFO', 'UNDER_INVESTIGATION'], actor: ['ADMIN'] },
  APPROVED: { to: ['SUSPENDED', 'EXPIRED', 'REVOKED'], actor: ['ADMIN', 'SYSTEM'] },
  REJECTED: { to: ['PENDING_REVIEW'], actor: ['USER'] },
  NEEDS_MORE_INFO: { to: ['PENDING_REVIEW', 'ABANDONED'], actor: ['USER', 'SYSTEM'] },
  UNDER_INVESTIGATION: { to: ['APPROVED', 'REJECTED', 'PERMANENTLY_BANNED'], actor: ['ADMIN'] },
  SUSPENDED: { to: ['APPROVED', 'REVOKED'], actor: ['ADMIN'] },
  EXPIRED: { to: ['PENDING_REVIEW'], actor: ['USER'] },
  REVOKED: { to: [], actor: [] },
  PERMANENTLY_BANNED: { to: [], actor: [] },
  ABANDONED: { to: ['DRAFT'], actor: ['USER'] },
};

export function canTransition(from: string, to: string, actor: string): boolean {
  const allowed = ALLOWED_TRANSITIONS[from];
  return allowed?.to.includes(to) && allowed?.actor.includes(actor as any);
}
```

### Atomic Transition (Concurrency Safe)

```typescript
// src/lib/verification/service.ts

export async function transitionStatus(
  verificationId: string,
  userId: string,
  newStatus: string,
  actor: 'USER' | 'ADMIN' | 'SYSTEM',
  actorId?: string
): Promise<IVerification> {
  const verification = await Verification.findOne({ _id: verificationId, userId });
  if (!verification) throw new Error('NOT_FOUND');
  
  if (!canTransition(verification.status, newStatus, actor)) {
    throw new Error('INVALID_TRANSITION');
  }
  
  // Atomic update with version check
  const result = await Verification.findOneAndUpdate(
    { 
      _id: verificationId, 
      userId,
      __v: verification.__v  // Optimistic lock
    },
    { 
      $set: { status: newStatus, statusChangedAt: new Date() },
      $inc: { __v: 1 }
    },
    { new: true }
  );
  
  if (!result) throw new Error('VERSION_CONFLICT');
  
  // Log event
  await VerificationEvent.create({
    verificationId,
    eventType: newStatus,
    eventData: { from: verification.status, to: newStatus },
    actorType: actor,
    actorId,
  });
  
  return result;
}
```

---

## D) AuthZ / IDOR Fix Plan

### Universal Rule

**EVERY query MUST include userId scoping for user endpoints.**

### Guard Helpers

```typescript
// src/lib/auth/guards.ts

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw { status: 401, message: 'Unauthorized' };
  }
  return session.user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    throw { status: 403, message: 'Forbidden' };
  }
  return user;
}

export async function getVerificationForUser(verificationId: string, userId: string) {
  const verification = await Verification.findOne({ 
    _id: verificationId, 
    userId  // CRITICAL: Always scope by userId
  });
  if (!verification) {
    throw { status: 404, message: 'Not found' };  // 404 not 403 to prevent enumeration
  }
  return verification;
}

export async function getDocumentForUser(documentId: string, userId: string) {
  const doc = await VerificationDocument.findById(documentId).populate('verificationId');
  if (!doc || doc.verificationId.userId.toString() !== userId) {
    throw { status: 404, message: 'Not found' };
  }
  return doc;
}
```

### Protected Endpoints Checklist (25 checks)

| # | Endpoint | Check | Test |
|---|----------|-------|------|
| 1 | GET /api/verification | userId from session | A can't see B's |
| 2 | POST /api/verification | userId from session | Creates for auth user only |
| 3 | PUT /api/verification/:id | getVerificationForUser | A can't update B's |
| 4 | POST /api/verification/submit | getVerificationForUser | A can't submit B's |
| 5 | POST /api/verification/documents | getVerificationForUser | A can't upload to B's |
| 6 | GET /api/verification/documents/:id | getDocumentForUser | A can't view B's |
| 7 | DELETE /api/verification/documents/:id | getDocumentForUser + DRAFT | A can't delete B's |
| 8 | GET /api/admin/* | requireAdmin | User → 403 |
| 9 | POST /api/admin/.../action | requireAdmin | User → 403 |
| 10 | Rate limit login | 5/min/IP | 6th → 429 |
| 11 | Rate limit submit | 3/day/user | 4th → 429 |
| 12 | Rate limit upload | 10/hr/user | 11th → 429 |
| 13 | JWT alg:none | Rejected | → 401 |
| 14 | Expired JWT | Rejected | → 401 |
| 15 | Enumeration IDs | 404 for all invalid | No 403 |
| 16 | Timing attack | ±50ms consistency | Pass |
| 17 | S3 direct access | Bucket private | → 403 |
| 18 | Signed URL expired | After 16 min | → 403 |
| 19 | Signed URL path tamper | Invalid sig | → 403 |
| 20 | Admin deactivated | Next request | → 401 |
| 21 | Session hijack | Different device | → 401 |
| 22 | X-Admin-Id header | Ignored | JWT only |
| 23 | BAN without senior | Reviewer | → 403 |
| 24 | Edit after submit | User tries PUT | → 403 |
| 25 | Delete after submit | User tries DELETE | → 403 |

---

## E) Campaign Fate on Revoke/Suspend

### Policy Rules

| Event | Campaign Effect | Payout Effect | Donor Effect |
|-------|-----------------|---------------|--------------|
| SUSPENDED | Campaign → PAUSED | Pending → HELD | "Temporarily unavailable" |
| REVOKED | Campaign → CANCELLED | Pending → HELD for refund review | "Campaign ended" |
| EXPIRED | Campaign → PAUSED | Pending → HELD until re-verified | "Awaiting re-verification" |
| PERMANENTLY_BANNED | Campaign → CANCELLED | All → Refund | Full refund to donors |

### Implementation

```typescript
// src/lib/verification/campaignFate.ts

export async function handleVerificationStatusChange(
  verificationId: string,
  oldStatus: string,
  newStatus: string
) {
  const verification = await Verification.findById(verificationId);
  const userId = verification.userId;
  
  if (['SUSPENDED', 'EXPIRED'].includes(newStatus)) {
    await Campaign.updateMany(
      { userId, status: 'ACTIVE' },
      { $set: { status: 'PAUSED', pauseReason: `Verification ${newStatus.toLowerCase()}` } }
    );
    await Payout.updateMany(
      { userId, status: 'PENDING' },
      { $set: { status: 'HELD', holdReason: `Verification ${newStatus.toLowerCase()}` } }
    );
  }
  
  if (['REVOKED', 'PERMANENTLY_BANNED'].includes(newStatus)) {
    await Campaign.updateMany(
      { userId, status: { $in: ['ACTIVE', 'PAUSED'] } },
      { $set: { status: 'CANCELLED', cancelReason: `Verification ${newStatus.toLowerCase()}` } }
    );
    await Payout.updateMany(
      { userId, status: { $in: ['PENDING', 'HELD'] } },
      { $set: { status: 'REFUND_REVIEW' } }
    );
  }
  
  if (newStatus === 'APPROVED' && oldStatus === 'SUSPENDED') {
    await Campaign.updateMany(
      { userId, status: 'PAUSED', pauseReason: /verification/i },
      { $set: { status: 'ACTIVE', pauseReason: null } }
    );
    await Payout.updateMany(
      { userId, status: 'HELD', holdReason: /verification/i },
      { $set: { status: 'PENDING', holdReason: null } }
    );
  }
}
```

### Interim Safe Behavior (No Stripe Connect Yet)

- **Decision**: All payouts are manual admin-triggered
- Held funds stay in Stripe balance
- Admin reviews before release
- Refunds require manual Stripe dashboard action

---

## F) Upload Hardening + Hash Dedup

### Allowed MIME + Magic Bytes

```typescript
// src/lib/upload/validation.ts

export const ALLOWED_TYPES = {
  'image/jpeg': { magicBytes: [0xFF, 0xD8, 0xFF], maxSize: 8 * 1024 * 1024 },
  'image/png': { magicBytes: [0x89, 0x50, 0x4E, 0x47], maxSize: 8 * 1024 * 1024 },
  'application/pdf': { magicBytes: [0x25, 0x50, 0x44, 0x46], maxSize: 10 * 1024 * 1024 },
  'image/heic': { magicBytes: null, maxSize: 8 * 1024 * 1024 }, // Complex, defer to library
};

export function validateFile(buffer: Buffer, claimedType: string): { valid: boolean; error?: string } {
  const config = ALLOWED_TYPES[claimedType];
  if (!config) return { valid: false, error: 'INVALID_TYPE' };
  if (buffer.length > config.maxSize) return { valid: false, error: 'SIZE_EXCEEDED' };
  if (buffer.length < 1024) return { valid: false, error: 'EMPTY_FILE' };
  
  if (config.magicBytes) {
    const matches = config.magicBytes.every((byte, i) => buffer[i] === byte);
    if (!matches) return { valid: false, error: 'MAGIC_MISMATCH' };
  }
  
  return { valid: true };
}
```

### Hash Dedup Strategy

```typescript
// src/lib/upload/storage.ts
import crypto from 'crypto';

export async function uploadDocument(
  verificationId: string,
  userId: string,
  file: Buffer,
  fileName: string,
  mimeType: string,
  documentType: string
) {
  const validation = validateFile(file, mimeType);
  if (!validation.valid) throw new Error(validation.error);
  
  const sha256Hash = crypto.createHash('sha256').update(file).digest('hex');
  
  // Check for duplicates globally
  const existingDoc = await VerificationDocument.findOne({ sha256Hash });
  if (existingDoc && existingDoc.verificationId.toString() !== verificationId) {
    // Flag both verifications
    await Verification.updateOne(
      { _id: verificationId },
      { $addToSet: { riskFlags: 'DUPLICATE_DOCUMENT' } }
    );
  }
  
  // Generate safe path
  const docId = new mongoose.Types.ObjectId();
  const ext = mimeType.split('/')[1] || 'bin';
  const storagePath = `${userId}/${verificationId}/${docId}.${ext}`;
  
  // Upload to storage (Cloudinary/S3)
  await uploadToStorage(storagePath, file);
  
  // Create record
  return await VerificationDocument.create({
    _id: docId,
    verificationId,
    documentType,
    storagePath,
    fileName: sanitizeFileName(fileName),
    mimeType,
    fileSizeBytes: file.length,
    sha256Hash,
  });
}
```

### Reject Reasons Table

| Code | Message | HTTP |
|------|---------|------|
| INVALID_TYPE | File type not allowed | 400 |
| SIZE_EXCEEDED | File exceeds maximum size | 413 |
| MAGIC_MISMATCH | File content does not match type | 400 |
| EMPTY_FILE | File is empty or too small | 400 |
| UPLOAD_FAILED | Upload failed, please retry | 500 |
| VIRUS_DETECTED | Security threat detected | 400 |

---

## G) Stripe Webhook Reliability

### Processing Flow

```typescript
// src/app/api/webhooks/stripe/route.ts

import Stripe from 'stripe';
import StripeEvent from '@/models/StripeEvent';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;
  
  // 1. Verify signature FIRST
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return new Response('Invalid signature', { status: 400 });
  }
  
  // 2. Check idempotency
  const existing = await StripeEvent.findOne({ eventId: event.id });
  if (existing) {
    return new Response('OK', { status: 200 }); // Already processed
  }
  
  // 3. Persist BEFORE processing
  await StripeEvent.create({
    eventId: event.id,
    eventType: event.type,
    payload: event.data,
    processingStatus: 'PENDING',
  });
  
  // 4. Return 200 immediately
  // Process async via queue/cron
  return new Response('OK', { status: 200 });
}
```

### 12 Test Cases

| # | Test | Expected |
|---|------|----------|
| 1 | Valid event first time | 200, persisted |
| 2 | Duplicate event ID | 200, skipped |
| 3 | Invalid signature | 400 |
| 4 | Processing timeout | 200 returned, async continues |
| 5 | DB write fails | Retry via Stripe |
| 6 | Unknown event type | 200, logged, ignored |
| 7 | Out of order events | Queue dependency |
| 8 | Test mode to prod | Reject (mode check) |
| 9 | Replay 100 events | No duplicates |
| 10 | charge.dispute.created | Pause payouts |
| 11 | payout.failed | Alert admin |
| 12 | Deploy 503 recovery | Stripe retries work |

---

## H) Cursor Execution Prompts

### Prompt 1: P0 Full Implementation

```
TASK: Implement FundEd Student Verification System P0

STACK: Next.js 14 App Router, NextAuth, MongoDB/Mongoose, TypeScript

CONTEXT: Read these files first:
- implementation_blueprint.md (this document)
- implementation_plan.md (spec)
- security_review.md (security requirements)

STEPS (execute in order):

1. Create Mongoose models in src/models/:
   - Verification.ts (with optimisticConcurrency: true)
   - VerificationDocument.ts
   - VerificationEvent.ts
   - StripeEvent.ts
   Copy schemas EXACTLY from Section B.

2. Create auth guards in src/lib/auth/guards.ts:
   - requireAuth()
   - requireAdmin()
   - getVerificationForUser()
   Copy from Section D.

3. Create state machine in src/lib/verification/transitions.ts:
   - ALLOWED_TRANSITIONS constant
   - canTransition() function
   - transitionStatus() with optimistic lock
   Copy from Section C.

4. Create upload validation in src/lib/upload/validation.ts:
   - ALLOWED_TYPES with magic bytes
   - validateFile() function
   Copy from Section F.

5. Create API routes:
   - src/app/api/verification/route.ts (GET current, POST create)
   - src/app/api/verification/submit/route.ts
   - src/app/api/verification/documents/route.ts
   - src/app/api/admin/verifications/route.ts
   - src/app/api/admin/verifications/[id]/route.ts
   - src/app/api/admin/verifications/[id]/action/route.ts

   CRITICAL: Every route must call requireAuth() or requireAdmin() FIRST.
   CRITICAL: User routes must use getVerificationForUser() - NEVER query without userId.

6. Create webhook handler in src/app/api/webhooks/stripe/route.ts:
   Copy from Section G.

7. Create security tests in src/__tests__/security/:
   - idor.test.ts (all 12 checks from Section D)
   - upload.test.ts (validate magic bytes, size limits)

RULES:
- NEVER query Verification without userId scope for user endpoints
- ALWAYS use optimistic locking for status changes
- ALWAYS log to VerificationEvent on state changes
- Return 404 (not 403) for not found to prevent enumeration
```

### Prompt 2: P0 Guard + IDOR Hotfix (Fast PR)

```
TASK: URGENT IDOR Hotfix for Verification Endpoints

PROBLEM: Current verification endpoints may not properly scope queries by userId, allowing users to access other users' verifications.

FIX (do all in one PR):

1. Create src/lib/auth/guards.ts with:

export async function getVerificationForUser(verificationId: string, userId: string) {
  const verification = await Verification.findOne({ 
    _id: verificationId, 
    userId  // CRITICAL
  });
  if (!verification) throw { status: 404, message: 'Not found' };
  return verification;
}

2. Update EVERY verification route to use this helper:

In src/app/api/verification/[id]/route.ts:
- const verification = await getVerificationForUser(params.id, session.user.id);

In src/app/api/verification/documents/route.ts:
- Before upload: await getVerificationForUser(body.verificationId, session.user.id);

3. Add test in src/__tests__/security/idor.test.ts:

test('User A cannot access User B verification', async () => {
  const res = await fetch('/api/verification/' + userBVerificationId, {
    headers: { Authorization: 'Bearer ' + userAToken }
  });
  expect(res.status).toBe(404); // NOT 403
});

4. Verify: Run all IDOR tests, all must pass.

DO NOT MERGE without passing IDOR tests.
```

---

## Summary Checklist

- [ ] Step 1: Auth guards created
- [ ] Step 2: All 5 models created with indexes
- [ ] Step 3: Upload validation + hash dedup
- [ ] Step 4: User verification API with ownership checks
- [ ] Step 5: Admin API with audit logging
- [ ] Step 6: Security tests passing
- [ ] Campaign fate handler integrated
- [ ] Stripe webhook with idempotency
