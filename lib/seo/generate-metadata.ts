// lib/seo/generate-metadata.ts
import type { Metadata } from 'next'
import { buildAlternates } from '@/lib/seo/metadata'
import type { CampaignData } from '@/app/[locale]/campaign/[id]/fetchCampaign'

const BASE = 'https://fund-ed.com'

function truncate(text: string, max = 157): string {
  if (!text) return ''
  return text.length <= max ? text : text.slice(0, max) + '...'
}

export function campaignMetadata(campaign: CampaignData, locale: string): Metadata {
  const title = `${campaign.title} — FundEd`
  const description = truncate(campaign.story)
  const ogImageUrl = `${BASE}/api/og/campaign/${campaign.campaign_id}`
  const path = `/campaign/${campaign.campaign_id}`

  return {
    title,
    description,
    alternates: buildAlternates(locale, path),
    openGraph: {
      title: campaign.title,
      description,
      type: 'article',
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: campaign.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: campaign.title,
      description,
      images: [ogImageUrl],
    },
  }
}

export interface StudentSeoData {
  userId: string
  name: string
  image?: string | null
  fieldOfStudy?: string | null
  university?: string | null
  shortStory?: string | null
}

export function studentMetadata(student: StudentSeoData, locale: string): Metadata {
  const title = [
    student.name,
    student.fieldOfStudy,
    'FundEd',
  ].filter(Boolean).join(' — ')
  const description = truncate(
    [student.shortStory, student.university].filter(Boolean).join(' · ')
  ) || `${student.name} — FundEd öğrenci profili`
  const ogImageUrl = `${BASE}/api/og/student/${student.userId}`
  const path = `/student/${student.userId}`

  return {
    title,
    description,
    alternates: buildAlternates(locale, path),
    openGraph: {
      title: student.name,
      description,
      type: 'profile',
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: student.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: student.name,
      description,
      images: [ogImageUrl],
    },
  }
}

export function browseMetadata(locale: string, searchQuery?: string): Metadata {
  const isTr = locale === 'tr'
  const title = isTr ? 'Kampanyaları Keşfet — FundEd' : 'Browse Campaigns — FundEd'
  const description = isTr
    ? 'Doğrulanmış öğrencilerin eğitim kampanyalarını keşfet ve destek ol.'
    : 'Discover and support verified students education campaigns on FundEd.'
  const path = '/browse'

  return {
    title,
    description,
    alternates: buildAlternates(locale, path),
    openGraph: { title, description, type: 'website' },
    twitter: { card: 'summary', title, description },
    robots: searchQuery ? { index: false, follow: true } : undefined,
  }
}
