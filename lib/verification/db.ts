/**
 * Verification Database Operations
 * 
 * All database operations for verification system.
 * Uses MongoDB native driver with proper userId scoping for IDOR protection.
 */

import { getDb } from '@/lib/db';
import { ObjectId } from 'mongodb';
import crypto from 'crypto';
import {
    Verification,
    VerificationDoc,
    VerificationEvent,
    VerificationAuditLog,
    StripeEventRecord,
    InternalNote,
    VerificationStatusType,
    EventType,
    RiskFlag,
    CreateVerificationDTO,
    UpdateVerificationDTO,
    VerificationQueueItem,
    VerificationDetail
} from '@/types/verification';
import { canTransition, validateTransition } from './transitions';

// =======================================
// Helper Functions
// =======================================

function generateId(): string {
    return crypto.randomUUID();
}

function hashSensitive(value: string): string {
    return crypto.createHash('sha256').update(value).digest('hex');
}

function now(): string {
    return new Date().toISOString();
}

// =======================================
// Verification CRUD
// =======================================

/**
 * Create a new verification in DRAFT status
 * CRITICAL: Always creates for the authenticated user
 */
export async function createVerification(
    userId: string,
    data: CreateVerificationDTO
): Promise<Verification> {
    const db = await getDb();

    const verification: Verification = {
        verification_id: generateId(),
        user_id: userId,
        status: 'DRAFT',
        status_changed_at: now(),

        first_name: data.first_name,
        last_name: data.last_name,
        date_of_birth: data.date_of_birth,
        phone_hash: hashSensitive(data.phone),
        country: data.country,
        city: data.city,

        institution_name: data.institution_name,
        institution_country: data.institution_country,
        institution_type: data.institution_type,
        student_id_hash: hashSensitive(data.student_id),
        enrollment_year: data.enrollment_year,
        expected_graduation: data.expected_graduation,
        degree_program: data.degree_program,
        degree_level: data.degree_level,
        is_full_time: data.is_full_time,

        monthly_income: data.monthly_income,
        has_scholarship: data.has_scholarship,
        scholarship_amount: data.scholarship_amount,
        financial_need_statement: data.financial_need_statement,

        risk_score: 0,
        risk_flags: [],

        created_at: now(),
        updated_at: now(),
        __v: 0
    };

    await db.collection('verifications').insertOne(verification);

    // Log event
    await logVerificationEvent(verification.verification_id, 'CREATED', {}, 'USER', userId);

    return verification;
}

/**
 * Get verification by ID for a specific user
 * CRITICAL: Always scopes by userId to prevent IDOR
 */
export async function getVerificationForUser(
    verificationId: string,
    userId: string
): Promise<Verification | null> {
    const db = await getDb();

    const verification = await db.collection<Verification>('verifications').findOne({
        verification_id: verificationId,
        user_id: userId  // CRITICAL: Always scope by userId
    });

    return verification;
}

/**
 * Get current user's latest verification
 */
export async function getCurrentVerification(userId: string): Promise<Verification | null> {
    const db = await getDb();

    const verification = await db.collection<Verification>('verifications')
        .find({ user_id: userId })
        .sort({ created_at: -1 })
        .limit(1)
        .toArray();

    return verification[0] || null;
}

/**
 * Update verification (only in editable status)
 * CRITICAL: Always scopes by userId
 */
export async function updateVerification(
    verificationId: string,
    userId: string,
    data: UpdateVerificationDTO,
    version: number
): Promise<Verification | null> {
    const db = await getDb();

    // Build update object, hash sensitive fields
    const updateData: Record<string, any> = { ...data, updated_at: now() };

    if (data.phone) {
        updateData.phone_hash = hashSensitive(data.phone);
        delete updateData.phone;
    }
    if (data.student_id) {
        updateData.student_id_hash = hashSensitive(data.student_id);
        delete updateData.student_id;
    }

    // Optimistic concurrency: check version
    const result = await db.collection<Verification>('verifications').findOneAndUpdate(
        {
            verification_id: verificationId,
            user_id: userId,  // CRITICAL: Always scope by userId
            status: { $in: ['DRAFT', 'NEEDS_MORE_INFO'] },  // Only editable statuses
            __v: version  // Optimistic lock
        },
        {
            $set: updateData,
            $inc: { __v: 1 }
        },
        { returnDocument: 'after' }
    );

    if (result) {
        await logVerificationEvent(verificationId, 'UPDATED', { fields: Object.keys(data) }, 'USER', userId);
    }

    return result;
}

/**
 * Submit verification for review
 * CRITICAL: Always scopes by userId
 */
export async function submitVerification(
    verificationId: string,
    userId: string,
    version: number
): Promise<{ success: boolean; error?: string; verification?: Verification }> {
    const db = await getDb();

    // Get current verification
    const verification = await getVerificationForUser(verificationId, userId);
    if (!verification) {
        return { success: false, error: 'NOT_FOUND' };
    }

    // Validate transition
    const transition = validateTransition(verification.status, 'PENDING_REVIEW', 'USER');
    if (!transition.valid) {
        return { success: false, error: transition.error };
    }

    // Check required documents
    const docs = await getDocumentsForVerification(verificationId, userId);
    const requiredTypes = ['STUDENT_ID', 'ENROLLMENT_LETTER', 'GOVERNMENT_ID', 'SELFIE_WITH_ID'];
    const uploadedTypes = docs.map(d => d.document_type);
    const missing = requiredTypes.filter(t => !uploadedTypes.includes(t as any));

    if (missing.length > 0) {
        return { success: false, error: `Missing required documents: ${missing.join(', ')}` };
    }

    // Perform atomic update with optimistic lock
    const result = await db.collection<Verification>('verifications').findOneAndUpdate(
        {
            verification_id: verificationId,
            user_id: userId,
            __v: version
        },
        {
            $set: {
                status: 'PENDING_REVIEW',
                status_changed_at: now(),
                submitted_at: now(),
                updated_at: now()
            },
            $inc: { __v: 1 }
        },
        { returnDocument: 'after' }
    );

    if (!result) {
        return { success: false, error: 'VERSION_CONFLICT' };
    }

    await logVerificationEvent(verificationId, 'SUBMITTED', {}, 'USER', userId);

    return { success: true, verification: result };
}

/**
 * Transition verification status (for admin/system)
 */
export async function transitionStatus(
    verificationId: string,
    newStatus: VerificationStatusType,
    actor: 'ADMIN' | 'SYSTEM',
    actorId?: string,
    additionalData?: Record<string, any>
): Promise<{ success: boolean; error?: string; verification?: Verification }> {
    const db = await getDb();

    const verification = await db.collection<Verification>('verifications').findOne({
        verification_id: verificationId
    });

    if (!verification) {
        return { success: false, error: 'NOT_FOUND' };
    }

    const transition = validateTransition(verification.status, newStatus, actor);
    if (!transition.valid) {
        return { success: false, error: transition.error };
    }

    const updateData: Record<string, any> = {
        status: newStatus,
        status_changed_at: now(),
        updated_at: now(),
        ...additionalData
    };

    // Set expiration for approved status (1 year)
    if (newStatus === 'APPROVED') {
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        updateData.expires_at = expiresAt.toISOString();
        updateData.reviewed_at = now();
    }

    // Set reapply cooldown for rejected status (7 days)
    if (newStatus === 'REJECTED') {
        const reapplyAt = new Date();
        reapplyAt.setDate(reapplyAt.getDate() + 7);
        updateData.reapply_eligible_at = reapplyAt.toISOString();
        updateData.reviewed_at = now();
    }

    const result = await db.collection<Verification>('verifications').findOneAndUpdate(
        {
            verification_id: verificationId,
            __v: verification.__v
        },
        {
            $set: updateData,
            $inc: { __v: 1 }
        },
        { returnDocument: 'after' }
    );

    if (!result) {
        return { success: false, error: 'VERSION_CONFLICT' };
    }

    await logVerificationEvent(
        verificationId,
        newStatus as EventType,
        { from: verification.status, to: newStatus, ...additionalData },
        actor,
        actorId
    );

    return { success: true, verification: result };
}

// =======================================
// Admin Queue Operations
// =======================================

/**
 * Get verification queue for admin
 */
export async function getVerificationQueue(
    filters: {
        status?: VerificationStatusType[];
        assignedTo?: string;
        minRiskScore?: number;
        search?: string;
    },
    pagination: { page: number; limit: number },
    sort: { field: string; order: 'asc' | 'desc' }
): Promise<{ items: VerificationQueueItem[]; total: number }> {
    const db = await getDb();

    const query: Record<string, any> = {};

    if (filters.status && filters.status.length > 0) {
        query.status = { $in: filters.status };
    }
    if (filters.assignedTo) {
        query.assigned_to = filters.assignedTo;
    }
    if (filters.minRiskScore !== undefined) {
        query.risk_score = { $gte: filters.minRiskScore };
    }
    if (filters.search) {
        query.$or = [
            { first_name: { $regex: filters.search, $options: 'i' } },
            { last_name: { $regex: filters.search, $options: 'i' } },
            { institution_name: { $regex: filters.search, $options: 'i' } }
        ];
    }

    const sortObj: Record<string, 1 | -1> = {
        [sort.field]: sort.order === 'asc' ? 1 : -1
    };

    const [items, total] = await Promise.all([
        db.collection<Verification>('verifications')
            .find(query)
            .sort(sortObj)
            .skip((pagination.page - 1) * pagination.limit)
            .limit(pagination.limit)
            .toArray(),
        db.collection('verifications').countDocuments(query)
    ]);

    const queueItems: VerificationQueueItem[] = items.map(v => ({
        verification_id: v.verification_id,
        user_id: v.user_id,
        first_name: v.first_name,
        last_name: v.last_name,
        institution_name: v.institution_name,
        status: v.status,
        risk_score: v.risk_score,
        risk_flags: v.risk_flags,
        submitted_at: v.submitted_at,
        assigned_to: v.assigned_to,
        days_in_queue: v.submitted_at
            ? Math.floor((Date.now() - new Date(v.submitted_at).getTime()) / (1000 * 60 * 60 * 24))
            : undefined
    }));

    return { items: queueItems, total };
}

/**
 * Get full verification detail for admin
 */
export async function getVerificationDetail(verificationId: string): Promise<VerificationDetail | null> {
    const db = await getDb();

    const verification = await db.collection<Verification>('verifications').findOne({
        verification_id: verificationId
    });

    if (!verification) return null;

    const [documents, events, notes] = await Promise.all([
        db.collection<VerificationDoc>('verification_documents')
            .find({ verification_id: verificationId })
            .toArray(),
        db.collection<VerificationEvent>('verification_events')
            .find({ verification_id: verificationId })
            .sort({ occurred_at: -1 })
            .toArray(),
        db.collection<InternalNote>('verification_notes')
            .find({ verification_id: verificationId })
            .sort({ created_at: -1 })
            .toArray()
    ]);

    return {
        ...verification,
        documents,
        events,
        notes
    };
}

/**
 * Assign verification to admin
 */
export async function assignVerification(
    verificationId: string,
    adminId: string
): Promise<boolean> {
    const db = await getDb();

    const result = await db.collection('verifications').updateOne(
        { verification_id: verificationId },
        {
            $set: {
                assigned_to: adminId,
                assigned_at: now(),
                updated_at: now()
            }
        }
    );

    if (result.modifiedCount > 0) {
        await logVerificationEvent(verificationId, 'ASSIGNED', { assigned_to: adminId }, 'ADMIN', adminId);
        return true;
    }

    return false;
}

/**
 * Add risk flag to verification
 */
export async function addRiskFlag(
    verificationId: string,
    flag: RiskFlag,
    actorId?: string
): Promise<boolean> {
    const db = await getDb();

    const result = await db.collection('verifications').updateOne(
        { verification_id: verificationId },
        {
            $addToSet: { risk_flags: flag },
            $inc: { risk_score: 10 },  // Increase risk score
            $set: { updated_at: now() }
        }
    );

    if (result.modifiedCount > 0) {
        await logVerificationEvent(verificationId, 'FLAG_ADDED', { flag }, 'SYSTEM', actorId);
        return true;
    }

    return false;
}

// =======================================
// Document Operations
// =======================================

/**
 * Get documents for a verification (user-scoped)
 */
export async function getDocumentsForVerification(
    verificationId: string,
    userId: string
): Promise<VerificationDoc[]> {
    const db = await getDb();

    // First verify the user owns this verification
    const verification = await getVerificationForUser(verificationId, userId);
    if (!verification) return [];

    return db.collection<VerificationDoc>('verification_documents')
        .find({ verification_id: verificationId })
        .toArray();
}

/**
 * Create document record
 */
export async function createDocumentRecord(
    verificationId: string,
    userId: string,
    doc: Omit<VerificationDoc, '_id' | 'doc_id' | 'verification_id' | 'uploaded_at'>
): Promise<VerificationDoc | null> {
    const db = await getDb();

    // Verify ownership
    const verification = await getVerificationForUser(verificationId, userId);
    if (!verification) return null;

    // Check if verification is in editable status
    if (!['DRAFT', 'NEEDS_MORE_INFO'].includes(verification.status)) {
        return null;
    }

    const document: VerificationDoc = {
        doc_id: generateId(),
        verification_id: verificationId,
        ...doc,
        uploaded_at: now()
    };

    await db.collection('verification_documents').insertOne(document);

    await logVerificationEvent(
        verificationId,
        'DOCUMENT_UPLOADED',
        { document_type: doc.document_type, sha256_hash: doc.sha256_hash },
        'USER',
        userId
    );

    return document;
}

/**
 * Check for duplicate document hash
 */
export async function checkDocumentDuplicate(
    sha256Hash: string,
    excludeVerificationId?: string
): Promise<{ isDuplicate: boolean; verificationId?: string }> {
    const db = await getDb();

    const query: Record<string, any> = { sha256_hash: sha256Hash };
    if (excludeVerificationId) {
        query.verification_id = { $ne: excludeVerificationId };
    }

    const existing = await db.collection<VerificationDoc>('verification_documents').findOne(query);

    if (existing) {
        return { isDuplicate: true, verificationId: existing.verification_id };
    }

    return { isDuplicate: false };
}

// =======================================
// Event Logging (Immutable)
// =======================================

async function logVerificationEvent(
    verificationId: string,
    eventType: EventType,
    eventData: Record<string, any>,
    actorType: 'USER' | 'ADMIN' | 'SYSTEM',
    actorId?: string,
    actorIp?: string
): Promise<void> {
    const db = await getDb();

    const event: VerificationEvent = {
        event_id: generateId(),
        verification_id: verificationId,
        event_type: eventType,
        event_data: eventData,
        actor_type: actorType,
        actor_id: actorId,
        actor_ip: actorIp,
        occurred_at: now()
    };

    await db.collection('verification_events').insertOne(event);
}

// =======================================
// Stripe Event (Idempotency)
// =======================================

/**
 * Check if Stripe event already processed
 */
export async function isStripeEventProcessed(eventId: string): Promise<boolean> {
    const db = await getDb();
    const existing = await db.collection('stripe_events').findOne({ event_id: eventId });
    return !!existing;
}

/**
 * Record Stripe event for idempotency
 */
export async function recordStripeEvent(
    eventId: string,
    eventType: string,
    payload: Record<string, any>
): Promise<StripeEventRecord> {
    const db = await getDb();

    const record: StripeEventRecord = {
        event_id: eventId,
        event_type: eventType,
        received_at: now(),
        processing_status: 'PENDING',
        payload,
        retry_count: 0
    };

    await db.collection('stripe_events').insertOne(record);
    return record;
}

/**
 * Update Stripe event status
 */
export async function updateStripeEventStatus(
    eventId: string,
    status: 'PROCESSING' | 'PROCESSED' | 'FAILED',
    errorMessage?: string
): Promise<void> {
    const db = await getDb();

    const update: Record<string, any> = {
        processing_status: status
    };

    if (status === 'PROCESSED') {
        update.processed_at = now();
    }

    if (errorMessage) {
        update.error_message = errorMessage;
        update.$inc = { retry_count: 1 };
    }

    await db.collection('stripe_events').updateOne(
        { event_id: eventId },
        { $set: update }
    );
}

// =======================================
// Audit Logging
// =======================================

/**
 * Create audit log entry for admin action
 */
export async function createAuditLog(
    log: Omit<VerificationAuditLog, '_id' | 'audit_id' | 'timestamp'>
): Promise<void> {
    const db = await getDb();

    const auditLog: VerificationAuditLog = {
        audit_id: generateId(),
        timestamp: now(),
        ...log
    };

    await db.collection('verification_audit_logs').insertOne(auditLog);
}

// =======================================
// Internal Notes
// =======================================

/**
 * Create internal note
 */
export async function createNote(
    verificationId: string,
    authorId: string,
    authorEmail: string,
    content: string,
    noteType: InternalNote['note_type'],
    visibility: InternalNote['visibility']
): Promise<InternalNote> {
    const db = await getDb();

    const note: InternalNote = {
        note_id: generateId(),
        verification_id: verificationId,
        author_id: authorId,
        author_email: authorEmail,
        created_at: now(),
        note_type: noteType,
        visibility,
        content
    };

    await db.collection('verification_notes').insertOne(note);

    await logVerificationEvent(verificationId, 'NOTE_ADDED', { note_type: noteType }, 'ADMIN', authorId);

    return note;
}
