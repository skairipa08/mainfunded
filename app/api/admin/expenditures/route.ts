import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdminOrOps } from '@/lib/authz';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { withReceiptUrl } from '@/lib/expenditures';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const rateLimitResponse = withRateLimit(request, RATE_LIMITS.admin);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    await requireAdminOrOps();
    const db = await getDb();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const campaignId = searchParams.get('campaign_id');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    const query: Record<string, any> = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query.status = status;
    }
    if (campaignId) {
      query.campaign_id = campaignId;
    }

    const [items, total] = await Promise.all([
      db.collection('expenditures')
        .find(query, { projection: { _id: 0 } })
        .sort({ created_at: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
      db.collection('expenditures').countDocuments(query),
    ]);

    const campaignIds = [...new Set(items.map((x: any) => x.campaign_id).filter(Boolean))];
    const campaigns = campaignIds.length > 0
      ? await db.collection('campaigns')
        .find(
          { campaign_id: { $in: campaignIds } },
          { projection: { _id: 0, campaign_id: 1, title: 1, owner_id: 1 } }
        )
        .toArray()
      : [];

    const campaignMap = new Map(campaigns.map((campaign: any) => [campaign.campaign_id, campaign]));

    return NextResponse.json({
      success: true,
      data: {
        items: items.map((item: any) => ({
          ...withReceiptUrl(item),
          campaign_title: campaignMap.get(item.campaign_id)?.title || item.campaign_id,
        })),
        total,
        page,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error: any) {
    if (error?.message === 'Unauthorized') {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 });
    }
    if (error?.statusCode === 403 || error?.message === 'Insufficient permissions') {
      return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } }, { status: 403 });
    }

    console.error('[Admin Expenditures API] GET error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
