export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireUser } from '@/lib/authz';
import { successResponse, errorResponse, handleRouteError } from '@/lib/api-response';
import crypto from 'crypto';

// GET: Get messages between student and a specific donor for a campaign
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaign_id');
    const donorId = searchParams.get('donor_id');

    if (!campaignId || !donorId) {
      return errorResponse(
        { code: 'VALIDATION_ERROR', message: 'campaign_id ve donor_id gereklidir' },
        400,
      );
    }

    // Verify that campaign belongs to this student
    const campaign = await db.collection('campaigns').findOne(
      { campaign_id: campaignId, owner_id: user.id },
      { projection: { campaign_id: 1 } },
    );

    if (!campaign) {
      return errorResponse(
        { code: 'FORBIDDEN', message: 'Bu kampanya size ait değil' },
        403,
      );
    }

    // Verify donor has donated to this campaign
    const donation = await db.collection('donations').findOne({
      campaign_id: campaignId,
      donor_id: donorId,
      payment_status: { $in: ['paid', 'completed'] },
    });

    if (!donation) {
      return errorResponse(
        { code: 'FORBIDDEN', message: 'Bu kullanıcı kampanyanıza bağış yapmamış' },
        403,
      );
    }

    // Get messages between student and donor for this campaign
    const messages = await db
      .collection('donation_messages')
      .find(
        {
          campaign_id: campaignId,
          $or: [
            { sender_id: user.id, recipient_id: donorId },
            { sender_id: donorId, recipient_id: user.id },
          ],
        },
        { projection: { _id: 0 } },
      )
      .sort({ created_at: 1 })
      .limit(200)
      .toArray();

    return successResponse(messages);
  } catch (error) {
    return handleRouteError(error);
  }
}

// POST: Send a message from student to a donor
export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const user = await requireUser();
    const body = await request.json();

    const { campaign_id, recipient_id, content } = body;

    if (!campaign_id || !recipient_id || !content?.trim()) {
      return errorResponse(
        { code: 'VALIDATION_ERROR', message: 'Kampanya, alıcı ve mesaj içeriği gereklidir' },
        400,
      );
    }

    if (content.trim().length > 1000) {
      return errorResponse(
        { code: 'VALIDATION_ERROR', message: 'Mesaj 1000 karakteri geçemez' },
        400,
      );
    }

    // Verify that campaign belongs to this student
    const campaign = await db.collection('campaigns').findOne(
      { campaign_id, owner_id: user.id },
      { projection: { campaign_id: 1, title: 1 } },
    );

    if (!campaign) {
      return errorResponse(
        { code: 'FORBIDDEN', message: 'Bu kampanya size ait değil' },
        403,
      );
    }

    // Verify recipient has donated to this campaign
    const donation = await db.collection('donations').findOne({
      campaign_id,
      donor_id: recipient_id,
      payment_status: { $in: ['paid', 'completed'] },
    });

    if (!donation) {
      return errorResponse(
        { code: 'FORBIDDEN', message: 'Sadece size bağış yapan donörlere mesaj gönderebilirsiniz' },
        403,
      );
    }

    const message = {
      message_id: `msg_${crypto.randomBytes(8).toString('hex')}`,
      campaign_id,
      donation_id: donation.donation_id || null,
      sender_id: user.id,
      sender_name: user.name,
      recipient_id,
      content: content.trim(),
      type: 'student_to_donor',
      read: false,
      created_at: new Date().toISOString(),
    };

    await db.collection('donation_messages').insertOne(message);

    return successResponse(
      { message_id: message.message_id },
      'Mesaj gönderildi',
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
