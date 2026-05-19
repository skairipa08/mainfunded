/**
 * GET /api/campaigns/[id]/annual-report
 *
 * Returns all-time and per-year donation aggregates for a campaign.
 * Accessible by the campaign owner, admins, and public (aggregated data only).
 *
 * Response shape:
 * {
 *   campaign_id, title, status,
 *   all_time: { total_raised, donor_count },
 *   by_year: [{ year, total_raised, donor_count }]
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const campaignId = params.id;

  try {
    const db = await getDb();

    // Fetch campaign metadata
    const campaign = await db.collection('campaigns').findOne(
      { $or: [{ campaign_id: campaignId }, { _id: campaignId }] },
      { projection: { _id: 0, campaign_id: 1, title: 1, status: 1, goal_amount: 1, evergreen_enabled: 1 } }
    );

    if (!campaign) {
      return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    }

    // Aggregate donations by year using MongoDB $group
    const pipeline = [
      { $match: { campaign_id: campaignId, status: { $in: ['paid', 'completed', 'succeeded'] } } },
      {
        $group: {
          _id: { $year: { $dateFromString: { dateString: '$created_at' } } },
          total_raised: { $sum: '$amount' },
          donor_count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const byYear = await db.collection('donations').aggregate(pipeline).toArray();

    // All-time totals
    const allTime = byYear.reduce(
      (acc, row) => {
        acc.total_raised += row.total_raised;
        acc.donor_count += row.donor_count;
        return acc;
      },
      { total_raised: 0, donor_count: 0 }
    );

    const goalExceeded = allTime.total_raised > (campaign.goal_amount ?? 0);

    logger.info(`[Annual Report] Campaign ${campaignId}: all_time=${allTime.total_raised}`);

    return NextResponse.json({
      success: true,
      data: {
        campaign_id: campaign.campaign_id,
        title: campaign.title,
        status: campaign.status,
        goal_amount: campaign.goal_amount,
        evergreen_enabled: campaign.evergreen_enabled ?? false,
        goal_exceeded: goalExceeded,
        goal_exceeded_message: goalExceeded
          ? 'Hedef Aşıldı! Fazlası bir sonraki dönem için ayrılıyor'
          : null,
        all_time: allTime,
        by_year: byYear.map((row) => ({
          year: row._id,
          total_raised: row.total_raised,
          donor_count: row.donor_count,
        })),
      },
    });
  } catch (error: any) {
    logger.error('[Annual Report] Error:', error.message);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
