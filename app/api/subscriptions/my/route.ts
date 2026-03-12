import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireUser } from '@/lib/authz';
import { successResponse, errorResponse, handleRouteError } from '@/lib/api-response';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

/**
 * GET /api/subscriptions/my
 * List authenticated donor's subscriptions with pagination
 */
export async function GET(request: NextRequest) {
  const rateLimitResponse = withRateLimit(request, RATE_LIMITS.api);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const user = await requireUser();
    const db = await getDb();

    const url = request.nextUrl;
    const status = url.searchParams.get('status') || undefined;
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;

    // Build query
    const query: Record<string, any> = { donor_id: user.id };
    if (status) {
      query.status = status;
    }

    const [subscriptions, total] = await Promise.all([
      db.collection('subscriptions')
        .find(query, { projection: { _id: 0, card_user_key: 0, card_token: 0 } })
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection('subscriptions').countDocuments(query),
    ]);

    // Enrich with campaign titles
    const campaignIds = [...new Set(subscriptions.map((s: any) => s.campaign_id))];
    const campaigns = await db.collection('campaigns')
      .find(
        { campaign_id: { $in: campaignIds } },
        { projection: { _id: 0, campaign_id: 1, title: 1, status: 1 } }
      )
      .toArray();

    const campaignMap = new Map(campaigns.map((c: any) => [c.campaign_id, c]));

    const enriched = subscriptions.map((sub: any) => ({
      ...sub,
      campaign_title: campaignMap.get(sub.campaign_id)?.title || 'Unknown Campaign',
      campaign_status: campaignMap.get(sub.campaign_id)?.status || 'unknown',
    }));

    return successResponse({
      subscriptions: enriched,
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
