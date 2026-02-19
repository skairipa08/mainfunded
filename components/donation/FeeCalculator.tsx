'use client';

import { useMemo } from 'react';
import { calculateTotalWithFees, type FeeBreakdown } from '@/lib/fees';

interface FeeCalculatorProps {
  /** Net donation amount (what the student receives). */
  baseAmount: number;
}

export default function FeeCalculator({ baseAmount }: FeeCalculatorProps) {
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
    { label: 'Öğrenciye gidecek', value: breakdown.baseAmount, highlight: true },
    { label: 'Platform bedeli', value: breakdown.platformFee, highlight: false },
    { label: 'İşlem bedeli (Stripe)', value: breakdown.stripeFee, highlight: false },
  ];

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm">
      <h4 className="mb-3 font-semibold text-blue-900">Ücret Detayı</h4>

      <ul className="space-y-2">
        {rows.map((row) => (
          <li
            key={row.label}
            className={`flex items-center justify-between ${
              row.highlight ? 'font-medium text-blue-800' : 'text-blue-600'
            }`}
          >
            <span>{row.label}</span>
            <span>${row.value.toFixed(2)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex items-center justify-between border-t border-blue-300 pt-3 font-bold text-blue-900">
        <span>Toplam</span>
        <span>${breakdown.totalCharge.toFixed(2)}</span>
      </div>
    </div>
  );
}
