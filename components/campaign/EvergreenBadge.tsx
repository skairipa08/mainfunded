'use client';

import { Infinity, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EvergreenBadgeProps {
  /** Whether the raised amount has exceeded the goal */
  goalExceeded?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-3 py-1 gap-1.5',
  lg: 'text-base px-4 py-1.5 gap-2',
};

/**
 * Visual badge shown on evergreen campaigns.
 * A teal "Devam Eden Destek" pill + optional "goal exceeded" banner.
 */
export function EvergreenBadge({ goalExceeded = false, className, size = 'md' }: EvergreenBadgeProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {/* Main badge */}
      <span
        className={cn(
          'inline-flex items-center font-semibold rounded-full',
          'bg-teal-100 text-teal-800 border border-teal-300',
          sizeClasses[size]
        )}
      >
        <Infinity className="w-3.5 h-3.5 flex-shrink-0" />
        Devam Eden Destek
      </span>

      {/* Goal exceeded notice */}
      {goalExceeded && (
        <span
          className={cn(
            'inline-flex items-center font-medium rounded-full',
            'bg-amber-100 text-amber-800 border border-amber-300',
            sizeClasses[size]
          )}
        >
          <TrendingUp className="w-3.5 h-3.5 flex-shrink-0" />
          Hedef Aşıldı! Fazlası bir sonraki dönem için ayrılıyor
        </span>
      )}
    </div>
  );
}
