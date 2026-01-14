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
    amount: transaction.amount,
    currency: transaction.currency || 'usd',
    stripe_session_id: sessionId,
    stripe_payment_intent_id: paymentIntentId || null,
    status: PaymentStatus.PAID,
    created_at: new Date().toISOString(),
  };
  
  await db.collection('donations').insertOne(donation);
  
  await db.collection('payment_transactions').updateOne(
    { session_id: sessionId },
    { $set: {
      payment_status: 'paid',
      stripe_payment_intent_id: paymentIntentId,
      updated_at: new Date().toISOString(),
    }}
  );
  
  await db.collection('campaigns').updateOne(
    { campaign_id: transaction.campaign_id },
    {
      $inc: {
        raised_amount: transaction.amount,
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
    { $set: {
      payment_status: 'failed',
      updated_at: new Date().toISOString(),
    }}
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
    { $set: {
      status: PaymentStatus.REFUNDED,
      refund_amount: refundAmount,
      refunded_at: new Date().toISOString(),
    }}
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
          { $set: {
            payment_status: 'expired',
            updated_at: new Date().toISOString(),
          }}
        );
      } else if (eventType === 'charge.refunded') {
        const charge = event.data.object as Stripe.Charge;
        const refundAmount = (charge.amount_refunded || 0) / 100; // Convert from cents
        await processRefund(db, charge.payment_intent as string, refundAmount);
      }
      
      return NextResponse.json({ success: true, event_type: eventType });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message });
    }
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
