export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireUser } from '@/lib/authz';
import { successResponse, errorResponse, handleRouteError } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: { donation_id: string } }
) {
  try {
    const db = await getDb();
    const user = await requireUser();
    const donationId = params.donation_id;

    const donation = await db.collection('donations').findOne(
      { donation_id: donationId, donor_id: user.id },
      { projection: { _id: 0 } }
    );

    if (!donation) {
      return errorResponse({ code: 'NOT_FOUND', message: 'Donation not found' }, 404);
    }

    // Get campaign details
    const campaign = await db.collection('campaigns').findOne(
      { campaign_id: donation.campaign_id },
      { projection: { _id: 0, campaign_id: 1, title: 1, category: 1 } }
    );

    // Return receipt data for client-side PDF generation
    return successResponse({
      receipt: {
        receipt_number: `FE-${donationId?.replace('don_', '').toUpperCase() || Date.now()}`,
        donation_id: donationId,
        donor_name: donation.donor_name || user.name,
        donor_email: donation.donor_email || user.email,
        campaign_title: campaign?.title || 'Campaign',
        amount: donation.amount,
        currency: donation.currency || 'USD',
        date: donation.created_at,
        payment_status: donation.payment_status || donation.status || 'paid',
        organization: 'FundEd - Educational Crowdfunding Platform',
        receipt_url: donation.receipt_url || null,
      }
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
