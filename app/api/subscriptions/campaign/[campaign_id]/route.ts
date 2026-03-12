import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/authz';
import { successResponse, errorResponse, handleRouteError } from '@/lib/api-response';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

/**
 * GET /api/subscriptions/campaign/[campaign_id]
 * Admin endpoint: List all subscriptions for a campaign
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { campaign_id: string } }
) {
  const rateLimitResponse = withRateLimit(request, RATE_LIMITS.admin);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    await requireAdmin();
    const db = await getDb();

    const url = request.nextUrl;
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;

    const query = { campaign_id: params.campaign_id };

    const [subscriptions, total] = await Promise.all([
      db.collection('subscriptions')
        .find(query, { projection: { _id: 0, card_user_key: 0, card_token: 0 } })
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection('subscriptions').countDocuments(query),
    ]);

    // Aggregate stats for this campaign's subscriptions
    const statsResult = await db.collection('subscriptions').aggregate([
      { $match: { campaign_id: params.campaign_id, status: 'active' } },
      {
        $group: {
          _id: null,
          active_count: { $sum: 1 },
          total_mrr: { $sum: '$amount' },
        },
      },
    ]).toArray();

    const stats = statsResult[0] || { active_count: 0, total_mrr: 0 };

    return successResponse({
      subscriptions,
      stats: {
        active_count: stats.active_count,
        monthly_recurring_revenue: stats.total_mrr,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
