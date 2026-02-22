import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireUser } from '@/lib/authz';
import Stripe from 'stripe';
import { errorResponse, successResponse } from '@/lib/api-response';

const stripe = new Stripe(process.env.STRIPE_API_KEY || '', {
  apiVersion: '2023-10-16',
});

// GET — generate Stripe Connect Express Onboarding URL or Dashboard URL
export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const db = await getDb();

    if (!process.env.STRIPE_API_KEY) {
      return errorResponse({ code: 'CONFIG_ERROR', message: 'Stripe Connect yapılandırılmamış' }, 503);
    }

    const baseUrl = process.env.AUTH_URL || 'http://localhost:3000';
    const returnUrl = `${baseUrl}/student/dashboard/payout?refresh=true`;

    // Fetch the user's current record
    const userRecord = await db.collection('users').findOne({ id: user.id });

    let accountId = userRecord?.stripe_account_id;

    // Create a new Stripe Connect Express account if they don't have one
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US', // Default to US, Stripe handles country selection later
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
      accountId = account.id;

      // Save the ID so we don't recreate it
      await db.collection('users').updateOne(
        { id: user.id },
        { $set: { stripe_account_id: accountId, stripe_onboarding_complete: false } }
      );
    }

    // Checking if Onboarding is complete
    const accountStatus = await stripe.accounts.retrieve(accountId);

    if (accountStatus.details_submitted) {
      // Onboarding is complete, record it
      await db.collection('users').updateOne(
        { id: user.id },
        { $set: { stripe_onboarding_complete: true } }
      );

      // Generate a login link to their Stripe Dashboard
      const loginLink = await stripe.accounts.createLoginLink(accountId);
      return successResponse({ url: loginLink.url });
    }

    // Onboarding is NOT complete, generate an account link
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: returnUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    return successResponse({ url: accountLink.url });

  } catch (error: any) {
    const message = error.message || 'Server error';
    return errorResponse({ code: 'STRIPE_ERROR', message }, 500);
  }
}
