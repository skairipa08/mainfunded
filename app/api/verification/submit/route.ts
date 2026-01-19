/**
 * Verification Submit API
 * 
 * POST /api/verification/submit - Submit verification for review
 */

import { NextRequest, NextResponse } from 'next/server';
import {
    requireStudent,
    handleAuthError,
    requireVerificationOwnership,
    submitVerification
} from '@/lib/verification';

/**
 * POST /api/verification/submit
 * Submit verification for admin review
 */
export async function POST(request: NextRequest) {
    try {
        const user = await requireStudent();

        const body = await request.json();
        const { verification_id, __v } = body;

        if (!verification_id) {
            return NextResponse.json(
                { error: 'verification_id is required' },
                { status: 400 }
            );
        }

        if (typeof __v !== 'number') {
            return NextResponse.json(
                { error: '__v (version) is required' },
                { status: 400 }
            );
        }

        // Verify ownership first
        await requireVerificationOwnership(verification_id, user.id);

        const result = await submitVerification(verification_id, user.id, __v);

        if (!result.success) {
            const statusCode = result.error === 'VERSION_CONFLICT' ? 409
                : result.error?.startsWith('Missing') ? 400
                    : 422;

            return NextResponse.json(
                { error: result.error },
                { status: statusCode }
            );
        }

        // Remove sensitive data
        const { phone_hash, student_id_hash, ...safeVerification } = result.verification!;

        return NextResponse.json({
            message: 'Verification submitted successfully',
            verification: safeVerification
        });
    } catch (error) {
        return handleAuthError(error);
    }
}
