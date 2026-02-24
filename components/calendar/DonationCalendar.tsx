'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Heart,
  Megaphone,
  CalendarDays,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import CampaignCountdown from './CampaignCountdown';
import type { CalendarEvent, CalendarEventType, DonationStreak } from '@/types/notifications';
import { SPECIAL_DAYS } from '@/types/notifications';

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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Build all calendar events
  const allEvents = useMemo(() => {
    const events: CalendarEvent[] = [];

    // Add special days (use year-agnostic matching)
    SPECIAL_DAYS.forEach((sd, i) => {
      const sdDate = new Date(sd.date);
      // Generate for the displayed year
      const dateStr = `${year}-${String(sdDate.getMonth() + 1).padStart(2, '0')}-${String(sdDate.getDate()).padStart(2, '0')}`;
      events.push({
        ...sd,
        id: `special-${i}`,
        date: dateStr,
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

    return events;
  }, [donations, campaigns, year]);

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

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];

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
            <p className="text-xs text-gray-500">Aylık Bağış Serisi</p>
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
            <p className="text-xs text-gray-500">Toplam Bağış</p>
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
            <p className="text-xs text-gray-500">Aktif Kampanya</p>
          </div>
        </div>
      </div>

      {/* Campaign Countdowns */}
      {activeCampaigns.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Yaklaşan Kampanya Bitiş Tarihleri
          </h3>
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
              Bugün
            </Button>
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
                Bu tarihte etkinlik bulunmuyor
              </p>
              <Link href="/donate">
                <Button variant="outline" size="sm" className="mt-3">
                  🔔 Bağış Hatırlatıcısı Kur
                </Button>
              </Link>
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
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 px-1">
        {[
          { type: 'donation' as CalendarEventType, label: 'Bağışlarım' },
          { type: 'campaign_end' as CalendarEventType, label: 'Kampanya Bitişi' },
          { type: 'special_day' as CalendarEventType, label: 'Özel Günler' },
          { type: 'school' as CalendarEventType, label: 'Okul Takvimi' },
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
