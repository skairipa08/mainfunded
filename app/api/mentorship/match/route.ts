import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { requireUser } from '@/lib/authz';
import { errorResponse, successResponse, handleRouteError } from '@/lib/api-response';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { rankMentors } from '@/lib/mentorship/matching';

const matchRequestSchema = z.object({
  studentId: z.string().min(3),
  careerGoal: z.string().min(5).max(280),
  preferredLanguage: z.string().min(2).max(40).optional(),
  preferredSector: z.string().min(2).max(80).optional(),
  preferredDayOfWeek: z.number().int().min(0).max(6).optional(),
});

export async function POST(request: NextRequest) {
  const rateLimitResponse = withRateLimit(request, RATE_LIMITS.api);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    await requireUser();

    const body = await request.json();
    const parsed = matchRequestSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse({ code: 'VALIDATION_ERROR', message: 'Invalid match request', details: parsed.error.issues }, 400);
    }

    const db = await getDb();
    const mentors = await db.collection('mentor_profiles')
      .find({ accepting_new_students: true }, { projection: { _id: 0 } })
      .toArray();

    const ranked = rankMentors(parsed.data, mentors as any[]);

    await db.collection('mentorship_matches').insertOne({
      match_id: crypto.randomUUID(),
      student_id: parsed.data.studentId,
      career_goal: parsed.data.careerGoal,
      preferred_language: parsed.data.preferredLanguage || null,
      preferred_sector: parsed.data.preferredSector || null,
      preferred_day_of_week: parsed.data.preferredDayOfWeek ?? null,
      results: ranked,
      created_at: new Date(),
    });

    return successResponse({
      studentId: parsed.data.studentId,
      matches: ranked,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
