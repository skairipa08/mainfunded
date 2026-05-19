import { getDb } from '@/lib/db';
import type { NotificationType } from '@/types/notifications';

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

/**
 * Create a notification for a user (server-side).
 * Use this from donation webhooks, cron jobs, etc.
 */
export async function createNotification(params: CreateNotificationParams) {
  const db = await getDb();

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

  await db.collection('notifications').insertOne(notification);
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

// In-memory throttle: userId → last triggered date string (resets on cold start)
const reminderThrottle = new Map<string, string>();

/**
 * Fire-and-forget: sends campaign-ending-soon reminders for this user.
 * Runs at most once per day per user (in-memory throttle).
 */
export async function maybeTriggerReminders(userId: string): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  if (reminderThrottle.get(userId) === today) return;
  reminderThrottle.set(userId, today);

  const db = await getDb();
  const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  const donations = await db
    .collection('donations')
    .aggregate([
      { $match: { userId } },
      {
        $lookup: {
          from: 'campaigns',
          localField: 'campaignId',
          foreignField: '_id',
          as: 'campaign',
        },
      },
      { $unwind: '$campaign' },
      {
        $match: {
          'campaign.deadline': { $lte: threeDaysFromNow, $gte: new Date() },
          'campaign.status': 'published',
        },
      },
      { $group: { _id: '$campaign._id', campaign: { $first: '$campaign' } } },
    ])
    .toArray();

  for (const { campaign } of donations) {
    const daysLeft = Math.ceil(
      (new Date(campaign.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    await notifyCampaignEndingSoon({
      userId,
      campaignTitle: campaign.title,
      campaignSlug: campaign.slug,
      daysLeft,
    });
  }
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
