import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireUser } from '@/lib/authz';
import { successResponse, errorResponse, handleRouteError } from '@/lib/api-response';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

/**
 * GET /api/subscriptions/[subscription_id]
 * Get subscription details with payment history (IDOR-protected)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { subscription_id: string } }
) {
  const rateLimitResponse = withRateLimit(request, RATE_LIMITS.api);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const user = await requireUser();
    const db = await getDb();

    const subscription = await db.collection('subscriptions').findOne(
      { subscription_id: params.subscription_id },
      { projection: { _id: 0, card_user_key: 0, card_token: 0 } }
    );

    if (!subscription) {
      return errorResponse({ code: 'NOT_FOUND', message: 'Subscription not found' }, 404);
    }

    // IDOR protection: Only the subscription owner can view it
    if (subscription.donor_id !== user.id) {
      return errorResponse({ code: 'FORBIDDEN', message: 'Access denied' }, 403);
    }

    // Get payment history
    const payments = await db.collection('subscription_payments')
      .find(
        { subscription_id: params.subscription_id },
        { projection: { _id: 0 } }
      )
      .sort({ created_at: -1 })
      .limit(50)
      .toArray();

    // Get campaign info
    const campaign = await db.collection('campaigns').findOne(
      { campaign_id: subscription.campaign_id },
      { projection: { _id: 0, campaign_id: 1, title: 1, status: 1, goal_amount: 1, raised_amount: 1 } }
    );

    return successResponse({
      subscription: {
        ...subscription,
        campaign_title: campaign?.title || 'Unknown Campaign',
        campaign_status: campaign?.status || 'unknown',
      },
      payments,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
