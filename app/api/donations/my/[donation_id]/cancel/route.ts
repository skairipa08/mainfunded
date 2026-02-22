import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireUser } from '@/lib/authz';
import { cancelIyzicoPayment } from '@/lib/iyzico';
import { errorResponse, handleRouteError, successResponse } from '@/lib/api-response';

// POST /api/donations/my/[donation_id]/cancel
export async function POST(
    request: NextRequest,
    { params }: { params: { donation_id: string } }
) {
    try {
        const db = await getDb();
        const user = await requireUser();
        const donationId = params.donation_id;

        if (!process.env.IYZICO_API_KEY || !process.env.IYZICO_SECRET_KEY) {
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

        if (donation.status === 'refunded' || donation.status === 'canceled') {
            return errorResponse({ code: 'ALREADY_CANCELED', message: 'This donation is already canceled or refunded' }, 400);
        }

        // Cancel the payment via iyzico
        const cancelResult = await cancelIyzicoPayment(donation.iyzico_payment_id);

        if (cancelResult.status !== 'success') {
            return errorResponse({ code: 'CANCEL_FAILED', message: cancelResult.errorMessage || 'Cancellation failed' }, 500);
        }

        // Update local database
        await db.collection('donations').updateOne(
            { donation_id: donationId },
            {
                $set: {
                    status: 'canceled',
                    updated_at: new Date().toISOString()
                }
            }
        );

        // Update campaign stats
        await db.collection('campaigns').updateOne(
            { campaign_id: donation.campaign_id },
            {
                $inc: {
                    raised_amount: -(donation.amount || 0),
                    donor_count: -1,
                },
                $set: { updated_at: new Date().toISOString() }
            }
        );

        return successResponse({
            message: 'Donation successfully canceled',
            status: 'canceled'
        });

    } catch (error) {
        return handleRouteError(error);
    }
}
