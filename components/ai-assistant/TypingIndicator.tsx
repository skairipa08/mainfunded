'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from "@/lib/i18n/context";

export function TypingIndicator({ className }: { className?: string }) {
    const { t } = useTranslation();
  return (
    <div className={cn('flex items-center gap-1 px-4 py-3', className)}>
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
      <span className="text-xs text-gray-400 ml-2">{t('components.typingindicator.yaz_yor')}</span>
    </div>
  );
}
