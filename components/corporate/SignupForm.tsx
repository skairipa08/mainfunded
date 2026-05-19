'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { signupSchema, type SignupInput } from '@/lib/corporate/validators';

export function SignupForm() {
  const t = useTranslations('corporate.signup');
  const router = useRouter();
  const form = useForm<SignupInput>({ resolver: zodResolver(signupSchema) });
  const { register, handleSubmit, formState } = form;

  async function onSubmit(values: SignupInput) {
    const res = await fetch('/api/corporate/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    const json = await res.json();
    if (!json.success) {
      const errKey = json.error as string;
      const KNOWN = ['EMAIL_TAKEN', 'TAX_ID_TAKEN', 'SIGNUP_FAILED'];
      toast.error(KNOWN.includes(errKey) ? t(`errors.${errKey}` as any) : errKey);
      return;
    }
    toast.success(t('successBody'));
    router.push('/corporate/login');
  }

  const inputCls =
    'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none';
  const errCls = 'mt-1 text-sm text-red-600';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium">{t('name')}</label>
        <input {...register('name')} className={inputCls} />
        {formState.errors.name && <p className={errCls}>{formState.errors.name.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium">{t('legalName')}</label>
        <input {...register('legalName')} className={inputCls} />
      </div>
      <div>
        <label className="block text-sm font-medium">{t('taxId')}</label>
        <input {...register('taxId')} className={inputCls} />
        {formState.errors.taxId && <p className={errCls}>{formState.errors.taxId.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium">{t('contactEmail')}</label>
        <input type="email" {...register('contactEmail')} className={inputCls} />
        {formState.errors.contactEmail && (
          <p className={errCls}>{formState.errors.contactEmail.message}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium">{t('contactPhone')}</label>
        <input {...register('contactPhone')} className={inputCls} />
      </div>
      <div>
        <label className="block text-sm font-medium">{t('websiteUrl')}</label>
        <input type="url" {...register('websiteUrl')} className={inputCls} />
      </div>
      <div>
        <label className="block text-sm font-medium">{t('password')}</label>
        <input type="password" {...register('password')} className={inputCls} />
        {formState.errors.password && (
          <p className={errCls}>{formState.errors.password.message}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={formState.isSubmitting}
        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {t('submit')}
      </button>
    </form>
  );
}
