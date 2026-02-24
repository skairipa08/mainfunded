import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { rankCampaigns } from '@/lib/ai-assistant/recommendation-engine';
import type { DonorPreferences } from '@/types/ai-assistant';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const preferences: DonorPreferences = body.preferences || {};
    const limit = Math.min(body.limit || 3, 10);

    const db = await getDb();

    // Build a broad query — recommendation engine will score & rank
    const query: any = { status: 'published' };

    // Apply hard filters for country if specified
    if (preferences.country && preferences.country !== 'any') {
      query.country = preferences.country;
    }

    // Fetch a wider pool for scoring (up to 50 campaigns)
    const campaigns = await db
      .collection('campaigns')
      .find(query, { projection: { _id: 0 } })
      .sort({ created_at: -1 })
      .limit(50)
      .toArray();

    if (campaigns.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No campaigns found',
      });
    }

    // Collect owner IDs and fetch student profiles
    const ownerIds = [...new Set(campaigns.map((c: any) => c.owner_id).filter(Boolean))];

    let studentProfiles: any[] = [];
    let users: any[] = [];

    if (ownerIds.length > 0) {
      const { ObjectId } = await import('mongodb');

      [users, studentProfiles] = await Promise.all([
        db.collection('users').find(
          {
            _id: {
              $in: ownerIds
                .map((id: string) => {
                  try { return new ObjectId(id); } catch { return null; }
                })
                .filter((id): id is InstanceType<typeof ObjectId> => id !== null),
            },
          },
          { projection: { _id: 1, name: 1, image: 1 } }
        ).toArray(),
        db.collection('student_profiles').find(
          { user_id: { $in: ownerIds } },
          {
            projection: {
              _id: 0,
              user_id: 1,
              country: 1,
              fieldOfStudy: 1,
              field_of_study: 1,
              university: 1,
              gender: 1,
              verificationStatus: 1,
              verification_status: 1,
            },
          }
        ).toArray(),
      ]);
    }

    // Build lookup maps
    const userMap = new Map(users.map((u: any) => [u._id.toString(), u]));
    const profileMap = new Map(studentProfiles.map((p: any) => [p.user_id, p]));

    // Enrich campaigns with student data
    const enriched = campaigns.map((c: any) => {
      const user = userMap.get(c.owner_id);
      const profile = profileMap.get(c.owner_id);

      return {
        ...c,
        student: {
          name: user?.name || 'Öğrenci',
          picture: user?.image || null,
          country: profile?.country || c.country || null,
          field_of_study: profile?.fieldOfStudy || profile?.field_of_study || c.field_of_study || null,
          university: profile?.university || null,
          gender: profile?.gender || null,
          verification_status: profile?.verificationStatus || profile?.verification_status || null,
        },
      };
    });

    // Score & rank
    const recommendations = rankCampaigns(enriched, preferences, limit);

    return NextResponse.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    console.error('[Assistant Recommend] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
