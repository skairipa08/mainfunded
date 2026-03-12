import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { chargeStoredCard } from '@/lib/iyzico';
import { SubscriptionStatus } from '@/types';
import type { BillingInterval } from '@/types';
import crypto from 'crypto';
import {
  sendEmail,
  renderSubscriptionRenewalEmail,
  renderStudentRecurringDonationEmail,
  renderPaymentFailedEmail,
} from '@/lib/email';

/**
 * GET /api/cron/process-subscriptions
 *
 * Cron endpoint to process due recurring subscriptions.
 * Protected by CRON_SECRET — Vercel Cron passes this automatically,
 * or call manually with ?secret=YOUR_SECRET.
 *
 * Scheduled via vercel.json: daily at 09:00 UTC
 */
export async function GET(request: NextRequest) {
  // Verify cron secret
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get('authorization');
    const querySecret = request.nextUrl.searchParams.get('secret');

    const bearerMatch = authHeader === `Bearer ${cronSecret}`;
    const queryMatch = querySecret === cronSecret;

    if (!bearerMatch && !queryMatch) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const results = {
    processed: 0,
    succeeded: 0,
    failed: 0,
    skipped: 0,
    expired: 0,
    errors: [] as string[],
  };

  try {
    const db = await getDb();
    const now = new Date().toISOString();

    // Find all active subscriptions that are due for billing
    const dueSubscriptions = await db.collection('subscriptions').find({
      status: SubscriptionStatus.ACTIVE,
      next_billing_date: { $lte: now },
    }).toArray();

    // Also process past_due subscriptions (retry)
    const pastDueSubscriptions = await db.collection('subscriptions').find({
      status: SubscriptionStatus.PAST_DUE,
      next_billing_date: { $lte: now },
      retry_count: { $lt: 5 }, // Don't retry more than max_retries
    }).toArray();

    const allSubscriptions = [...dueSubscriptions, ...pastDueSubscriptions];

    console.log(`[Cron] Processing ${allSubscriptions.length} due subscriptions`);

    for (const subscription of allSubscriptions) {
      results.processed++;

      try {
        // Verify campaign still exists and is active
        const campaign = await db.collection('campaigns').findOne(
          { campaign_id: subscription.campaign_id },
          { projection: { _id: 0 } }
        );

        if (!campaign || campaign.status === 'completed' || campaign.status === 'cancelled') {
          // Campaign no longer active — expire the subscription
          await db.collection('subscriptions').updateOne(
            { subscription_id: subscription.subscription_id },
            {
              $set: {
                status: SubscriptionStatus.EXPIRED,
                updated_at: new Date().toISOString(),
                cancellation_reason: 'Campaign no longer active',
              },
            }
          );
          results.expired++;
          results.skipped++;
          continue;
        }

        // Charge the stored card
        const conversationId = `recur_${crypto.randomBytes(6).toString('hex')}`;
        const chargeResult = await chargeStoredCard({
          conversationId,
          price: subscription.amount.toFixed(2),
          paidPrice: subscription.amount.toFixed(2),
          currency: subscription.currency || 'TRY',
          cardUserKey: subscription.card_user_key,
          cardToken: subscription.card_token,
          buyerId: subscription.donor_id || `donor_${subscription.donor_email}`,
          buyerName: subscription.donor_name || 'Anonymous',
          buyerEmail: subscription.donor_email || 'anonymous@funded.org',
          basketId: `basket_sub_${crypto.randomBytes(4).toString('hex')}`,
          campaignTitle: campaign.title || 'Campaign',
          campaignId: subscription.campaign_id,
        });

        if (chargeResult.status === 'success') {
          // ── Payment succeeded ──────────────────────────────────────
          const donationId = `donation_${crypto.randomBytes(6).toString('hex')}`;
          const nextBillingDate = calculateNextBillingDate(subscription.interval as BillingInterval);

          // Create donation record
          await db.collection('donations').insertOne({
            donation_id: donationId,
            campaign_id: subscription.campaign_id,
            donor_id: subscription.donor_id || null,
            donor_name: subscription.donor_name,
            donor_email: subscription.donor_email || null,
            anonymous: false,
            amount: subscription.amount,
            total_charged: subscription.amount,
            cover_fees: false,
            currency: subscription.currency || 'TRY',
            iyzico_payment_id: chargeResult.paymentId,
            subscription_id: subscription.subscription_id,
            status: 'paid',
            created_at: new Date().toISOString(),
          });

          // Update campaign raised amount
          await db.collection('campaigns').updateOne(
            { campaign_id: subscription.campaign_id },
            {
              $inc: { raised_amount: subscription.amount, donor_count: 0 }, // Don't re-count donor
              $set: { updated_at: new Date().toISOString() },
            }
          );

          // Record subscription payment
          await db.collection('subscription_payments').insertOne({
            payment_id: `sp_${crypto.randomBytes(6).toString('hex')}`,
            subscription_id: subscription.subscription_id,
            donation_id: donationId,
            amount: subscription.amount,
            currency: subscription.currency || 'TRY',
            status: 'success',
            iyzico_payment_id: chargeResult.paymentId,
            created_at: new Date().toISOString(),
          });

          // Update subscription
          const newTotalCharged = (subscription.total_charged || 0) + subscription.amount;
          const newTotalPayments = (subscription.total_payments || 0) + 1;

          await db.collection('subscriptions').updateOne(
            { subscription_id: subscription.subscription_id },
            {
              $set: {
                status: SubscriptionStatus.ACTIVE, // Reset to active if was past_due
                next_billing_date: nextBillingDate,
                last_billing_date: new Date().toISOString(),
                retry_count: 0,
                total_charged: newTotalCharged,
                total_payments: newTotalPayments,
                updated_at: new Date().toISOString(),
              },
            }
          );

          // ── Send success emails ──
          const formattedNextDate = new Date(nextBillingDate).toLocaleDateString('tr-TR', {
            year: 'numeric', month: 'long', day: 'numeric',
          });

          // Email to donor
          if (subscription.donor_email) {
            try {
              await sendEmail({
                to: subscription.donor_email,
                subject: '💝 Aylık Bağışınız Başarıyla Tahsil Edildi',
                html: renderSubscriptionRenewalEmail({
                  donorName: subscription.donor_name || 'Bağışçı',
                  amount: subscription.amount,
                  currency: subscription.currency || 'TRY',
                  campaignTitle: campaign.title || 'Kampanya',
                  campaignId: subscription.campaign_id,
                  paymentDate: new Date().toLocaleDateString('tr-TR'),
                  nextBillingDate: formattedNextDate,
                  totalDonated: newTotalCharged,
                }),
              });
            } catch {
              // Non-critical
            }
          }

          // Email to student
          if (campaign.owner_id) {
            try {
              const student = await db.collection('users').findOne(
                { user_id: campaign.owner_id },
                { projection: { email: 1, name: 1 } }
              );
              if (student?.email) {
                await sendEmail({
                  to: student.email,
                  subject: '🎓 Düzenli Bağışçınızdan Yeni Ödeme!',
                  html: renderStudentRecurringDonationEmail({
                    studentName: student.name || 'Öğrenci',
                    donorName: subscription.donor_name || 'Bağışçı',
                    amount: subscription.amount,
                    currency: subscription.currency || 'TRY',
                    campaignTitle: campaign.title || 'Kampanya',
                    campaignId: subscription.campaign_id,
                    anonymous: false,
                  }),
                });
              }
            } catch {
              // Non-critical
            }
          }

          results.succeeded++;
        } else {
          // ── Payment failed ─────────────────────────────────────────
          const newRetryCount = (subscription.retry_count || 0) + 1;
          const maxRetries = subscription.max_retries || 5;

          // Determine new status based on retry count
          let newStatus = subscription.status;
          if (newRetryCount >= maxRetries) {
            newStatus = SubscriptionStatus.EXPIRED;
            results.expired++;
          } else if (newRetryCount >= 3) {
            newStatus = SubscriptionStatus.PAST_DUE;
          }

          // Set next retry date (exponential backoff: 1, 2, 4, 8, 16 days)
          const retryDays = Math.pow(2, newRetryCount - 1);
          const nextRetry = new Date();
          nextRetry.setDate(nextRetry.getDate() + retryDays);

          // Record failed payment attempt
          await db.collection('subscription_payments').insertOne({
            payment_id: `sp_${crypto.randomBytes(6).toString('hex')}`,
            subscription_id: subscription.subscription_id,
            amount: subscription.amount,
            currency: subscription.currency || 'TRY',
            status: 'failed',
            error_message: chargeResult.errorMessage || 'Payment declined',
            created_at: new Date().toISOString(),
          });

          // Update subscription
          await db.collection('subscriptions').updateOne(
            { subscription_id: subscription.subscription_id },
            {
              $set: {
                status: newStatus,
                retry_count: newRetryCount,
                next_billing_date: nextRetry.toISOString(),
                updated_at: new Date().toISOString(),
              },
            }
          );

          // Send failure email to donor
          if (subscription.donor_email) {
            try {
              await sendEmail({
                to: subscription.donor_email,
                subject: '⚠️ Düzenli Bağış Ödemesi Başarısız',
                html: renderPaymentFailedEmail({
                  donorName: subscription.donor_name || 'Bağışçı',
                  amount: subscription.amount,
                  currency: subscription.currency || 'TRY',
                  campaignTitle: campaign.title || 'Kampanya',
                  retryCount: newRetryCount,
                  maxRetries,
                }),
              });
            } catch {
              // Non-critical
            }
          }

          results.failed++;
        }
      } catch (error: any) {
        // Individual subscription processing failed — continue with others
        results.errors.push(`${subscription.subscription_id}: ${error.message}`);
        results.failed++;
        console.error(`[Cron] Error processing subscription ${subscription.subscription_id}:`, error.message);
      }
    }

    console.log(`[Cron] Subscription processing complete:`, results);

    return NextResponse.json({
      success: true,
      ...results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Cron] process-subscriptions failed:', error);
    return NextResponse.json(
      { error: 'Failed to process subscriptions', message: error.message },
      { status: 500 }
    );
  }
}

/** Calculate next billing date based on interval */
function calculateNextBillingDate(interval: BillingInterval): string {
  const next = new Date();
  switch (interval) {
    case 'monthly': next.setMonth(next.getMonth() + 1); break;
    case 'quarterly': next.setMonth(next.getMonth() + 3); break;
    case 'yearly': next.setFullYear(next.getFullYear() + 1); break;
  }
  return next.toISOString();
}
