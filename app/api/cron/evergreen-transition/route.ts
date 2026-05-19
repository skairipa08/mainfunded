/**
 * Cron: Evergreen Campaign Transition
 *
 * Vercel cron schedule (vercel.json):
 *   "0 0 * * *"  →  runs once per day at midnight UTC
 *
 * What it does:
 *   1. Finds all "published" campaigns whose end_date has passed.
 *   2. If evergreen_enabled = true  → transitions to "evergreen"
 *   3. If evergreen_enabled = false → transitions to "completed"
 *
 * Security: protected by CRON_SECRET header.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { resolveExpiredStatus } from '@/lib/campaign-state-machine';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  // Verify caller is the Vercel cron scheduler (or an authorised internal call)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = await getDb();
    const now = new Date();

    // Find published campaigns whose deadline has passed
    const expiredCampaigns = await db
      .collection('campaigns')
      .find({
        status: 'published',
        end_date: { $lte: now.toISOString(), $ne: null },
      })
      .toArray();

    if (expiredCampaigns.length === 0) {
      logger.info('[Cron/evergreen-transition] No expired campaigns found.');
      return NextResponse.json({ success: true, transitioned: 0 });
    }

    const bulkOps = expiredCampaigns.map((campaign: any) => {
      const nextStatus = resolveExpiredStatus(campaign.evergreen_enabled === true);
      return {
        updateOne: {
          filter: { campaign_id: campaign.campaign_id },
          update: {
            $set: {
              status: nextStatus,
              updated_at: now.toISOString(),
              ...(nextStatus === 'completed' ? { completed_at: now.toISOString() } : {}),
              ...(nextStatus === 'evergreen' ? { evergreen_since: now.toISOString() } : {}),
            },
          },
        },
      };
    });

    const result = await db.collection('campaigns').bulkWrite(bulkOps);

    logger.info(
      `[Cron/evergreen-transition] Transitioned ${result.modifiedCount} campaigns.`,
      {
        evergreen: expiredCampaigns.filter((c: any) => c.evergreen_enabled).length,
        completed: expiredCampaigns.filter((c: any) => !c.evergreen_enabled).length,
      }
    );

    return NextResponse.json({
      success: true,
      transitioned: result.modifiedCount,
      details: expiredCampaigns.map((c: any) => ({
        campaign_id: c.campaign_id,
        title: c.title,
        nextStatus: resolveExpiredStatus(c.evergreen_enabled === true),
      })),
    });
  } catch (error: any) {
    logger.error('[Cron/evergreen-transition] Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
