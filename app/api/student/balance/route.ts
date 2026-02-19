import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireUser } from '@/lib/authz';

export async function GET() {
  try {
    const user = await requireUser();
    const db = await getDb();

    // Get or create balance document
    let balance: Record<string, unknown> | null = await db.collection('student_balances').findOne(
      { user_id: user.id },
      { projection: { _id: 0 } },
    );

    if (!balance) {
      balance = {
        user_id: user.id,
        totalEarned: 0,
        totalWithdrawn: 0,
        available: 0,
        pending: 0,
        lastUpdated: new Date().toISOString(),
      };
    }

    // Calculate pending: donations in last 14 days that haven't settled
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    // Get campaigns owned by this user
    const campaigns = await db.collection('campaigns')
      .find({ owner_id: user.id }, { projection: { campaign_id: 1 } })
      .toArray();

    const campaignIds = campaigns.map((c) => c.campaign_id);

    let pending = 0;
    if (campaignIds.length > 0) {
      const pendingAgg = await db.collection('donations').aggregate([
        {
          $match: {
            campaign_id: { $in: campaignIds },
            status: 'paid',
            created_at: { $gte: fourteenDaysAgo.toISOString() },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]).toArray();

      pending = pendingAgg[0]?.total ?? 0;
    }

    const totalEarned = Number(balance.totalEarned ?? 0);
    const totalWithdrawn = Number(balance.totalWithdrawn ?? 0);
    const available = Math.max(0, totalEarned - totalWithdrawn - pending);

    return NextResponse.json({
      success: true,
      data: {
        user_id: user.id,
        totalEarned,
        totalWithdrawn,
        available,
        pending,
        lastUpdated: balance.lastUpdated,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    const status = message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: { code: 'ERROR', message } }, { status });
  }
}
