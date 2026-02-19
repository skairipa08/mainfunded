export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/authz';
import { successResponse, errorResponse, handleRouteError } from '@/lib/api-response';

/**
 * PATCH /api/admin/mentors/[id]
 * Admin: approve or reject a mentor application
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const admin = await requireAdmin();

        const db = await getDb();
        const body = await request.json();
        const { status, admin_note } = body;

        if (!status || !['approved', 'rejected'].includes(status)) {
            return errorResponse({
                code: 'VALIDATION_ERROR',
                message: 'Status must be "approved" or "rejected"',
            }, 400);
        }

        const applicationId = params.id;

        const result = await db.collection('mentor_applications').updateOne(
            { application_id: applicationId },
            {
                $set: {
                    status,
                    admin_note: admin_note || null,
                    reviewed_by: admin.id,
                    reviewed_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
            }
        );

        if (result.matchedCount === 0) {
            return errorResponse({
                code: 'NOT_FOUND',
                message: 'Başvuru bulunamadı',
            }, 404);
        }

        return successResponse(
            { application_id: applicationId, status },
            status === 'approved' ? 'Başvuru onaylandı' : 'Başvuru reddedildi'
        );
    } catch (error) {
        return handleRouteError(error);
    }
}
