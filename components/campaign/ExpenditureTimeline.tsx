'use client';

import { useEffect, useMemo, useState } from 'react';
import { Calendar, ReceiptText, Wallet } from 'lucide-react';

interface ExpenditureItem {
  expenditure_id: string;
  category: string;
  custom_category?: string;
  amount: number;
  currency: string;
  description: string;
  created_at: string;
  published_at?: string;
  receipt_url?: string;
}

interface ExpenditurePayload {
  summary: {
    raised_amount: number;
    spent_amount: number;
    remaining_amount: number;
  };
  expenditures: ExpenditureItem[];
}

function formatMoney(amount: number, currency = 'TRY') {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

export default function ExpenditureTimeline({ campaignId }: { campaignId: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<ExpenditurePayload | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/expenditures?campaign_id=${encodeURIComponent(campaignId)}`, {
          cache: 'no-store',
        });

        const result = await response.json();

        if (!response.ok || !result?.success) {
          throw new Error(result?.error?.message || 'Harcama verileri yüklenemedi');
        }

        if (!mounted) return;
        setPayload(result.data);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || 'Bir hata oluştu');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [campaignId]);

  const currency = useMemo(() => {
    const first = payload?.expenditures?.[0]?.currency;
    return first || 'TRY';
  }, [payload?.expenditures]);

  if (loading) {
    return (
      <div className="bg-white border rounded-2xl p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Harcama Takibi</h3>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  const summary = payload?.summary || {
    raised_amount: 0,
    spent_amount: 0,
    remaining_amount: 0,
  };
  const expenditures = payload?.expenditures || [];

  return (
    <section className="bg-white border rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Harcama Takibi</h3>

      <div className="grid md:grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border p-4 bg-gray-50">
          <p className="text-xs text-gray-500 mb-1">Toplanan</p>
          <p className="text-lg font-bold text-gray-900">{formatMoney(summary.raised_amount, currency)}</p>
        </div>
        <div className="rounded-xl border p-4 bg-gray-50">
          <p className="text-xs text-gray-500 mb-1">Harcanan</p>
          <p className="text-lg font-bold text-gray-900">{formatMoney(summary.spent_amount, currency)}</p>
        </div>
        <div className="rounded-xl border p-4 bg-gray-50">
          <p className="text-xs text-gray-500 mb-1">Kalan</p>
          <p className="text-lg font-bold text-gray-900">{formatMoney(summary.remaining_amount, currency)}</p>
        </div>
      </div>

      {expenditures.length === 0 ? (
        <div className="text-sm text-gray-500 bg-gray-50 border rounded-xl p-4">
          Henüz onaylanmış harcama kalemi bulunmuyor.
        </div>
      ) : (
        <div className="space-y-4">
          {expenditures.map((item) => {
            const categoryLabel = item.custom_category || item.category;
            const dateLabel = new Date(item.published_at || item.created_at).toLocaleDateString('tr-TR');

            return (
              <div key={item.expenditure_id} className="border rounded-xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">{categoryLabel}</p>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  </div>
                  <p className="font-semibold text-gray-900 whitespace-nowrap">{formatMoney(item.amount, item.currency || currency)}</p>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {dateLabel}
                  </span>

                  {item.receipt_url && (
                    <a
                      href={item.receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
                    >
                      <ReceiptText className="h-3.5 w-3.5" />
                      Belgeyi Gör
                    </a>
                  )}

                  <span className="inline-flex items-center gap-1 text-green-700">
                    <Wallet className="h-3.5 w-3.5" />
                    Onaylandı
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
