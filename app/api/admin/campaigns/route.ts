import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/authz';
import { errorResponse, getStatusCode } from '@/lib/api-error';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { ObjectId } from 'mongodb';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;


export async function GET(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = withRateLimit(request, RATE_LIMITS.admin);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    await requireAdmin();

    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const query: any = {};
    if (status) {
      query.status = status;
    }

    const campaigns = await db.collection('campaigns')
      .find(query, { projection: { _id: 0 } })
      .sort({ created_at: -1 })
      .limit(500)
      .toArray();

    // Collect owner IDs and fetch in batch
    const ownerIds = [...new Set(campaigns.map(c => c.owner_id).filter(Boolean))];
    const [users, studentProfiles] = await Promise.all([
      db.collection('users').find(
        { _id: { $in: ownerIds.map(id => new ObjectId(id)) } },
        { projection: { _id: 1, email: 1, name: 1, image: 1 } }
      ).toArray(),
      db.collection('student_profiles').find(
        { user_id: { $in: ownerIds } },
        { projection: { _id: 0 } }
      ).toArray(),
    ]);

    const userMap = new Map(users.map(u => [u._id.toString(), u]));
    const profileMap = new Map(studentProfiles.map(p => [p.user_id, p]));

    const enriched = campaigns.map(campaign => {
      const ownerId = campaign.owner_id;
      const user = userMap.get(ownerId);
      const profile = profileMap.get(ownerId);

      return {
        ...campaign,
        student: user ? {
          _id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
        } : null,
        student_profile: profile,
      };
    });

    return NextResponse.json({
      success: true,
      data: enriched,
    });
  } catch (error: any) {
    console.error('Admin campaigns GET error:', error);
    return NextResponse.json(
      errorResponse(error),
      { status: getStatusCode(error) }
    );
  }
}
