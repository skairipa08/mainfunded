'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Infinity, Users, TrendingUp, Heart } from 'lucide-react';
import { EvergreenBadge } from './EvergreenBadge';
import { cn } from '@/lib/utils';

export interface EvergreenCampaignCardProps {
  campaign_id: string;
  title: string;
  story: string;
  cover_image?: string | null;
  raised_amount: number;
  goal_amount: number;
  donor_count: number;
  evergreen_since?: string | null;
  student: {
    name: string;
    picture?: string | null;
    country?: string | null;
    field_of_study?: string | null;
    university?: string | null;
  };
  className?: string;
}

function formatTRY(amount: number) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(amount);
}

/**
 * Evergreen-specific campaign card with teal accent styling,
 * the infinity badge, and a goal-exceeded banner when applicable.
 */
export function EvergreenCampaignCard({
  campaign_id,
  title,
  story,
  cover_image,
  raised_amount,
  goal_amount,
  donor_count,
  evergreen_since,
  student,
  className,
}: EvergreenCampaignCardProps) {
  const goalExceeded = raised_amount > goal_amount;
  const progressPct = Math.min(100, Math.round((raised_amount / goal_amount) * 100));

  return (
    <Link
      href={`/campaigns/${campaign_id}`}
      className={cn(
        'group flex flex-col rounded-2xl border-2 border-teal-200 bg-white shadow-md',
        'hover:shadow-xl hover:border-teal-400 transition-all duration-200 overflow-hidden',
        className
      )}
    >
      {/* Cover image */}
      <div className="relative h-44 w-full bg-teal-50">
        {cover_image ? (
          <Image src={cover_image} alt={title} fill className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Infinity className="w-12 h-12 text-teal-300" />
          </div>
        )}

        {/* Evergreen ribbon */}
        <div className="absolute top-3 left-3">
          <EvergreenBadge goalExceeded={goalExceeded} size="sm" />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-3 p-4 flex-1">
        {/* Student info */}
        <div className="flex items-center gap-2">
          {student.picture ? (
            <Image
              src={student.picture}
              alt={student.name}
              width={32}
              height={32}
              className="rounded-full border border-teal-200 object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-teal-700 text-sm font-bold">
              {student.name.charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{student.name}</p>
            {student.university && (
              <p className="text-xs text-gray-500 truncate">{student.university}</p>
            )}
          </div>
        </div>

        {/* Title + story excerpt */}
        <div>
          <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-teal-700 transition-colors">
            {title}
          </h3>
          <p className="mt-1 text-sm text-gray-600 line-clamp-2">{story}</p>
        </div>

        {/* Goal exceeded banner */}
        {goalExceeded && (
          <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800 font-medium">
            <TrendingUp className="w-3.5 h-3.5 flex-shrink-0" />
            Hedef Aşıldı! Fazlası bir sonraki dönem için ayrılıyor
          </div>
        )}

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="h-2 w-full rounded-full bg-teal-100 overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                goalExceeded ? 'bg-amber-400' : 'bg-teal-500'
              )}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{formatTRY(raised_amount)}</span>
            <span>Hedef: {formatTRY(goal_amount)}</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mt-auto pt-1 border-t border-gray-100">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {donor_count.toLocaleString('tr-TR')} destekçi
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-teal-500" />
            Bağış yapmaya devam edebilirsiniz
          </span>
        </div>
      </div>
    </Link>
  );
}
