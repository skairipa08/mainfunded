'use client';

import { useEffect, useState, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatCard } from '@/components/ui/StatCard';
import { toast } from 'sonner';
import { DollarSign, Clock, CheckCircle, XCircle, RefreshCw, Send } from 'lucide-react';

interface PayoutSummary {
  method_type: string;
  total_students: number;
  total_available: number;
}

interface PendingPayout {
  user_id: string;
  student_name: string;
  email: string;
  method_type: string;
  method_details: Record<string, string>;
  available: number;
  totalEarned: number;
  totalWithdrawn: number;
}

export default function AdminPayoutsPage() {
  const [summaries, setSummaries] = useState<PayoutSummary[]>([]);
  const [pendingPayouts, setPendingPayouts] = useState<PendingPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [payoutAmounts, setPayoutAmounts] = useState<Record<string, string>>({});

  const fetchPayouts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/payouts');
      if (!res.ok) throw new Error('Ödeme verileri yüklenemedi');
      const data = await res.json();
      setSummaries(data.data?.summaries ?? []);
      setPendingPayouts(data.data?.pending ?? []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Hata oluştu';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayouts();
  }, [fetchPayouts]);

  const handleProcessPayout = async (payout: PendingPayout) => {
    const amountStr = payoutAmounts[payout.user_id];
    const amount = parseFloat(amountStr);
    if (!amount || amount <= 0 || amount > payout.available) {
      toast.error(`Geçerli bir tutar girin (maks. $${payout.available})`);
      return;
    }

    setProcessingId(payout.user_id);
    try {
      const res = await fetch('/api/admin/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: payout.user_id,
          amount,
          method_type: payout.method_type,
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error ?? 'Ödeme işlenemedi');
      }
      toast.success(`$${amount} ödeme başarıyla işlendi`);
      setPayoutAmounts((prev) => ({ ...prev, [payout.user_id]: '' }));
      await fetchPayouts();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Hata oluştu');
    } finally {
      setProcessingId(null);
    }
  };

  const totalAvailable = summaries.reduce((sum, s) => sum + s.total_available, 0);
  const totalStudents = summaries.reduce((sum, s) => sum + s.total_students, 0);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-red-600 font-medium mb-4">{error}</p>
        <Button onClick={fetchPayouts}><RefreshCw className="h-4 w-4 mr-2" /> Yeniden Dene</Button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Ödemeler</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Toplam Bekleyen Bakiye"
          value={`$${totalAvailable.toLocaleString()}`}
          icon={<DollarSign className="h-5 w-5" />}
          loading={loading}
          valueClassName="text-green-600"
        />
        <StatCard
          title="Ödeme Bekleyen Öğrenci"
          value={totalStudents}
          icon={<Clock className="h-5 w-5" />}
          loading={loading}
          valueClassName="text-yellow-600"
        />
        <StatCard
          title="Ödeme Yöntemleri"
          value={summaries.length}
          subtitle={summaries.map((s) => s.method_type).join(', ')}
          icon={<CheckCircle className="h-5 w-5" />}
          loading={loading}
        />
      </div>

      {/* Method Breakdown */}
      {!loading && summaries.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Yönteme Göre Dağılım</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {summaries.map((s) => (
              <div key={s.method_type} className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">{s.method_type}</p>
                <p className="text-xl font-bold text-gray-900">${s.total_available.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{s.total_students} öğrenci</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Payouts Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Bekleyen Ödemeler</h3>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-44" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-8 w-28 ml-auto" />
              </div>
            ))}
          </div>
        ) : pendingPayouts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">Bekleyen ödeme yok</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Öğrenci</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">E-posta</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Yöntem</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Detay</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Bakiye</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tutar</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pendingPayouts.map((p) => (
                  <tr key={p.user_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {p.student_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className="capitalize">{p.method_type}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {Object.values(p.method_details).join(' · ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-green-600">
                      ${p.available.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Input
                        type="number"
                        placeholder="Tutar"
                        className="w-28 text-right"
                        min={1}
                        max={p.available}
                        value={payoutAmounts[p.user_id] ?? ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setPayoutAmounts((prev) => ({ ...prev, [p.user_id]: e.target.value }))
                        }
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Button
                        size="sm"
                        onClick={() => handleProcessPayout(p)}
                        disabled={processingId === p.user_id}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        {processingId === p.user_id ? 'İşleniyor...' : 'Gönder'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
