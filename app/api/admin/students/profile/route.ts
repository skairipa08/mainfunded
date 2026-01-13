import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireUser } from '@/lib/authz';
import { errorResponse, getStatusCode } from '@/lib/api-error';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { sendEmail, renderAdminNotificationEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = withRateLimit(request, RATE_LIMITS.admin);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const user = await requireUser();
    const db = await getDb();
    const body = await request.json();
    
    // Check if profile already exists (canonical user_id)
    const existing = await db.collection('student_profiles').findOne(
      { user_id: user.id },
      { projection: { _id: 0 } }
    );
    
    if (existing) {
      return NextResponse.json(
        { error: { code: 'CONFLICT', message: 'Student profile already exists' } },
        { status: 400 }
      );
    }
    
    // Create student profile with canonical user_id
    const profile = {
      profile_id: `profile_${crypto.randomBytes(6).toString('hex')}`,
      user_id: user.id, // Canonical NextAuth user.id
      university: body.university?.trim(),
      department: body.department?.trim(),
      fieldOfStudy: body.field_of_study?.trim() || body.fieldOfStudy?.trim(),
      country: body.country?.trim(),
      verificationStatus: 'pending',
      docs: body.verification_documents || body.docs || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await db.collection('student_profiles').insertOne(profile);
    
    // Notify admins (non-blocking)
    try {
      const adminEmails = (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map(e => e.trim().toLowerCase())
        .filter(Boolean);
      
      if (adminEmails.length > 0 && user.email) {
        // Send to all admins
        await Promise.all(
          adminEmails.map(adminEmail =>
            sendEmail({
              to: adminEmail,
              subject: 'New Student Verification Request',
              html: renderAdminNotificationEmail({
                studentName: user.name || 'Student',
                studentEmail: user.email,
                studentId: user.id,
              }),
            })
          )
        );
      }
    } catch (emailError) {
      // Email failures don't break the flow
      console.warn('Failed to send admin notification:', emailError);
    }
    
    return NextResponse.json({
      success: true,
      data: profile,
      message: 'Student profile created. Awaiting verification.',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Create student profile error:', error);
    return NextResponse.json(
      errorResponse(error),
      { status: getStatusCode(error) }
    );
  }
}
