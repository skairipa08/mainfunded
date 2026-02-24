export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireUser } from '@/lib/authz';
import { successResponse, handleRouteError } from '@/lib/api-response';

// GET: Get conversation threads for a student (grouped by donor + campaign)
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const user = await requireUser();

    // Get all campaigns owned by this student
    const myCampaigns = await db
      .collection('campaigns')
      .find(
        { owner_id: user.id },
        { projection: { _id: 0, campaign_id: 1, title: 1 } },
      )
      .toArray();

    const campaignIds = myCampaigns.map((c: any) => c.campaign_id);
    const campaignMap = new Map(myCampaigns.map((c: any) => [c.campaign_id, c.title]));

    if (campaignIds.length === 0) {
      return successResponse([]);
    }

    // Get all messages where student is sender or recipient on these campaigns
    const messages = await db
      .collection('donation_messages')
      .find({
        campaign_id: { $in: campaignIds },
        $or: [{ sender_id: user.id }, { recipient_id: user.id }],
      })
      .sort({ created_at: -1 })
      .toArray();

    // Group by donor + campaign pair
    const threadMap = new Map<string, {
      donor_id: string;
      donor_name: string;
      campaign_id: string;
      campaign_title: string;
      last_message: string;
      last_message_at: string;
      unread_count: number;
      anonymous: boolean;
    }>();

    for (const msg of messages) {
      // Determine donor id (the other person)
      const donorId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
      const donorName = msg.sender_id === user.id ? '' : msg.sender_name;
      const key = `${donorId}-${msg.campaign_id}`;

      if (!threadMap.has(key)) {
        threadMap.set(key, {
          donor_id: donorId,
          donor_name: donorName || 'Bağışçı',
          campaign_id: msg.campaign_id,
          campaign_title: campaignMap.get(msg.campaign_id) || '',
          last_message: msg.content,
          last_message_at: msg.created_at,
          unread_count: 0,
          anonymous: false,
        });
      }

      // Update donor name if we have it
      if (donorName && threadMap.get(key)!.donor_name === 'Bağışçı') {
        threadMap.get(key)!.donor_name = donorName;
      }

      // Count unread messages (messages sent to this user that are unread)
      if (msg.recipient_id === user.id && !msg.read) {
        threadMap.get(key)!.unread_count++;
      }
    }

    // Check anonymity of donors
    for (const [key, thread] of threadMap) {
      const donation = await db.collection('donations').findOne({
        campaign_id: thread.campaign_id,
        donor_id: thread.donor_id,
        payment_status: { $in: ['paid', 'completed'] },
      });
      if (donation?.anonymous) {
        thread.anonymous = true;
        thread.donor_name = 'Anonim Bağışçı';
      } else if (donation?.donor_name) {
        thread.donor_name = donation.donor_name;
      }
    }

    const threads = Array.from(threadMap.values()).sort(
      (a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime(),
    );

    return successResponse(threads);
  } catch (error) {
    return handleRouteError(error);
  }
}
