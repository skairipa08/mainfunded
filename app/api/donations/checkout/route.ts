import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import crypto from 'crypto';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { successResponse, errorResponse, handleRouteError } from '@/lib/api-response';
import { calculateTotalWithFees } from '@/lib/fees';
import { createCheckoutSchema } from '@/lib/validators/donation';
import { createIyzicoCheckoutForm } from '@/lib/iyzico';

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = withRateLimit(request, RATE_LIMITS.checkout);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    if (!process.env.IYZICO_API_KEY || !process.env.IYZICO_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Payment service not configured' },
        { status: 503 }
      );
    }

    const db = await getDb();
    const body = await request.json();

    // Validate input with Zod schema
    const parsed = createCheckoutSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(
        { code: 'VALIDATION_ERROR', message: parsed.error.errors.map(e => e.message).join(', ') },
        400
      );
    }

    const {
      campaign_id: campaignId,
      amount: baseAmount,
      coverFees,
      donor_name: donorName,
      donor_email: donorEmail,
      anonymous,
      note_to_student,
      platform_tip_percent: platformTipPercent,
      platform_tip_amount: platformTipAmount,
      interval,
    } = parsed.data;

    const noteToStudent = note_to_student?.trim() || '';
    let originUrl = parsed.data.origin_url;
    let idempotencyKey = parsed.data.idempotency_key;

    // Fee calculation
    let amount: number;
    let iyzicoFee = 0;
    let platformFee = 0;

    if (coverFees) {
      const fees = calculateTotalWithFees(baseAmount);
      amount = fees.totalCharge;
      iyzicoFee = fees.iyzicoFee;
      platformFee = fees.platformFee;
    } else {
      amount = baseAmount;
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
      idempotencyKey = `${campaignId}_${amount}_${interval}_${crypto.randomBytes(8).toString('hex')}`;
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
        finalDonorEmail = user.email;
      }
    } catch (error) {
      // Anonymous donation - no user session
    }

    const conversationId = `conv_${crypto.randomBytes(8).toString('hex')}`;
    const basketId = `basket_${crypto.randomBytes(6).toString('hex')}`;

    try {
      const isSubscription = interval === 'week' || interval === 'month';
      const callbackUrl = `${originUrl}/api/iyzico/callback`;

      // Create iyzico checkout form
      const iyzicoResult = await createIyzicoCheckoutForm({
        conversationId,
        price: amount.toFixed(2),
        paidPrice: amount.toFixed(2),
        basketId,
        callbackUrl,
        buyerName: donorName || 'Anonymous',
        buyerEmail: finalDonorEmail || 'anonymous@funded.org',
        buyerId: donorId || `guest_${crypto.randomBytes(4).toString('hex')}`,
        campaignTitle: campaign.title?.substring(0, 50) || 'Campaign',
        campaignId,
      });

      if (iyzicoResult.status !== 'success') {
        return errorResponse(
          { code: 'PAYMENT_ERROR', message: 'Unable to create payment form. Please try again later.' },
          500
        );
      }

      // Create transaction record
      const sessionId = iyzicoResult.token;
      const transaction = {
        transaction_id: `txn_${crypto.randomBytes(6).toString('hex')}`,
        session_id: sessionId,
        conversation_id: conversationId,
        basket_id: basketId,
        campaign_id: campaignId,
        donor_id: donorId,
        donor_name: donorName,
        donor_email: finalDonorEmail || null,
        amount: amount,
        base_amount: baseAmount,
        iyzico_fee: iyzicoFee,
        platform_fee: platformFee,
        cover_fees: coverFees,
        currency: 'TRY',
        anonymous: anonymous,
        note_to_student: noteToStudent,
        platform_tip_percent: platformTipPercent,
        platform_tip_amount: platformTipAmount,
        interval: interval || 'one-time',
        is_recurring: isSubscription,
        payment_status: 'initiated',
        idempotency_key: idempotencyKey,
        checkout_url: iyzicoResult.paymentPageUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await db.collection('payment_transactions').insertOne(transaction);

      return successResponse({
        url: iyzicoResult.paymentPageUrl,
        session_id: sessionId,
        checkoutFormContent: iyzicoResult.checkoutFormContent,
      });
    } catch (error: any) {
      return errorResponse(
        { code: 'PAYMENT_ERROR', message: 'Unable to process payment. Please try again later.' },
        500
      );
    }
  } catch (error) {
    return handleRouteError(error);
  }
}
