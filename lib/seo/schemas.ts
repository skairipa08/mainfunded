// lib/seo/schemas.ts

const BASE = 'https://fund-ed.com'
const BRAND = 'FundEd'

/* ── Organization (sitewide) ── */
export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BRAND,
    url: BASE,
    logo: `${BASE}/logo.png`,
    sameAs: [],
    description:
      'FundEd is the first ESG-aligned education crowdfunding platform with verified student outcomes.',
  }
}

/* ── WebSite + SearchAction (sitewide) ── */
export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: BRAND,
    url: BASE,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE}/browse?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

/* ── BreadcrumbList ── */
export interface Crumb {
  name: string
  url: string
}
export function breadcrumbSchema(crumbs: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  }
}

/* ── FAQPage ── */
export interface FaqItem {
  question: string
  answer: string
}
export function faqSchema(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }
}

/* ── Article ── */
export function articleSchema({
  title,
  description,
  url,
  imageUrl,
  datePublished,
  dateModified,
}: {
  title: string
  description: string
  url: string
  imageUrl?: string
  datePublished: string
  dateModified?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url,
    image: imageUrl || `${BASE}/og-image.png`,
    datePublished,
    dateModified: dateModified || datePublished,
    author: { '@type': 'Organization', name: BRAND },
    publisher: {
      '@type': 'Organization',
      name: BRAND,
      logo: { '@type': 'ImageObject', url: `${BASE}/logo.png` },
    },
  }
}

/* ── HowTo (for calculator) ── */
export interface HowToStep {
  name: string
  text: string
}
export function howToSchema({
  name,
  description,
  steps,
}: {
  name: string
  description: string
  steps: HowToStep[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    step: steps.map((s) => ({
      '@type': 'HowToStep',
      name: s.name,
      text: s.text,
    })),
  }
}

/* ── Person (student profile) ── */
export function personSchema({
  name,
  description,
  imageUrl,
  url,
}: {
  name: string
  description: string
  imageUrl?: string
  url: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    description,
    image: imageUrl,
    url,
  }
}

/* ── EducationalOrganization ── */
export function educationalOrgSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: BRAND,
    url: BASE,
    description:
      'ESG-aligned education crowdfunding connecting donors with verified students globally.',
  }
}

/* ── CampaignPage (WebPage + DonateAction) ── */
export interface CampaignSchemaProps {
  title: string
  description: string
  url: string
  imageUrl?: string
  raisedAmount: number
  goalAmount: number
  studentName: string
}
export function campaignSchema({
  title,
  description,
  url,
  imageUrl,
  raisedAmount,
  goalAmount,
  studentName,
}: CampaignSchemaProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url,
    image: imageUrl,
    potentialAction: {
      '@type': 'DonateAction',
      name: `Support ${studentName}`,
      target: url,
      recipient: {
        '@type': 'Person',
        name: studentName,
      },
    },
    offers: {
      '@type': 'Offer',
      price: goalAmount - raisedAmount,
      priceCurrency: 'TRY',
      availability: raisedAmount >= goalAmount
        ? 'https://schema.org/SoldOut'
        : 'https://schema.org/InStock',
    },
  }
}
