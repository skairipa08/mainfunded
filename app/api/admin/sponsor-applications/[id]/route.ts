export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/authz';
import { successResponse, errorResponse, handleRouteError } from '@/lib/api-response';

/**
 * PATCH /api/admin/sponsor-applications/[id]
 * Admin: update sponsor application status / add notes
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return errorResponse({ code: 'INVALID_ID', message: 'Geçersiz başvuru ID.' }, 400);
    }

    const body = await request.json();
    const { status, notes } = body;

    const allowedStatuses = ['pending', 'reviewed', 'approved', 'rejected'];
    if (status && !allowedStatuses.includes(status)) {
      return errorResponse({
        code: 'VALIDATION_ERROR',
        message: `Geçersiz durum. Geçerli değerler: ${allowedStatuses.join(', ')}`,
      }, 400);
    }

    const db = await getDb();

    const updateFields: any = { updatedAt: new Date().toISOString() };
    if (status) updateFields.status = status;
    if (notes !== undefined) updateFields.notes = notes;

    const result = await db.collection('sponsor_applications').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return errorResponse({ code: 'NOT_FOUND', message: 'Başvuru bulunamadı.' }, 404);
    }

    return successResponse({ message: 'Başvuru güncellendi.' });
  } catch (error) {
    return handleRouteError(error);
  }
}

/**
 * DELETE /api/admin/sponsor-applications/[id]
 * Admin: delete a sponsor application
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return errorResponse({ code: 'INVALID_ID', message: 'Geçersiz başvuru ID.' }, 400);
    }

    const db = await getDb();
    const result = await db.collection('sponsor_applications').deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return errorResponse({ code: 'NOT_FOUND', message: 'Başvuru bulunamadı.' }, 404);
    }

    return successResponse({ message: 'Başvuru silindi.' });
  } catch (error) {
    return handleRouteError(error);
  }
}
