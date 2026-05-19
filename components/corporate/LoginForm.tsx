'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, getSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

export function LoginForm() {
  const t = useTranslations('corporate.login');
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const errorParam = params.get('error');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await signIn('credentials', { email, password, redirect: false });
    if (!res || res.error) {
      toast.error('Login failed');
      setSubmitting(false);
      return;
    }
    const session = await getSession();
    const status = (session?.user as any)?.companyStatus;
    if (status === 'PENDING') router.push('/corporate/pending');
    else if (status === 'APPROVED') router.push('/corporate/settings/matching-rule');
    else if (status === 'REJECTED') router.push('/corporate/login?error=rejected');
    else if (status === 'SUSPENDED') router.push('/corporate/login?error=suspended');
    else router.push('/');
    setSubmitting(false);
  }

  const inputCls =
    'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none';

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-md">
      {errorParam === 'rejected' && <p className="text-red-600">{t('rejected')}</p>}
      {errorParam === 'suspended' && <p className="text-red-600">{t('suspended')}</p>}
      <div>
        <label className="block text-sm font-medium">{t('email')}</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputCls}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">{t('password')}</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputCls}
          required
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {t('submit')}
      </button>
    </form>
  );
}
