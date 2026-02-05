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

    // Find the donation
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
      { projection: { _id: 0, campaign_id: 1, title: 1, category: 1, story: 1, status: 1, goal_amount: 1, raised_amount: 1, owner_id: 1, created_at: 1 } }
    );

    // Get student profile and user info
    let student = null;
    if (campaign?.owner_id) {
      const { ObjectId } = await import('mongodb');
      const studentProfile = await db.collection('student_profiles').findOne(
        { user_id: campaign.owner_id },
        { projection: { _id: 0, user_id: 1, university: 1, department: 1, fieldOfStudy: 1, field_of_study: 1, country: 1 } }
      );

      let studentUser = null;
      try {
        studentUser = await db.collection('users').findOne(
          { _id: new ObjectId(campaign.owner_id) },
          { projection: { name: 1, image: 1, email: 1 } }
        );
      } catch {
        // If ObjectId conversion fails, try string match
      }

      student = {
        name: studentUser?.name || 'Ogrenci',
        image: studentUser?.image || null,
        university: studentProfile?.university || '',
        department: studentProfile?.department || studentProfile?.fieldOfStudy || studentProfile?.field_of_study || '',
        country: studentProfile?.country || '',
      };
    }

    // Get campaign updates
    const updates = await db.collection('campaign_updates')
      .find(
        { campaign_id: donation.campaign_id },
        { projection: { _id: 0 } }
      )
      .sort({ created_at: -1 })
      .limit(20)
      .toArray();

    // Get messages between donor and student (if any)
    const messages = await db.collection('donation_messages')
      .find(
        {
          $or: [
            { donation_id: donationId, sender_id: user.id },
            { donation_id: donationId, recipient_id: user.id },
            { campaign_id: donation.campaign_id, sender_id: user.id },
            { campaign_id: donation.campaign_id, recipient_id: user.id },
          ]
        },
        { projection: { _id: 0 } }
      )
      .sort({ created_at: 1 })
      .limit(50)
      .toArray();

    // Allocation breakdown (from donation or campaign)
    const allocationBreakdown = donation.allocation_breakdown || campaign?.allocation_breakdown || null;

    return successResponse({
      donation: {
        ...donation,
        allocation_breakdown: allocationBreakdown,
      },
      campaign: campaign || null,
      student,
      updates,
      messages,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
