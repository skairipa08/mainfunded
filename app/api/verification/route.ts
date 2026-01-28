/**
 * User Verification API Routes
 * 
 * GET  /api/verification - Get current user's verification
 * POST /api/verification - Create new verification
 * PUT  /api/verification - Update verification (draft only)
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import {
    requireStudent,
    handleAuthError,
    getCurrentVerification,
    createVerification,
    updateVerification,
    CreateVerificationDTO,
    UpdateVerificationDTO
} from '@/lib/verification';


/**
 * GET /api/verification
 * Get the current user's latest verification
 */
export async function GET(request: NextRequest) {
    try {
        const user = await requireStudent();

        const verification = await getCurrentVerification(user.id);

        if (!verification) {
            return NextResponse.json(
                { message: 'No verification found', canCreate: true },
                { status: 404 }
            );
        }

        // Remove sensitive hashed fields from response
        const { phone_hash, student_id_hash, ...safeVerification } = verification;

        return NextResponse.json({
            verification: safeVerification,
            canEdit: ['DRAFT', 'NEEDS_MORE_INFO'].includes(verification.status),
            canSubmit: verification.status === 'DRAFT'
        });
    } catch (error) {
        return handleAuthError(error);
    }
}

/**
 * POST /api/verification
 * Create a new verification draft
 */
export async function POST(request: NextRequest) {
    try {
        const user = await requireStudent();

        // Check if user already has an active verification
        const existing = await getCurrentVerification(user.id);
        if (existing && !['REJECTED', 'REVOKED', 'PERMANENTLY_BANNED', 'ABANDONED'].includes(existing.status)) {
            return NextResponse.json(
                {
                    error: 'Active verification already exists',
                    status: existing.status,
                    verification_id: existing.verification_id
                },
                { status: 409 }
            );
        }

        // Check cooldown for rejected
        if (existing?.status === 'REJECTED' && existing.reapply_eligible_at) {
            const reapplyDate = new Date(existing.reapply_eligible_at);
            if (reapplyDate > new Date()) {
                const daysLeft = Math.ceil((reapplyDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return NextResponse.json(
                    {
                        error: 'Reapply cooldown period active',
                        eligible_at: existing.reapply_eligible_at,
                        days_remaining: daysLeft
                    },
                    { status: 429 }
                );
            }
        }

        const body: CreateVerificationDTO = await request.json();

        // Validate required fields
        const requiredFields = [
            'first_name', 'last_name', 'date_of_birth', 'phone', 'country',
            'institution_name', 'institution_country', 'institution_type',
            'student_id', 'enrollment_year', 'expected_graduation',
            'degree_program', 'degree_level', 'is_full_time'
        ];

        const missing = requiredFields.filter(f => !(f in body));
        if (missing.length > 0) {
            return NextResponse.json(
                { error: `Missing required fields: ${missing.join(', ')}` },
                { status: 400 }
            );
        }

        // Age validation (16-35)
        const dob = new Date(body.date_of_birth);
        const age = Math.floor((Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365));
        if (age < 16 || age > 35) {
            return NextResponse.json(
                { error: 'Age must be between 16 and 35' },
                { status: 400 }
            );
        }

        const verification = await createVerification(user.id, body);

        // Remove sensitive data
        const { phone_hash, student_id_hash, ...safeVerification } = verification;

        return NextResponse.json(
            { verification: safeVerification },
            { status: 201 }
        );
    } catch (error) {
        return handleAuthError(error);
    }
}

/**
 * PUT /api/verification
 * Update current verification (draft or needs_more_info only)
 */
export async function PUT(request: NextRequest) {
    try {
        const user = await requireStudent();

        const body = await request.json();
        const { verification_id, __v, ...updateData } = body as UpdateVerificationDTO & { verification_id: string; __v: number };

        if (!verification_id) {
            return NextResponse.json(
                { error: 'verification_id is required' },
                { status: 400 }
            );
        }

        if (typeof __v !== 'number') {
            return NextResponse.json(
                { error: '__v (version) is required for optimistic locking' },
                { status: 400 }
            );
        }

        const updated = await updateVerification(verification_id, user.id, updateData, __v);

        if (!updated) {
            return NextResponse.json(
                { error: 'Verification not found, not editable, or version conflict' },
                { status: 404 }
            );
        }

        const { phone_hash, student_id_hash, ...safeVerification } = updated;

        return NextResponse.json({ verification: safeVerification });
    } catch (error) {
        return handleAuthError(error);
    }
}
