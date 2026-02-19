import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireUser } from '@/lib/authz';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_API_KEY || '', {
  apiVersion: '2023-10-16',
});

// GET — generate Stripe Connect OAuth URL
export async function GET() {
  try {
    const user = await requireUser();

    if (!process.env.STRIPE_API_KEY || !process.env.STRIPE_CONNECT_CLIENT_ID) {
      return NextResponse.json(
        { error: { code: 'CONFIG_ERROR', message: 'Stripe Connect yapılandırılmamış' } },
        { status: 503 },
      );
    }

    const baseUrl = process.env.AUTH_URL || 'http://localhost:3000';
    const state = Buffer.from(JSON.stringify({ user_id: user.id })).toString('base64url');

    const url = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${process.env.STRIPE_CONNECT_CLIENT_ID}&scope=read_write&redirect_uri=${encodeURIComponent(`${baseUrl}/api/student/stripe-connect/callback`)}&state=${state}`;

    return NextResponse.json({ success: true, data: { url } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    const status = message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: { code: 'ERROR', message } }, { status });
  }
}

// POST — handle callback code, exchange for accountId
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const db = await getDb();
    const body = await request.json();
    const code = body.code as string | undefined;

    if (!code) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Authorization code gereklidir' } },
        { status: 400 },
      );
    }

    // Exchange code for connected account
    const response = await stripe.oauth.token({
      grant_type: 'authorization_code',
      code,
    });

    const stripeAccountId = response.stripe_user_id;
    if (!stripeAccountId) {
      return NextResponse.json(
        { error: { code: 'STRIPE_ERROR', message: 'Stripe hesap bağlantısı başarısız' } },
        { status: 500 },
      );
    }

    // Remove old stripe_connect, add new
    await db.collection('student_profiles').updateOne(
      { user_id: user.id },
      { $pull: { payoutMethods: { type: 'stripe_connect' } } as any },
    );

    await db.collection('student_profiles').updateOne(
      { user_id: user.id },
      {
        $push: {
          payoutMethods: {
            type: 'stripe_connect',
            stripeAccountId,
            stripeAccountStatus: 'active',
            isVerified: true,
            addedAt: new Date().toISOString(),
            isDefault: false,
          },
        } as any,
      },
    );

    return NextResponse.json({
      success: true,
      message: 'Stripe Connect hesabı başarıyla bağlandı',
      data: { stripeAccountId },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Stripe bağlantı hatası';
    const status = message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: { code: 'ERROR', message } }, { status });
  }
}
