import crypto from 'crypto';

export type MentorshipWebhookProvider = 'calendly' | 'calcom';

export interface NormalizedWebhookEvent {
  provider: MentorshipWebhookProvider;
  action: 'created' | 'cancelled';
  externalEventId: string;
  externalBookingId: string;
  mentorUserId?: string;
  studentUserId?: string;
  startsAt?: Date;
  endsAt?: Date;
  payload: any;
}

function safeCompare(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export function verifyCalendlySignature(rawBody: string, signatureHeader: string, secret: string): boolean {
  const pairs = signatureHeader.split(',').map((part) => part.trim());
  const timestamp = pairs.find((part) => part.startsWith('t='))?.slice(2);
  const v1 = pairs.find((part) => part.startsWith('v1='))?.slice(3);

  if (!timestamp || !v1 || !secret) {
    return false;
  }

  const signedPayload = `${timestamp}.${rawBody}`;
  const digest = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');
  return safeCompare(digest, v1);
}

export function verifyCalcomSignature(rawBody: string, signatureHeader: string, secret: string): boolean {
  if (!signatureHeader || !secret) {
    return false;
  }

  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const normalized = signatureHeader.replace(/^sha256=/i, '');
  return safeCompare(expected, normalized);
}

export function normalizeCalendlyEvent(payload: any): NormalizedWebhookEvent | null {
  const eventType = payload?.event;
  const innerPayload = payload?.payload;
  const inviteeUri = innerPayload?.uri;
  const eventUri = innerPayload?.event;
  const tracking = innerPayload?.tracking || {};
  const startsAt = innerPayload?.scheduled_event?.start_time || innerPayload?.start_time;
  const endsAt = innerPayload?.scheduled_event?.end_time || innerPayload?.end_time;

  if (eventType === 'invitee.created') {
    return {
      provider: 'calendly',
      action: 'created',
      externalEventId: eventUri || inviteeUri,
      externalBookingId: inviteeUri || eventUri,
      mentorUserId: tracking.mentor_user_id,
      studentUserId: tracking.student_user_id,
      startsAt: startsAt ? new Date(startsAt) : undefined,
      endsAt: endsAt ? new Date(endsAt) : undefined,
      payload,
    };
  }

  if (eventType === 'invitee.canceled') {
    return {
      provider: 'calendly',
      action: 'cancelled',
      externalEventId: eventUri || inviteeUri,
      externalBookingId: inviteeUri || eventUri,
      mentorUserId: tracking.mentor_user_id,
      studentUserId: tracking.student_user_id,
      startsAt: startsAt ? new Date(startsAt) : undefined,
      endsAt: endsAt ? new Date(endsAt) : undefined,
      payload,
    };
  }

  return null;
}

export function normalizeCalcomEvent(payload: any): NormalizedWebhookEvent | null {
  const trigger = payload?.triggerEvent;
  const booking = payload?.payload;
  const metadata = booking?.metadata || {};

  if (trigger === 'BOOKING_CREATED') {
    return {
      provider: 'calcom',
      action: 'created',
      externalEventId: String(booking?.eventTypeId || booking?.id || ''),
      externalBookingId: String(booking?.uid || booking?.id || ''),
      mentorUserId: metadata.mentor_user_id,
      studentUserId: metadata.student_user_id,
      startsAt: booking?.startTime ? new Date(booking.startTime) : undefined,
      endsAt: booking?.endTime ? new Date(booking.endTime) : undefined,
      payload,
    };
  }

  if (trigger === 'BOOKING_CANCELLED') {
    return {
      provider: 'calcom',
      action: 'cancelled',
      externalEventId: String(booking?.eventTypeId || booking?.id || ''),
      externalBookingId: String(booking?.uid || booking?.id || ''),
      mentorUserId: metadata.mentor_user_id,
      studentUserId: metadata.student_user_id,
      startsAt: booking?.startTime ? new Date(booking.startTime) : undefined,
      endsAt: booking?.endTime ? new Date(booking.endTime) : undefined,
      payload,
    };
  }

  return null;
}
