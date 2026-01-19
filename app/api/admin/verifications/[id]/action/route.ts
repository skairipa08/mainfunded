/**
 * Admin Verification Action API
 * 
 * POST /api/admin/verifications/[id]/action - Perform admin action
 */

import { NextRequest, NextResponse } from 'next/server';
import {
    requireAdmin,
    handleAuthError,
    getVerificationDetail,
    transitionStatus,
    assignVerification,
    createAuditLog,
    createNote,
    actionToStatus,
    AdminActionDTO,
    VerificationStatusType
} from '@/lib/verification';

interface Params {
    params: {
        id: string;
    };
}

/**
 * POST /api/admin/verifications/[id]/action
 * Perform admin action on verification
 */
export async function POST(request: NextRequest, { params }: Params) {
    try {
        const admin = await requireAdmin();

        const { id: verificationId } = params;

        if (!verificationId) {
            return NextResponse.json({ error: 'Verification ID required' }, { status: 400 });
        }

        const body: AdminActionDTO = await request.json();

        if (!body.action) {
            return NextResponse.json({ error: 'Action is required' }, { status: 400 });
        }

        // Get current verification
        const detail = await getVerificationDetail(verificationId);
        if (!detail) {
            return NextResponse.json({ error: 'Verification not found' }, { status: 404 });
        }

        const startTime = Date.now();

        // Handle different actions
        let result: { success: boolean; error?: string; newStatus?: VerificationStatusType };

        switch (body.action) {
            case 'APPROVE':
            case 'REJECT':
            case 'NEEDS_MORE_INFO':
            case 'SUSPEND':
            case 'INVESTIGATE':
            case 'REVOKE':
            case 'BAN':
            case 'LIFT_SUSPENSION': {
                const targetStatus = actionToStatus(body.action);
                if (!targetStatus) {
                    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
                }

                // Validate required fields for certain actions
                if (['REJECT', 'SUSPEND', 'REVOKE', 'BAN'].includes(body.action) && !body.reason) {
                    return NextResponse.json(
                        { error: `Reason is required for ${body.action}` },
                        { status: 400 }
                    );
                }

                if (body.action === 'NEEDS_MORE_INFO' && (!body.requested_documents || body.requested_documents.length === 0)) {
                    return NextResponse.json(
                        { error: 'requested_documents is required for NEEDS_MORE_INFO' },
                        { status: 400 }
                    );
                }

                const transitionResult = await transitionStatus(
                    verificationId,
                    targetStatus,
                    'ADMIN',
                    admin.id,
                    {
                        reject_reason: body.reason,
                        reject_reason_code: body.reason_code,
                        requested_documents: body.requested_documents,
                        suspend_until: body.suspend_until
                    }
                );

                result = {
                    success: transitionResult.success,
                    error: transitionResult.error,
                    newStatus: targetStatus
                };
                break;
            }

            case 'REASSIGN': {
                if (!body.new_assignee) {
                    return NextResponse.json({ error: 'new_assignee is required for REASSIGN' }, { status: 400 });
                }

                const assigned = await assignVerification(verificationId, body.new_assignee);
                result = { success: assigned };
                break;
            }

            case 'ESCALATE': {
                if (!body.escalate_to || !body.reason) {
                    return NextResponse.json(
                        { error: 'escalate_to and reason are required for ESCALATE' },
                        { status: 400 }
                    );
                }

                await assignVerification(verificationId, body.escalate_to);
                result = { success: true };
                break;
            }

            default:
                return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
        }

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 422 });
        }

        // Create audit log
        await createAuditLog({
            actor_id: admin.id,
            actor_email: admin.email,
            actor_role: 'ADMIN',
            actor_ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
            actor_user_agent: request.headers.get('user-agent') || 'unknown',
            target_type: 'VERIFICATION',
            target_id: verificationId,
            target_user_id: detail.user_id,
            action: body.action,
            previous_status: detail.status,
            new_status: result.newStatus,
            action_details: {
                reason: body.reason,
                reason_code: body.reason_code,
                requested_documents: body.requested_documents,
                message: body.message,
                escalate_to: body.escalate_to,
                assigned_to: body.new_assignee,
                suspend_until: body.suspend_until,
                internal_notes: body.internal_notes
            },
            session_id: 'session-placeholder', // TODO: Get from session
            request_id: crypto.randomUUID(),
            duration_ms: Date.now() - startTime
        });

        // Add internal note if provided
        if (body.internal_notes) {
            await createNote(
                verificationId,
                admin.id,
                admin.email,
                body.internal_notes,
                body.action === 'INVESTIGATE' ? 'INVESTIGATION' : 'OBSERVATION',
                'ALL_ADMINS'
            );
        }

        // TODO: Send email notification to user based on action
        // await sendVerificationStatusEmail(detail.user_id, body.action, body.message);

        const updatedDetail = await getVerificationDetail(verificationId);

        return NextResponse.json({
            message: `Action ${body.action} completed successfully`,
            verification: updatedDetail
        });
    } catch (error) {
        return handleAuthError(error);
    }
}
