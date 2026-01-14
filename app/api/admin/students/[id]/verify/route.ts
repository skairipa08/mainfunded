import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/authz';
import { errorResponse, getStatusCode } from '@/lib/api-error';
import { studentVerifySchema } from '@/lib/validators/admin';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { sendEmail, renderStudentVerifiedEmail, renderStudentRejectedEmail } from '@/lib/email';
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
    
    // Validate input
    const validation = studentVerifySchema.safeParse({ body, params: { id } });
    if (!validation.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: validation.error.errors,
          },
        },
        { status: 400 }
      );
    }
    
    const { action, reason } = validation.data.body;
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
    
    // Prevent duplicate verification/rejection
    const currentStatus = studentProfile.verificationStatus || studentProfile.verification_status;
    const newStatus = action === 'approve' ? 'verified' : 'rejected';
    
    if (currentStatus === newStatus) {
      return NextResponse.json(
        { error: { code: 'INVALID_STATUS', message: `Student is already ${newStatus}` } },
        { status: 400 }
      );
    }
    
    const updateData: any = {
      verificationStatus: newStatus,
      updatedAt: new Date().toISOString(),
    };
    
    if (action === 'approve') {
      updateData.verifiedAt = new Date().toISOString();
    } else {
      updateData.rejectionReason = reason || '';
    }
    
    // Update student profile (use canonical user_id)
    await db.collection('student_profiles').updateOne(
      { user_id: userId },
      { $set: updateData }
    );
    
    // Create audit log
    try {
      await db.collection('audit_logs').insertOne({
        audit_id: `audit_${crypto.randomBytes(6).toString('hex')}`,
        actor_user_id: admin.id,
        action: action === 'approve' ? 'student.verified' : 'student.rejected',
        target_type: 'student_profile',
        target_id: userId,
        meta: { reason },
        created_at: new Date().toISOString(),
      });
    } catch {
      // Ignore audit log errors
    }
    
    try {
      const user = await db.collection('users').findOne(
        { _id: new ObjectId(userId) },
        { projection: { email: 1, name: 1 } }
      );
      
      if (user?.email) {
        if (action === 'approve') {
          await sendEmail({
            to: user.email,
            subject: 'Your Student Verification Has Been Approved',
            html: renderStudentVerifiedEmail({
              studentName: user.name || 'Student',
              studentEmail: user.email,
            }),
          });
        } else {
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
      }
    } catch {
      // Ignore email errors
    }
    
    return NextResponse.json({
      success: true,
      message: `Student ${action}d successfully`,
    });
  } catch (error: any) {
    return NextResponse.json(
      errorResponse(error),
      { status: getStatusCode(error) }
    );
  }
}
