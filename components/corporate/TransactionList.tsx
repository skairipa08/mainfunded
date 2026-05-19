'use client';
import useSWR from 'swr';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { TransactionRow } from './TransactionRow';

const fetcher = (url: string) => fetch(url).then((r) => r.json());
type Status = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL';

export function TransactionList() {
  const t = useTranslations('corporateP2.transactions');
  const [status, setStatus] = useState<Status>('PENDING');
  const url =
    status === 'ALL'
      ? '/api/corporate/transactions'
      : `/api/corporate/transactions?status=${status}`;
  const { data, mutate } = useSWR(url, fetcher);
  const txs = data?.data ?? [];

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as Status[]).map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`rounded-md px-3 py-1 text-sm ${
              status === s ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {t(s.toLowerCase() as any)}
          </button>
        ))}
      </div>

      {!data ? (
        <p>Loading...</p>
      ) : txs.length === 0 ? (
        <p className="text-gray-600">{t('noTransactions')}</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-2">{t('donor')}</th>
              <th className="text-left p-2">{t('amount')}</th>
              <th className="text-left p-2">{t('matched')}</th>
              <th className="text-left p-2">{t('category')}</th>
              <th className="text-left p-2">{t('date')}</th>
              <th className="text-left p-2"></th>
            </tr>
          </thead>
          <tbody>
            {txs.map((tx: any) => (
              <TransactionRow key={tx.id} tx={tx} onChange={() => mutate()} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
