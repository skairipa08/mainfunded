import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/authz';
import { getDb } from '@/lib/db';
import { errorResponse, getStatusCode } from '@/lib/api-error';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = withRateLimit(request, RATE_LIMITS.auth);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const db = await getDb();
    
    // Get user from adapter users collection (canonical ID)
    const userDoc = await db.collection('users').findOne(
      { _id: new ObjectId(user.id) },
      { projection: { _id: 1, email: 1, name: 1, image: 1, role: 1 } }
    );

    if (!userDoc) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    // Get student profile if exists (only from student_profiles)
    let studentProfile = null;
    const profile = await db.collection('student_profiles').findOne(
      { user_id: user.id },
      { projection: { _id: 0 } }
    );
    
    if (profile) {
      studentProfile = {
        user_id: profile.user_id,
        verificationStatus: profile.verificationStatus || profile.verification_status,
        country: profile.country,
        fieldOfStudy: profile.fieldOfStudy || profile.field_of_study,
        university: profile.university,
        department: profile.department,
        docs: profile.docs || profile.verification_documents,
        createdAt: profile.createdAt || profile.created_at,
        updatedAt: profile.updatedAt || profile.updated_at,
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        id: userDoc._id.toString(),
        email: userDoc.email,
        name: userDoc.name,
        image: userDoc.image,
        role: userDoc.role || 'user',
        student_profile: studentProfile,
      },
    });
  } catch (error: any) {
    console.error('Auth me error:', error);
    return NextResponse.json(
      errorResponse(error),
      { status: getStatusCode(error) }
    );
  }
}
