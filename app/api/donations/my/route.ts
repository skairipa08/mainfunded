import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireUser } from '@/lib/authz';
import { successResponse, handleRouteError } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const user = await requireUser();
    
    const donations = await db.collection('donations')
      .find(
        { donor_id: user.id, status: 'paid' },
        { projection: { _id: 0 } }
      )
      .sort({ created_at: -1 })
      .limit(100)
      .toArray();
    
    // Enrich with campaign data
    const enriched = [];
    for (const donation of donations) {
      const campaign = await db.collection('campaigns').findOne(
        { campaign_id: donation.campaign_id },
        { projection: { _id: 0, campaign_id: 1, title: 1, category: 1 } }
      );
      enriched.push({ ...donation, campaign });
    }
    
    return successResponse(enriched);
  } catch (error) {
    return handleRouteError(error);
  }
}
