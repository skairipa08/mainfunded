import { getDb } from '@/lib/db';
import type {
  NotificationType,
  NotificationPreferences,
  ReminderRule,
  ReminderInstruction,
} from '@/types/notifications';
import type { Db } from 'mongodb';

// ═══════════════════════════════════════════════════════
// Server-side notification helpers
// Can be used from API routes, webhooks, cron jobs, etc.
// ═══════════════════════════════════════════════════════

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, unknown>;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  userId: '',
  email: true,
  push: true,
  donationReminders: true,
  campaignUpdates: true,
  milestoneAlerts: true,
  impactReports: true,
  calendarReminders: true,
  reminderDay: 10,
  lastReminderSentAt: null,
  reminderRules: [],
};

const inMemoryNotificationPreferences = new Map<string, NotificationPreferences>();

async function getDbSafe(): Promise<Db | null> {
  try {
    return await getDb();
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    const isRecoverableDbError =
      message.includes('MONGO_URL') ||
      message.includes('ETIMEDOUT') ||
      message.includes('ECONNREFUSED') ||
      message.includes('MongoNetworkError') ||
      message.includes('Server selection timed out');

    if (isRecoverableDbError) {
      console.warn('[Notifications] DB unavailable, using graceful fallback:', message);
      return null;
    }
    throw error;
  }
}

function removeUndefinedFields<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  ) as Partial<T>;
}

function normalizeMonthDay(value?: string): string | undefined {
  if (!value) return undefined;
  const match = value.match(/^(\d{2})-(\d{2})$/);
  if (!match) return undefined;
  const month = Number(match[1]);
  const day = Number(match[2]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return undefined;
  return `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function normalizeReminderRule(rule: Partial<ReminderRule>): ReminderRule | null {
  if (!rule.type || !rule.instruction) return null;

  const instruction: ReminderInstruction =
    rule.instruction === 'auto_payment_instruction'
      ? 'auto_payment_instruction'
      : 'notify_only';

  if (rule.type === 'monthly') {
    const dayOfMonth = Math.min(28, Math.max(1, Math.trunc(rule.dayOfMonth ?? 10)));
    return {
      id: rule.id ?? `monthly-${dayOfMonth}`,
      type: 'monthly',
      title: rule.title ?? `Her ayın ${dayOfMonth}. günü`,
      enabled: rule.enabled ?? true,
      instruction,
      dayOfMonth,
      lastTriggeredAt: rule.lastTriggeredAt ?? null,
      createdAt: rule.createdAt ?? new Date().toISOString(),
    };
  }

  const monthDay = normalizeMonthDay(rule.monthDay);
  if (!monthDay) return null;

  return {
    id: rule.id ?? `special-${monthDay}`,
    type: 'special_day',
    title: rule.title ?? rule.specialDayTitle ?? `Özel gün (${monthDay})`,
    enabled: rule.enabled ?? true,
    instruction,
    monthDay,
    specialDayDate: rule.specialDayDate,
    specialDayTitle: rule.specialDayTitle,
    lastTriggeredAt: rule.lastTriggeredAt ?? null,
    createdAt: rule.createdAt ?? new Date().toISOString(),
  };
}

function getNormalizedReminderRules(rawRules: unknown): ReminderRule[] {
  if (!Array.isArray(rawRules)) return [];
  return rawRules
    .map((rule) => normalizeReminderRule(rule as Partial<ReminderRule>))
    .filter((rule): rule is ReminderRule => rule != null);
}

/**
 * Create a notification for a user (server-side).
 * Use this from donation webhooks, cron jobs, etc.
 */
export async function createNotification(params: CreateNotificationParams) {
  const db = await getDbSafe();

  const notification = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
    userId: params.userId,
    type: params.type,
    title: params.title,
    message: params.message,
    read: false,
    timestamp: new Date().toISOString(),
    link: params.link ?? null,
    metadata: params.metadata ?? {},
    createdAt: new Date(),
  };

  if (db) {
    await db.collection('notifications').insertOne(notification);
  }
  return notification;
}

export async function getNotificationPreferences(
  userId: string
): Promise<NotificationPreferences> {
  const db = await getDbSafe();

  if (!db) {
    const existing = inMemoryNotificationPreferences.get(userId);
    if (existing) {
      return {
        ...DEFAULT_NOTIFICATION_PREFERENCES,
        userId,
        ...existing,
        reminderRules: getNormalizedReminderRules(existing.reminderRules),
      };
    }

    const defaults: NotificationPreferences = {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      userId,
    };
    inMemoryNotificationPreferences.set(userId, defaults);
    return defaults;
  }

  const preferences = await db.collection('notification_preferences').findOne({ userId });

  if (!preferences) {
    const defaults: NotificationPreferences = {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      userId,
    };

    await db.collection('notification_preferences').insertOne({
      ...defaults,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return defaults;
  }

  return {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    userId,
    ...preferences,
    reminderRules: getNormalizedReminderRules(preferences.reminderRules),
  } as NotificationPreferences;
}

export async function updateNotificationPreferences(
  userId: string,
  patch: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
  const db = await getDbSafe();

  const sanitizedPatch: Partial<NotificationPreferences> = removeUndefinedFields({
    ...patch,
  });

  delete (sanitizedPatch as { userId?: string }).userId;

  if (typeof sanitizedPatch.reminderDay === 'number') {
    sanitizedPatch.reminderDay = Math.min(
      28,
      Math.max(1, Math.trunc(sanitizedPatch.reminderDay))
    );
  }

  if (sanitizedPatch.reminderRules) {
    sanitizedPatch.reminderRules = getNormalizedReminderRules(
      sanitizedPatch.reminderRules
    );
  }

  if (Object.keys(sanitizedPatch).length === 0) {
    return getNotificationPreferences(userId);
  }

  if (!db) {
    const current = await getNotificationPreferences(userId);
    const next: NotificationPreferences = {
      ...current,
      ...sanitizedPatch,
      userId,
      reminderRules: getNormalizedReminderRules(
        (sanitizedPatch.reminderRules as unknown) ?? current.reminderRules
      ),
    };

    inMemoryNotificationPreferences.set(userId, next);
    return next;
  }

  await db.collection('notification_preferences').updateOne(
    { userId },
    {
      $set: {
        ...sanitizedPatch,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        ...DEFAULT_NOTIFICATION_PREFERENCES,
        userId,
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );

  return getNotificationPreferences(userId);
}

export async function upsertReminderRule(
  userId: string,
  rulePatch: Partial<ReminderRule>
): Promise<NotificationPreferences> {
  const preferences = await getNotificationPreferences(userId);
  const normalized = normalizeReminderRule(rulePatch);

  if (!normalized) {
    throw new Error('Invalid reminder rule payload');
  }

  const nextRules = [...(preferences.reminderRules ?? [])];
  const index = nextRules.findIndex((rule) => rule.id === normalized.id);
  if (index >= 0) {
    nextRules[index] = {
      ...nextRules[index],
      ...normalized,
      createdAt: nextRules[index].createdAt ?? normalized.createdAt,
    };
  } else {
    nextRules.push(normalized);
  }

  const monthlyRule = nextRules.find((rule) => rule.type === 'monthly' && rule.enabled);

  return updateNotificationPreferences(userId, {
    reminderRules: nextRules,
    reminderDay: monthlyRule?.dayOfMonth ?? preferences.reminderDay,
    donationReminders: true,
    calendarReminders: true,
  });
}

export async function removeReminderRule(
  userId: string,
  ruleId: string
): Promise<NotificationPreferences> {
  const preferences = await getNotificationPreferences(userId);
  const nextRules = (preferences.reminderRules ?? []).filter((rule) => rule.id !== ruleId);
  const monthlyRule = nextRules.find((rule) => rule.type === 'monthly' && rule.enabled);

  return updateNotificationPreferences(userId, {
    reminderRules: nextRules,
    reminderDay: monthlyRule?.dayOfMonth ?? preferences.reminderDay,
  });
}

async function markRuleTriggered(
  userId: string,
  ruleId: string,
  atIso: string
): Promise<void> {
  const preferences = await getNotificationPreferences(userId);
  const nextRules = (preferences.reminderRules ?? []).map((rule) =>
    rule.id === ruleId ? { ...rule, lastTriggeredAt: atIso } : rule
  );

  await updateNotificationPreferences(userId, {
    reminderRules: nextRules,
  });
}

export async function maybeCreateMonthlyDonationReminder(userId: string) {
  const db = await getDbSafe();
  const preferences = await getNotificationPreferences(userId);

  if (!db) {
    return null;
  }

  if (!preferences.donationReminders || !preferences.calendarReminders) {
    return null;
  }

  const today = new Date();
  const activeMonthlyRule = (preferences.reminderRules ?? []).find(
    (rule) => rule.type === 'monthly' && rule.enabled
  );
  const reminderDay = Math.min(
    28,
    Math.max(1, activeMonthlyRule?.dayOfMonth ?? preferences.reminderDay ?? 10)
  );

  if (today.getDate() !== reminderDay) {
    return null;
  }

  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  if (preferences.lastReminderSentAt?.startsWith(currentMonth)) {
    return null;
  }

  if (activeMonthlyRule?.lastTriggeredAt?.startsWith(currentMonth)) {
    return null;
  }

  const paidDonationCount = await db.collection('donations').countDocuments({
    donor_id: userId,
    payment_status: { $in: ['paid', 'completed'] },
    created_at: { $regex: `^${currentMonth}` },
  });

  if (paidDonationCount > 0) {
    return null;
  }

  const notification = await createNotification({
    userId,
    type: 'reminder',
    title: 'Aylık bağış hatırlatıcısı 💚',
    message:
      activeMonthlyRule?.instruction === 'auto_payment_instruction'
        ? 'Bu ay henüz bağış yapmadınız. Otomatik ödeme talimatı ile düzenli desteği tek adımda sürdürebilirsiniz.'
        : 'Bu ay henüz bağış yapmadınız. Küçük bir destekle bir öğrencinin eğitim yolculuğuna katkı sağlayabilirsiniz.',
    link: '/campaigns',
    metadata: {
      reminderMonth: currentMonth,
      reminderDay,
      reminderRuleId: activeMonthlyRule?.id,
      instruction: activeMonthlyRule?.instruction ?? 'notify_only',
    },
  });

  await updateNotificationPreferences(userId, {
    lastReminderSentAt: today.toISOString(),
  });

  if (activeMonthlyRule) {
    await markRuleTriggered(userId, activeMonthlyRule.id, today.toISOString());
  }

  return notification;
}

export async function maybeCreateSpecialDayReminders(userId: string) {
  const preferences = await getNotificationPreferences(userId);
  const today = new Date();
  const todayMonthDay = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const currentYearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  const rule = (preferences.reminderRules ?? []).find(
    (item) =>
      item.type === 'special_day' &&
      item.enabled &&
      item.monthDay === todayMonthDay &&
      !item.lastTriggeredAt?.startsWith(currentYearMonth)
  );

  if (!rule) {
    return null;
  }

  const notification = await createNotification({
    userId,
    type: 'reminder',
    title: `${rule.specialDayTitle ?? rule.title} hatırlatıcısı ✨`,
    message:
      rule.instruction === 'auto_payment_instruction'
        ? `${rule.specialDayTitle ?? rule.title} için otomatik ödeme talimatı seçeneğini etkinleştirerek desteğinizi düzenli hale getirebilirsiniz.`
        : `${rule.specialDayTitle ?? rule.title} için bağış desteğinizi bugün planlayabilirsiniz.`,
    link: '/campaigns',
    metadata: {
      reminderRuleId: rule.id,
      monthDay: rule.monthDay,
      instruction: rule.instruction,
      specialDayTitle: rule.specialDayTitle ?? rule.title,
    },
  });

  await markRuleTriggered(userId, rule.id, today.toISOString());
  return notification;
}

/**
 * Create a donation thank-you notification
 */
export async function notifyDonationReceived(params: {
  userId: string;
  amount: number;
  campaignTitle: string;
  campaignSlug?: string;
}) {
  return createNotification({
    userId: params.userId,
    type: 'thank_you',
    title: 'Bağışınız için teşekkürler! 🙏',
    message: `${params.amount.toLocaleString('tr-TR')}₺ bağışınız "${params.campaignTitle}" kampanyasına ulaştı.`,
    link: params.campaignSlug
      ? `/campaign/${params.campaignSlug}`
      : '/my-donations',
    metadata: { amount: params.amount, campaignTitle: params.campaignTitle },
  });
}

/**
 * Notify when a campaign reaches a milestone (e.g., 50%, 75%, 90%)
 */
export async function notifyMilestone(params: {
  userId: string;
  campaignTitle: string;
  campaignSlug?: string;
  percentage: number;
}) {
  return createNotification({
    userId: params.userId,
    type: 'milestone',
    title: `Hedefe %${params.percentage} ulaşıldı! 🎯`,
    message: `"${params.campaignTitle}" kampanyası %${params.percentage}'a ulaştı. Son hamleyi sen yap!`,
    link: params.campaignSlug
      ? `/campaign/${params.campaignSlug}`
      : '/campaigns',
    metadata: {
      percentage: params.percentage,
      campaignTitle: params.campaignTitle,
    },
  });
}

/**
 * Notify about donation streak achievement
 */
export async function notifyStreak(params: {
  userId: string;
  streakCount: number;
}) {
  return createNotification({
    userId: params.userId,
    type: 'streak',
    title: `${params.streakCount} aylık bağış serisi! 🔥`,
    message: `Harika! ${params.streakCount} ay üst üste bağış yaptınız. Serinin devamını bekleriz!`,
    link: '/calendar',
    metadata: { streakCount: params.streakCount },
  });
}

/**
 * Send a campaign ending soon reminder
 */
export async function notifyCampaignEndingSoon(params: {
  userId: string;
  campaignTitle: string;
  campaignSlug?: string;
  daysLeft: number;
}) {
  return createNotification({
    userId: params.userId,
    type: 'reminder',
    title: `Kampanya bitiyor! ⏰`,
    message: `"${params.campaignTitle}" kampanyasının bitmesine ${params.daysLeft} gün kaldı. Desteğinizi şimdi gösterin!`,
    link: params.campaignSlug
      ? `/campaign/${params.campaignSlug}`
      : '/campaigns',
    metadata: {
      daysLeft: params.daysLeft,
      campaignTitle: params.campaignTitle,
    },
  });
}

/**
 * Notify about the impact of donations
 */
export async function notifyImpactReport(params: {
  userId: string;
  studentsHelped: number;
  message?: string;
}) {
  return createNotification({
    userId: params.userId,
    type: 'impact',
    title: 'Etkiniz büyüyor! 🌟',
    message:
      params.message ??
      `Bağışlarınız sayesinde ${params.studentsHelped} öğrenciye ulaşıldı. Teşekkürler!`,
    link: '/reports',
    metadata: { studentsHelped: params.studentsHelped },
  });
}
