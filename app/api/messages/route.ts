export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireUser } from '@/lib/authz';
import { successResponse, errorResponse, handleRouteError } from '@/lib/api-response';
import crypto from 'crypto';

// POST: Send a message from donor to student
export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const user = await requireUser();
    const body = await request.json();

    const { campaign_id, donation_id, content, recipient_id } = body;

    if (!campaign_id || !content?.trim()) {
      return errorResponse(
        { code: 'VALIDATION_ERROR', message: 'Campaign ID and message content are required' },
        400
      );
    }

    if (content.trim().length > 1000) {
      return errorResponse(
        { code: 'VALIDATION_ERROR', message: 'Message too long (max 1000 characters)' },
        400
      );
    }

    // Verify the user has donated to this campaign
    const donation = await db.collection('donations').findOne({
      campaign_id,
      donor_id: user.id,
      payment_status: { $in: ['paid', 'completed'] },
    });

    if (!donation) {
      return errorResponse(
        { code: 'FORBIDDEN', message: 'You can only message students from campaigns you have donated to' },
        403
      );
    }

    // Get campaign to find student (owner)
    const campaign = await db.collection('campaigns').findOne(
      { campaign_id },
      { projection: { owner_id: 1, title: 1 } }
    );

    if (!campaign) {
      return errorResponse({ code: 'NOT_FOUND', message: 'Campaign not found' }, 404);
    }

    const message = {
      message_id: `msg_${crypto.randomBytes(8).toString('hex')}`,
      campaign_id,
      donation_id: donation_id || donation.donation_id || null,
      sender_id: user.id,
      sender_name: user.name,
      recipient_id: recipient_id || campaign.owner_id,
      content: content.trim(),
      type: 'donor_to_student',
      read: false,
      created_at: new Date().toISOString(),
    };

    await db.collection('donation_messages').insertOne(message);

    return successResponse(
      { message_id: message.message_id },
      'Message sent successfully'
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

// GET: Retrieve messages for a campaign/donation
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaign_id');
    const donationId = searchParams.get('donation_id');

    if (!campaignId && !donationId) {
      return errorResponse(
        { code: 'VALIDATION_ERROR', message: 'campaign_id or donation_id is required' },
        400
      );
    }

    const query: any = {
      $or: [
        { sender_id: user.id },
        { recipient_id: user.id },
      ]
    };

    if (campaignId) query.campaign_id = campaignId;
    if (donationId) query.donation_id = donationId;

    const messages = await db.collection('donation_messages')
      .find(query, { projection: { _id: 0 } })
      .sort({ created_at: 1 })
      .limit(100)
      .toArray();

    return successResponse(messages);
  } catch (error) {
    return handleRouteError(error);
  }
}
