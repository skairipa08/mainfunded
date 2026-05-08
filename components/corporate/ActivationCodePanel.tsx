'use client';
import useSWR from 'swr';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function ActivationCodePanel() {
  const t = useTranslations('corporateP2.code');
  const { data, mutate } = useSWR('/api/corporate/activation-code', fetcher);
  const [submitting, setSubmitting] = useState(false);
  const code = data?.data?.activationCode as string | null;

  async function rotate() {
    if (code && !confirm(t('rotateConfirm'))) return;
    setSubmitting(true);
    const res = await fetch('/api/corporate/activation-code', { method: 'POST' });
    const json = await res.json();
    setSubmitting(false);
    if (!json.success) {
      toast.error(json.error);
      return;
    }
    toast.success(json.data.activationCode);
    mutate();
  }

  if (!data) return <p>Loading...</p>;

  return (
    <section className="rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-semibold mb-4">{t('title')}</h2>
      <div className="mb-4">
        <p className="text-sm text-gray-600">{t('current')}</p>
        <p className="mt-1 font-mono text-2xl tracking-widest">{code ?? t('noCode')}</p>
      </div>
      <button
        onClick={rotate}
        disabled={submitting}
        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {t('rotate')}
      </button>
    </section>
  );
}
