import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  getNotificationPreferences,
  removeReminderRule,
  upsertReminderRule,
} from '@/lib/notification-helpers';
import type { ReminderInstruction, ReminderRuleType } from '@/types/notifications';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getUserIdFromSession(session: any): string | null {
  return (session?.user as any)?.id ?? session?.user?.email ?? null;
}

// GET /api/notifications/reminder-rules
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = getUserIdFromSession(session);
    if (!userId) {
      return NextResponse.json({ error: 'User id not found' }, { status: 400 });
    }

    const preferences = await getNotificationPreferences(userId);
    return NextResponse.json({ rules: preferences.reminderRules ?? [] });
  } catch (error) {
    console.error('[Reminder Rules API] GET error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/notifications/reminder-rules
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = getUserIdFromSession(session);
    if (!userId) {
      return NextResponse.json({ error: 'User id not found' }, { status: 400 });
    }

    const body = await request.json();

    const type: ReminderRuleType = body.type === 'special_day' ? 'special_day' : 'monthly';
    const instruction: ReminderInstruction =
      body.instruction === 'auto_payment_instruction'
        ? 'auto_payment_instruction'
        : 'notify_only';

    let preferences;
    try {
      preferences = await upsertReminderRule(userId, {
      id: body.id,
      type,
      instruction,
      enabled: body.enabled !== false,
      title: body.title,
      dayOfMonth: body.dayOfMonth,
      monthDay: body.monthDay,
      specialDayDate: body.specialDayDate,
      specialDayTitle: body.specialDayTitle,
    });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid reminder rule';
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json({ success: true, rules: preferences.reminderRules ?? [] });
  } catch (error) {
    console.error('[Reminder Rules API] POST error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/notifications/reminder-rules
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = getUserIdFromSession(session);
    if (!userId) {
      return NextResponse.json({ error: 'User id not found' }, { status: 400 });
    }

    const body = await request.json();
    if (!body?.ruleId) {
      return NextResponse.json({ error: 'ruleId is required' }, { status: 400 });
    }

    const preferences = await removeReminderRule(userId, String(body.ruleId));
    return NextResponse.json({ success: true, rules: preferences.reminderRules ?? [] });
  } catch (error) {
    console.error('[Reminder Rules API] DELETE error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
