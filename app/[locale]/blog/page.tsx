// app/[locale]/blog/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { buildAlternates } from '@/lib/seo/metadata'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbSchema } from '@/lib/seo/schemas'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

interface Props {
  params: { locale: string }
}

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isTr = locale === 'tr'
  return {
    title: isTr ? 'Eğitim Fonlama Blogu | FundEd' : 'Education Funding Blog | FundEd',
    description: isTr
      ? 'Eğitim fonlaması, ESG yatırımı ve şeffaf bağış hakkında rehberler ve karşılaştırmalar.'
      : 'Guides and comparisons on education funding, ESG investing, and transparent donations.',
    alternates: buildAlternates(locale, '/blog'),
  }
}

const posts = [
  {
    slug: 'alternatives-to-gofundme-for-education',
    en: { title: 'Best Alternatives to GoFundMe for Education Funding', description: 'An honest comparison of 7 platforms for funding education — and why transparency matters.' },
    tr: { title: 'Eğitim Fonlaması İçin GoFundMe Alternatifleri', description: '7 platformun dürüst karşılaştırması — ve şeffaflığın neden önemli olduğu.' },
    date: '2026-03-15',
  },
  {
    slug: 'scholarship-vs-crowdfunding-vs-sponsorship',
    en: { title: 'Scholarship vs. Crowdfunding vs. Sponsorship: Which Is Best?', description: 'A clear comparison of three models for funding a student\'s education.' },
    tr: { title: 'Burs, Kitle Fonlaması, Sponsorluk: Hangisi Daha İyi?', description: 'Bir öğrencinin eğitimini finanse etmenin üç modelinin net karşılaştırması.' },
    date: '2026-03-15',
  },
  {
    slug: 'esg-education-impact',
    en: { title: 'What Is ESG-Aligned Giving in Education?', description: 'How education donations fit into ESG frameworks and why it matters for donors and corporates.' },
    tr: { title: 'Eğitimde ESG Uyumlu Bağış Nedir?', description: 'Eğitim bağışları ESG çerçevelerine nasıl uyar ve bu neden önemlidir.' },
    date: '2026-03-15',
  },
]

export default function BlogPage({ params: { locale } }: Props) {
  const isTr = locale === 'tr'
  const crumbs = isTr
    ? [{ name: 'Ana Sayfa', url: 'https://fund-ed.com/tr' }, { name: 'Blog', url: 'https://fund-ed.com/tr/blog' }]
    : [{ name: 'Home', url: 'https://fund-ed.com/en' }, { name: 'Blog', url: 'https://fund-ed.com/en/blog' }]

  return (
    <>
      <JsonLd schema={breadcrumbSchema(crumbs)} />
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-grow max-w-4xl mx-auto px-4 py-20 w-full">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            {isTr ? 'Eğitim Fonlama Blogu' : 'Education Funding Blog'}
          </h1>
          <p className="text-lg text-slate-500 mb-12">
            {isTr
              ? 'Eğitim fonlaması, ESG ve şeffaf bağış hakkında rehberler.'
              : 'Guides on education funding, ESG investing, and transparent donations.'}
          </p>
          <div className="space-y-8">
            {posts.map((post) => {
              const content = isTr ? post.tr : post.en
              return (
                <Link
                  key={post.slug}
                  href={`/${locale}/blog/${post.slug}`}
                  className="block bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-lg transition-shadow"
                >
                  <p className="text-sm text-slate-400 mb-2">{post.date}</p>
                  <h2 className="text-xl font-bold text-slate-900 mb-3">{content.title}</h2>
                  <p className="text-slate-500">{content.description}</p>
                </Link>
              )
            })}
          </div>
        </main>
        <Footer />
      </div>
    </>
  )
}
