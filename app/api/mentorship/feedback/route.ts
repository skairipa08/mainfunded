import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { requireUser } from '@/lib/authz';
import { errorResponse, successResponse, handleRouteError } from '@/lib/api-response';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

const feedbackSchema = z.object({
  session_id: z.string().min(10),
  mentor_user_id: z.string().min(3),
  rating: z.number().min(1).max(5),
  goal_clarity: z.number().min(1).max(5),
  communication: z.number().min(1).max(5),
  helpfulness: z.number().min(1).max(5),
  comment: z.string().min(10).max(800).optional(),
});

export async function POST(request: NextRequest) {
  const rateLimitResponse = withRateLimit(request, RATE_LIMITS.api);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const user = await requireUser();
    const body = await request.json();
    const parsed = feedbackSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse({ code: 'VALIDATION_ERROR', message: 'Invalid feedback form', details: parsed.error.issues }, 400);
    }

    const db = await getDb();
    const session = await db.collection('mentorship_sessions').findOne({ session_id: parsed.data.session_id });

    if (!session) {
      return errorResponse({ code: 'NOT_FOUND', message: 'Session not found' }, 404);
    }

    if (session.student_user_id !== user.id) {
      return errorResponse({ code: 'FORBIDDEN', message: 'You can only review your own sessions' }, 403);
    }

    await db.collection('mentorship_feedback').insertOne({
      feedback_id: crypto.randomUUID(),
      session_id: parsed.data.session_id,
      student_user_id: user.id,
      mentor_user_id: parsed.data.mentor_user_id,
      rating: parsed.data.rating,
      goal_clarity: parsed.data.goal_clarity,
      communication: parsed.data.communication,
      helpfulness: parsed.data.helpfulness,
      comment: parsed.data.comment || '',
      created_at: new Date(),
    });

    await db.collection('mentorship_sessions').updateOne(
      { session_id: parsed.data.session_id },
      { $set: { status: 'completed', updated_at: new Date() } },
    );

    return successResponse({ submitted: true }, 'Feedback submitted successfully', 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
