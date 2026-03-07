import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CampaignDetailClient from './CampaignDetailClient';
import { fetchCampaignData } from './fetchCampaign';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const campaign = await fetchCampaignData(params.id);

  if (!campaign) {
    return { title: 'Campaign Not Found — FundEd' };
  }

  const description = campaign.story
    ? campaign.story.substring(0, 160) + (campaign.story.length > 160 ? '...' : '')
    : `Support ${campaign.student?.name}'s education on FundEd`;

  return {
    title: `${campaign.title} — FundEd`,
    description,
    openGraph: {
      title: campaign.title,
      description,
      type: 'article',
      images: campaign.cover_image ? [{ url: campaign.cover_image, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: campaign.title,
      description,
      images: campaign.cover_image ? [campaign.cover_image] : [],
    },
  };
}

function CampaignDetailLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="animate-pulse">
        <div className="h-8 w-32 bg-gray-200 rounded mb-4" />
        <div className="h-10 w-3/4 bg-gray-200 rounded mb-6" />
        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="aspect-[4/3] bg-gray-200 rounded-2xl" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-4/6" />
          </div>
          <div className="lg:col-span-2">
            <div className="bg-white border rounded-2xl p-6 space-y-4">
              <div className="h-20 w-20 bg-gray-200 rounded-full mx-auto" />
              <div className="h-6 bg-gray-200 rounded w-full" />
              <div className="h-12 bg-gray-200 rounded w-full" />
              <div className="h-12 bg-gray-200 rounded w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function CampaignDetailPage({ params }: Props) {
  const campaign = await fetchCampaignData(params.id);

  if (!campaign) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow">
        <Suspense fallback={<CampaignDetailLoading />}>
          <CampaignDetailClient initialCampaign={campaign} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
