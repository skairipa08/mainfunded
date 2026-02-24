export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { successResponse, errorResponse, handleRouteError } from '@/lib/api-response';

/**
 * POST /api/sponsor-applications
 * Public: Submit a new sponsor application
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { companyName, contactName, email, phone, message } = body;

    // Validation
    if (!companyName || !contactName || !email || !phone) {
      return errorResponse({
        code: 'VALIDATION_ERROR',
        message: 'companyName, contactName, email ve phone alanlari zorunludur.',
      }, 400);
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse({
        code: 'VALIDATION_ERROR',
        message: 'Geçerli bir e-posta adresi giriniz.',
      }, 400);
    }

    const db = await getDb();

    const application = {
      companyName: companyName.trim(),
      contactName: contactName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      message: (message || '').trim(),
      status: 'pending', // pending | reviewed | approved | rejected
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: '', // admin notes
    };

    await db.collection('sponsor_applications').insertOne(application);

    return successResponse({ message: 'Başvurunuz başarıyla alındı.' }, 'Başvuru gönderildi', 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
