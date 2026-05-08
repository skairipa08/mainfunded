'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

type Props = {
  company: {
    id: string;
    name: string;
    taxId: string;
    contactEmail: string;
    createdAt: string;
  };
  onChange: () => void;
};

export function AdminCompanyRow({ company, onChange }: Props) {
  const t = useTranslations('admin.corporate');
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function decide(decision: 'APPROVE' | 'REJECT', body: any = {}) {
    setSubmitting(true);
    const res = await fetch(`/api/admin/corporate/companies/${company.id}/approve`, {
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
        <td className="p-2">{company.name}</td>
        <td className="p-2">{company.taxId}</td>
        <td className="p-2">{company.contactEmail}</td>
        <td className="p-2">{new Date(company.createdAt).toLocaleDateString('tr-TR')}</td>
        <td className="p-2">
          <div className="flex gap-2">
            <button
              className="rounded-md bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700 disabled:opacity-50"
              onClick={() => decide('APPROVE')}
              disabled={submitting}
            >
              {t('approve')}
            </button>
            <button
              className="rounded-md bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700 disabled:opacity-50"
              onClick={() => setRejectOpen(true)}
              disabled={submitting}
            >
              {t('reject')}
            </button>
          </div>
        </td>
      </tr>

      {rejectOpen && (
        <tr>
          <td colSpan={5}>
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
                  placeholder="Açıklama yazınız"
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
