'use client';
import useSWR from 'swr';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { profileUpdateSchema, type ProfileUpdateInput } from '@/lib/corporate/validators';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function ProfileForm() {
  const t = useTranslations('corporate.settings.profile');
  const { data, mutate } = useSWR('/api/corporate/me', fetcher);
  const company = data?.data?.company;

  const form = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    values: company
      ? {
          name: company.name,
          legalName: company.legalName ?? undefined,
          contactEmail: company.contactEmail,
          contactPhone: company.contactPhone ?? undefined,
          websiteUrl: company.websiteUrl ?? undefined,
          logoUrl: company.logoUrl ?? undefined,
        }
      : undefined,
  });
  const { register, handleSubmit, formState } = form;

  async function onSubmit(values: ProfileUpdateInput) {
    const res = await fetch('/api/corporate/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    const json = await res.json();
    if (!json.success) {
      toast.error(json.error);
      return;
    }
    toast.success(t('saved'));
    mutate();
  }

  if (!company) return <p>Loading...</p>;

  const inputCls =
    'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none';
  const disabledCls =
    'mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-500';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium">Tax ID</label>
        <input value={company.taxId} disabled className={disabledCls} />
        <p className="mt-1 text-xs text-gray-500">Vergi numarası değiştirilemez.</p>
      </div>
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input {...register('name')} className={inputCls} />
      </div>
      <div>
        <label className="block text-sm font-medium">Legal Name</label>
        <input {...register('legalName')} className={inputCls} />
      </div>
      <div>
        <label className="block text-sm font-medium">Contact Email</label>
        <input type="email" {...register('contactEmail')} className={inputCls} />
      </div>
      <div>
        <label className="block text-sm font-medium">Contact Phone</label>
        <input {...register('contactPhone')} className={inputCls} />
      </div>
      <div>
        <label className="block text-sm font-medium">Website</label>
        <input type="url" {...register('websiteUrl')} className={inputCls} />
      </div>
      <div>
        <label className="block text-sm font-medium">Logo URL</label>
        <input type="url" {...register('logoUrl')} className={inputCls} />
      </div>
      <button
        type="submit"
        disabled={formState.isSubmitting}
        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {t('save')}
      </button>
    </form>
  );
}
