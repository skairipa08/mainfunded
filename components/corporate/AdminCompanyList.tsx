'use client';
import useSWR from 'swr';
import { useTranslations } from 'next-intl';
import { AdminCompanyRow } from './AdminCompanyRow';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function AdminCompanyList() {
  const t = useTranslations('admin.corporate');
  const { data, mutate } = useSWR('/api/admin/corporate/companies?status=PENDING', fetcher);
  const companies = data?.data ?? [];

  if (!data) return <p>Loading...</p>;
  if (companies.length === 0) return <p className="text-gray-600">{t('noPending')}</p>;

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b bg-gray-50">
          <th className="text-left p-2">{t('name')}</th>
          <th className="text-left p-2">{t('taxId')}</th>
          <th className="text-left p-2">{t('contactEmail')}</th>
          <th className="text-left p-2">{t('createdAt')}</th>
          <th className="text-left p-2"></th>
        </tr>
      </thead>
      <tbody>
        {companies.map((c: any) => (
          <AdminCompanyRow key={c.id} company={c} onChange={() => mutate()} />
        ))}
      </tbody>
    </table>
  );
}
