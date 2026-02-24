import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/authz';
import { getDb } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

/**
 * GET /api/profile — Load current user's personal info
 */
export async function GET(request: NextRequest) {
  const rateLimitResponse = withRateLimit(request, RATE_LIMITS.auth);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const db = await getDb();
    const userDoc = await db.collection('users').findOne(
      { _id: new ObjectId(user.id) },
      {
        projection: {
          name: 1,
          phone: 1,
          phoneCountryCode: 1,
          backupEmail: 1,
          country: 1,
          gender: 1,
          dateOfBirth: 1,
          language: 1,
          twoFactorEnabled: 1,
          accountType: 1,
        },
      }
    );

    if (!userDoc) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        phone: (() => {
          // If user has phoneCountryCode saved, use the stored phone directly
          if (userDoc.phoneCountryCode) return userDoc.phone || '';
          // If phone starts with +, split country code for the form
          const rawPhone = userDoc.phone || '';
          if (rawPhone.startsWith('+90')) return rawPhone.slice(3);
          if (rawPhone.startsWith('+1')) return rawPhone.slice(2);
          if (rawPhone.startsWith('+44')) return rawPhone.slice(3);
          if (rawPhone.startsWith('+49')) return rawPhone.slice(3);
          if (rawPhone.startsWith('+33')) return rawPhone.slice(3);
          if (rawPhone.startsWith('+34')) return rawPhone.slice(3);
          if (rawPhone.startsWith('+971')) return rawPhone.slice(4);
          if (rawPhone.startsWith('+966')) return rawPhone.slice(4);
          return rawPhone;
        })(),
        phoneCountryCode: (() => {
          if (userDoc.phoneCountryCode) return userDoc.phoneCountryCode;
          const rawPhone = userDoc.phone || '';
          if (rawPhone.startsWith('+90')) return '+90';
          if (rawPhone.startsWith('+1')) return '+1';
          if (rawPhone.startsWith('+44')) return '+44';
          if (rawPhone.startsWith('+49')) return '+49';
          if (rawPhone.startsWith('+33')) return '+33';
          if (rawPhone.startsWith('+34')) return '+34';
          if (rawPhone.startsWith('+971')) return '+971';
          if (rawPhone.startsWith('+966')) return '+966';
          return '+90';
        })(),
        backupEmail: userDoc.backupEmail || '',
        country: userDoc.country || '',
        gender: userDoc.gender || '',
        dateOfBirth: userDoc.dateOfBirth || '',
        language: userDoc.language || 'tr',
        twoFactorEnabled: userDoc.twoFactorEnabled || false,
        name: userDoc.name || '',
        accountType: userDoc.accountType || 'student',
      },
    });
  } catch (error: any) {
    console.error('Profile GET error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to load profile' } },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/profile — Update current user's personal info
 */
export async function PUT(request: NextRequest) {
  const rateLimitResponse = withRateLimit(request, RATE_LIMITS.auth);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Whitelist allowed fields to prevent injection
    const allowedFields = [
      'name',
      'phone',
      'phoneCountryCode',
      'backupEmail',
      'country',
      'gender',
      'dateOfBirth',
      'language',
      'twoFactorEnabled',
    ];

    const updateData: Record<string, any> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        // Basic sanitization
        if (field === 'twoFactorEnabled') {
          updateData[field] = Boolean(body[field]);
        } else {
          updateData[field] = String(body[field]).trim().slice(0, 200);
        }
      }
    }

    // Validate name
    if (updateData.name !== undefined) {
      if (typeof updateData.name !== 'string' || updateData.name.length < 2) {
        return NextResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: 'İsim en az 2 karakter olmalıdır' } },
          { status: 400 }
        );
      }
      if (updateData.name.length > 100) {
        updateData.name = updateData.name.slice(0, 100);
      }
    }

    // Validate phone format (optional, basic check)
    if (updateData.phone && !/^[0-9\s\-+()]*$/.test(updateData.phone)) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid phone format' } },
        { status: 400 }
      );
    }

    // Validate backup email format (optional)
    if (updateData.backupEmail && updateData.backupEmail.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateData.backupEmail)) {
        return NextResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: 'Invalid email format' } },
          { status: 400 }
        );
      }
    }

    // Validate gender
    if (updateData.gender && !['male', 'female', 'other', ''].includes(updateData.gender)) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid gender value' } },
        { status: 400 }
      );
    }

    // Validate country code
    const validCountryCodes = ['+90', '+1', '+44', '+49', '+33', '+34', '+971', '+966'];
    if (updateData.phoneCountryCode && !validCountryCodes.includes(updateData.phoneCountryCode)) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid country code' } },
        { status: 400 }
      );
    }

    updateData.updatedAt = new Date();

    const db = await getDb();
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(user.id) },
      {
        $set: updateData,
        $setOnInsert: {
          email: user.email,
          role: 'user',
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (error: any) {
    console.error('Profile PUT error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update profile' } },
      { status: 500 }
    );
  }
}
