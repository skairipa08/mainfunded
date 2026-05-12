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
    en: {
      title: 'Best Alternatives to GoFundMe for Education Funding',
      description: 'An honest comparison of 7 platforms for funding education — and why transparency matters.',
      category: 'Platform Comparison',
    },
    tr: {
      title: 'Eğitim Fonlaması İçin GoFundMe Alternatifleri',
      description: '7 platformun dürüst karşılaştırması — ve şeffaflığın neden önemli olduğu.',
      category: 'Platform Karşılaştırması',
    },
    date: '2026-03-15',
    readTime: 6,
    color: 'emerald' as const,
  },
  {
    slug: 'scholarship-vs-crowdfunding-vs-sponsorship',
    en: {
      title: 'Scholarship vs. Crowdfunding vs. Sponsorship: Which Is Best?',
      description: "A clear comparison of three models for funding a student's education.",
      category: 'Guide',
    },
    tr: {
      title: 'Burs, Kitle Fonlaması, Sponsorluk: Hangisi Daha İyi?',
      description: 'Bir öğrencinin eğitimini finanse etmenin üç modelinin net karşılaştırması.',
      category: 'Rehber',
    },
    date: '2026-03-15',
    readTime: 5,
    color: 'indigo' as const,
  },
  {
    slug: 'esg-education-impact',
    en: {
      title: 'What Is ESG-Aligned Giving in Education?',
      description: 'How education donations fit into ESG frameworks and why it matters for donors and corporates.',
      category: 'ESG',
    },
    tr: {
      title: 'Eğitimde ESG Uyumlu Bağış Nedir?',
      description: 'Eğitim bağışları ESG çerçevelerine nasıl uyar ve bu neden önemlidir.',
      category: 'ESG',
    },
    date: '2026-03-15',
    readTime: 7,
    color: 'amber' as const,
  },
]

const colorMap = {
  emerald: {
    badge: 'bg-emerald-100 text-emerald-700',
    arrow: 'text-emerald-500',
    number: 'group-hover:text-emerald-300',
    title: 'group-hover:text-emerald-700',
    border: 'group-hover:border-emerald-200',
  },
  indigo: {
    badge: 'bg-indigo-100 text-indigo-700',
    arrow: 'text-indigo-500',
    number: 'group-hover:text-indigo-300',
    title: 'group-hover:text-indigo-700',
    border: 'group-hover:border-indigo-200',
  },
  amber: {
    badge: 'bg-amber-100 text-amber-700',
    arrow: 'text-amber-500',
    number: 'group-hover:text-amber-300',
    title: 'group-hover:text-amber-700',
    border: 'group-hover:border-amber-200',
  },
}

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

        {/* Hero */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="max-w-4xl mx-auto px-6 py-20">
            <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-5">
              {isTr ? 'Eğitim Fonlama Blogu' : 'Education Funding Blog'}
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
              {isTr ? (
                <>Dürüst Rehberler.<br />Gerçek Karşılaştırmalar.</>
              ) : (
                <>Honest Guides.<br />Real Comparisons.</>
              )}
            </h1>
            <p className="text-slate-400 text-base mb-8 max-w-lg">
              {isTr
                ? 'Eğitim fonlaması, ESG ve şeffaf bağış hakkında rehberler.'
                : 'Guides on education funding, ESG investing, and transparent donations.'}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-emerald-900/60 text-emerald-300 text-xs px-3 py-1 rounded-full border border-emerald-800/60">
                {isTr ? 'Platform' : 'Platform'}
              </span>
              <span className="bg-indigo-900/60 text-indigo-300 text-xs px-3 py-1 rounded-full border border-indigo-800/60">
                {isTr ? 'Rehber' : 'Guide'}
              </span>
              <span className="bg-amber-900/60 text-amber-300 text-xs px-3 py-1 rounded-full border border-amber-800/60">
                ESG
              </span>
            </div>
          </div>
        </div>

        {/* Post List */}
        <main className="flex-grow max-w-4xl mx-auto px-6 py-12 w-full">
          <div className="divide-y divide-slate-100">
            {posts.map((post, i) => {
              const content = isTr ? post.tr : post.en
              const c = colorMap[post.color]
              const num = String(i + 1).padStart(2, '0')
              return (
                <Link
                  key={post.slug}
                  href={`/${locale}/blog/${post.slug}`}
                  className={`group flex items-start gap-6 py-8 px-4 -mx-4 rounded-2xl border border-transparent transition-all duration-200 hover:bg-slate-50 ${c.border}`}
                >
                  <span
                    className={`text-3xl font-black text-slate-200 transition-colors duration-200 w-10 flex-shrink-0 mt-1 select-none ${c.number}`}
                  >
                    {num}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${c.badge}`}>
                        {content.category}
                      </span>
                      <span className="text-xs text-slate-400">
                        · {post.date} · {post.readTime} {isTr ? 'dk' : 'min'}
                      </span>
                    </div>
                    <h2 className={`text-lg font-bold text-slate-900 transition-colors duration-200 mb-2 leading-snug ${c.title}`}>
                      {content.title}
                    </h2>
                    <p className="text-slate-500 text-sm leading-relaxed">{content.description}</p>
                  </div>
                  <span
                    className={`flex-shrink-0 text-xl mt-2 transition-all duration-200 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 ${c.arrow}`}
                  >
                    →
                  </span>
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
