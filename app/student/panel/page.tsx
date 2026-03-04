'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Megaphone,
  TrendingUp,
  Users,
  MessageCircle,
  Plus,
  ArrowRight,
  FileEdit,
} from 'lucide-react';
import { useCurrency } from '@/lib/currency-context';
import { useTranslation } from "@/lib/i18n/context";

interface CampaignItem {
  campaign_id: string;
  title: string;
  status: string;
  raised_amount: number;
  goal_amount: number;
  donor_count: number;
  created_at: string;
}

interface DonationItem {
  donation_id: string;
  amount: number;
  donor_name: string;
  donor_id: string;
  anonymous: boolean;
  created_at: string;
  campaign_title?: string;
}

export default function StudentPanelPage() {
    const { t } = useTranslation();
  const { data: session } = useSession();
  const { formatAmount } = useCurrency();

  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [recentDonations, setRecentDonations] = useState<DonationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [campRes, msgRes] = await Promise.all([
        fetch('/api/campaigns/my'),
        fetch('/api/student/messages/unread-count'),
      ]);

      if (campRes.ok) {
        const campData = await campRes.json();
        setCampaigns(campData.data ?? []);
      }

      if (msgRes.ok) {
        const msgData = await msgRes.json();
        setUnreadMessages(msgData.data?.count ?? 0);
      }

      // Fetch donations for student's campaigns
      try {
        const donRes = await fetch('/api/student/donations');
        if (donRes.ok) {
          const donData = await donRes.json();
          setRecentDonations((donData.data ?? []).slice(0, 5));
        }
      } catch {}
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Veri yüklenemedi';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) fetchData();
  }, [session, fetchData]);

  const activeCampaigns = campaigns.filter((c) => c.status === 'published');
  const completedCampaigns = campaigns.filter((c) => c.status === 'completed');
  const totalRaised = campaigns.reduce((sum, c) => sum + (c.raised_amount || 0), 0);
  const totalDonors = campaigns.reduce((sum, c) => sum + (c.donor_count || 0), 0);

  const statusColor: Record<string, string> = {
    published: 'bg-green-100 text-green-800',
    draft: 'bg-gray-100 text-gray-800',
    completed: 'bg-blue-100 text-blue-800',
    suspended: 'bg-red-100 text-red-800',
  };

  const statusLabel: Record<string, string> = {
    published: 'Aktif',
    draft: 'Taslak',
    completed: 'Tamamlandı',
    suspended: 'Askıda',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('app.page.ho_geldiniz')}</h1>
          <p className="text-gray-500 mt-1">
            {t('app.page.kampanyalar_n_z_y_netin_ba_lar')}</p>
        </div>
        <Link href="/campaigns/new" className="mt-4 sm:mt-0">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" /> {t('app.page.yeni_kampanya')}</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          icon={<Megaphone className="h-5 w-5 text-blue-600" />}
          title={t('app.page.aktif_kampanyalar')}
          value={loading ? '—' : String(activeCampaigns.length)}
          loading={loading}
        />
        <StatsCard
          icon={<TrendingUp className="h-5 w-5 text-green-600" />}
          title={t('app.page.toplam_toplanan')}
          value={loading ? '—' : formatAmount(totalRaised)}
          loading={loading}
        />
        <StatsCard
          icon={<Users className="h-5 w-5 text-purple-600" />}
          title={t('app.page.toplam_ba')}
          value={loading ? '—' : String(totalDonors)}
          loading={loading}
        />
        <StatsCard
          icon={<MessageCircle className="h-5 w-5 text-orange-600" />}
          title={t('app.page.okunmam_mesaj')}
          value={loading ? '—' : String(unreadMessages)}
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Campaigns */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">{t('app.page.aktif_kampanyalar_m')}</h2>
            <Link href="/student/panel/campaigns">
              <Button variant="ghost" size="sm">
                {t('app.page.t_m_n_g_r')}<ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow p-4">
                  <Skeleton className="h-5 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-1/3 mb-2" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))}
            </div>
          ) : activeCampaigns.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Megaphone className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">{t('app.page.hen_z_aktif_kampanyan_z_yok')}</p>
              <Link href="/campaigns/new">
                <Button>
                  <Plus className="h-4 w-4 mr-1" /> {t('app.page.lk_kampanyan_z_olu_turun')}</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {activeCampaigns.slice(0, 5).map((c) => {
                const pct =
                  c.goal_amount > 0
                    ? Math.min(100, Math.round((c.raised_amount / c.goal_amount) * 100))
                    : 0;
                return (
                  <Link
                    key={c.campaign_id}
                    href={`/student/panel/campaigns/${c.campaign_id}`}
                    className="block"
                  >
                    <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{c.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {formatAmount(c.raised_amount)} / {formatAmount(c.goal_amount)} &middot;{' '}
                            {c.donor_count} {t('app.page.ba')}</p>
                        </div>
                        <Badge className={statusColor[c.status] ?? 'bg-gray-100 text-gray-800'}>
                          {statusLabel[c.status] ?? c.status}
                        </Badge>
                      </div>
                      <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1 text-right">{pct}%</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Completed campaigns with update prompt */}
          {completedCampaigns.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold text-gray-900">{t('app.page.tamamlanan_kampanyalar')}</h2>
                <Link href="/student/panel/updates">
                  <Button variant="ghost" size="sm">
                    {t('app.page.g_ncelleme_payla')}<FileEdit className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
              <div className="space-y-3">
                {completedCampaigns.slice(0, 3).map((c) => (
                  <div
                    key={c.campaign_id}
                    className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{c.title}</h3>
                        <p className="text-sm text-gray-500">
                          {formatAmount(c.raised_amount)} {t('app.page.topland_middot')}{c.donor_count} {t('app.page.ba')}</p>
                      </div>
                      <Link href={`/student/panel/updates?campaign=${c.campaign_id}`}>
                        <Button variant="outline" size="sm">
                          <FileEdit className="h-4 w-4 mr-1" /> {t('app.page.g_ncelleme')}</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Recent Donations */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">{t('app.page.son_ba_lar')}</h2>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow p-3">
                  <Skeleton className="h-4 w-1/2 mb-1" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              ))}
            </div>
          ) : recentDonations.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">{t('app.page.hen_z_ba_yok')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentDonations.map((d) => (
                <div
                  key={d.donation_id}
                  className="bg-white rounded-lg shadow p-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {d.anonymous ? 'Anonim Bağışçı' : d.donor_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {d.campaign_title && (
                        <span className="text-blue-600">{d.campaign_title} &middot; </span>
                      )}
                      {new Date(d.created_at).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-green-600">
                    +{formatAmount(d.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Quick Links */}
          <div className="bg-white rounded-lg shadow p-4 space-y-3">
            <h3 className="font-medium text-gray-900">{t('app.page.h_zl_eri_im')}</h3>
            <Link
              href="/student/panel/messages"
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
            >
              <MessageCircle className="h-4 w-4" />
              {t('app.page.ba_lar_n_za_mesaj_g_nderin')}{unreadMessages > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {unreadMessages}
                </span>
              )}
            </Link>
            <Link
              href="/student/panel/updates"
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
            >
              <FileEdit className="h-4 w-4" />
              {t('app.page.g_ncelleme_ve_foto_raf_payla_n')}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({
  icon,
  title,
  value,
  loading,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  loading: boolean;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <span className="text-sm text-gray-500">{title}</span>
      </div>
      {loading ? (
        <Skeleton className="h-8 w-20" />
      ) : (
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      )}
    </div>
  );
}
