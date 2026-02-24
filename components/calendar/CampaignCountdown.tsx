'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface Campaign {
  id: string;
  title: string;
  endDate: string;
  raised?: number;
  goal?: number;
  slug?: string;
}

export default function CampaignCountdown({
  campaign,
}: {
  campaign: Campaign;
}) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    expired: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });

  useEffect(() => {
    const calculate = () => {
      const end = new Date(campaign.endDate).getTime();
      const now = Date.now();
      const diff = end - now;
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
      return {
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff / 3600000) % 24),
        minutes: Math.floor((diff / 60000) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        expired: false,
      };
    };

    setTimeLeft(calculate());
    const timer = setInterval(() => setTimeLeft(calculate()), 1000);
    return () => clearInterval(timer);
  }, [campaign.endDate]);

  if (timeLeft.expired) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-500">
        Bu kampanya sona erdi
      </div>
    );
  }

  const progress =
    campaign.raised && campaign.goal
      ? Math.min(100, (campaign.raised / campaign.goal) * 100)
      : 0;

  const urgency =
    timeLeft.days <= 1
      ? 'critical'
      : timeLeft.days <= 3
        ? 'warning'
        : 'normal';

  return (
    <div
      className={cn(
        'rounded-xl border p-4 transition-all',
        urgency === 'critical' &&
          'border-red-300 bg-red-50 shadow-[0_0_0_0_rgba(239,68,68,0.2)] animate-pulse',
        urgency === 'warning' && 'border-amber-300 bg-amber-50',
        urgency === 'normal' && 'border-gray-200 bg-white'
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Campaign Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-sm truncate">
            {campaign.title}
          </h4>
          {campaign.raised != null && campaign.goal != null && (
            <>
              <div className="mt-2 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {campaign.raised.toLocaleString('tr-TR')}₺ /{' '}
                {campaign.goal.toLocaleString('tr-TR')}₺
                <span className="ml-1 font-semibold text-emerald-600">
                  (%{Math.round(progress)})
                </span>
              </p>
            </>
          )}
        </div>

        {/* Countdown Timer */}
        <div className="flex items-center gap-1">
          {[
            { value: timeLeft.days, label: 'Gün' },
            { value: timeLeft.hours, label: 'Saat' },
            { value: timeLeft.minutes, label: 'Dk' },
            { value: timeLeft.seconds, label: 'Sn' },
          ].map((unit, i) => (
            <React.Fragment key={unit.label}>
              {i > 0 && (
                <span className="text-gray-400 font-bold text-lg">:</span>
              )}
              <div className="flex flex-col items-center bg-gray-900 text-white rounded-lg px-2.5 py-1.5 min-w-[44px]">
                <span className="text-lg font-extrabold tabular-nums leading-tight">
                  {String(unit.value).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase tracking-wider opacity-60">
                  {unit.label}
                </span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Urgent CTA */}
      {urgency === 'critical' && (
        <a
          href={campaign.slug ? `/campaign/${campaign.slug}/donate` : '/donate'}
          className="mt-3 block w-full text-center py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-sm rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md"
        >
          ⚡ Son Şans – Hemen Bağış Yap!
        </a>
      )}
    </div>
  );
}
