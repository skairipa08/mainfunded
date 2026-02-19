'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Users, ShieldAlert, Megaphone, DollarSign, Wallet, FileText } from 'lucide-react';

interface Stats {
  users: { total: number; admins: number };
  verifications: { pending: number; verified: number; rejected: number };
  campaigns: { total: number; published: number; completed: number };
  donations: { total_amount: number; total_count: number };
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/stats');
      if (!response.ok) {
        throw new Error('İstatistikler yüklenemedi');
      }
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      } else {
        throw new Error(data.error?.message || 'İstatistikler yüklenemedi');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Hata oluştu';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-red-600 font-medium mb-4">{error}</p>
        <Button onClick={fetchStats}>Yeniden Dene</Button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Toplam Kullanıcı"
          value={stats?.users.total ?? 0}
          subtitle={`${stats?.users.admins ?? 0} admin`}
          icon={<Users className="h-5 w-5" />}
          loading={loading}
        />
        <StatCard
          title="Bekleyen Doğrulamalar"
          value={stats?.verifications.pending ?? 0}
          subtitle={`${stats?.verifications.verified ?? 0} doğrulandı, ${stats?.verifications.rejected ?? 0} reddedildi`}
          icon={<ShieldAlert className="h-5 w-5" />}
          loading={loading}
          valueClassName="text-yellow-600"
        />
        <StatCard
          title="Kampanyalar"
          value={stats?.campaigns.total ?? 0}
          subtitle={`${stats?.campaigns.published ?? 0} yayında, ${stats?.campaigns.completed ?? 0} tamamlandı`}
          icon={<Megaphone className="h-5 w-5" />}
          loading={loading}
        />
        <StatCard
          title="Toplam Bağış"
          value={`$${(stats?.donations.total_amount ?? 0).toLocaleString()}`}
          subtitle={`${stats?.donations.total_count ?? 0} bağış`}
          icon={<DollarSign className="h-5 w-5" />}
          loading={loading}
          valueClassName="text-green-600"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Hızlı İşlemler</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/students">
            <Button><Users className="h-4 w-4 mr-2" /> Öğrenci İncele</Button>
          </Link>
          <Link href="/admin/campaigns">
            <Button variant="outline"><Megaphone className="h-4 w-4 mr-2" /> Kampanyalar</Button>
          </Link>
          <Link href="/admin/payouts">
            <Button variant="outline"><Wallet className="h-4 w-4 mr-2" /> Ödemeler</Button>
          </Link>
          <Link href="/admin/audit">
            <Button variant="outline"><FileText className="h-4 w-4 mr-2" /> Denetim Kayıtları</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
