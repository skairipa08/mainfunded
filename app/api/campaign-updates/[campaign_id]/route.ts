export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireUser } from '@/lib/authz';
import { successResponse, errorResponse, handleRouteError } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: { campaign_id: string } }
) {
  try {
    const db = await getDb();
    await requireUser(); // Ensure user is logged in
    const campaignId = params.campaign_id;

    // Verify campaign exists
    const campaign = await db.collection('campaigns').findOne(
      { campaign_id: campaignId },
      { projection: { _id: 0, campaign_id: 1, title: 1 } }
    );

    if (!campaign) {
      return errorResponse({ code: 'NOT_FOUND', message: 'Campaign not found' }, 404);
    }

    const updates = await db.collection('campaign_updates')
      .find(
        { campaign_id: campaignId },
        { projection: { _id: 0 } }
      )
      .sort({ created_at: -1 })
      .limit(50)
      .toArray();

    return successResponse({
      campaign_id: campaignId,
      campaign_title: campaign.title,
      updates,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
