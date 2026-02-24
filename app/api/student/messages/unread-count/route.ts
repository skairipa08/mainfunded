export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireUser } from '@/lib/authz';
import { successResponse, handleRouteError } from '@/lib/api-response';

// GET: Get unread message count for the student
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const user = await requireUser();

    const count = await db.collection('donation_messages').countDocuments({
      recipient_id: user.id,
      read: false,
    });

    return successResponse({ count });
  } catch (error) {
    return handleRouteError(error);
  }
}
