'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

type Tx = {
  id: string;
  donorUserId: string;
  donationAmountTRY: number;
  matchedAmountTRY: number;
  category: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectReason?: string | null;
  createdAt: string;
};

export function TransactionRow({ tx, onChange }: { tx: Tx; onChange: () => void }) {
  const t = useTranslations('corporateP2.transactions');
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function decide(decision: 'APPROVE' | 'REJECT', body: any = {}) {
    setSubmitting(true);
    const res = await fetch(`/api/corporate/transactions/${tx.id}/decide`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, ...body }),
    });
    const json = await res.json();
    setSubmitting(false);
    if (!json.success) {
      toast.error(json.error);
      return;
    }
    toast.success(decision === 'APPROVE' ? 'Onaylandı' : 'Reddedildi');
    setRejectOpen(false);
    setReason('');
    onChange();
  }

  return (
    <>
      <tr className="border-b">
        <td className="p-2 font-mono text-xs">{tx.donorUserId.slice(-8)}</td>
        <td className="p-2">{tx.donationAmountTRY.toLocaleString('tr-TR')} TL</td>
        <td className="p-2">{tx.matchedAmountTRY.toLocaleString('tr-TR')} TL</td>
        <td className="p-2">{tx.category}</td>
        <td className="p-2">{new Date(tx.createdAt).toLocaleDateString('tr-TR')}</td>
        <td className="p-2">
          {tx.status === 'PENDING' ? (
            <div className="flex gap-2">
              <button
                onClick={() => decide('APPROVE')}
                disabled={submitting}
                className="rounded-md bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700 disabled:opacity-50"
              >
                {t('approve')}
              </button>
              <button
                onClick={() => setRejectOpen(true)}
                disabled={submitting}
                className="rounded-md bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700 disabled:opacity-50"
              >
                {t('reject')}
              </button>
            </div>
          ) : (
            <span
              className={`rounded-md px-2 py-1 text-xs ${
                tx.status === 'APPROVED'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {tx.status}
              {tx.rejectReason ? ` (${tx.rejectReason})` : ''}
            </span>
          )}
        </td>
      </tr>

      {rejectOpen && (
        <tr>
          <td colSpan={6}>
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
              onClick={() => setRejectOpen(false)}
            >
              <div
                className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold mb-4">{t('rejectReason')}</h3>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2 text-sm"
                  rows={4}
                />
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
                    onClick={() => {
                      setRejectOpen(false);
                      setReason('');
                    }}
                  >
                    İptal
                  </button>
                  <button
                    className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                    disabled={!reason.trim() || submitting}
                    onClick={() => decide('REJECT', { reason: reason.trim() })}
                  >
                    {t('reject')}
                  </button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
