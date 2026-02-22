import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { retrieveIyzicoPayment } from '@/lib/iyzico';
import { PaymentStatus } from '@/types';
import { sendEmail, renderDonationSuccessEmail } from '@/lib/email';
import crypto from 'crypto';
import {
    isIyzicoEventProcessed,
    recordIyzicoEvent,
    updateIyzicoEventStatus
} from '@/lib/verification/db';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

async function processSuccessfulPayment(db: any, token: string, paymentId: string) {
  // Check idempotency
  const existingDonation = await db.collection('donations').findOne(
    { iyzico_token: token },
    { projection: { _id: 0 } }
  );

  if (existingDonation) {
    return;
  }

  const transaction = await db.collection('payment_transactions').findOne(
    { session_id: token },
    { projection: { _id: 0 } }
  );

  if (!transaction) {
    return;
  }

  const donation = {
    donation_id: `donation_${crypto.randomBytes(6).toString('hex')}`,
    campaign_id: transaction.campaign_id,
    donor_id: transaction.donor_id || null,
    donor_name: transaction.donor_name,
    donor_email: transaction.donor_email || null,
    anonymous: transaction.anonymous || false,
    amount: transaction.base_amount ?? transaction.amount,
    total_charged: transaction.amount,
    cover_fees: transaction.cover_fees || false,
    currency: transaction.currency || 'TRY',
    iyzico_token: token,
    iyzico_payment_id: paymentId,
    status: PaymentStatus.PAID,
    created_at: new Date().toISOString(),
  };

  await db.collection('donations').insertOne(donation);

  // Record platform fee if fees were covered
  if (transaction.cover_fees && transaction.platform_fee > 0) {
    try {
      await db.collection('platform_fees').insertOne({
        fee_id: `fee_${crypto.randomBytes(6).toString('hex')}`,
        donation_id: donation.donation_id,
        campaign_id: transaction.campaign_id,
        base_amount: transaction.base_amount ?? transaction.amount,
        platform_fee: transaction.platform_fee,
        iyzico_fee: transaction.iyzico_fee || 0,
        created_at: new Date().toISOString(),
      });
    } catch {
      // Non-critical: fee record failed but donation is still valid
    }
  }

  await db.collection('payment_transactions').updateOne(
    { session_id: token },
    {
      $set: {
        payment_status: 'paid',
        iyzico_payment_id: paymentId,
        updated_at: new Date().toISOString(),
      }
    }
  );

  await db.collection('campaigns').updateOne(
    { campaign_id: transaction.campaign_id },
    {
      $inc: {
        raised_amount: transaction.base_amount ?? transaction.amount,
        donor_count: 1,
      },
      $set: {
        updated_at: new Date().toISOString(),
      },
    }
  );

  const campaign = await db.collection('campaigns').findOne(
    { campaign_id: transaction.campaign_id },
    { projection: { _id: 0 } }
  );

  if (campaign && (campaign.raised_amount || 0) >= (campaign.goal_amount || 0)) {
    await db.collection('campaigns').updateOne(
      { campaign_id: transaction.campaign_id },
      { $set: { status: 'completed' } }
    );
  }

  if (transaction.donor_email && !transaction.anonymous) {
    try {
      await sendEmail({
        to: transaction.donor_email,
        subject: 'Bağışınız İçin Teşekkürler',
        html: renderDonationSuccessEmail({
          donorName: transaction.donor_name || 'Bağışçı',
          donorEmail: transaction.donor_email,
          amount: transaction.amount,
          campaignTitle: campaign?.title || 'Kampanya',
          campaignId: transaction.campaign_id,
          anonymous: transaction.anonymous || false,
        }),
      });
    } catch {
      // Ignore email errors
    }
  }
}

async function processPaymentFailure(db: any, token: string) {
  await db.collection('payment_transactions').updateOne(
    { session_id: token },
    {
      $set: {
        payment_status: 'failed',
        updated_at: new Date().toISOString(),
      }
    }
  );
}

/**
 * iyzico Callback Handler
 * iyzico sends a POST to this endpoint after payment completes.
 * We then retrieve the payment result using the token.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const formData = body ? null : await request.formData().catch(() => null);
    
    const token = body?.token || formData?.get('token')?.toString();

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    // Check idempotency
    const alreadyProcessed = await isIyzicoEventProcessed(token);
    if (alreadyProcessed) {
      logger.info(`[iyzico Callback] Token ${token} already processed, skipping`);
      // Redirect to success page
      const db = await getDb();
      const transaction = await db.collection('payment_transactions').findOne({ session_id: token });
      const redirectUrl = transaction?.campaign_id
        ? `/campaign/${transaction.campaign_id}/donate?session_id=${token}`
        : '/donor/dashboard';
      return NextResponse.redirect(new URL(redirectUrl, process.env.AUTH_URL || 'http://localhost:3000'));
    }

    // Record event
    await recordIyzicoEvent(token, 'callback', { token });

    // Retrieve payment result from iyzico
    const paymentResult = await retrieveIyzicoPayment(token);

    const db = await getDb();

    if (paymentResult.status === 'success' && paymentResult.paymentStatus === '1') {
      // Payment successful
      await updateIyzicoEventStatus(token, 'PROCESSING');
      try {
        await processSuccessfulPayment(db, token, paymentResult.paymentId);
        await updateIyzicoEventStatus(token, 'PROCESSED');
      } catch (error: any) {
        await updateIyzicoEventStatus(token, 'FAILED', error.message);
        console.error('[iyzico Callback] Processing error:', error);
      }
    } else {
      // Payment failed
      await processPaymentFailure(db, token);
      await updateIyzicoEventStatus(token, 'FAILED', paymentResult.errorMessage || 'Payment failed');
    }

    // Redirect user to result page
    const transaction = await db.collection('payment_transactions').findOne({ session_id: token });
    const campaignId = transaction?.campaign_id || paymentResult.basketId;
    
    if (paymentResult.status === 'success' && paymentResult.paymentStatus === '1') {
      const successUrl = `/campaign/${campaignId}/donate?session_id=${token}`;
      return NextResponse.redirect(new URL(successUrl, process.env.AUTH_URL || 'http://localhost:3000'));
    } else {
      const failUrl = `/campaign/${campaignId}/donate?error=payment_failed`;
      return NextResponse.redirect(new URL(failUrl, process.env.AUTH_URL || 'http://localhost:3000'));
    }
  } catch (error: any) {
    console.error('[iyzico Callback] Fatal error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
