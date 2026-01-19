/**
 * Stripe Webhook Handler
 * 
 * Implements reliable webhook processing with:
 * 1. Signature verification FIRST
 * 2. Idempotency checking using StripeEvent collection
 * 3. Event persistence BEFORE processing (status: PENDING)
 * 4. Immediate 200 response, async processing
 * 5. Handles: checkout.session.completed, charge.dispute.created, payout.failed, payment_intent.succeeded
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getDb } from '@/lib/db';
import {
    isStripeEventProcessed,
    recordStripeEvent,
    updateStripeEventStatus
} from '@/lib/verification/db';
import { sendEmail } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_API_KEY || '', {
    apiVersion: '2023-10-16',
});

export const runtime = 'nodejs';

/**
 * Process checkout.session.completed event
 */
async function handleCheckoutSessionCompleted(
    db: any,
    session: Stripe.Checkout.Session
): Promise<void> {
    // Only process if payment is actually paid
    if (session.payment_status !== 'paid') {
        return;
    }

    // Check if donation already exists (idempotency)
    const existingDonation = await db.collection('donations').findOne({
        stripe_session_id: session.id
    });

    if (existingDonation) {
        return; // Already processed
    }

    // Find the payment transaction
    const transaction = await db.collection('payment_transactions').findOne({
        session_id: session.id
    });

    if (!transaction) {
        console.warn(`[Webhook] No transaction found for session ${session.id}`);
        return;
    }

    const paymentIntentId = typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id || null;

    // Create donation record
    const donation = {
        donation_id: `donation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        campaign_id: transaction.campaign_id,
        donor_id: transaction.donor_id || null,
        donor_name: transaction.donor_name,
        donor_email: transaction.donor_email || null,
        anonymous: transaction.anonymous || false,
        amount: transaction.amount,
        currency: transaction.currency || 'usd',
        stripe_session_id: session.id,
        stripe_payment_intent_id: paymentIntentId,
        status: 'paid',
        created_at: new Date().toISOString(),
    };

    await db.collection('donations').insertOne(donation);

    // Update transaction status
    await db.collection('payment_transactions').updateOne(
        { session_id: session.id },
        {
            $set: {
                payment_status: 'paid',
                stripe_payment_intent_id: paymentIntentId,
                updated_at: new Date().toISOString(),
            }
        }
    );

    // Update campaign raised amount
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

    // Check if campaign goal reached
    const campaign = await db.collection('campaigns').findOne({
        campaign_id: transaction.campaign_id
    });

    if (campaign && (campaign.raised_amount || 0) >= (campaign.goal_amount || 0)) {
        await db.collection('campaigns').updateOne(
            { campaign_id: transaction.campaign_id },
            { $set: { status: 'completed' } }
        );
    }
}

/**
 * Process charge.dispute.created event
 * Pauses all pending payouts for the affected user
 */
async function handleChargeDisputeCreated(
    db: any,
    dispute: Stripe.Dispute
): Promise<void> {
    // Get the charge to find the payment intent
    const chargeId = dispute.charge as string;
    
    // Find the donation associated with this charge
    const donation = await db.collection('donations').findOne({
        stripe_payment_intent_id: dispute.payment_intent as string
    });

    if (!donation) {
        console.warn(`[Webhook] No donation found for dispute ${dispute.id}`);
        return;
    }

    // Find the campaign owner
    const campaign = await db.collection('campaigns').findOne({
        campaign_id: donation.campaign_id
    });

    if (!campaign) {
        console.warn(`[Webhook] No campaign found for dispute ${dispute.id}`);
        return;
    }

    const userId = campaign.owner_id;

    // Pause all pending payouts for this user
    const result = await db.collection('payouts').updateMany(
        { user_id: userId, status: 'pending' },
        {
            $set: {
                status: 'held',
                hold_reason: `Charge dispute created: ${dispute.id}`,
                dispute_id: dispute.id,
                updated_at: new Date().toISOString()
            }
        }
    );

    console.log(`[Webhook] Dispute ${dispute.id}: ${result.modifiedCount} payouts paused for user ${userId}`);

    // Alert admins
    await alertAdmins({
        subject: `⚠️ Charge Dispute Created`,
        html: `
            <h2>Charge Dispute Alert</h2>
            <p>A charge dispute has been created:</p>
            <ul>
                <li><strong>Dispute ID:</strong> ${dispute.id}</li>
                <li><strong>Charge ID:</strong> ${chargeId}</li>
                <li><strong>Amount:</strong> $${(dispute.amount / 100).toFixed(2)}</li>
                <li><strong>Campaign ID:</strong> ${donation.campaign_id}</li>
                <li><strong>User ID:</strong> ${userId}</li>
                <li><strong>Payouts Paused:</strong> ${result.modifiedCount}</li>
            </ul>
            <p>Please review the dispute in Stripe dashboard and take appropriate action.</p>
        `
    });
}

/**
 * Process payout.failed event
 * Alerts admins about failed payout
 */
async function handlePayoutFailed(
    db: any,
    payout: Stripe.Payout
): Promise<void> {
    console.error(`[Webhook] Payout failed: ${payout.id}, Amount: ${payout.amount / 100} ${payout.currency}`);

    // Find the user associated with this payout (if we store payout_id in payouts collection)
    // For now, we'll just alert admins with the payout details
    await alertAdmins({
        subject: `🚨 Payout Failed`,
        html: `
            <h2>Payout Failure Alert</h2>
            <p>A payout has failed:</p>
            <ul>
                <li><strong>Payout ID:</strong> ${payout.id}</li>
                <li><strong>Amount:</strong> ${payout.amount / 100} ${payout.currency.toUpperCase()}</li>
                <li><strong>Status:</strong> ${payout.status}</li>
                <li><strong>Failure Code:</strong> ${payout.failure_code || 'N/A'}</li>
                <li><strong>Failure Message:</strong> ${payout.failure_message || 'N/A'}</li>
                <li><strong>Destination:</strong> ${payout.destination || 'N/A'}</li>
            </ul>
            <p>Please review the payout in Stripe dashboard and contact the user if necessary.</p>
        `
    });

    // Update payout status in our database if we have a record
    await db.collection('payouts').updateMany(
        { stripe_payout_id: payout.id },
        {
            $set: {
                status: 'failed',
                failure_code: payout.failure_code,
                failure_message: payout.failure_message,
                updated_at: new Date().toISOString()
            }
        }
    );
}

/**
 * Process payment_intent.succeeded event
 */
async function handlePaymentIntentSucceeded(
    db: any,
    paymentIntent: Stripe.PaymentIntent
): Promise<void> {
    // Check if already processed
    const existingDonation = await db.collection('donations').findOne({
        stripe_payment_intent_id: paymentIntent.id
    });

    if (existingDonation) {
        return; // Already processed
    }

    // Find transaction by payment intent
    const transaction = await db.collection('payment_transactions').findOne({
        stripe_payment_intent_id: paymentIntent.id
    });

    if (!transaction) {
        // Payment intent might be from a different flow, log but don't error
        console.log(`[Webhook] Payment intent ${paymentIntent.id} succeeded but no transaction found`);
        return;
    }

    // Create donation if not exists
    const donation = {
        donation_id: `donation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        campaign_id: transaction.campaign_id,
        donor_id: transaction.donor_id || null,
        donor_name: transaction.donor_name,
        donor_email: transaction.donor_email || null,
        anonymous: transaction.anonymous || false,
        amount: transaction.amount,
        currency: transaction.currency || 'usd',
        stripe_session_id: transaction.session_id || null,
        stripe_payment_intent_id: paymentIntent.id,
        status: 'paid',
        created_at: new Date().toISOString(),
    };

    await db.collection('donations').insertOne(donation);

    // Update transaction
    await db.collection('payment_transactions').updateOne(
        { stripe_payment_intent_id: paymentIntent.id },
        {
            $set: {
                payment_status: 'paid',
                updated_at: new Date().toISOString(),
            }
        }
    );

    // Update campaign
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
}

/**
 * Send alert email to all admins
 */
async function alertAdmins(options: { subject: string; html: string }): Promise<void> {
    const adminEmails = (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map(e => e.trim().toLowerCase())
        .filter(Boolean);

    if (adminEmails.length === 0) {
        console.warn('[Webhook] No ADMIN_EMAILS configured, skipping admin alert');
        return;
    }

    try {
        await Promise.all(
            adminEmails.map(adminEmail =>
                sendEmail({
                    to: adminEmail,
                    subject: options.subject,
                    html: options.html,
                })
            )
        );
    } catch (error) {
        console.error('[Webhook] Failed to send admin alert:', error);
        // Don't throw - alert failure shouldn't break webhook processing
    }
}

/**
 * Process webhook event asynchronously
 */
async function processEvent(event: Stripe.Event): Promise<void> {
    const db = await getDb();

    try {
        // Update status to PROCESSING
        await updateStripeEventStatus(event.id, 'PROCESSING');

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                await handleCheckoutSessionCompleted(db, session);
                break;
            }

            case 'charge.dispute.created': {
                const dispute = event.data.object as Stripe.Dispute;
                await handleChargeDisputeCreated(db, dispute);
                break;
            }

            case 'payout.failed': {
                const payout = event.data.object as Stripe.Payout;
                await handlePayoutFailed(db, payout);
                break;
            }

            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                await handlePaymentIntentSucceeded(db, paymentIntent);
                break;
            }

            default:
                // Unknown event type - log but don't error
                console.log(`[Webhook] Unhandled event type: ${event.type}`);
        }

        // Mark as processed
        await updateStripeEventStatus(event.id, 'PROCESSED');
    } catch (error: any) {
        console.error(`[Webhook] Error processing event ${event.id}:`, error);
        await updateStripeEventStatus(
            event.id,
            'FAILED',
            error.message || 'Unknown error'
        );
        // Re-throw to allow retry mechanism
        throw error;
    }
}

/**
 * Main webhook handler
 */
export async function POST(request: NextRequest) {
    try {
        // 1. Verify configuration
        if (!process.env.STRIPE_API_KEY) {
            return NextResponse.json(
                { error: 'Stripe not configured' },
                { status: 500 }
            );
        }

        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!webhookSecret) {
            return NextResponse.json(
                { error: 'STRIPE_WEBHOOK_SECRET is required for webhook verification' },
                { status: 500 }
            );
        }

        // 2. Get raw body and signature
        const body = await request.text();
        const signature = request.headers.get('stripe-signature');

        if (!signature) {
            return NextResponse.json(
                { error: 'Missing stripe-signature header' },
                { status: 400 }
            );
        }

        // 3. Verify signature FIRST
        let event: Stripe.Event;
        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (error: any) {
            console.error('[Webhook] Invalid signature:', error.message);
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 400 }
            );
        }

        // 4. Check idempotency
        const alreadyProcessed = await isStripeEventProcessed(event.id);
        if (alreadyProcessed) {
            console.log(`[Webhook] Event ${event.id} already processed, skipping`);
            return NextResponse.json({ received: true }, { status: 200 });
        }

        // 5. Persist event BEFORE processing (status: PENDING)
        await recordStripeEvent(
            event.id,
            event.type,
            event.data.object as Record<string, any>
        );

        // 6. Return 200 immediately, process async
        // Process in background (don't await)
        processEvent(event).catch(error => {
            console.error(`[Webhook] Async processing failed for ${event.id}:`, error);
            // Event status already updated in processEvent
        });

        return NextResponse.json({ received: true }, { status: 200 });
    } catch (error: any) {
        console.error('[Webhook] Fatal error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
