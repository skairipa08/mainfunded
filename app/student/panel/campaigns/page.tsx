'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Plus,
  Users,
  TrendingUp,
  MessageCircle,
  Eye,
} from 'lucide-react';
import { useCurrency } from '@/lib/currency-context';

interface DonorInfo {
  donor_id: string;
  donor_name: string;
  amount: number;
  anonymous: boolean;
  created_at: string;
}

interface CampaignDetail {
  campaign_id: string;
  title: string;
  description?: string;
  status: string;
  raised_amount: number;
  goal_amount: number;
  donor_count: number;
  created_at: string;
  donors?: DonorInfo[];
}

export default function StudentCampaignsPage() {
  const { data: session } = useSession();
  const { formatAmount } = useCurrency();

  const [campaigns, setCampaigns] = useState<CampaignDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);
  const [donorLoading, setDonorLoading] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/campaigns/my');
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.data ?? []);
      }
    } catch {
      toast.error('Kampanyalar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) fetchCampaigns();
  }, [session, fetchCampaigns]);

  const loadDonors = async (campaignId: string) => {
    if (expandedCampaign === campaignId) {
      setExpandedCampaign(null);
      return;
    }
    setExpandedCampaign(campaignId);
    setDonorLoading(campaignId);
    try {
      const res = await fetch(`/api/student/campaigns/${campaignId}/donors`);
      if (res.ok) {
        const data = await res.json();
        setCampaigns((prev) =>
          prev.map((c) =>
            c.campaign_id === campaignId ? { ...c, donors: data.data ?? [] } : c,
          ),
        );
      }
    } catch {
      toast.error('Bağışçılar yüklenemedi');
    } finally {
      setDonorLoading(null);
    }
  };

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
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/student/panel">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> Geri
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Kampanyalarım</h1>
          <p className="text-gray-500 text-sm">
            Tüm kampanyalarınızı görün, bağışçılarınızı takip edin.
          </p>
        </div>
        <Link href="/campaigns/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" /> Yeni Kampanya
          </Button>
        </Link>
      </div>

      {/* Campaign List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <Skeleton className="h-6 w-2/3 mb-3" />
              <Skeleton className="h-4 w-1/3 mb-2" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-16 text-center">
          <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-4">Henüz kampanyanız yok</p>
          <Link href="/campaigns/new">
            <Button>
              <Plus className="h-4 w-4 mr-1" /> İlk Kampanyanızı Oluşturun
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((c) => {
            const pct =
              c.goal_amount > 0
                ? Math.min(100, Math.round((c.raised_amount / c.goal_amount) * 100))
                : 0;
            const isExpanded = expandedCampaign === c.campaign_id;

            return (
              <div key={c.campaign_id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {c.title}
                        </h3>
                        <Badge className={statusColor[c.status] ?? 'bg-gray-100 text-gray-800'}>
                          {statusLabel[c.status] ?? c.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        Oluşturulma: {new Date(c.created_at).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/campaign/${c.campaign_id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" /> Görüntüle
                        </Button>
                      </Link>
                      {c.status === 'completed' && (
                        <Link href={`/student/panel/updates?campaign=${c.campaign_id}`}>
                          <Button variant="outline" size="sm">
                            Güncelleme Paylaş
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">İlerleme</span>
                      <span className="font-medium text-gray-900">{pct}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-green-600 font-medium">
                        {formatAmount(c.raised_amount)}
                      </span>
                      <span className="text-gray-500">/ {formatAmount(c.goal_amount)}</span>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" /> {c.donor_count} bağışçı
                    </span>
                    <button
                      onClick={() => loadDonors(c.campaign_id)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <Users className="h-4 w-4" />
                      {isExpanded ? 'Bağışçıları Gizle' : 'Bağışçıları Göster'}
                    </button>
                    <Link
                      href={`/student/panel/messages?campaign=${c.campaign_id}`}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <MessageCircle className="h-4 w-4" /> Mesaj Gönder
                    </Link>
                  </div>
                </div>

                {/* Expanded Donors List */}
                {isExpanded && (
                  <div className="border-t bg-gray-50 p-6">
                    <h4 className="font-medium text-gray-900 mb-3">Bağışçılar</h4>
                    {donorLoading === c.campaign_id ? (
                      <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-center gap-3">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-16 ml-auto" />
                          </div>
                        ))}
                      </div>
                    ) : !c.donors || c.donors.length === 0 ? (
                      <p className="text-gray-500 text-sm">Henüz bağışçı yok.</p>
                    ) : (
                      <div className="space-y-2">
                        {c.donors.map((d, idx) => (
                          <div
                            key={d.donor_id + '-' + idx}
                            className="flex items-center gap-3 bg-white rounded-lg p-3"
                          >
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm flex-shrink-0">
                              {d.anonymous ? '?' : d.donor_name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">
                                {d.anonymous ? 'Anonim Bağışçı' : d.donor_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(d.created_at).toLocaleDateString('tr-TR')}
                              </p>
                            </div>
                            <span className="text-sm font-semibold text-green-600">
                              {formatAmount(d.amount)}
                            </span>
                            {!d.anonymous && (
                              <Link
                                href={`/student/panel/messages?campaign=${c.campaign_id}&donor=${d.donor_id}`}
                              >
                                <Button variant="ghost" size="sm" className="text-blue-600">
                                  <MessageCircle className="h-4 w-4" />
                                </Button>
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
