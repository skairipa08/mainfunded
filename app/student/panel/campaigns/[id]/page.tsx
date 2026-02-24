'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Users,
  MessageCircle,
  TrendingUp,
  Calendar,
  FileEdit,
} from 'lucide-react';
import { useCurrency } from '@/lib/currency-context';

interface DonorInfo {
  donor_id: string;
  donor_name: string;
  amount: number;
  anonymous: boolean;
  created_at: string;
}

interface CampaignInfo {
  campaign_id: string;
  title: string;
  description?: string;
  status: string;
  raised_amount: number;
  goal_amount: number;
  donor_count: number;
  created_at: string;
}

export default function StudentCampaignDetailPage() {
  const { data: session } = useSession();
  const { formatAmount } = useCurrency();
  const params = useParams();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<CampaignInfo | null>(null);
  const [donors, setDonors] = useState<DonorInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [campRes, donorRes] = await Promise.all([
        fetch(`/api/campaigns/${campaignId}`),
        fetch(`/api/student/campaigns/${campaignId}/donors`),
      ]);

      if (campRes.ok) {
        const campData = await campRes.json();
        setCampaign(campData.data ?? null);
      }

      if (donorRes.ok) {
        const donorData = await donorRes.json();
        setDonors(donorData.data ?? []);
      }
    } catch {
      toast.error('Kampanya bilgileri yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    if (session && campaignId) fetchData();
  }, [session, campaignId, fetchData]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-6 w-32 mb-8" />
        <Skeleton className="h-40 w-full mb-4" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">Kampanya bulunamadı.</p>
        <Link href="/student/panel/campaigns">
          <Button className="mt-4">Kampanyalarıma Dön</Button>
        </Link>
      </div>
    );
  }

  const pct =
    campaign.goal_amount > 0
      ? Math.min(100, Math.round((campaign.raised_amount / campaign.goal_amount) * 100))
      : 0;

  const statusLabel: Record<string, string> = {
    published: 'Aktif',
    draft: 'Taslak',
    completed: 'Tamamlandı',
    suspended: 'Askıda',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back */}
      <Link href="/student/panel/campaigns" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="h-4 w-4" /> Kampanyalarıma Dön
      </Link>

      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{campaign.title}</h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
              <Badge className={campaign.status === 'published' ? 'bg-green-100 text-green-800' : campaign.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                {statusLabel[campaign.status] ?? campaign.status}
              </Badge>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(campaign.created_at).toLocaleDateString('tr-TR')}
              </span>
            </div>
          </div>
          {campaign.status === 'completed' && (
            <Link href={`/student/panel/updates?campaign=${campaign.campaign_id}`}>
              <Button size="sm">
                <FileEdit className="h-4 w-4 mr-1" /> Güncelleme Paylaş
              </Button>
            </Link>
          )}
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Bağış İlerlemesi</span>
            <span className="font-medium">{pct}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-blue-600 h-4 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-green-600 font-semibold text-lg">
              {formatAmount(campaign.raised_amount)}
            </span>
            <span className="text-gray-500">/ {formatAmount(campaign.goal_amount)}</span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" /> {campaign.donor_count} bağışçı
          </span>
          <span className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" /> {formatAmount(campaign.raised_amount)} toplandı
          </span>
        </div>
      </div>

      {/* Donors */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Bağışçılar ({donors.length})
        </h2>
        {donors.length === 0 ? (
          <p className="text-gray-500 text-sm">Henüz bağışçı yok.</p>
        ) : (
          <div className="space-y-3">
            {donors.map((d, idx) => (
              <div
                key={d.donor_id + '-' + idx}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold flex-shrink-0">
                  {d.anonymous ? '?' : d.donor_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">
                    {d.anonymous ? 'Anonim Bağışçı' : d.donor_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(d.created_at).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <span className="text-sm font-semibold text-green-600 mr-4">
                  {formatAmount(d.amount)}
                </span>
                {!d.anonymous && (
                  <Link
                    href={`/student/panel/messages?campaign=${campaignId}&donor=${d.donor_id}`}
                  >
                    <Button variant="outline" size="sm">
                      <MessageCircle className="h-4 w-4 mr-1" /> Mesaj
                    </Button>
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
