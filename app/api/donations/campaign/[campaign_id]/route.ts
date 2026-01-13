import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { campaign_id: string } }
) {
  try {
    const db = await getDb();
    const campaignId = params.campaign_id;
    
    const donations = await db.collection('donations')
      .find(
        { campaign_id: campaignId, payment_status: 'paid' },
        { projection: { _id: 0 } }
      )
      .sort({ created_at: -1 })
      .limit(100)
      .toArray();
    
    const donorWall = donations.map(d => ({
      name: d.anonymous ? "Anonymous" : (d.donor_name || "Anonymous"),
      amount: d.amount,
      date: d.created_at,
      anonymous: d.anonymous || false
    }));
    
    return NextResponse.json({
      success: true,
      data: donorWall
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
