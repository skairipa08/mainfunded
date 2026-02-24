export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireUser } from '@/lib/authz';
import { successResponse, errorResponse, handleRouteError } from '@/lib/api-response';

// POST: Mark messages as read for a specific conversation
export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const user = await requireUser();
    const body = await request.json();

    const { campaign_id, donor_id } = body;

    if (!campaign_id || !donor_id) {
      return errorResponse(
        { code: 'VALIDATION_ERROR', message: 'campaign_id ve donor_id gereklidir' },
        400,
      );
    }

    // Mark all messages from this donor to the student as read
    await db.collection('donation_messages').updateMany(
      {
        campaign_id,
        sender_id: donor_id,
        recipient_id: user.id,
        read: false,
      },
      { $set: { read: true } },
    );

    return successResponse(null, 'Mesajlar okundu olarak işaretlendi');
  } catch (error) {
    return handleRouteError(error);
  }
}
