// app/[locale]/education-funding-calculator/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
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
      ? '500 TL, 1.000 TL veya 5.000 TL bağışınızın bir öğrencinin eğitimine katkısını gerçek fiyatlarla hesaplayın.'
      : 'Calculate what your donation achieves for a student\'s education with real Turkish market prices.',
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
      ? 'Farklı bağış tutarlarının bir öğrencinin eğitimine katkısını gerçek Türkiye piyasa fiyatlarıyla görün.'
      : 'See what different donation amounts achieve for a student\'s education at real Turkish market prices.',
    steps: isTr ? [
      { name: '500 TL Bağış', text: '2 ders kitabı, 6 okul öğünü veya 3 eğitim günü sağlar.' },
      { name: '1.000 TL Bağış', text: '5 ders kitabı, 12 okul öğünü veya 6 eğitim günü sağlar.' },
      { name: '2.500 TL Bağış', text: '12 ders kitabı, 31 okul öğünü veya 16 eğitim günü sağlar.' },
      { name: '5.000 TL Bağış', text: '25 ders kitabı, 62 okul öğünü veya 33 eğitim günü sağlar.' },
    ] : [
      { name: 'Donate ₺500', text: 'Provides 2 textbooks, 6 school meals, or 3 days of education.' },
      { name: 'Donate ₺1,000', text: 'Provides 5 textbooks, 12 school meals, or 6 days of education.' },
      { name: 'Donate ₺2,500', text: 'Provides 12 textbooks, 31 school meals, or 16 days of education.' },
      { name: 'Donate ₺5,000', text: 'Provides 25 textbooks, 62 school meals, or 33 days of education.' },
    ],
  })

  return (
    <>
      <JsonLd schema={schema} />
      <JsonLd schema={breadcrumbSchema(crumbs)} />
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />

        {/* Hero */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="max-w-3xl mx-auto px-6 pt-16 pb-12">
            <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-5">
              {isTr ? 'Etki Hesaplayıcı' : 'Impact Calculator'}
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-4">
              {isTr ? 'Bağışınız Ne Kadar Fark Yaratır?' : 'How Much Difference Does Your Donation Make?'}
            </h1>
            <p className="text-slate-400 text-base leading-relaxed max-w-2xl mb-8">
              {isTr
                ? 'Tutarı girin veya seçin — 2025 Türkiye piyasa fiyatlarıyla bağışınızın somut etkisini görün.'
                : 'Enter or select an amount to see its concrete impact at real 2025 Turkish market prices.'}
            </p>
            {/* Unit price reference strip */}
            <div className="flex flex-wrap gap-3">
              {(isTr ? [
                { label: '1 Ders Kitabı', price: '₺200' },
                { label: '1 Okul Öğünü', price: '₺80' },
                { label: '1 Eğitim Günü', price: '₺150' },
                { label: '1 Kırtasiye Seti', price: '₺400' },
                { label: '1 Etüt Saati', price: '₺350' },
              ] : [
                { label: '1 Textbook', price: '₺200' },
                { label: '1 School Meal', price: '₺80' },
                { label: '1 Education Day', price: '₺150' },
                { label: '1 Stationery Kit', price: '₺400' },
                { label: '1 Tutoring Hour', price: '₺350' },
              ]).map(item => (
                <div key={item.label} className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-1.5">
                  <span className="text-slate-400 text-xs">{item.label}</span>
                  <span className="text-white text-xs font-bold">{item.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="bg-white border-b border-slate-100">
          <div className="max-w-3xl mx-auto px-6 py-3 flex items-center gap-2 text-xs text-slate-400">
            <Link href={`/${locale}`} className="hover:text-slate-700 transition-colors">
              {isTr ? 'Ana Sayfa' : 'Home'}
            </Link>
            <span>›</span>
            <span className="text-slate-700 font-medium">
              {isTr ? 'Etki Hesaplayıcı' : 'Impact Calculator'}
            </span>
          </div>
        </div>

        <main className="flex-grow">
          <div className="max-w-3xl mx-auto px-4 py-10 w-full">
            <CalculatorClient locale={locale} />
          </div>
        </main>

        <Footer />
      </div>
    </>
  )
}
