// app/[locale]/who-we-are/page.tsx
import type { Metadata } from 'next'
import { buildAlternates } from '@/lib/seo/metadata'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbSchema } from '@/lib/seo/schemas'
import WhoWeAreClient from './WhoWeAreClient'

interface Props {
  params: { locale: string }
}

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isTr = locale === 'tr'
  return {
    title: isTr
      ? 'FundEd Hakkında — ESG Eğitim Platformu | FundEd'
      : 'About FundEd — ESG Education Platform | FundEd',
    description: isTr
      ? 'FundEd, doğrulanmış öğrenci sonuçlarına sahip ilk ESG uyumlu eğitim kitle fonlama platformudur.'
      : 'FundEd is the first ESG-aligned education crowdfunding platform with verified student outcomes.',
    alternates: buildAlternates(locale, '/who-we-are'),
  }
}

export default function WhoWeArePage({ params: { locale } }: Props) {
  const isTr = locale === 'tr'
  const breadcrumbs = isTr
    ? [{ name: 'Ana Sayfa', url: 'https://fund-ed.com/tr' }, { name: 'Hakkımızda', url: 'https://fund-ed.com/tr/who-we-are' }]
    : [{ name: 'Home', url: 'https://fund-ed.com/en' }, { name: 'About', url: 'https://fund-ed.com/en/who-we-are' }]

  return (
    <>
      <JsonLd schema={breadcrumbSchema(breadcrumbs)} />
      <WhoWeAreClient />
    </>
  )
}
