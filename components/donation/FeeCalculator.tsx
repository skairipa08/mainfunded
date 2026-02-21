'use client';

import { useMemo } from 'react';
import { calculateTotalWithFees, type FeeBreakdown } from '@/lib/fees';
import { useCurrency } from '@/lib/currency-context';
import { useTranslation } from '@/lib/i18n';

interface FeeCalculatorProps {
  /** Net donation amount (what the student receives). */
  baseAmount: number;
}

export default function FeeCalculator({ baseAmount }: FeeCalculatorProps) {
  const { formatAmount } = useCurrency();
  const { t } = useTranslation();
  const breakdown: FeeBreakdown | null = useMemo(() => {
    try {
      if (baseAmount <= 0) return null;
      return calculateTotalWithFees(baseAmount);
    } catch {
      return null;
    }
  }, [baseAmount]);

  if (!breakdown) {
    return null;
  }

  const rows = [
    { label: t('feeCalculator.toStudent'), value: breakdown.baseAmount, highlight: true },
    { label: t('feeCalculator.platformFee'), value: breakdown.platformFee, highlight: false },
    { label: t('feeCalculator.stripeFee'), value: breakdown.stripeFee, highlight: false },
  ];

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm">
      <h4 className="mb-3 font-semibold text-blue-900">{t('feeCalculator.title')}</h4>

      <ul className="space-y-2">
        {rows.map((row) => (
          <li
            key={row.label}
            className={`flex items-center justify-between ${
              row.highlight ? 'font-medium text-blue-800' : 'text-blue-600'
            }`}
          >
            <span>{row.label}</span>
            <span>{formatAmount(row.value)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex items-center justify-between border-t border-blue-300 pt-3 font-bold text-blue-900">
        <span>{t('feeCalculator.total')}</span>
        <span>{formatAmount(breakdown.totalCharge)}</span>
      </div>
    </div>
  );
}
