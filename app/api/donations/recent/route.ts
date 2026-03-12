import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

/**
 * GET /api/donations/recent?campaign_id=xxx&limit=10
 * Returns the most recent paid donations for a campaign.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaign_id');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 20);

    if (!campaignId) {
      return NextResponse.json({ error: 'campaign_id is required' }, { status: 400 });
    }

    const db = await getDb();

    const donations = await db
      .collection('donations')
      .find(
        { campaign_id: campaignId, payment_status: 'paid' },
        {
          projection: {
            _id: 0,
            donor_name: 1,
            amount: 1,
            currency: 1,
            anonymous: 1,
            created_at: 1,
            message: 1,
          },
        }
      )
      .sort({ created_at: -1 })
      .limit(limit)
      .toArray();

    const masked = donations.map((d) => ({
      displayName: d.anonymous ? 'Bir destekçi' : maskDonorName(d.donor_name || 'Anonim'),
      amount: d.amount,
      currency: d.currency || 'TRY',
      anonymous: !!d.anonymous,
      createdAt: d.created_at,
      message: d.anonymous ? undefined : d.message,
    }));

    return NextResponse.json({ success: true, data: masked }, { status: 200 });
  } catch (error: any) {
    console.error('[donations/recent] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

/**
 * Masks surname: "Ahmet Kaya" → "Ahmet K."
 */
function maskDonorName(name: string): string {
  if (!name || name.trim() === '') return 'Bir destekçi';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${firstName} ${lastInitial}.`;
}
