import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { getDb } from '@/lib/db';
import { errorResponse, successResponse } from '@/lib/api-response';
import {
  normalizeCalendlyEvent,
  normalizeCalcomEvent,
  verifyCalendlySignature,
  verifyCalcomSignature,
} from '@/lib/mentorship/webhooks';

function getDurationMinutes(start?: Date, end?: Date): number {
  if (!start || !end) {
    return 0;
  }

  const diff = end.getTime() - start.getTime();
  return diff > 0 ? Math.round(diff / 60000) : 0;
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const providerHeader = (request.headers.get('x-mentorship-provider') || '').toLowerCase();

    const db = await getDb();
    let normalizedEvent: ReturnType<typeof normalizeCalendlyEvent> | ReturnType<typeof normalizeCalcomEvent>;

    if (providerHeader === 'calendly') {
      const signature = request.headers.get('Calendly-Webhook-Signature') || '';
      const secret = process.env.CALENDLY_WEBHOOK_SECRET || '';

      if (!verifyCalendlySignature(rawBody, signature, secret)) {
        return errorResponse({ code: 'INVALID_SIGNATURE', message: 'Invalid Calendly signature' }, 401);
      }

      normalizedEvent = normalizeCalendlyEvent(JSON.parse(rawBody));
    } else if (providerHeader === 'calcom') {
      const signature = request.headers.get('x-cal-signature-256') || request.headers.get('x-cal-signature') || '';
      const secret = process.env.CALCOM_WEBHOOK_SECRET || '';

      if (!verifyCalcomSignature(rawBody, signature, secret)) {
        return errorResponse({ code: 'INVALID_SIGNATURE', message: 'Invalid cal.com signature' }, 401);
      }

      normalizedEvent = normalizeCalcomEvent(JSON.parse(rawBody));
    } else {
      return errorResponse({ code: 'UNKNOWN_PROVIDER', message: 'Unsupported webhook provider' }, 400);
    }

    if (!normalizedEvent || !normalizedEvent.externalBookingId) {
      return errorResponse({ code: 'IGNORED_EVENT', message: 'Event not mapped' }, 202);
    }

    if (normalizedEvent.action === 'created') {
      const durationMinutes = getDurationMinutes(normalizedEvent.startsAt, normalizedEvent.endsAt);
      const now = new Date();

      await db.collection('mentorship_sessions').updateOne(
        { external_booking_id: normalizedEvent.externalBookingId },
        {
          $set: {
            provider: normalizedEvent.provider,
            external_event_id: normalizedEvent.externalEventId,
            external_booking_id: normalizedEvent.externalBookingId,
            mentor_user_id: normalizedEvent.mentorUserId || null,
            student_user_id: normalizedEvent.studentUserId || null,
            scheduled_start: normalizedEvent.startsAt || null,
            scheduled_end: normalizedEvent.endsAt || null,
            duration_minutes: durationMinutes,
            status: 'scheduled',
            raw_payload: normalizedEvent.payload,
            updated_at: now,
          },
          $setOnInsert: {
            session_id: crypto.randomUUID(),
            created_at: now,
          },
        },
        { upsert: true },
      );

      if (normalizedEvent.startsAt) {
        const oneDayReminder = new Date(normalizedEvent.startsAt.getTime() - 24 * 60 * 60 * 1000);
        const oneHourReminder = new Date(normalizedEvent.startsAt.getTime() - 60 * 60 * 1000);

        await db.collection('notifications').insertMany([
          {
            id: crypto.randomUUID(),
            type: 'mentor_session_reminder',
            userId: normalizedEvent.studentUserId || normalizedEvent.mentorUserId,
            read: false,
            title: 'Mentorluk seansı hatırlatması',
            message: 'Mentorluk seansınız 24 saat içinde başlayacak.',
            send_at: oneDayReminder,
            timestamp: now,
          },
          {
            id: crypto.randomUUID(),
            type: 'mentor_session_reminder',
            userId: normalizedEvent.studentUserId || normalizedEvent.mentorUserId,
            read: false,
            title: 'Mentorluk seansı hatırlatması',
            message: 'Mentorluk seansınız 1 saat içinde başlayacak.',
            send_at: oneHourReminder,
            timestamp: now,
          },
        ]);
      }
    }

    if (normalizedEvent.action === 'cancelled') {
      await db.collection('mentorship_sessions').updateOne(
        { external_booking_id: normalizedEvent.externalBookingId },
        {
          $set: {
            status: 'cancelled',
            cancelled_at: new Date(),
            raw_payload: normalizedEvent.payload,
            updated_at: new Date(),
          },
        },
      );
    }

    return successResponse({ processed: true });
  } catch (error) {
    console.error('[Mentorship webhook] error:', error);
    return errorResponse({ code: 'WEBHOOK_PROCESSING_ERROR', message: 'Webhook processing failed' }, 500);
  }
}
