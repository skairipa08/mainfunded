import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/authz';
import { errorResponse, getStatusCode } from '@/lib/api-error';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { sendEmail, renderStudentRejectedEmail } from '@/lib/email';
import { ObjectId } from 'mongodb';
import crypto from 'crypto';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Rate limiting
  const rateLimitResponse = withRateLimit(request, RATE_LIMITS.admin);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const { id } = params;
    const admin = await requireAdmin();
    
    const db = await getDb();
    const body = await request.json();
    
    const { reason } = body;
    const userId = id; // Canonical NextAuth user.id
    
    // Get student profile (only from student_profiles collection)
    const studentProfile = await db.collection('student_profiles').findOne(
      { user_id: userId },
      { projection: { _id: 0 } }
    );
    
    if (!studentProfile) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Student profile not found' } },
        { status: 404 }
      );
    }
    
    // Prevent duplicate rejection
    const currentStatus = studentProfile.verificationStatus || studentProfile.verification_status;
    if (currentStatus === 'rejected') {
      return NextResponse.json(
        { error: { code: 'INVALID_STATUS', message: 'Student is already rejected' } },
        { status: 400 }
      );
    }
    
    // Reject student
    const updateData = {
      verificationStatus: 'rejected',
      rejectionReason: reason || '',
      updatedAt: new Date().toISOString(),
    };
    
    await db.collection('student_profiles').updateOne(
      { user_id: userId },
      { $set: updateData }
    );
    
    // Create audit log
    try {
      await db.collection('audit_logs').insertOne({
        audit_id: `audit_${crypto.randomBytes(6).toString('hex')}`,
        actor_user_id: admin.id,
        action: 'student.rejected',
        target_type: 'student_profile',
        target_id: userId,
        meta: { reason },
        created_at: new Date().toISOString(),
      });
    } catch (auditError) {
      console.warn('Failed to create audit log:', auditError);
    }
    
    // Send email notification (non-blocking)
    try {
      const user = await db.collection('users').findOne(
        { _id: new ObjectId(userId) },
        { projection: { email: 1, name: 1 } }
      );
      
      if (user?.email) {
        await sendEmail({
          to: user.email,
          subject: 'Student Verification Update',
          html: renderStudentRejectedEmail({
            studentName: user.name || 'Student',
            studentEmail: user.email,
            reason: reason || undefined,
          }),
        });
      }
    } catch (emailError) {
      // Email failures don't break the flow
      console.warn('Failed to send rejection email:', emailError);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Student rejected successfully',
    });
  } catch (error: any) {
    console.error('Student reject error:', error);
    return NextResponse.json(
      errorResponse(error),
      { status: getStatusCode(error) }
    );
  }
}
