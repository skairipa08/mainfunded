'use client';
import { useTranslations } from 'next-intl';

export function PendingBanner() {
  const t = useTranslations('corporate.pending');
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
      <h2 className="text-xl font-semibold">{t('title')}</h2>
      <p className="mt-2">{t('body')}</p>
    </div>
  );
}
