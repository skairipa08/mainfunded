'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Users, ShieldAlert, Megaphone, DollarSign, Wallet, FileText, RefreshCcw } from 'lucide-react';
import { useCurrency } from '@/lib/currency-context';
import { useTranslation } from "@/lib/i18n/context";

interface Stats {
  users: { total: number; admins: number };
  verifications: { pending: number; verified: number; rejected: number };
  campaigns: { total: number; published: number; completed: number };
  donations: { total_amount: number; total_count: number };
  subscriptions?: { active: number; paused: number; cancelled: number; mrr: number; churn_rate: number };
}

export default function AdminDashboard() {
    const { t } = useTranslation();
  const { data: session } = useSession();
  const { formatAmount } = useCurrency();
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
        <Button onClick={fetchStats}>{t('app.page.yeniden_dene')}</Button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">{t('app.page.dashboard')}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title={t('app.page.toplam_kullan_c')}
          value={stats?.users.total ?? 0}
          subtitle={`${stats?.users.admins ?? 0} admin`}
          icon={<Users className="h-5 w-5" />}
          loading={loading}
        />
        <StatCard
          title={t('app.page.bekleyen_do_rulamalar')}
          value={stats?.verifications.pending ?? 0}
          subtitle={`${stats?.verifications.verified ?? 0} doğrulandı, ${stats?.verifications.rejected ?? 0} reddedildi`}
          icon={<ShieldAlert className="h-5 w-5" />}
          loading={loading}
          valueClassName="text-yellow-600"
        />
        <StatCard
          title={t('app.page.kampanyalar')}
          value={stats?.campaigns.total ?? 0}
          subtitle={`${stats?.campaigns.published ?? 0} yayında, ${stats?.campaigns.completed ?? 0} tamamlandı`}
          icon={<Megaphone className="h-5 w-5" />}
          loading={loading}
        />
        <StatCard
          title={t('app.page.toplam_ba')}
          value={formatAmount(stats?.donations.total_amount ?? 0)}
          subtitle={`${stats?.donations.total_count ?? 0} bağış`}
          icon={<DollarSign className="h-5 w-5" />}
          loading={loading}
          valueClassName="text-green-600"
        />
        <StatCard
          title="Aktif Abonelikler"
          value={stats?.subscriptions?.active ?? 0}
          subtitle={`${stats?.subscriptions?.paused ?? 0} duraklatılmış, ${stats?.subscriptions?.cancelled ?? 0} iptal`}
          icon={<RefreshCcw className="h-5 w-5" />}
          loading={loading}
          valueClassName="text-purple-600"
        />
        <StatCard
          title="Aylık Tekrarlı Gelir"
          value={formatAmount(stats?.subscriptions?.mrr ?? 0)}
          subtitle={`Churn: %${((stats?.subscriptions?.churn_rate ?? 0) * 100).toFixed(1)}`}
          icon={<DollarSign className="h-5 w-5" />}
          loading={loading}
          valueClassName="text-indigo-600"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('app.page.h_zl_lemler')}</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/students">
            <Button><Users className="h-4 w-4 mr-2" /> {t('app.page.renci_ncele')}</Button>
          </Link>
          <Link href="/admin/campaigns">
            <Button variant="outline"><Megaphone className="h-4 w-4 mr-2" /> {t('app.page.kampanyalar')}</Button>
          </Link>
          <Link href="/admin/payouts">
            <Button variant="outline"><Wallet className="h-4 w-4 mr-2" /> {t('app.page.demeler')}</Button>
          </Link>
          <Link href="/admin/audit">
            <Button variant="outline"><FileText className="h-4 w-4 mr-2" /> {t('app.page.denetim_kay_tlar')}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
