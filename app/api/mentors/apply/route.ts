export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { successResponse, errorResponse, handleRouteError } from '@/lib/api-response';
import crypto from 'crypto';

/**
 * POST /api/mentors/apply
 * Public: submit a mentor application (pending admin review)
 */
export async function POST(request: NextRequest) {
    try {
        const db = await getDb();
        const body = await request.json();

        const { firstName, lastName, email, phone, country, jobTitle, experienceYears, mentorType, whyText } = body;

        // Validation
        if (!firstName?.trim() || !lastName?.trim()) {
            return errorResponse({ code: 'VALIDATION_ERROR', message: 'Ad ve soyad gereklidir' }, 400);
        }
        if (!email?.trim() || !email.includes('@')) {
            return errorResponse({ code: 'VALIDATION_ERROR', message: 'Geçerli bir e-posta adresi giriniz' }, 400);
        }
        if (!phone?.trim()) {
            return errorResponse({ code: 'VALIDATION_ERROR', message: 'Telefon numarası gereklidir' }, 400);
        }
        if (!country?.trim()) {
            return errorResponse({ code: 'VALIDATION_ERROR', message: 'Ülke seçimi gereklidir' }, 400);
        }
        if (!jobTitle?.trim()) {
            return errorResponse({ code: 'VALIDATION_ERROR', message: 'İş pozisyonu gereklidir' }, 400);
        }
        if (!experienceYears?.trim()) {
            return errorResponse({ code: 'VALIDATION_ERROR', message: 'Deneyim yılı gereklidir' }, 400);
        }
        if (!mentorType || !['corporate', 'individual'].includes(mentorType)) {
            return errorResponse({ code: 'VALIDATION_ERROR', message: 'Mentör tipi seçiniz' }, 400);
        }
        if (!whyText?.trim() || whyText.trim().length < 100) {
            return errorResponse({ code: 'VALIDATION_ERROR', message: 'Motivasyon metni en az 100 karakter olmalıdır' }, 400);
        }

        const application = {
            application_id: `mentor_${crypto.randomBytes(8).toString('hex')}`,
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            full_name: `${firstName.trim()} ${lastName.trim()}`,
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            country: country.trim(),
            job_title: jobTitle.trim(),
            experience_years: experienceYears.trim(),
            mentor_type: mentorType,
            why_text: whyText.trim().substring(0, 2000),
            status: 'pending',
            admin_note: null,
            reviewed_by: null,
            reviewed_at: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        await db.collection('mentor_applications').insertOne(application);

        return successResponse(
            { application_id: application.application_id },
            'Başvurunuz başarıyla alındı. İnceleme sonrası sizinle iletişime geçilecektir.',
            201
        );
    } catch (error) {
        return handleRouteError(error);
    }
}
