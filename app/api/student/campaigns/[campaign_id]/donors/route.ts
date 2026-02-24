export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireUser } from '@/lib/authz';
import { successResponse, errorResponse, handleRouteError } from '@/lib/api-response';

// GET: Get donors for a student's campaign
export async function GET(
  request: NextRequest,
  { params }: { params: { campaign_id: string } },
) {
  try {
    const db = await getDb();
    const user = await requireUser();
    const campaignId = params.campaign_id;

    // Verify the campaign belongs to this student
    const campaign = await db.collection('campaigns').findOne(
      { campaign_id: campaignId, owner_id: user.id },
      { projection: { campaign_id: 1 } },
    );

    if (!campaign) {
      return errorResponse(
        { code: 'FORBIDDEN', message: 'Bu kampanya size ait değil' },
        403,
      );
    }

    // Get all paid donations for this campaign
    const donations = await db
      .collection('donations')
      .find(
        {
          campaign_id: campaignId,
          payment_status: { $in: ['paid', 'completed'] },
        },
        {
          projection: {
            _id: 0,
            donation_id: 1,
            donor_id: 1,
            donor_name: 1,
            amount: 1,
            anonymous: 1,
            created_at: 1,
          },
        },
      )
      .sort({ created_at: -1 })
      .toArray();

    return successResponse(donations);
  } catch (error) {
    return handleRouteError(error);
  }
}
