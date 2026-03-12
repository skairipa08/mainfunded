import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireUser } from '@/lib/authz';
import { successResponse, errorResponse, handleRouteError } from '@/lib/api-response';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { SubscriptionStatus } from '@/types';

/**
 * POST /api/subscriptions/[subscription_id]/pause
 * Pause a subscription (IDOR-protected)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { subscription_id: string } }
) {
  const rateLimitResponse = withRateLimit(request, RATE_LIMITS.api);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const user = await requireUser();
    const db = await getDb();

    const subscription = await db.collection('subscriptions').findOne(
      { subscription_id: params.subscription_id }
    );

    if (!subscription) {
      return errorResponse({ code: 'NOT_FOUND', message: 'Subscription not found' }, 404);
    }

    // IDOR protection
    if (subscription.donor_id !== user.id) {
      return errorResponse({ code: 'FORBIDDEN', message: 'Access denied' }, 403);
    }

    // Only active subscriptions can be paused
    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      return errorResponse(
        { code: 'INVALID_STATUS', message: `Cannot pause subscription with status: ${subscription.status}` },
        400
      );
    }

    await db.collection('subscriptions').updateOne(
      { subscription_id: params.subscription_id },
      {
        $set: {
          status: SubscriptionStatus.PAUSED,
          paused_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      }
    );

    return successResponse({
      subscription_id: params.subscription_id,
      status: SubscriptionStatus.PAUSED,
      paused_at: new Date().toISOString(),
    }, 'Subscription paused successfully');
  } catch (error) {
    return handleRouteError(error);
  }
}
