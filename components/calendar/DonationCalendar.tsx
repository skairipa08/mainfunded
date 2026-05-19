'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Heart,
  Megaphone,
  CalendarDays,
  BellRing,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  ensureBrowserNotificationsEnabled,
  showBrowserNotificationPreview,
} from '@/lib/browser-notifications';
import CampaignCountdown from './CampaignCountdown';
import type {
  CalendarEvent,
  CalendarEventType,
  DonationStreak,
  ReminderInstruction,
  ReminderRule,
} from '@/types/notifications';
import { SPECIAL_DAYS, resolveSpecialDayDateForYear } from '@/types/notifications';
import { useTranslation } from "@/lib/i18n/context";

// ═══════════════════════════════════════════════════════
// Donation Calendar — full calendar with events
// ═══════════════════════════════════════════════════════

const MONTHS_TR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

const DAYS_TR = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

interface DonationRecord {
  id: string;
  date: string;
  amount: number;
  campaignTitle?: string;
  campaignSlug?: string;
}

interface Campaign {
  id: string;
  title: string;
  endDate: string;
  raised?: number;
  goal?: number;
  slug?: string;
}

interface DonationCalendarProps {
  donations?: DonationRecord[];
  campaigns?: Campaign[];
  streak?: DonationStreak;
}

function getEventTypeColor(type: CalendarEventType) {
  switch (type) {
    case 'donation':
      return 'bg-emerald-500';
    case 'campaign_end':
      return 'bg-red-500';
    case 'special_day':
      return 'bg-amber-500';
    case 'school':
      return 'bg-blue-500';
    case 'reminder':
      return 'bg-purple-500';
    default:
      return 'bg-gray-400';
  }
}

function getEventTypeBg(type: CalendarEventType) {
  switch (type) {
    case 'donation':
      return 'bg-emerald-50 border-emerald-200 text-emerald-800';
    case 'campaign_end':
      return 'bg-red-50 border-red-200 text-red-800';
    case 'special_day':
      return 'bg-amber-50 border-amber-200 text-amber-800';
    case 'school':
      return 'bg-blue-50 border-blue-200 text-blue-800';
    case 'reminder':
      return 'bg-purple-50 border-purple-200 text-purple-800';
    default:
      return 'bg-gray-50 border-gray-200 text-gray-800';
  }
}

export default function DonationCalendar({
  donations = [],
  campaigns = [],
  streak,
}: DonationCalendarProps) {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [reminderDay, setReminderDay] = useState<number | null>(null);
  const [reminderRules, setReminderRules] = useState<ReminderRule[]>([]);
  const [isSavingReminder, setIsSavingReminder] = useState(false);
  const [reminderFeedback, setReminderFeedback] = useState<string | null>(null);
  const [reminderError, setReminderError] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    let active = true;

    const fetchReminderPreference = async () => {
      try {
        const res = await fetch('/api/notifications/preferences');
        if (!res.ok) return;
        const data = await res.json();
        const day = data?.preferences?.reminderDay;
        if (active && typeof day === 'number') {
          setReminderDay(Math.min(28, Math.max(1, Math.trunc(day))));
        }

        if (active && Array.isArray(data?.preferences?.reminderRules)) {
          setReminderRules(data.preferences.reminderRules);
        }
      } catch {
        // no-op
      }
    };

    fetchReminderPreference();
    return () => {
      active = false;
    };
  }, []);

  // Build all calendar events
  const allEvents = useMemo(() => {
    const events: CalendarEvent[] = [];

    // Add special days (use year-agnostic matching)
    SPECIAL_DAYS.forEach((sd, i) => {
      events.push({
        ...sd,
        id: `special-${i}`,
        date: resolveSpecialDayDateForYear(sd, year),
      });
    });

    // Add donation history
    donations.forEach((d) => {
      events.push({
        id: `donation-${d.id}`,
        date: d.date,
        title: `${d.amount.toLocaleString('tr-TR')}₺ bağış`,
        description: d.campaignTitle
          ? `"${d.campaignTitle}" kampanyasına`
          : undefined,
        type: 'donation',
        emoji: '💚',
        link: d.campaignSlug ? `/campaign/${d.campaignSlug}` : '/my-donations',
      });
    });

    // Add campaign deadlines
    campaigns.forEach((c) => {
      events.push({
        id: `campaign-${c.id}`,
        date: c.endDate,
        title: `${c.title} – Son Gün!`,
        description: c.raised != null && c.goal != null
          ? `${c.raised.toLocaleString('tr-TR')}₺ / ${c.goal.toLocaleString('tr-TR')}₺`
          : undefined,
        type: 'campaign_end',
        emoji: '⏰',
        link: c.slug ? `/campaign/${c.slug}` : '/campaigns',
      });
    });

    if (reminderDay != null) {
      const dayInCurrentMonth = Math.min(
        reminderDay,
        new Date(year, month + 1, 0).getDate()
      );
      events.push({
        id: `reminder-${year}-${month + 1}`,
        date: `${year}-${String(month + 1).padStart(2, '0')}-${String(dayInCurrentMonth).padStart(2, '0')}`,
        title: 'Aylık Bağış Hatırlatıcısı',
        description: 'Bu ay eğitim için düzenli destek gününüz.',
        type: 'reminder',
        emoji: '🔔',
        link: '/campaigns',
      });
    }

    reminderRules
      .filter((rule) => rule.type === 'special_day' && rule.enabled && rule.monthDay)
      .forEach((rule) => {
        const [ruleMonth, ruleDay] = (rule.monthDay ?? '01-01').split('-').map((value) => Number(value));
        const safeMonth = Math.min(12, Math.max(1, ruleMonth));
        const safeDay = Math.min(31, Math.max(1, ruleDay));
        const normalizedDate = `${year}-${String(safeMonth).padStart(2, '0')}-${String(safeDay).padStart(2, '0')}`;

        events.push({
          id: `special-reminder-${rule.id}`,
          date: normalizedDate,
          title: `${rule.specialDayTitle ?? rule.title} Hatırlatıcısı`,
          description:
            rule.instruction === 'auto_payment_instruction'
              ? 'Otomatik ödeme talimatı seçeneği açık.'
              : 'Bu özel gün için bağış hatırlatıcınız aktif.',
          type: 'reminder',
          emoji: '🔔',
          link: '/campaigns',
        });
      });

    return events;
  }, [donations, campaigns, year, month, reminderDay, reminderRules]);

  // Calendar grid days
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = (firstDay.getDay() + 6) % 7; // Monday start
    const days: { date: Date; currentMonth: boolean }[] = [];

    for (let i = startOffset - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month, -i), currentMonth: false });
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), currentMonth: true });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), currentMonth: false });
    }
    return days;
  }, [year, month]);

  const getEventsForDate = useCallback(
    (date: Date) => {
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      return allEvents.filter((e) => e.date.startsWith(dateStr));
    },
    [allEvents]
  );

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const navigateMonth = (dir: number) =>
    setCurrentDate(new Date(year, month + dir, 1));

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const handleSetDonationReminder = async () => {
    if (!selectedDate) return;

    const selectedReminderDay = Math.min(28, Math.max(1, selectedDate.getDate()));
    setIsSavingReminder(true);
    setReminderError(null);
    setReminderFeedback(null);

    try {
      const browserNotification = await ensureBrowserNotificationsEnabled();

      const res = await fetch('/api/notifications/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donationReminders: true,
          calendarReminders: true,
          reminderDay: selectedReminderDay,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Hatırlatıcı kaydedilemedi');
      }

      const data = await res.json();
      setReminderDay(selectedReminderDay);
      if (Array.isArray(data?.preferences?.reminderRules)) {
        setReminderRules(data.preferences.reminderRules);
      }

      const browserMessage = !browserNotification.supported
        ? ' Bu tarayıcı bildirimleri desteklemiyor.'
        : browserNotification.permission === 'granted'
          ? ' Tarayıcı bildirimleri açıldı.'
          : browserNotification.permission === 'denied'
            ? ' Tarayıcı bildirim izni reddedildi; tarayıcı ayarlarından açabilirsiniz.'
            : ' Tarayıcı bildirimi için izin verilmedi.';

      if (browserNotification.permission === 'granted') {
        showBrowserNotificationPreview(
          'FundEd hatırlatıcı aktif ✅',
          `Her ayın ${selectedReminderDay}. günü bağış hatırlatıcısı alacaksınız.`
        );
      }

      setReminderFeedback(`Hatırlatıcı her ayın ${selectedReminderDay}. günü için aktif edildi.${browserMessage}`);
    } catch {
      setReminderError('Hatırlatıcı ayarlanırken bir sorun oluştu. Lütfen giriş yaptığınızdan emin olup tekrar deneyin.');
    } finally {
      setIsSavingReminder(false);
    }
  };

  const handleSetSpecialDayReminder = async (instruction: ReminderInstruction) => {
    if (!selectedDate) return;

    const specialDayEvent = selectedEvents.find((event) => event.type === 'special_day');
    if (!specialDayEvent) {
      setReminderError('Seçili tarih özel gün içermiyor.');
      return;
    }

    const monthDay = `${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

    setIsSavingReminder(true);
    setReminderError(null);
    setReminderFeedback(null);

    try {
      const browserNotification = await ensureBrowserNotificationsEnabled();

      const res = await fetch('/api/notifications/reminder-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `special-${monthDay}`,
          type: 'special_day',
          title: specialDayEvent.title,
          specialDayTitle: specialDayEvent.title,
          specialDayDate: `${selectedDate.getFullYear()}-${monthDay}`,
          monthDay,
          instruction,
          enabled: true,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Özel gün hatırlatıcısı kaydedilemedi');
      }

      const data = await res.json();
      if (Array.isArray(data?.rules)) {
        setReminderRules(data.rules);
      }

      const browserMessage = !browserNotification.supported
        ? ' Tarayıcı bildirimi desteklenmiyor.'
        : browserNotification.permission === 'granted'
          ? ' Tarayıcı bildirimi açıldı.'
          : browserNotification.permission === 'denied'
            ? ' Tarayıcı bildirim izni reddedildi.'
            : ' Tarayıcı bildirimi için izin verilmedi.';

      if (browserNotification.permission === 'granted') {
        showBrowserNotificationPreview(
          `${specialDayEvent.title} hatırlatıcısı aktif ✨`,
          instruction === 'auto_payment_instruction'
            ? 'Otomatik ödeme talimatı önerisi ile özel gün bildirimi kurulmuştur.'
            : 'Özel gün için hatırlatıcı bildirimi kurulmuştur.'
        );
      }

      setReminderFeedback(
        instruction === 'auto_payment_instruction'
          ? `${specialDayEvent.title} için otomatik ödeme talimatı seçeneğiyle hatırlatıcı kuruldu.${browserMessage}`
          : `${specialDayEvent.title} için özel gün hatırlatıcısı kuruldu.${browserMessage}`
      );
    } catch {
      setReminderError('Özel gün hatırlatıcısı ayarlanamadı. Lütfen tekrar deneyin.');
    } finally {
      setIsSavingReminder(false);
    }
  };

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];
  const hasSpecialDayEvent = selectedEvents.some((event) => event.type === 'special_day');

  // Compute streak from donations
  const donationStreak = useMemo(() => {
    if (streak) return streak;
    if (donations.length === 0)
      return { currentStreak: 0, longestStreak: 0, totalDonations: 0, lastDonationDate: null };

    const months = new Set(
      donations.map((d) => {
        const dt = new Date(d.date);
        return `${dt.getFullYear()}-${dt.getMonth()}`;
      })
    );

    let current = 0;
    const today = new Date();
    for (let i = 0; i < 24; i++) {
      const checkMonth = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${checkMonth.getFullYear()}-${checkMonth.getMonth()}`;
      if (months.has(key)) {
        current++;
      } else {
        break;
      }
    }

    return {
      currentStreak: current,
      longestStreak: current,
      totalDonations: donations.length,
      lastDonationDate:
        donations.length > 0
          ? donations.sort(
              (a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            )[0].date
          : null,
    };
  }, [streak, donations]);

  const activeCampaigns = campaigns.filter(
    (c) => new Date(c.endDate) > new Date()
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
            <Flame className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-gray-900">
              {donationStreak.currentStreak}
            </p>
            <p className="text-xs text-gray-500">{t('components.donationcalendar.ayl_k_ba_serisi')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Heart className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-gray-900">
              {donationStreak.totalDonations}
            </p>
            <p className="text-xs text-gray-500">{t('components.donationcalendar.toplam_ba')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
            <Megaphone className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-gray-900">
              {activeCampaigns.length}
            </p>
            <p className="text-xs text-gray-500">{t('components.donationcalendar.aktif_kampanya')}</p>
          </div>
        </div>
      </div>

      {/* Campaign Countdowns */}
      {activeCampaigns.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            {t('components.donationcalendar.yakla_an_kampanya_biti_tarihle')}</h3>
          {activeCampaigns
            .sort(
              (a, b) =>
                new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
            )
            .slice(0, 3)
            .map((campaign) => (
              <CampaignCountdown key={campaign.id} campaign={campaign} />
            ))}
        </div>
      )}

      {/* Calendar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Önceki ay"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-900">
              {MONTHS_TR[month]} {year}
            </h2>
            <Button variant="outline" size="sm" onClick={goToToday} className="text-xs h-7">
              {t('components.donationcalendar.bug_n')}</Button>
          </div>
          <button
            onClick={() => navigateMonth(1)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Sonraki ay"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {DAYS_TR.map((day) => (
            <div
              key={day}
              className="py-2 text-center text-xs font-semibold text-gray-400 uppercase"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((dayObj, index) => {
            const events = getEventsForDate(dayObj.date);
            const today = isToday(dayObj.date);
            const selected =
              selectedDate &&
              dayObj.date.toDateString() === selectedDate.toDateString();

            return (
              <button
                key={index}
                onClick={() => setSelectedDate(dayObj.date)}
                className={cn(
                  'relative h-16 sm:h-20 p-1 border-b border-r border-gray-50 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-inset',
                  !dayObj.currentMonth && 'opacity-30',
                  today && 'bg-blue-50/70',
                  selected && 'ring-2 ring-blue-500 ring-inset bg-blue-50',
                  !selected && dayObj.currentMonth && 'hover:bg-gray-50'
                )}
              >
                <span
                  className={cn(
                    'inline-flex items-center justify-center text-sm w-7 h-7 rounded-full',
                    today &&
                      'bg-blue-600 text-white font-bold',
                    !today && 'text-gray-700 font-medium'
                  )}
                >
                  {dayObj.date.getDate()}
                </span>
                {/* Event dots */}
                {events.length > 0 && (
                  <div className="absolute bottom-1 left-1 right-1 flex gap-0.5 flex-wrap">
                    {events.slice(0, 4).map((ev, i) => (
                      <div
                        key={i}
                        className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          getEventTypeColor(ev.type)
                        )}
                        title={ev.title}
                      />
                    ))}
                    {events.length > 4 && (
                      <span className="text-[9px] text-gray-400">
                        +{events.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Detail */}
      {selectedDate && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-blue-500" />
            {selectedDate.toLocaleDateString('tr-TR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </h3>

          {selectedEvents.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-400">
                {t('components.donationcalendar.bu_tarihte_etkinlik_bulunmuyor')}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                disabled={isSavingReminder}
                onClick={handleSetDonationReminder}
              >
                {isSavingReminder
                  ? 'Kaydediliyor...'
                  : t('components.donationcalendar.ba_hat_rlat_c_s_kur')}
              </Button>
              {reminderFeedback && (
                <p className="text-xs text-emerald-600 mt-2">{reminderFeedback}</p>
              )}
              {reminderError && (
                <p className="text-xs text-red-600 mt-2">{reminderError}</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {selectedEvents.map((event) => (
                <div
                  key={event.id}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg border',
                    getEventTypeBg(event.type)
                  )}
                >
                  <span className="text-xl flex-shrink-0">{event.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{event.title}</p>
                    {event.description && (
                      <p className="text-xs mt-0.5 opacity-80">
                        {event.description}
                      </p>
                    )}
                  </div>
                  {event.link && (
                    <Link href={event.link}>
                      <Button
                        size="sm"
                        variant="default"
                        className="flex-shrink-0 text-xs h-7 bg-blue-600 hover:bg-blue-700"
                      >
                        {event.type === 'campaign_end'
                          ? 'Bağış Yap'
                          : event.type === 'donation'
                            ? 'Detay'
                            : 'Görüntüle'}
                      </Button>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}

          {hasSpecialDayEvent && (
            <div className="mt-4 border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Özel Gün Hatırlatıcısı</p>
                    <p className="text-xs text-gray-500">Bu özel gün için yıllık tekrar eden hatırlatma kurun.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isSavingReminder}
                    onClick={() => handleSetSpecialDayReminder('notify_only')}
                  >
                    <BellRing className="h-3.5 w-3.5 mr-1" />
                    Sadece Hatırlat
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    disabled={isSavingReminder}
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => handleSetSpecialDayReminder('auto_payment_instruction')}
                  >
                    Otomatik Ödeme Talimatı
                  </Button>
                </div>
              </div>
              <Link href="/calendar/reminders" className="inline-block mt-3 text-xs text-blue-600 hover:text-blue-700 font-medium">
                Tüm hatırlatıcı talimatlarını yönet →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 px-1">
        {[
          { type: 'donation' as CalendarEventType, label: 'Bağışlarım' },
          { type: 'campaign_end' as CalendarEventType, label: 'Kampanya Bitişi' },
          { type: 'special_day' as CalendarEventType, label: 'Özel Günler' },
          { type: 'school' as CalendarEventType, label: 'Okul Takvimi' },
          { type: 'reminder' as CalendarEventType, label: 'Hatırlatıcılar' },
        ].map(({ type, label }) => (
          <div key={type} className="flex items-center gap-1.5">
            <div
              className={cn('w-2.5 h-2.5 rounded-full', getEventTypeColor(type))}
            />
            <span className="text-xs text-gray-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
