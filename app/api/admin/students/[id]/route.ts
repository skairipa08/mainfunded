import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/authz';
import { errorResponse, getStatusCode } from '@/lib/api-error';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Rate limiting
  const rateLimitResponse = withRateLimit(request, RATE_LIMITS.admin);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    await requireAdmin();
    
    const { id } = params;
    const db = await getDb();
    const userId = id; // Canonical NextAuth user.id
    
    // Get student profile (only from student_profiles collection)
    const profile = await db.collection('student_profiles').findOne(
      { user_id: userId },
      { projection: { _id: 0 } }
    );
    
    if (!profile) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Student profile not found' } },
        { status: 404 }
      );
    }
    
    // Fetch user data
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { _id: 1, email: 1, name: 1, image: 1, role: 1 } }
    );
    
    // Normalize status: verificationStatus || verification_status || "pending"
    const status = profile.verificationStatus || profile.verification_status || 'pending';
    
    // Normalize documents: docs || verification_documents || []
    const docs = profile.docs || profile.verification_documents || [];
    
    // Build response
    const studentData = {
      user_id: profile.user_id,
      verificationStatus: status,
      country: profile.country,
      fieldOfStudy: profile.fieldOfStudy || profile.field_of_study,
      field_of_study: profile.fieldOfStudy || profile.field_of_study,
      university: profile.university,
      department: profile.department,
      docs: docs,
      verification_documents: docs,
      user: user ? {
        _id: user._id.toString(),
        email: user.email,
        name: user.name,
        image: user.image,
      } : null,
    };
    
    return NextResponse.json({
      success: true,
      data: studentData,
    });
  } catch (error: any) {
    console.error('Admin student GET error:', error);
    return NextResponse.json(
      errorResponse(error),
      { status: getStatusCode(error) }
    );
  }
}
