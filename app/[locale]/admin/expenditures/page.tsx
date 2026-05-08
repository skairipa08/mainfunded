'use client';

import { useCallback, useEffect, useState } from 'react';

interface ExpenditureItem {
  expenditure_id: string;
  campaign_id: string;
  campaign_title?: string;
  category: string;
  custom_category?: string;
  amount: number;
  currency: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  created_by_name: string;
  created_at: string;
  review_note?: string;
  receipt_url?: string;
}

interface ExpenditureResponse {
  items: ExpenditureItem[];
  total: number;
  page: number;
  totalPages: number;
}

function formatAmount(amount: number, currency = 'TRY') {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
  }).format(amount || 0);
}

export default function AdminExpendituresPage() {
  const [data, setData] = useState<ExpenditureResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [page, setPage] = useState(1);
  const [note, setNote] = useState('');
  const [actionTarget, setActionTarget] = useState<ExpenditureItem | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchExpenditures = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        status,
        page: String(page),
        limit: '20',
      });

      const response = await fetch(`/api/admin/expenditures?${params.toString()}`, { cache: 'no-store' });
      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.error?.message || 'Harcamalar alınamadı');
      }

      setData(result.data);
    } catch (err: any) {
      setError(err?.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    fetchExpenditures();
  }, [fetchExpenditures]);

  const openActionModal = (item: ExpenditureItem, type: 'approve' | 'reject') => {
    setActionTarget(item);
    setActionType(type);
    setNote('');
  };

  const submitAction = async () => {
    if (!actionTarget || !actionType) return;
    setActionLoading(true);

    try {
      const response = await fetch(`/api/admin/expenditures/${actionTarget.expenditure_id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionType,
          note,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result?.success) {
        throw new Error(result?.error?.message || 'İşlem başarısız');
      }

      setActionTarget(null);
      setActionType(null);
      setNote('');
      await fetchExpenditures();
    } catch (err: any) {
      alert(err?.message || 'İşlem başarısız');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-gray-900">Harcama Onay Paneli</h2>
        <button
          onClick={fetchExpenditures}
          className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-sm"
        >
          Yenile
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4 flex gap-2 flex-wrap">
        {(['pending', 'approved', 'rejected'] as const).map((itemStatus) => (
          <button
            key={itemStatus}
            onClick={() => {
              setStatus(itemStatus);
              setPage(1);
            }}
            className={`px-3 py-1.5 text-sm rounded-full ${status === itemStatus ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            {itemStatus === 'pending' ? 'Bekleyen' : itemStatus === 'approved' ? 'Onaylanan' : 'Reddedilen'}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kampanya</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kalem</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tutar</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ekleyen</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Belge</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksiyon</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.items?.length ? data.items.map((item) => (
                <tr key={item.expenditure_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900 max-w-[260px] truncate">{item.campaign_title || item.campaign_id}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <div className="font-medium">{item.custom_category || item.category}</div>
                    <div className="text-xs text-gray-500 max-w-[240px] truncate">{item.description}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-semibold">{formatAmount(item.amount, item.currency || 'TRY')}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.created_by_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(item.created_at).toLocaleDateString('tr-TR')}</td>
                  <td className="px-4 py-3 text-sm">
                    {item.receipt_url ? (
                      <a href={item.receipt_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                        Gör
                      </a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {item.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => openActionModal(item, 'approve')}
                          className="px-2.5 py-1 rounded bg-green-600 hover:bg-green-700 text-white"
                        >
                          Onayla
                        </button>
                        <button
                          onClick={() => openActionModal(item, 'reject')}
                          className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-700 text-white"
                        >
                          Reddet
                        </button>
                      </div>
                    ) : (
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${item.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>
                        {item.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}
                      </span>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">Kayıt bulunamadı.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Toplam {data.total} kayıt</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-sm bg-gray-100 rounded disabled:opacity-50"
            >
              Önceki
            </button>
            <span className="px-3 py-1 text-sm">{page} / {data.totalPages}</span>
            <button
              onClick={() => setPage((prev) => Math.min(data.totalPages, prev + 1))}
              disabled={page >= data.totalPages}
              className="px-3 py-1 text-sm bg-gray-100 rounded disabled:opacity-50"
            >
              Sonraki
            </button>
          </div>
        </div>
      )}

      {actionTarget && actionType && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-5 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-3">
              {actionType === 'approve' ? 'Harcamayı Onayla' : 'Harcamayı Reddet'}
            </h3>
            <p className="text-sm text-gray-600 mb-3">{actionTarget.custom_category || actionTarget.category} • {formatAmount(actionTarget.amount, actionTarget.currency || 'TRY')}</p>
            <label className="text-sm font-medium text-gray-700 block mb-1">Not</label>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
              className="w-full border rounded-md p-2 text-sm"
              placeholder={actionType === 'reject' ? 'Reddetme gerekçesini yazın' : 'Opsiyonel onay notu'}
            />

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setActionTarget(null);
                  setActionType(null);
                }}
                className="px-4 py-2 text-sm rounded border"
                disabled={actionLoading}
              >
                İptal
              </button>
              <button
                onClick={submitAction}
                disabled={actionLoading}
                className={`px-4 py-2 text-sm rounded text-white ${actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} disabled:opacity-50`}
              >
                {actionLoading ? 'İşleniyor...' : actionType === 'approve' ? 'Onayla' : 'Reddet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
