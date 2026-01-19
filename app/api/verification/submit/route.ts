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
    submitVerification,
    sendVerificationStatusEmail
} from '@/lib/verification';
import { checkUserRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

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

        // Rate limit: 3 submissions per day
        const rateCheck = checkUserRateLimit(request, user.id, RATE_LIMITS.verificationSubmit);
        if (!rateCheck.allowed) {
            return NextResponse.json(
                { error: 'Too many submissions. Please try again tomorrow.', code: 'RATE_LIMITED' },
                {
                    status: 429,
                    headers: {
                        'Retry-After': Math.ceil((rateCheck.resetAt - Date.now()) / 1000).toString()
                    }
                }
            );
        }

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

        // Send confirmation email
        try {
            await sendVerificationStatusEmail({
                userId: user.id,
                userEmail: user.email,
                userName: user.name || '',
                status: 'PENDING_REVIEW'
            });
        } catch (emailError) {
            console.error('[Submit] Email notification failed:', emailError);
        }

        return NextResponse.json({
            message: 'Verification submitted successfully',
            verification: safeVerification
        });
    } catch (error) {
        return handleAuthError(error);
    }
}
