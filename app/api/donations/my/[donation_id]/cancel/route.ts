import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireUser } from '@/lib/authz';
import Stripe from 'stripe';
import { errorResponse, handleRouteError, successResponse } from '@/lib/api-response';

const stripe = new Stripe(process.env.STRIPE_API_KEY || '', {
    apiVersion: '2023-10-16',
});

// POST /api/donations/my/[donation_id]/cancel
export async function POST(
    request: NextRequest,
    { params }: { params: { donation_id: string } }
) {
    try {
        const db = await getDb();
        const user = await requireUser();
        const donationId = params.donation_id;

        if (!process.env.STRIPE_API_KEY) {
            return errorResponse({ code: 'CONFIG_ERROR', message: 'Payment service not configured' }, 503);
        }

        // Find the donation and ensure it belongs to the current user
        const donation = await db.collection('donations').findOne({
            donation_id: donationId,
            donor_id: user.id
        });

        if (!donation) {
            return errorResponse({ code: 'NOT_FOUND', message: 'Donation not found or unauthorized' }, 404);
        }

        if (!donation.is_recurring || !donation.stripe_subscription_id) {
            return errorResponse({ code: 'INVALID_REQUEST', message: 'This is not an active recurring donation' }, 400);
        }

        if (donation.subscription_status === 'canceled') {
            return errorResponse({ code: 'ALREADY_CANCELED', message: 'This subscription is already canceled' }, 400);
        }

        // Cancel the subscription in Stripe
        const canceledSubscription = await stripe.subscriptions.cancel(donation.stripe_subscription_id);

        // Update local database
        await db.collection('donations').updateMany(
            { stripe_subscription_id: donation.stripe_subscription_id },
            {
                $set: {
                    subscription_status: canceledSubscription.status,
                    updated_at: new Date().toISOString()
                }
            }
        );

        // Also update transaction status
        await db.collection('payment_transactions').updateMany(
            { stripe_subscription_id: donation.stripe_subscription_id },
            {
                $set: {
                    subscription_status: canceledSubscription.status,
                    updated_at: new Date().toISOString()
                }
            }
        );

        return successResponse({
            message: 'Subscription successfully canceled',
            status: canceledSubscription.status
        });

    } catch (error) {
        return handleRouteError(error);
    }
}
