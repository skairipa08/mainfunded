import crypto from 'crypto';
import { describe, expect, it } from 'vitest';
import {
  normalizeCalcomEvent,
  normalizeCalendlyEvent,
  verifyCalcomSignature,
  verifyCalendlySignature,
} from '@/lib/mentorship/webhooks';

describe('Mentorship webhook helpers', () => {
  it('verifies Calendly signature', () => {
    const body = JSON.stringify({ event: 'invitee.created', payload: { uri: 'invitee-1' } });
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const secret = 'calendly-secret';
    const digest = crypto.createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex');
    const header = `t=${timestamp},v1=${digest}`;

    expect(verifyCalendlySignature(body, header, secret)).toBe(true);
    expect(verifyCalendlySignature(body, header, 'wrong-secret')).toBe(false);
  });

  it('verifies cal.com signature', () => {
    const body = JSON.stringify({ triggerEvent: 'BOOKING_CREATED' });
    const secret = 'calcom-secret';
    const digest = crypto.createHmac('sha256', secret).update(body).digest('hex');

    expect(verifyCalcomSignature(body, digest, secret)).toBe(true);
    expect(verifyCalcomSignature(body, digest, 'wrong-secret')).toBe(false);
  });

  it('normalizes Calendly booking created event', () => {
    const event = normalizeCalendlyEvent({
      event: 'invitee.created',
      payload: {
        uri: 'invitee-123',
        event: 'event-123',
        start_time: '2026-05-10T09:00:00.000Z',
        end_time: '2026-05-10T09:30:00.000Z',
        tracking: {
          mentor_user_id: 'mentor-1',
          student_user_id: 'student-1',
        },
      },
    });

    expect(event?.action).toBe('created');
    expect(event?.provider).toBe('calendly');
    expect(event?.externalBookingId).toBe('invitee-123');
  });

  it('normalizes cal.com booking cancelled event', () => {
    const event = normalizeCalcomEvent({
      triggerEvent: 'BOOKING_CANCELLED',
      payload: {
        uid: 'booking-321',
        eventTypeId: 'etype-9',
        metadata: {
          mentor_user_id: 'mentor-2',
          student_user_id: 'student-2',
        },
      },
    });

    expect(event?.action).toBe('cancelled');
    expect(event?.provider).toBe('calcom');
    expect(event?.externalBookingId).toBe('booking-321');
  });
});
