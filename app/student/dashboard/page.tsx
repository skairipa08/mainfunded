'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Wallet, TrendingUp, Clock, DollarSign, Plus, ExternalLink } from 'lucide-react';

interface BalanceData {
  totalEarned: number;
  totalWithdrawn: number;
  available: number;
  pending: number;
}

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
  anonymous: boolean;
  created_at: string;
  campaign_id: string;
}

export default function StudentDashboardPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [recentDonations, setRecentDonations] = useState<DonationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [balRes, campRes] = await Promise.all([
        fetch('/api/student/balance'),
        fetch('/api/campaigns/my'),
      ]);

      if (!balRes.ok) throw new Error('Bakiye yüklenemedi');
      if (!campRes.ok) throw new Error('Kampanyalar yüklenemedi');

      const balData = await balRes.json();
      const campData = await campRes.json();

      setBalance(balData.data);
      setCampaigns(campData.data ?? []);

      // Fetch recent donations across user's campaigns
      const campaignIds: string[] = (campData.data ?? []).map((c: CampaignItem) => c.campaign_id);
      if (campaignIds.length > 0) {
        try {
          const donRes = await fetch(`/api/donations/my`);
          if (donRes.ok) {
            const donData = await donRes.json();
            setRecentDonations((donData.data ?? []).slice(0, 10));
          }
        } catch {
          // non-critical
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Veri yüklenemedi';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authStatus === 'loading') return;
    if (!session) {
      router.replace('/login');
      return;
    }
    fetchData();
  }, [session, authStatus, router, fetchData]);

  if (authStatus === 'loading') {
    return <DashboardSkeleton />;
  }

  if (!session) return null;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <Button onClick={fetchData}>Yeniden Dene</Button>
        </div>
      </div>
    );
  }

  const statusColor: Record<string, string> = {
    published: 'bg-green-100 text-green-800',
    draft: 'bg-gray-100 text-gray-800',
    completed: 'bg-blue-100 text-blue-800',
    suspended: 'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Öğrenci Paneli</h1>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Link href="/student/dashboard/payout">
              <Button variant="outline" size="sm"><Wallet className="h-4 w-4 mr-1" /> Ödeme Yöntemleri</Button>
            </Link>
            <Link href="/campaigns/new">
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Yeni Kampanya</Button>
            </Link>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Toplam Kazanç"
            value={`$${(balance?.totalEarned ?? 0).toLocaleString()}`}
            icon={<TrendingUp className="h-5 w-5" />}
            loading={loading}
            valueClassName="text-green-600"
          />
          <StatCard
            title="Kullanılabilir Bakiye"
            value={`$${(balance?.available ?? 0).toLocaleString()}`}
            icon={<DollarSign className="h-5 w-5" />}
            loading={loading}
            valueClassName="text-blue-600"
          />
          <StatCard
            title="Beklemede"
            value={`$${(balance?.pending ?? 0).toLocaleString()}`}
            subtitle="(son 14 gün)"
            icon={<Clock className="h-5 w-5" />}
            loading={loading}
            valueClassName="text-yellow-600"
          />
          <StatCard
            title="Çekilen Toplam"
            value={`$${(balance?.totalWithdrawn ?? 0).toLocaleString()}`}
            icon={<Wallet className="h-5 w-5" />}
            loading={loading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Campaigns */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Kampanyalarım</h2>
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
            ) : campaigns.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500 mb-4">Henüz kampanyanız yok</p>
                <Link href="/campaigns/new">
                  <Button><Plus className="h-4 w-4 mr-1" /> İlk Kampanyanızı Oluşturun</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {campaigns.map((c) => {
                  const pct = c.goal_amount > 0 ? Math.min(100, Math.round((c.raised_amount / c.goal_amount) * 100)) : 0;
                  return (
                    <Link key={c.campaign_id} href={`/campaign/${c.campaign_id}`} className="block">
                      <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">{c.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              ${c.raised_amount.toLocaleString()} / ${c.goal_amount.toLocaleString()} &middot; {c.donor_count} bağışçı
                            </p>
                          </div>
                          <Badge className={statusColor[c.status] ?? 'bg-gray-100 text-gray-800'}>
                            {c.status}
                          </Badge>
                        </div>
                        <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Donations */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Son Bağışlar</h2>
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
                <p className="text-gray-500">Henüz bağış yok</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentDonations.map((d) => (
                  <div key={d.donation_id} className="bg-white rounded-lg shadow p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {d.anonymous ? 'Anonim' : d.donor_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(d.created_at).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-green-600">
                      +${d.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Skeleton className="h-9 w-48 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <Skeleton className="h-4 w-28 mb-3" />
              <Skeleton className="h-8 w-24 mb-1" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
