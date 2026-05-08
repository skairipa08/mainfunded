'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

export function EmployeeJoinForm() {
  const t = useTranslations('corporateP2.join');
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch('/api/corporate/employee/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code.trim().toUpperCase() }),
    });
    const json = await res.json();
    setSubmitting(false);
    if (!json.success) {
      const KNOWN = ['INVALID_CODE', 'COMPANY_NOT_APPROVED', 'ALREADY_AFFILIATED'];
      toast.error(KNOWN.includes(json.error) ? t(`errors.${json.error}` as any) : json.error);
      return;
    }
    toast.success(t('success', { company: json.data.companyName }));
    setCode('');
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium">{t('code')}</label>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength={8}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-lg uppercase tracking-widest focus:border-blue-500 focus:outline-none"
          required
        />
      </div>
      <button
        type="submit"
        disabled={submitting || code.trim().length !== 8}
        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {t('submit')}
      </button>
    </form>
  );
}
