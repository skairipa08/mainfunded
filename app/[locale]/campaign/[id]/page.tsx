import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CampaignDetailClient from './CampaignDetailClient';
import { fetchCampaignData } from './fetchCampaign';
import { JsonLd } from '@/components/seo/JsonLd'
import { personSchema, educationalOrgSchema, breadcrumbSchema, campaignSchema } from '@/lib/seo/schemas'
import { campaignMetadata } from '@/lib/seo/generate-metadata'

interface Props {
  params: { id: string; locale: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const campaign = await fetchCampaignData(params.id)
  if (!campaign) return { title: 'Campaign Not Found — FundEd' }
  return campaignMetadata(campaign, params.locale)
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
  const campaign = await fetchCampaignData(params.id)

  if (!campaign) {
    return notFound()
  }

  const isTr = params.locale === 'tr'

  const schemas = [
    campaignSchema({
      title: campaign.title,
      description: campaign.story?.substring(0, 200) || '',
      url: `https://fund-ed.com/${params.locale}/campaign/${campaign.campaign_id}`,
      imageUrl: `https://fund-ed.com/api/og/campaign/${campaign.campaign_id}`,
      raisedAmount: campaign.raised_amount,
      goalAmount: campaign.goal_amount,
      studentName: campaign.student?.name || campaign.title,
    }),
    personSchema({
      name: campaign.student?.name || campaign.title,
      description: campaign.story?.substring(0, 200) || '',
      imageUrl: campaign.cover_image,
      url: `https://fund-ed.com/${params.locale}/campaign/${params.id}`,
    }),
    educationalOrgSchema(),
    breadcrumbSchema(isTr
      ? [
          { name: 'Ana Sayfa', url: `https://fund-ed.com/tr` },
          { name: 'Kampanyalar', url: `https://fund-ed.com/tr/browse` },
          { name: campaign.title, url: `https://fund-ed.com/tr/campaign/${params.id}` },
        ]
      : [
          { name: 'Home', url: `https://fund-ed.com/en` },
          { name: 'Browse', url: `https://fund-ed.com/en/browse` },
          { name: campaign.title, url: `https://fund-ed.com/en/campaign/${params.id}` },
        ]
    ),
  ]

  return (
    <>
      {schemas.map((s, i) => <JsonLd key={i} schema={s} />)}
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow">
          <Suspense fallback={<CampaignDetailLoading />}>
            <CampaignDetailClient initialCampaign={campaign} />
          </Suspense>
        </main>
        <Footer />
      </div>
    </>
  );
}
