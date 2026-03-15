// app/[locale]/education-funding-calculator/page.tsx
import type { Metadata } from 'next'
import { buildAlternates } from '@/lib/seo/metadata'
import { JsonLd } from '@/components/seo/JsonLd'
import { howToSchema, breadcrumbSchema } from '@/lib/seo/schemas'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CalculatorClient from './CalculatorClient'

interface Props { params: { locale: string } }

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isTr = locale === 'tr'
  return {
    title: isTr
      ? 'Eğitim Fonlama Etki Hesaplayıcı | FundEd'
      : 'Education Funding Impact Calculator | FundEd',
    description: isTr
      ? '$25, $50, $100 veya $500 bağışınızın bir öğrencinin eğitimine katkısını hesaplayın.'
      : 'Calculate what your $25, $50, $100 or $500 donation achieves for a student\'s education.',
    alternates: buildAlternates(locale, '/education-funding-calculator'),
  }
}

export default function CalculatorPage({ params: { locale } }: Props) {
  const isTr = locale === 'tr'
  const crumbs = isTr
    ? [{ name: 'Ana Sayfa', url: 'https://fund-ed.com/tr' }, { name: 'Etki Hesaplayıcı', url: 'https://fund-ed.com/tr/education-funding-calculator' }]
    : [{ name: 'Home', url: 'https://fund-ed.com/en' }, { name: 'Impact Calculator', url: 'https://fund-ed.com/en/education-funding-calculator' }]

  const schema = howToSchema({
    name: isTr ? 'Eğitim Bağışı Etkisini Hesapla' : 'Calculate Your Education Donation Impact',
    description: isTr
      ? 'Farklı bağış tutarlarının bir öğrencinin eğitimine katkısını görün.'
      : 'See what different donation amounts achieve for a student\'s education.',
    steps: isTr ? [
      { name: '$25 Bağış', text: '3 ders kitabı, 10 okul öğünü veya 5 eğitim günü sağlar.' },
      { name: '$50 Bağış', text: '6 ders kitabı, 20 okul öğünü veya 10 eğitim günü sağlar.' },
      { name: '$100 Bağış', text: '12 ders kitabı, 40 okul öğünü veya 20 eğitim günü sağlar.' },
      { name: '$500 Bağış', text: '60 ders kitabı, 200 okul öğünü veya 100 eğitim günü sağlar.' },
    ] : [
      { name: 'Donate $25', text: 'Provides 3 textbooks, 10 school meals, or 5 days of education.' },
      { name: 'Donate $50', text: 'Provides 6 textbooks, 20 school meals, or 10 days of education.' },
      { name: 'Donate $100', text: 'Provides 12 textbooks, 40 school meals, or 20 days of education.' },
      { name: 'Donate $500', text: 'Provides 60 textbooks, 200 school meals, or 100 days of education.' },
    ],
  })

  return (
    <>
      <JsonLd schema={schema} />
      <JsonLd schema={breadcrumbSchema(crumbs)} />
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-grow py-20 px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              {isTr ? 'Eğitim Fonlama Etki Hesaplayıcı' : 'Education Funding Impact Calculator'}
            </h1>
            <p className="text-lg text-slate-500">
              {isTr
                ? 'Bağış tutarını seçin ve bir öğrencinin eğitimine katkınızı görün.'
                : 'Select a donation amount to see what it achieves for a student\'s education.'}
            </p>
          </div>
          <CalculatorClient locale={locale} />
        </main>
        <Footer />
      </div>
    </>
  )
}
