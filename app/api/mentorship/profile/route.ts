import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { requireUser } from '@/lib/authz';
import { errorResponse, successResponse, handleRouteError } from '@/lib/api-response';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

const availabilitySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startMinute: z.number().int().min(0).max(1439),
  endMinute: z.number().int().min(1).max(1440),
  timezone: z.string().min(2).max(100),
});

const profileSchema = z.object({
  full_name: z.string().min(2).max(120),
  expertise_areas: z.array(z.string().min(2).max(60)).min(1).max(15),
  industries: z.array(z.string().min(2).max(60)).min(1).max(10),
  sector: z.string().min(2).max(80),
  languages: z.array(z.string().min(2).max(40)).min(1).max(8),
  availability_windows: z.array(availabilitySchema).min(1).max(24),
  calendly_user_uri: z.string().url().optional(),
  calcom_username: z.string().min(2).max(50).optional(),
  accepting_new_students: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  const rateLimitResponse = withRateLimit(request, RATE_LIMITS.api);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const user = await requireUser();
    const db = await getDb();

    const profile = await db.collection('mentor_profiles').findOne(
      { user_id: user.id },
      { projection: { _id: 0 } },
    );

    if (!profile) {
      return errorResponse({ code: 'NOT_FOUND', message: 'Mentor profile not found' }, 404);
    }

    return successResponse(profile);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  const rateLimitResponse = withRateLimit(request, RATE_LIMITS.api);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const user = await requireUser();
    const body = await request.json();
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse({ code: 'VALIDATION_ERROR', message: 'Invalid mentor profile', details: parsed.error.issues }, 400);
    }

    const db = await getDb();
    const now = new Date();
    const mentorProfileId = crypto.randomUUID();

    await db.collection('mentor_profiles').updateOne(
      { user_id: user.id },
      {
        $set: {
          ...parsed.data,
          user_id: user.id,
          updated_at: now,
        },
        $setOnInsert: {
          mentor_profile_id: mentorProfileId,
          created_at: now,
        },
      },
      { upsert: true },
    );

    const saved = await db.collection('mentor_profiles').findOne(
      { user_id: user.id },
      { projection: { _id: 0 } },
    );

    return successResponse(saved, 'Mentor profile saved successfully');
  } catch (error) {
    return handleRouteError(error);
  }
}
