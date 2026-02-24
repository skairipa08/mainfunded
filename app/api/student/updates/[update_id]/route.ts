export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireUser } from '@/lib/authz';
import { successResponse, errorResponse, handleRouteError } from '@/lib/api-response';

// DELETE: Delete a student update
export async function DELETE(
  request: NextRequest,
  { params }: { params: { update_id: string } },
) {
  try {
    const db = await getDb();
    const user = await requireUser();
    const updateId = params.update_id;

    // Verify this update belongs to the current user
    const update = await db.collection('student_updates').findOne({
      update_id: updateId,
      owner_id: user.id,
    });

    if (!update) {
      return errorResponse(
        { code: 'NOT_FOUND', message: 'Güncelleme bulunamadı veya size ait değil' },
        404,
      );
    }

    await db.collection('student_updates').deleteOne({ update_id: updateId });

    return successResponse(null, 'Güncelleme silindi');
  } catch (error) {
    return handleRouteError(error);
  }
}
