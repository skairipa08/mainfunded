'use client';

import { useEffect, useState } from 'react';
import { Infinity, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { EvergreenCampaignCard, EvergreenCampaignCardProps } from './campaign/EvergreenCampaignCard';
import { cn } from '@/lib/utils';

interface OngoingSupportsProps {
  /** Optional server-passed initial data to avoid extra client fetch */
  initialCampaigns?: EvergreenCampaignCardProps[];
  className?: string;
}

/**
 * "Devam Eden Destekler" — Homepage section that lists all evergreen campaigns.
 * Falls back to client-side fetch if no initialCampaigns are supplied.
 */
export function OngoingSupports({ initialCampaigns, className }: OngoingSupportsProps) {
  const [campaigns, setCampaigns] = useState<EvergreenCampaignCardProps[]>(initialCampaigns ?? []);
  const [loading, setLoading] = useState(!initialCampaigns);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialCampaigns) return; // already have data from server

    async function fetchEvergreen() {
      try {
        const res = await fetch('/api/campaigns?status=evergreen&limit=6', { cache: 'no-store' });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || 'API error');
        setCampaigns(json.data ?? []);
      } catch (err: any) {
        setError(err.message ?? 'Yüklenemedi');
      } finally {
        setLoading(false);
      }
    }

    fetchEvergreen();
  }, [initialCampaigns]);

  if (loading) {
    return (
      <section className={cn('py-12 bg-teal-50', className)}>
        <div className="container mx-auto px-4">
          <SectionHeader />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-72 rounded-2xl bg-teal-100 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || campaigns.length === 0) return null; // gracefully hide section

  return (
    <section className={cn('py-14 bg-teal-50', className)}>
      <div className="container mx-auto px-4">
        <SectionHeader />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {campaigns.map((campaign) => (
            <EvergreenCampaignCard key={campaign.campaign_id} {...campaign} />
          ))}
        </div>

        {/* View all link */}
        <div className="mt-10 flex justify-center">
          <Link
            href="/campaigns?status=evergreen"
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-6 py-3',
              'bg-teal-600 text-white font-semibold text-sm',
              'hover:bg-teal-700 transition-colors shadow-md'
            )}
          >
            Tüm Devam Eden Destekleri Gör
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function SectionHeader() {
  return (
    <div className="flex flex-col items-center text-center gap-3">
      {/* Icon + Heading */}
      <div className="flex items-center gap-2 text-teal-700">
        <Infinity className="w-7 h-7" />
        <h2 className="text-2xl font-bold tracking-tight">Devam Eden Destekler</h2>
      </div>
      <p className="max-w-xl text-gray-600 text-sm">
        Bu kampanyalar süreleri dolmuş olsa da bağış kabul etmeye devam ediyor.
        Katkıda bulunmak için aşağıdaki öğrencilerden birini seçebilirsiniz.
      </p>
    </div>
  );
}
