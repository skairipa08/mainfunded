import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { requireUser } from '@/lib/authz';
import { errorResponse, successResponse, handleRouteError } from '@/lib/api-response';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { rankMentors } from '@/lib/mentorship/matching';
import { SupportType } from '@/lib/mentorship/types';

const supportIntentSchema = z.object({
  support_type: z.enum(['money', 'time', 'both']),
  donation_amount: z.number().min(0).max(1_000_000).optional(),
  mentorship_hours: z.number().min(0).max(200).optional(),
  student_id: z.string().min(3),
  career_goal: z.string().min(5).max(280).optional(),
  preferred_language: z.string().min(2).max(40).optional(),
  preferred_sector: z.string().min(2).max(80).optional(),
  preferred_day_of_week: z.number().int().min(0).max(6).optional(),
});

function validateSupportAmounts(type: SupportType, donationAmount?: number, mentorshipHours?: number) {
  if (type === 'money' && (!donationAmount || donationAmount <= 0)) {
    return 'Money support requires donation_amount > 0';
  }

  if (type === 'time' && (!mentorshipHours || mentorshipHours <= 0)) {
    return 'Time support requires mentorship_hours > 0';
  }

  if (type === 'both' && ((!donationAmount || donationAmount <= 0) || (!mentorshipHours || mentorshipHours <= 0))) {
    return 'Both support requires donation_amount and mentorship_hours';
  }

  return null;
}

export async function POST(request: NextRequest) {
  const rateLimitResponse = withRateLimit(request, RATE_LIMITS.api);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const user = await requireUser();
    const body = await request.json();
    const parsed = supportIntentSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse({ code: 'VALIDATION_ERROR', message: 'Invalid support intent', details: parsed.error.issues }, 400);
    }

    const amountValidationError = validateSupportAmounts(
      parsed.data.support_type,
      parsed.data.donation_amount,
      parsed.data.mentorship_hours,
    );
    if (amountValidationError) {
      return errorResponse({ code: 'INVALID_SUPPORT_TYPE', message: amountValidationError }, 400);
    }

    const db = await getDb();
    const now = new Date();

    const supportIntentId = crypto.randomUUID();
    await db.collection('hybrid_support_intents').insertOne({
      support_intent_id: supportIntentId,
      donor_user_id: user.id,
      student_id: parsed.data.student_id,
      support_type: parsed.data.support_type,
      donation_amount: parsed.data.donation_amount || 0,
      mentorship_hours: parsed.data.mentorship_hours || 0,
      career_goal: parsed.data.career_goal || null,
      preferred_language: parsed.data.preferred_language || null,
      preferred_sector: parsed.data.preferred_sector || null,
      preferred_day_of_week: parsed.data.preferred_day_of_week ?? null,
      status: 'pending',
      created_at: now,
      updated_at: now,
    });

    let matches: any[] = [];
    if ((parsed.data.support_type === 'time' || parsed.data.support_type === 'both') && parsed.data.career_goal) {
      const mentors = await db.collection('mentor_profiles')
        .find({ accepting_new_students: true }, { projection: { _id: 0 } })
        .toArray();

      matches = rankMentors({
        studentId: parsed.data.student_id,
        careerGoal: parsed.data.career_goal,
        preferredLanguage: parsed.data.preferred_language,
        preferredSector: parsed.data.preferred_sector,
        preferredDayOfWeek: parsed.data.preferred_day_of_week,
      }, mentors as any[]).slice(0, 3);
    }

    return successResponse({
      support_intent_id: supportIntentId,
      support_type: parsed.data.support_type,
      auto_matches: matches,
    }, 'Support intent created successfully', 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
