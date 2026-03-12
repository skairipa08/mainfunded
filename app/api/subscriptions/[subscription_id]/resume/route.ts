import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireUser } from '@/lib/authz';
import { successResponse, errorResponse, handleRouteError } from '@/lib/api-response';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { SubscriptionStatus } from '@/types';
import type { BillingInterval } from '@/types';

/**
 * POST /api/subscriptions/[subscription_id]/resume
 * Resume a paused subscription (IDOR-protected)
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

    // Only paused subscriptions can be resumed
    if (subscription.status !== SubscriptionStatus.PAUSED) {
      return errorResponse(
        { code: 'INVALID_STATUS', message: `Cannot resume subscription with status: ${subscription.status}` },
        400
      );
    }

    // Calculate next billing date from now
    const nextBillingDate = calculateNextBillingDate(subscription.interval as BillingInterval);

    await db.collection('subscriptions').updateOne(
      { subscription_id: params.subscription_id },
      {
        $set: {
          status: SubscriptionStatus.ACTIVE,
          next_billing_date: nextBillingDate,
          retry_count: 0,
          paused_at: null,
          updated_at: new Date().toISOString(),
        },
      }
    );

    return successResponse({
      subscription_id: params.subscription_id,
      status: SubscriptionStatus.ACTIVE,
      next_billing_date: nextBillingDate,
    }, 'Subscription resumed successfully');
  } catch (error) {
    return handleRouteError(error);
  }
}

function calculateNextBillingDate(interval: BillingInterval): string {
  const next = new Date();
  switch (interval) {
    case 'monthly': next.setMonth(next.getMonth() + 1); break;
    case 'quarterly': next.setMonth(next.getMonth() + 3); break;
    case 'yearly': next.setFullYear(next.getFullYear() + 1); break;
  }
  return next.toISOString();
}
