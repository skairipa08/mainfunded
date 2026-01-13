import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/authz';
import { errorResponse, getStatusCode } from '@/lib/api-error';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = withRateLimit(request, RATE_LIMITS.admin);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    await requireAdmin();
    
    const db = await getDb();
    
    // Get pending student profiles (only from student_profiles collection)
    const pendingProfiles = await db.collection('student_profiles')
      .find(
        { verificationStatus: 'pending' },
        { projection: { _id: 0 } }
      )
      .sort({ createdAt: -1, created_at: -1 })
      .limit(100)
      .toArray();
    
    // Fetch users in batch
    const userIds = pendingProfiles.map(p => p.user_id).filter(Boolean);
    const users = await db.collection('users').find(
      { _id: { $in: userIds.map(id => new ObjectId(id)) } },
      { projection: { _id: 1, email: 1, name: 1, image: 1 } }
    ).toArray();
    
    const userMap = new Map(users.map(u => [u._id.toString(), u]));
    
    // Enrich with user data
    const enriched = pendingProfiles.map(profile => {
      const user = userMap.get(profile.user_id);
      return {
        ...profile,
        user: user ? {
          _id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
        } : null,
      };
    });
    
    return NextResponse.json({
      success: true,
      data: enriched,
    });
  } catch (error: any) {
    console.error('Pending students GET error:', error);
    return NextResponse.json(
      errorResponse(error),
      { status: getStatusCode(error) }
    );
  }
}
