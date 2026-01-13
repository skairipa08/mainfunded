import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import Stripe from 'stripe';
import crypto from 'crypto';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { successResponse, errorResponse, handleRouteError } from '@/lib/api-response';

const stripe = new Stripe(process.env.STRIPE_API_KEY || '', {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = withRateLimit(request, RATE_LIMITS.checkout);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    if (!process.env.STRIPE_API_KEY) {
      return NextResponse.json(
        { error: 'Payment service not configured' },
        { status: 503 }
      );
    }

    const db = await getDb();
    const body = await request.json();
    
    const campaignId = body.campaign_id;
    const amount = parseFloat(body.amount);
    const donorName = body.donor_name || 'Anonymous';
    const donorEmail = body.donor_email;
    const anonymous = body.anonymous || false;
    let originUrl = body.origin_url;
    let idempotencyKey = body.idempotency_key;
    
    if (!campaignId || !amount) {
      return errorResponse(
        { code: 'VALIDATION_ERROR', message: 'Campaign ID and donation amount are required' },
        400
      );
    }
    
    if (amount <= 0 || amount > 10000000) { // $100,000 in cents
      return errorResponse(
        { code: 'VALIDATION_ERROR', message: 'Donation amount must be between $0.01 and $100,000' },
        400
      );
    }
    
    // Auto-detect origin URL if not provided
    if (!originUrl) {
      const referer = request.headers.get('referer');
      if (referer) {
        try {
          const url = new URL(referer);
          originUrl = `${url.protocol}//${url.host}`;
        } catch {
          // Invalid referer, use fallback
        }
      }
      if (!originUrl) {
        originUrl = process.env.AUTH_URL || 'http://localhost:3000';
      }
    }
    
    // Generate idempotency key if not provided
    if (!idempotencyKey) {
      idempotencyKey = `${campaignId}_${amount}_${crypto.randomBytes(8).toString('hex')}`;
    }
    
    // Check for existing transaction with same idempotency key
    const existing = await db.collection('payment_transactions').findOne(
      { idempotency_key: idempotencyKey },
      { projection: { _id: 0 } }
    );
    
    if (existing) {
      return NextResponse.json({
        success: true,
        data: {
          url: existing.checkout_url,
          session_id: existing.session_id,
        },
        message: 'Existing checkout session returned',
      });
    }
    
    // Verify campaign exists and is published
    const campaign = await db.collection('campaigns').findOne(
      { campaign_id: campaignId },
      { projection: { _id: 0 } }
    );
    
    if (!campaign) {
      return errorResponse(
        { code: 'NOT_FOUND', message: 'Campaign not found' },
        404
      );
    }
    
    if (campaign.status !== 'published') {
      return errorResponse(
        { code: 'INVALID_STATUS', message: 'This campaign is not currently accepting donations' },
        400
      );
    }
    
    // Get user from NextAuth session if available (optional for donations)
    let donorId = null;
    let finalDonorEmail = donorEmail;
    try {
      const { getSessionUser } = await import('@/lib/authz');
      const user = await getSessionUser();
      donorId = user?.id || null;
      if (user && !finalDonorEmail) {
        // Use email from session user (already available in getSessionUser)
        finalDonorEmail = user.email;
      }
    } catch (error) {
      // Anonymous donation - no user session
    }
    
    const successUrl = `${originUrl}/donate/success?session_id={CHECKOUT_SESSION_ID}&campaign_id=${campaignId}`;
    const cancelUrl = `${originUrl}/campaign/${campaignId}`;
    
    try {
      const session = await stripe.checkout.sessions.create(
        {
          payment_method_types: ['card'],
          line_items: [{
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Donation: ${campaign.title?.substring(0, 50) || 'Campaign'}`,
                description: 'Supporting education',
              },
              unit_amount: Math.round(amount * 100),
            },
            quantity: 1,
          }],
          mode: 'payment',
          success_url: successUrl,
          cancel_url: cancelUrl,
          customer_email: finalDonorEmail || undefined,
          metadata: {
            campaign_id: campaignId,
            donor_id: donorId || '',
            donor_name: donorName,
            anonymous: String(anonymous),
            idempotency_key: idempotencyKey,
          },
        },
        {
          idempotencyKey: idempotencyKey,
        }
      );
      
      // Create transaction record
      const transaction = {
        transaction_id: `txn_${crypto.randomBytes(6).toString('hex')}`,
        session_id: session.id,
        campaign_id: campaignId,
        donor_id: donorId,
        donor_name: donorName,
        donor_email: finalDonorEmail || null,
        amount: amount,
        currency: 'usd',
        anonymous: anonymous,
        payment_status: 'initiated',
        idempotency_key: idempotencyKey,
        checkout_url: session.url,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      await db.collection('payment_transactions').insertOne(transaction);
      
      return successResponse({
        url: session.url,
        session_id: session.id,
      });
    } catch (error: any) {
      // Log error but don't expose sensitive details
      const errorMessage = error?.message || 'Payment processing failed';
      return errorResponse(
        { code: 'PAYMENT_ERROR', message: 'Unable to process payment. Please try again later.' },
        500
      );
    }
  } catch (error) {
    return handleRouteError(error);
  }
}
