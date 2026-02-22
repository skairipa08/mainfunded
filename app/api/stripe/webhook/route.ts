import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import Stripe from 'stripe';
import { PaymentStatus } from '@/types';
import { sendEmail, renderDonationSuccessEmail } from '@/lib/email';
import { ObjectId } from 'mongodb';
import crypto from 'crypto';

const stripe = new Stripe(process.env.STRIPE_API_KEY || '', {
  apiVersion: '2023-10-16',
});

// Stripe webhook requires raw body - Next.js App Router handles this automatically
export const runtime = 'nodejs';

async function processSuccessfulPayment(db: any, sessionId: string, paymentIntentId: string | null) {
  const existingDonation = await db.collection('donations').findOne(
    { stripe_session_id: sessionId },
    { projection: { _id: 0 } }
  );

  if (existingDonation) {
    return;
  }

  const transaction = await db.collection('payment_transactions').findOne(
    { session_id: sessionId },
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
    currency: transaction.currency || 'usd',
    stripe_session_id: sessionId,
    stripe_payment_intent_id: paymentIntentId || null,
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
        stripe_fee: transaction.stripe_fee || 0,
        created_at: new Date().toISOString(),
      });
    } catch {
      // Non-critical: fee record failed but donation is still valid
    }
  }

  await db.collection('payment_transactions').updateOne(
    { session_id: sessionId },
    {
      $set: {
        payment_status: 'paid',
        stripe_payment_intent_id: paymentIntentId,
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
        subject: 'Thank You for Your Donation',
        html: renderDonationSuccessEmail({
          donorName: transaction.donor_name || 'Donor',
          donorEmail: transaction.donor_email,
          amount: transaction.amount,
          campaignTitle: campaign?.title || 'Campaign',
          campaignId: transaction.campaign_id,
          anonymous: transaction.anonymous || false,
        }),
      });
    } catch {
      // Ignore email errors
    }
  }
}

async function processPaymentFailure(db: any, sessionId: string) {
  await db.collection('payment_transactions').updateOne(
    { session_id: sessionId },
    {
      $set: {
        payment_status: 'failed',
        updated_at: new Date().toISOString(),
      }
    }
  );
}

async function processRefund(db: any, paymentIntentId: string, refundAmount: number) {
  const donation = await db.collection('donations').findOne(
    { stripe_payment_intent_id: paymentIntentId },
    { projection: { _id: 0 } }
  );

  if (!donation) {
    return;
  }

  await db.collection('donations').updateOne(
    { stripe_payment_intent_id: paymentIntentId },
    {
      $set: {
        status: PaymentStatus.REFUNDED,
        refund_amount: refundAmount,
        refunded_at: new Date().toISOString(),
      }
    }
  );

  await db.collection('campaigns').updateOne(
    { campaign_id: donation.campaign_id },
    {
      $inc: {
        raised_amount: -refundAmount,
        donor_count: -1,
      },
      $set: {
        updated_at: new Date().toISOString(),
      },
    }
  );
}

async function processRecurringPayment(db: any, invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;
  const paymentIntentId = typeof invoice.payment_intent === 'string' ? invoice.payment_intent : invoice.payment_intent?.id || null;

  // Invoice might be paid instantly upon checkout session, so we don't double-count the first one.
  // We can track this by checking if a donation with this exact invoice ID or payment intent exists.
  if (paymentIntentId) {
    const existingDonation = await db.collection('donations').findOne({ stripe_payment_intent_id: paymentIntentId });
    if (existingDonation) return;
  }

  // Find the original transaction/subscription setup to get campaign info, donor details
  const initialTransaction = await db.collection('payment_transactions').findOne({
    $or: [
      { stripe_subscription_id: subscriptionId },
      // Fallback matching logic using metadata from the customer or subscription might be needed,
      // but ideally we should save the subscription ID on the transaction during checkout.session.completed 
    ]
  }
  );

  // If we can't find it directly by subscription id, let's try finding it by customer email + amount or look up the subscription metadata
  let transactionContext = initialTransaction;

  if (!transactionContext) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const campaignId = subscription.metadata.campaign_id;
      if (!campaignId) return; // Not our platform's subscription

      transactionContext = {
        campaign_id: campaignId,
        donor_id: subscription.metadata.donor_id || null,
        donor_name: subscription.metadata.donor_name || 'Anonymous',
        donor_email: invoice.customer_email || null,
        anonymous: subscription.metadata.anonymous === 'true',
        base_amount: parseFloat(subscription.metadata.base_amount || '0'),
        amount: invoice.amount_paid / 100, // Amount in cents
        currency: invoice.currency,
        cover_fees: subscription.metadata.cover_fees === 'true',
      };

      // Retroactively bind the subscription to the original transaction if we can find it via idempotency key
      if (subscription.metadata.idempotency_key) {
        await db.collection('payment_transactions').updateOne(
          { idempotency_key: subscription.metadata.idempotency_key },
          { $set: { stripe_subscription_id: subscriptionId, is_recurring: true } }
        );
      }
    } catch {
      return; // Handle retrieval error
    }
  }

  if (!transactionContext || !transactionContext.campaign_id) return;

  const baseAmount = transactionContext.base_amount || (invoice.amount_paid / 100);

  const donation = {
    donation_id: `donation_${crypto.randomBytes(6).toString('hex')}`,
    campaign_id: transactionContext.campaign_id,
    donor_id: transactionContext.donor_id || null,
    donor_name: transactionContext.donor_name,
    donor_email: transactionContext.donor_email || null,
    anonymous: transactionContext.anonymous || false,
    amount: baseAmount,
    total_charged: invoice.amount_paid / 100,
    cover_fees: transactionContext.cover_fees || false,
    currency: invoice.currency || 'usd',
    stripe_session_id: null,
    stripe_payment_intent_id: paymentIntentId,
    stripe_invoice_id: invoice.id,
    stripe_subscription_id: subscriptionId,
    status: PaymentStatus.PAID,
    is_recurring: true,
    created_at: new Date(invoice.created * 1000).toISOString(),
  };

  await db.collection('donations').insertOne(donation);

  await db.collection('campaigns').updateOne(
    { campaign_id: transactionContext.campaign_id },
    {
      $inc: {
        raised_amount: baseAmount,
        donor_count: 1, // Depending on logic, recurring payments might not increment distinct donor count, but keeping simple for now
      },
      $set: {
        updated_at: new Date().toISOString(),
      },
    }
  );

  const campaign = await db.collection('campaigns').findOne(
    { campaign_id: transactionContext.campaign_id },
    { projection: { _id: 0 } }
  );

  if (transactionContext.donor_email && !transactionContext.anonymous) {
    try {
      await sendEmail({
        to: transactionContext.donor_email,
        subject: 'Thank You for Your Recurring Donation',
        html: renderDonationSuccessEmail({
          donorName: transactionContext.donor_name || 'Donor',
          donorEmail: transactionContext.donor_email,
          amount: invoice.amount_paid / 100,
          campaignTitle: campaign?.title || 'Campaign',
          campaignId: transactionContext.campaign_id,
          anonymous: transactionContext.anonymous || false,
        }),
      });
    } catch {
      // Ignore
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_API_KEY) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json(
        { error: 'STRIPE_WEBHOOK_SECRET is required for webhook verification' },
        { status: 500 }
      );
    }

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error: any) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const db = await getDb();
    const eventType = event.type;

    try {
      if (eventType === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.payment_status === 'paid') {
          await processSuccessfulPayment(
            db,
            session.id,
            typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id || null
          );
        }
      } else if (eventType === 'checkout.session.async_payment_succeeded') {
        const session = event.data.object as Stripe.Checkout.Session;
        await processSuccessfulPayment(
          db,
          session.id,
          typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id || null
        );
      } else if (eventType === 'checkout.session.async_payment_failed') {
        const session = event.data.object as Stripe.Checkout.Session;
        await processPaymentFailure(db, session.id);
      } else if (eventType === 'checkout.session.expired') {
        const session = event.data.object as Stripe.Checkout.Session;
        await db.collection('payment_transactions').updateOne(
          { session_id: session.id },
          {
            $set: {
              payment_status: 'expired',
              updated_at: new Date().toISOString(),
            }
          }
        );
      } else if (eventType === 'charge.refunded') {
        const charge = event.data.object as Stripe.Charge;
        const refundAmount = (charge.amount_refunded || 0) / 100; // Convert from cents
        await processRefund(db, charge.payment_intent as string, refundAmount);
      } else if (eventType === 'invoice.paid') {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          await processRecurringPayment(db, invoice);
        }
      } else if (eventType === 'customer.subscription.deleted' || eventType === 'customer.subscription.updated') {
        const subscription = event.data.object as Stripe.Subscription;
        await db.collection('donations').updateMany(
          { stripe_subscription_id: subscription.id },
          { $set: { subscription_status: subscription.status, updated_at: new Date().toISOString() } }
        );
        await db.collection('payment_transactions').updateMany(
          { stripe_subscription_id: subscription.id },
          { $set: { subscription_status: subscription.status, updated_at: new Date().toISOString() } }
        );
      }

      return NextResponse.json({ success: true, event_type: eventType });
    } catch (error: any) {
      console.error('Error processing webhook event:', error);
      return NextResponse.json({ success: false, error: error.message });
    }
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
