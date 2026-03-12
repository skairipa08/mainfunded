import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireUser } from '@/lib/authz';
import { successResponse, errorResponse, handleRouteError } from '@/lib/api-response';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { cancelSubscriptionSchema } from '@/lib/validators/donation';
import { SubscriptionStatus } from '@/types';
import { deleteStoredCard } from '@/lib/iyzico';
import {
  sendEmail,
  renderSubscriptionCancelledEmail,
} from '@/lib/email';

/**
 * POST /api/subscriptions/[subscription_id]/cancel
 * Cancel a subscription (IDOR-protected)
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

    // Parse optional body
    let reason = '';
    try {
      const body = await request.json();
      const parsed = cancelSubscriptionSchema.safeParse(body);
      if (parsed.success) {
        reason = parsed.data.reason || '';
      }
    } catch {
      // No body or invalid JSON — that's fine, reason is optional
    }

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

    // Check if already cancelled
    if (subscription.status === SubscriptionStatus.CANCELLED) {
      return errorResponse({ code: 'ALREADY_CANCELLED', message: 'Subscription is already cancelled' }, 400);
    }

    // Cancel the subscription
    await db.collection('subscriptions').updateOne(
      { subscription_id: params.subscription_id },
      {
        $set: {
          status: SubscriptionStatus.CANCELLED,
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason,
          updated_at: new Date().toISOString(),
        },
      }
    );

    // Try to delete stored card (non-critical)
    try {
      if (subscription.card_user_key && subscription.card_token) {
        await deleteStoredCard(subscription.card_user_key, subscription.card_token);
      }
    } catch {
      // Card deletion failure is non-critical
    }

    // Get campaign for email
    const campaign = await db.collection('campaigns').findOne(
      { campaign_id: subscription.campaign_id },
      { projection: { _id: 0, title: 1 } }
    );

    // Send cancellation email
    if (subscription.donor_email) {
      try {
        await sendEmail({
          to: subscription.donor_email,
          subject: 'Abonelik İptal Edildi',
          html: renderSubscriptionCancelledEmail({
            donorName: subscription.donor_name || 'Bağışçı',
            campaignTitle: campaign?.title || 'Kampanya',
            totalDonated: subscription.total_charged || 0,
            currency: subscription.currency || 'TRY',
            totalPayments: subscription.total_payments || 0,
          }),
        });
      } catch {
        // Non-critical
      }
    }

    // Audit log
    try {
      const { logAudit } = await import('@/lib/audit');
      await logAudit(db, {
        actor_user_id: user.id,
        actor_email: user.email || '',
        action: 'payout.processed',
        target_type: 'subscription',
        target_id: params.subscription_id,
        target_details: { reason, campaign_id: subscription.campaign_id, action: 'subscription.cancel' },
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        severity: 'info',
      });
    } catch {
      // Audit log failure is non-critical
    }

    return successResponse({
      subscription_id: params.subscription_id,
      status: SubscriptionStatus.CANCELLED,
      cancelled_at: new Date().toISOString(),
    }, 'Subscription cancelled successfully');
  } catch (error) {
    return handleRouteError(error);
  }
}
