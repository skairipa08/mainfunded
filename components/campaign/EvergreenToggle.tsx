'use client';

import { Infinity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EvergreenToggleProps {
  /** Controlled value */
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * "Süre sonrası bağışa açık kalsın" toggle field.
 * Drop this inside your campaign create/edit form.
 *
 * Usage:
 *   <EvergreenToggle value={form.evergreen_enabled} onChange={(v) => form.setValue('evergreen_enabled', v)} />
 */
export function EvergreenToggle({ value, onChange, disabled, className }: EvergreenToggleProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border p-4',
        value ? 'border-teal-400 bg-teal-50' : 'border-gray-200 bg-white',
        className
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex-shrink-0 rounded-full p-2 mt-0.5',
          value ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-400'
        )}
      >
        <Infinity className="w-4 h-4" />
      </div>

      {/* Label + description */}
      <div className="flex-1 min-w-0">
        <label
          htmlFor="evergreen_toggle"
          className="block text-sm font-semibold text-gray-900 cursor-pointer select-none"
        >
          Süre sonrası bağışa açık kalsın
        </label>
        <p className="mt-0.5 text-xs text-gray-500">
          Kampanya süresi dolduğunda &quot;Devam Eden Destek&quot; olarak yayında kalmaya devam eder.
          Bağışçılar ek destek vermeye devam edebilir; hedef aşılırsa fazla tutar bir sonraki
          dönem için ayrılır.
        </p>
      </div>

      {/* Toggle switch */}
      <button
        type="button"
        id="evergreen_toggle"
        role="switch"
        aria-checked={value}
        disabled={disabled}
        onClick={() => onChange(!value)}
        className={cn(
          'relative flex-shrink-0 h-6 w-11 rounded-full border-2 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2',
          value ? 'bg-teal-500 border-teal-500' : 'bg-gray-200 border-gray-200',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200',
            value ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  );
}
