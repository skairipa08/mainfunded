'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DonationCalendar from '@/components/calendar/DonationCalendar';
import { Loader2, CalendarDays } from 'lucide-react';
import type { Metadata } from 'next';

interface DonationRecord {
  id: string;
  date: string;
  amount: number;
  campaignTitle?: string;
  campaignSlug?: string;
}

interface CampaignRecord {
  id: string;
  title: string;
  endDate: string;
  raised?: number;
  goal?: number;
  slug?: string;
}

export default function CalendarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/calendar');
      return;
    }
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status, router]);

  async function fetchData() {
    setLoading(true);
    try {
      const [donationsRes, campaignsRes] = await Promise.all([
        fetch('/api/donations/my?limit=100').catch(() => null),
        fetch('/api/campaigns?status=active&limit=20').catch(() => null),
      ]);

      if (donationsRes?.ok) {
        const data = await donationsRes.json();
        const mapped: DonationRecord[] = (data.donations ?? []).map(
          (d: any) => ({
            id: d.donation_id ?? d._id ?? d.id,
            date: d.created_at ?? d.date,
            amount: d.amount ?? 0,
            campaignTitle: d.campaign?.title,
            campaignSlug: d.campaign?.campaign_id,
          })
        );
        setDonations(mapped);
      }

      if (campaignsRes?.ok) {
        const data = await campaignsRes.json();
        const mapped: CampaignRecord[] = (data.campaigns ?? []).map(
          (c: any) => ({
            id: c.campaign_id ?? c._id ?? c.id,
            title: c.title ?? 'Kampanya',
            endDate: c.end_date ?? c.endDate ?? c.deadline,
            raised: c.raised ?? c.current_amount ?? 0,
            goal: c.goal ?? c.target_amount ?? 0,
            slug: c.campaign_id ?? c.slug,
          })
        );
        setCampaigns(mapped);
      }
    } catch (err) {
      console.error('[Calendar] Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <CalendarDays className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Bağış Takvimi
              </h1>
              <p className="text-sm text-gray-500">
                Bağışlarınızı takip edin, özel günleri keşfedin, kampanya
                bitiş tarihlerini kaçırmayın
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-3 text-gray-500">Takvim yükleniyor...</span>
          </div>
        ) : (
          <DonationCalendar
            donations={donations}
            campaigns={campaigns}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}
