export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireUser } from '@/lib/authz';
import { successResponse, errorResponse, handleRouteError } from '@/lib/api-response';

// GET: Get student updates for a campaign (only if user is the owner or a donor)
export async function GET(
  request: NextRequest,
  { params }: { params: { campaign_id: string } },
) {
  try {
    const db = await getDb();
    const user = await requireUser();
    const campaignId = params.campaign_id;

    // Verify campaign exists
    const campaign = await db.collection('campaigns').findOne(
      { campaign_id: campaignId },
      { projection: { _id: 0, campaign_id: 1, owner_id: 1, title: 1 } },
    );

    if (!campaign) {
      return errorResponse({ code: 'NOT_FOUND', message: 'Kampanya bulunamadı' }, 404);
    }

    // Check if user is the campaign owner (student) or a donor
    const isOwner = campaign.owner_id === user.id;

    if (!isOwner) {
      // Check if user has donated to this campaign
      const donation = await db.collection('donations').findOne({
        campaign_id: campaignId,
        donor_id: user.id,
        payment_status: { $in: ['paid', 'completed'] },
      });

      if (!donation) {
        return errorResponse(
          { code: 'FORBIDDEN', message: 'Bu güncellemeleri görme yetkiniz yok. Sadece bağışçılar görebilir.' },
          403,
        );
      }
    }

    const updates = await db
      .collection('student_updates')
      .find(
        { campaign_id: campaignId },
        { projection: { _id: 0 } },
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
