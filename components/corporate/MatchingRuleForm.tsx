'use client';
import useSWR from 'swr';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { matchingRuleSchema, type MatchingRuleInput } from '@/lib/corporate/validators';
import { ELIGIBLE_CATEGORIES } from '@/lib/corporate/types';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function MatchingRuleForm() {
  const t = useTranslations('corporate.settings.matchingRule');
  const { data, mutate } = useSWR('/api/corporate/matching-rule', fetcher);
  const existing = data?.data;

  const form = useForm<MatchingRuleInput>({
    resolver: zodResolver(matchingRuleSchema),
    values: existing
      ? {
          ratio: existing.ratio,
          monthlyBudgetTRY: existing.monthlyBudgetTRY,
          eligibleCategories: existing.eligibleCategories,
          active: existing.active,
        }
      : {
          ratio: 2,
          monthlyBudgetTRY: 0,
          eligibleCategories: [],
          active: true,
        },
  });
  const { register, handleSubmit, formState } = form;

  async function onSubmit(values: MatchingRuleInput) {
    const res = await fetch('/api/corporate/matching-rule', {
      method: 'PUT',
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

  if (!data) return <p>Loading...</p>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-md">
      <fieldset>
        <legend className="font-semibold mb-2">{t('ratio')}</legend>
        <div className="flex gap-4">
          {[1, 2, 3].map((r) => (
            <label key={r} className="flex items-center gap-1">
              <input
                type="radio"
                value={r}
                {...register('ratio', { valueAsNumber: true })}
              />
              {t(`ratio${r}x` as any)}
            </label>
          ))}
        </div>
        {formState.errors.ratio && (
          <p className="text-red-600 mt-1 text-sm">{formState.errors.ratio.message}</p>
        )}
      </fieldset>

      <div>
        <label className="font-semibold">{t('monthlyBudget')}</label>
        <input
          type="number"
          min={1}
          step={1}
          {...register('monthlyBudgetTRY', { valueAsNumber: true })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        {formState.errors.monthlyBudgetTRY && (
          <p className="text-red-600 mt-1 text-sm">{formState.errors.monthlyBudgetTRY.message}</p>
        )}
      </div>

      <fieldset>
        <legend className="font-semibold mb-2">{t('categories')}</legend>
        <div className="grid grid-cols-2 gap-2">
          {ELIGIBLE_CATEGORIES.map((cat) => (
            <label key={cat} className="flex items-center gap-2">
              <input type="checkbox" value={cat} {...register('eligibleCategories')} />
              {t(`categoryLabels.${cat}` as any)}
            </label>
          ))}
        </div>
        {formState.errors.eligibleCategories && (
          <p className="text-red-600 mt-1 text-sm">
            {formState.errors.eligibleCategories.message}
          </p>
        )}
      </fieldset>

      <label className="flex items-center gap-2">
        <input type="checkbox" {...register('active')} />
        <span className="font-semibold">{t('active')}</span>
      </label>

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
