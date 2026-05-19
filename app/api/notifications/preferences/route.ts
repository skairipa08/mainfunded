import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from '@/lib/notification-helpers';
import type { NotificationPreferences } from '@/types/notifications';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function hasOwn<T extends object>(obj: T, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

// GET /api/notifications/preferences — current user's reminder & notification preferences
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id ?? session.user.email;
    if (!userId) {
      return NextResponse.json({ error: 'User id not found' }, { status: 400 });
    }
    const preferences = await getNotificationPreferences(userId);

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('[Notification Preferences API] GET error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications/preferences — update reminder & notification preferences
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const userId = (session.user as any).id ?? session.user.email;
    if (!userId) {
      return NextResponse.json({ error: 'User id not found' }, { status: 400 });
    }

    const patch: Partial<NotificationPreferences> = {};
    const allowedKeys: Array<keyof NotificationPreferences> = [
      'email',
      'push',
      'donationReminders',
      'campaignUpdates',
      'milestoneAlerts',
      'impactReports',
      'calendarReminders',
      'reminderDay',
      'lastReminderSentAt',
      'reminderRules',
    ];

    for (const key of allowedKeys) {
      if (hasOwn(body, key)) {
        (patch as any)[key] = body[key];
      }
    }

    const preferences = await updateNotificationPreferences(userId, patch);

    return NextResponse.json({ success: true, preferences });
  } catch (error) {
    console.error('[Notification Preferences API] PATCH error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
