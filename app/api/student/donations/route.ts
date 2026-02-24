export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireUser } from '@/lib/authz';
import { successResponse, handleRouteError } from '@/lib/api-response';

// GET: Get all donations received across the student's campaigns
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const user = await requireUser();

    // Get student's campaign IDs
    const campaigns = await db
      .collection('campaigns')
      .find(
        { owner_id: user.id },
        { projection: { _id: 0, campaign_id: 1, title: 1 } },
      )
      .toArray();

    const campaignIds = campaigns.map((c: any) => c.campaign_id);
    const campaignMap = new Map(campaigns.map((c: any) => [c.campaign_id, c.title]));

    if (campaignIds.length === 0) {
      return successResponse([]);
    }

    // Get all paid donations for these campaigns
    const donations = await db
      .collection('donations')
      .find(
        {
          campaign_id: { $in: campaignIds },
          payment_status: { $in: ['paid', 'completed'] },
        },
        {
          projection: {
            _id: 0,
            donation_id: 1,
            campaign_id: 1,
            donor_id: 1,
            donor_name: 1,
            amount: 1,
            anonymous: 1,
            created_at: 1,
          },
        },
      )
      .sort({ created_at: -1 })
      .limit(100)
      .toArray();

    // Enrich with campaign titles
    const enriched = donations.map((d: any) => ({
      ...d,
      campaign_title: campaignMap.get(d.campaign_id) || '',
    }));

    return successResponse(enriched);
  } catch (error) {
    return handleRouteError(error);
  }
}
