// app/[locale]/blog/scholarship-vs-crowdfunding-vs-sponsorship/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { buildAlternates } from '@/lib/seo/metadata'
import { JsonLd } from '@/components/seo/JsonLd'
import { articleSchema, breadcrumbSchema } from '@/lib/seo/schemas'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

interface Props { params: { locale: string } }

const DATE = '2026-03-15'
const SLUG = '/blog/scholarship-vs-crowdfunding-vs-sponsorship'

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isTr = locale === 'tr'
  return {
    title: isTr ? 'Burs, Kitle Fonlaması, Sponsorluk: Fark Ne? | FundEd' : "Scholarship vs. Crowdfunding vs. Sponsorship | FundEd",
    description: isTr ? 'Öğrenci eğitimini desteklemenin üç yolu karşılaştırıldı.' : "Three ways to fund a student's education compared.",
    alternates: buildAlternates(locale, SLUG),
  }
}

const alternatives = [
  { name: 'Scholarship', nameTr: 'Burs', score: 6.0, color: '#6366f1', noteTr: 'Kriterlere dayalı · Uzun başvuru', noteEn: 'Criteria-based · Long application' },
  { name: 'Sponsorship', nameTr: 'Sponsorluk', score: 5.5, color: '#f59e0b', noteTr: 'Kurumsal ilişki gerektirir', noteEn: 'Requires corporate relationships' },
]

function ComparisonBlock({ isTr }: { isTr: boolean }) {
  return (
    <div className="my-10">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 mb-4 flex flex-col sm:flex-row items-start justify-between gap-5">
        <div>
          <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2">⭐ {isTr ? 'Önerilen Model' : 'Recommended Model'}</p>
          <p className="text-2xl font-black text-white mb-1">{isTr ? 'Kitle Fonlaması' : 'Crowdfunding'}</p>
          <p className="text-slate-400 text-sm">{isTr ? 'FundEd · Herhangi bir öğrenci · Hızlı' : 'FundEd · Any student · Fast'}</p>
        </div>
        <div className="space-y-2 text-sm flex-shrink-0">
          <p className="text-emerald-400">✅ {isTr ? 'Hızlı Başvuru' : 'Fast Application'}</p>
          <p className="text-emerald-400">✅ {isTr ? 'Gerçek Zamanlı Etki Takibi' : 'Real-time Impact Tracking'}</p>
          <p className="text-emerald-400">✅ {isTr ? 'Herhangi Bir Öğrenci' : 'Any Student Can Apply'}</p>
          <p className="text-emerald-400">✅ {isTr ? 'Yüksek Esneklik' : 'High Flexibility'}</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
          {isTr ? 'Diğer Modeller (Erişim & Etki Puanı)' : 'Other Models (Accessibility & Impact Score)'}
        </p>
        <div className="space-y-5">
          {alternatives.map(a => (
            <div key={a.name}>
              <div className="flex items-center justify-between mb-2 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-semibold text-slate-800 flex-shrink-0">{isTr ? a.nameTr : a.name}</span>
                  <span className="text-xs text-slate-400 truncate">{isTr ? a.noteTr : a.noteEn}</span>
                </div>
                <span className="text-sm font-bold text-slate-500 flex-shrink-0">{a.score}/10</span>
              </div>
              <div className="bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${a.score * 10}%`, backgroundColor: a.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function BlogPostScholarship({ params: { locale } }: Props) {
  const isTr = locale === 'tr'
  const base = `https://fund-ed.com/${locale}`
  const crumbs = [
    { name: isTr ? 'Ana Sayfa' : 'Home', url: `https://fund-ed.com/${locale}` },
    { name: 'Blog', url: `${base}/blog` },
    { name: isTr ? 'Burs vs Kitle Fonlaması' : 'Scholarship vs Crowdfunding', url: `${base}${SLUG}` },
  ]
  const schema = articleSchema({
    title: isTr ? 'Burs, Kitle Fonlaması, Sponsorluk' : 'Scholarship vs. Crowdfunding vs. Sponsorship',
    description: isTr ? 'Üç modelin karşılaştırması.' : 'Three models compared.',
    url: `https://fund-ed.com/${locale}${SLUG}`,
    datePublished: DATE,
  })

  return (
    <>
      <JsonLd schema={schema} />
      <JsonLd schema={breadcrumbSchema(crumbs)} />
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />

        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="max-w-3xl mx-auto px-6 pt-16 pb-12">
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <span className="bg-indigo-900/60 text-indigo-300 text-xs px-3 py-1 rounded-full border border-indigo-800/60 font-semibold">{isTr ? 'Rehber' : 'Guide'}</span>
              <span className="text-slate-500 text-xs">· {isTr ? '5 dk okuma' : '5 min read'}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-4">
              {isTr ? 'Burs, Kitle Fonlaması ve Sponsorluk: En İyi Yol Hangisi?' : "Scholarship vs. Crowdfunding vs. Sponsorship: Which Is Best?"}
            </h1>
            <p className="text-slate-400 text-base leading-relaxed max-w-2xl">
              {isTr ? 'Her birinin avantajları ve sınırlılıkları farklıdır. Hangisi öğrenciler için en uygun?' : "Each model has different advantages and limitations. Which works best for students?"}
            </p>
          </div>
        </div>

        <div className="bg-white border-b border-slate-100">
          <div className="max-w-3xl mx-auto px-6 py-3 flex items-center gap-2 text-xs text-slate-400">
            <Link href={`/${locale}`} className="hover:text-slate-700 transition-colors">{isTr ? 'Ana Sayfa' : 'Home'}</Link>
            <span>›</span>
            <Link href={`/${locale}/blog`} className="hover:text-slate-700 transition-colors">Blog</Link>
            <span>›</span>
            <span className="text-slate-700 font-medium">{isTr ? 'Burs vs Kitle Fonlaması' : 'Scholarship vs Crowdfunding'}</span>
          </div>
        </div>

        <main className="flex-grow">
          <div className="max-w-3xl mx-auto px-4 py-10 w-full">
            <h2 className="text-xl font-extrabold text-slate-900 mb-2">{isTr ? 'Model Karşılaştırması' : 'Model Comparison'}</h2>
            <ComparisonBlock isTr={isTr} />

            {isTr ? (
              <div className="prose prose-slate max-w-none prose-headings:font-extrabold prose-a:text-emerald-600 prose-a:no-underline hover:prose-a:underline">
                <h2>Burs</h2>
                <p>Burslar, belirli kriterleri karşılayan öğrencilere verilen hibe fonlardır. Geri ödeme gerektirmez ancak rekabetçidir, başvuru süreci uzundur ve etki takibi çoğunlukla yapılmaz.</p>
                <h2>Kitle Fonlaması</h2>
                <p>FundEd gibi platformlar, öğrencilerin doğrudan bağışçılarla bağlantı kurmasını sağlar. Süreç hızlıdır, herhangi bir öğrenci başvurabilir ve fonlar gerçek zamanlı takip edilir. <Link href={`/${locale}/fund-a-student`}>Bir öğrenciyi desteklemek</Link> için idealdir.</p>
                <h2>Sponsorluk</h2>
                <p>Kurumsal sponsorluk ESG hedefleri için güçlü olabilir ancak bireysel bağışçılar için pratik değildir.</p>
                <h2>Sonuç</h2>
                <p>Hız, şeffaflık ve esneklik istiyorsanız <Link href={`/${locale}/fund-a-student`}>FundEd</Link> en iyi seçenektir. <Link href={`/${locale}/education-funding-calculator`}>Etki hesaplayıcımızla</Link> farkı görün.</p>
              </div>
            ) : (
              <div className="prose prose-slate max-w-none prose-headings:font-extrabold prose-a:text-emerald-600 prose-a:no-underline hover:prose-a:underline">
                <h2>Scholarships</h2>
                <p>Scholarships are grants for students meeting specific criteria. No repayment required, but highly competitive with long application processes and usually no impact tracking.</p>
                <h2>Crowdfunding</h2>
                <p>Platforms like FundEd connect students directly with donors. Faster, open to any student, with real-time fund tracking. The ideal model for <Link href={`/${locale}/fund-a-student`}>funding a student</Link>.</p>
                <h2>Sponsorship</h2>
                <p>Corporate sponsorship can be powerful for ESG goals but isn&apos;t practical for individual donors.</p>
                <h2>Conclusion</h2>
                <p>For speed, transparency, and flexibility, <Link href={`/${locale}/fund-a-student`}>FundEd</Link> is the best choice. Use our <Link href={`/${locale}/education-funding-calculator`}>impact calculator</Link> to see the difference.</p>
              </div>
            )}

            <div className="mt-14 pt-10 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">{isTr ? 'İlgili Makaleler' : 'Related Articles'}</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <Link href={`/${locale}/blog/alternatives-to-gofundme-for-education`} className="group flex items-start gap-3 p-4 border border-slate-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 transition-all">
                  <span className="text-emerald-500 text-lg mt-0.5 flex-shrink-0 group-hover:translate-x-1 transition-transform">→</span>
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-emerald-700 transition-colors leading-snug">{isTr ? 'Eğitim için GoFundMe Alternatifleri (2026)' : 'Best Alternatives to GoFundMe for Education'}</span>
                </Link>
                <Link href={`/${locale}/blog/esg-education-impact`} className="group flex items-start gap-3 p-4 border border-slate-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 transition-all">
                  <span className="text-emerald-500 text-lg mt-0.5 flex-shrink-0 group-hover:translate-x-1 transition-transform">→</span>
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-emerald-700 transition-colors leading-snug">{isTr ? 'ESG Uyumlu Eğitim Bağışı Nedir?' : 'What Is ESG-Aligned Giving in Education?'}</span>
                </Link>
              </div>
            </div>

            <div className="mt-8 mb-8 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2">{isTr ? 'Hemen Başlayın' : 'Get Started Now'}</p>
                <p className="text-white font-bold text-xl mb-1">{isTr ? 'Doğrulanmış bir öğrenciyi destekle' : 'Fund a verified student'}</p>
                <p className="text-slate-400 text-sm">{isTr ? 'ESG uyumlu, şeffaf, anlık etki takibi ile.' : 'ESG-aligned, transparent, with live impact tracking.'}</p>
              </div>
              <Link href={`/${locale}/fund-a-student`} className="flex-shrink-0 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors whitespace-nowrap">
                {isTr ? 'Bir öğrenciyi destekle →' : 'Fund a student →'}
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  )
}
