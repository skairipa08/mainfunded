// app/[locale]/blog/alternatives-to-gofundme-for-education/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { buildAlternates } from '@/lib/seo/metadata'
import { JsonLd } from '@/components/seo/JsonLd'
import { articleSchema, breadcrumbSchema } from '@/lib/seo/schemas'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

interface Props { params: { locale: string } }

const DATE = '2026-03-15'
const SLUG = '/blog/alternatives-to-gofundme-for-education'

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isTr = locale === 'tr'
  return {
    title: isTr
      ? 'Eğitim için GoFundMe Alternatifleri (2026) | FundEd'
      : 'Best Alternatives to GoFundMe for Education (2026) | FundEd',
    description: isTr
      ? 'Eğitim fonlaması için GoFundMe yerine hangi platformları kullanmalısınız? 7 platformun dürüst karşılaştırması.'
      : 'Which platforms should you use instead of GoFundMe for education? An honest comparison of 7 platforms.',
    alternates: buildAlternates(locale, SLUG),
  }
}

const competitors = [
  { name: 'DonorsChoose',   score: 7.0, color: '#6366f1', noteTr: 'Sınıf odaklı · Sadece ABD',           noteEn: 'Classroom-focused · US only' },
  { name: 'GlobalGiving',   score: 7.5, color: '#8b5cf6', noteTr: 'Kurum bazlı · Global',                noteEn: 'Org-level · Global' },
  { name: 'Kiva',           score: 6.5, color: '#f59e0b', noteTr: 'Mikro kredi · Geri ödeme odaklı',      noteEn: 'Microloans · Repayment-focused' },
  { name: 'ScholarshipOwl', score: 6.0, color: '#0ea5e9', noteTr: 'Burs odaklı · ABD ağırlıklı',          noteEn: 'Scholarship-focused · US-heavy' },
  { name: 'GoFundMe',       score: 5.0, color: '#94a3b8', noteTr: 'Genel amaçlı · Doğrulama yok',        noteEn: 'General purpose · No verification' },
  { name: 'JustGiving',     score: 4.5, color: '#cbd5e1', noteTr: 'Minimal doğrulama · İngiltere',        noteEn: 'Minimal verification · UK-based' },
]

function ComparisonBlock({ isTr }: { isTr: boolean }) {
  return (
    <div className="my-10">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 mb-4 flex flex-col sm:flex-row items-start justify-between gap-5">
        <div>
          <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2">
            ⭐ {isTr ? 'Önerilen Platform' : 'Recommended Platform'}
          </p>
          <p className="text-2xl font-black text-white mb-1">FundEd</p>
          <p className="text-slate-400 text-sm">{isTr ? 'Eğitim · Global · ESG Uyumlu' : 'Education · Global · ESG-Aligned'}</p>
        </div>
        <div className="space-y-2 text-sm flex-shrink-0">
          <p className="text-emerald-400">✅ {isTr ? 'Tam Öğrenci Doğrulaması' : 'Full Student Verification'}</p>
          <p className="text-emerald-400">✅ {isTr ? 'ESG Raporlaması' : 'ESG Reporting'}</p>
          <p className="text-emerald-400">✅ {isTr ? 'Şeffaf Fon Takibi' : 'Transparent Fund Tracking'}</p>
          <p className="text-emerald-400">✅ {isTr ? 'Global Erişim' : 'Global Reach'}</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
          {isTr ? 'Diğer Platformlar (Eğitim Uyum Puanı)' : 'Other Platforms (Education Fit Score)'}
        </p>
        <div className="space-y-5">
          {competitors.map(p => (
            <div key={p.name}>
              <div className="flex items-center justify-between mb-2 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-semibold text-slate-800 flex-shrink-0">{p.name}</span>
                  <span className="text-xs text-slate-400 truncate">{isTr ? p.noteTr : p.noteEn}</span>
                </div>
                <span className="text-sm font-bold text-slate-500 flex-shrink-0">{p.score}/10</span>
              </div>
              <div className="bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${p.score * 10}%`, backgroundColor: p.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function BlogPostAlternatives({ params: { locale } }: Props) {
  const isTr = locale === 'tr'
  const base = `https://fund-ed.com/${locale}`
  const crumbs = [
    { name: isTr ? 'Ana Sayfa' : 'Home', url: `https://fund-ed.com/${locale}` },
    { name: 'Blog', url: `${base}/blog` },
    { name: isTr ? 'GoFundMe Alternatifleri' : 'GoFundMe Alternatives', url: `${base}${SLUG}` },
  ]
  const schema = articleSchema({
    title: isTr ? 'Eğitim için GoFundMe Alternatifleri (2026)' : 'Best Alternatives to GoFundMe for Education (2026)',
    description: isTr ? '7 platformun dürüst karşılaştırması.' : 'An honest comparison of 7 platforms.',
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
              <span className="bg-emerald-900/60 text-emerald-300 text-xs px-3 py-1 rounded-full border border-emerald-800/60 font-semibold">
                {isTr ? 'Platform Karşılaştırması' : 'Platform Comparison'}
              </span>
              <span className="text-slate-500 text-xs">· {isTr ? '6 dk okuma' : '6 min read'}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-4">
              {isTr ? 'Eğitim Fonlaması İçin En İyi GoFundMe Alternatifleri (2026)' : 'Best Alternatives to GoFundMe for Education Funding (2026)'}
            </h1>
            <p className="text-slate-400 text-base leading-relaxed max-w-2xl">
              {isTr
                ? 'GoFundMe eğitim odaklı değil: doğrulama yok, etki takibi yok. İşte 7 platformun dürüst karşılaştırması.'
                : "GoFundMe isn't built for education: no verification, no impact tracking. Here's an honest comparison of 7 platforms."}
            </p>
          </div>
        </div>

        <div className="bg-white border-b border-slate-100">
          <div className="max-w-3xl mx-auto px-6 py-3 flex items-center gap-2 text-xs text-slate-400">
            <Link href={`/${locale}`} className="hover:text-slate-700 transition-colors">{isTr ? 'Ana Sayfa' : 'Home'}</Link>
            <span>›</span>
            <Link href={`/${locale}/blog`} className="hover:text-slate-700 transition-colors">Blog</Link>
            <span>›</span>
            <span className="text-slate-700 font-medium">{isTr ? 'GoFundMe Alternatifleri' : 'GoFundMe Alternatives'}</span>
          </div>
        </div>

        <main className="flex-grow">
          <div className="max-w-3xl mx-auto px-4 py-10 w-full">
            <h2 className="text-xl font-extrabold text-slate-900 mb-2">
              {isTr ? 'Platform Karşılaştırması' : 'Platform Comparison'}
            </h2>
            <ComparisonBlock isTr={isTr} />

            {isTr ? (
              <div className="prose prose-slate max-w-none prose-headings:font-extrabold prose-a:text-emerald-600 prose-a:no-underline hover:prose-a:underline">
                <h2>1. FundEd — En İyi ESG Uyumlu Eğitim Fonlama</h2>
                <p>FundEd, eğitim fonlamasına odaklanan, tam öğrenci doğrulaması, canlı etki takibi ve ESG raporlaması sunan bir platformdur.</p>
                <p><strong>Avantajlar:</strong> Doğrulanmış öğrenciler, ESG uyumlu raporlama, şeffaf fon takibi, global erişim.</p>
                <p><strong>Dezavantajlar:</strong> GoFundMe kadar geniş marka tanınırlığına sahip değil (henüz).</p>
                <h2>2. GoFundMe — Genel Amaçlı, Eğitim Odaklı Değil</h2>
                <p>GoFundMe, genel bağış toplama için en büyük platformdur. Ancak öğrenci doğrulaması yoktur ve ESG raporlaması mevcut değildir.</p>
                <h2>3. DonorsChoose — ABD Sınıfları İçin</h2>
                <p>DonorsChoose, ABD&apos;deki öğretmenlerin sınıf projeleri için harika bir platformdur ancak ABD dışını desteklemez.</p>
                <h2>Hangi Platformu Seçmelisiniz?</h2>
                <p>Doğrulanmış, etkisi ölçülebilir bir bağış için <Link href={`/${locale}/fund-a-student`}>FundEd</Link>&apos;i tercih edin. ABD sınıf malzemeleri için DonorsChoose, mikro kredi için Kiva değerlendirilebilir.</p>
                <h2>Şeffaflık Neden Önemli?</h2>
                <p>Genel platformlarda bağışınızın eğitime gittiğini doğrulamanın yolu yoktur. <Link href={`/${locale}/transparency`}>Şeffaflık sayfamızda</Link> FundEd&apos;in her bağışı nasıl izlediğini görebilirsiniz.</p>
                <h2>Sonuç</h2>
                <p>Eğitim odaklı, güvenli ve etkisi doğrulanmış bir platform arıyorsanız FundEd en iyi seçenektir. <Link href={`/${locale}/how-it-works`}>Nasıl çalıştığını öğrenin</Link>.</p>
              </div>
            ) : (
              <div className="prose prose-slate max-w-none prose-headings:font-extrabold prose-a:text-emerald-600 prose-a:no-underline hover:prose-a:underline">
                <h2>1. FundEd — Best ESG-Aligned Education Platform</h2>
                <p>FundEd is purpose-built for education funding with full student verification, live impact tracking, and ESG reporting.</p>
                <p><strong>Pros:</strong> Verified students, ESG-compliant reporting, transparent fund tracking, global reach.</p>
                <p><strong>Cons:</strong> Doesn&apos;t have GoFundMe&apos;s brand recognition (yet).</p>
                <h2>2. GoFundMe — General Purpose, Not Education-Focused</h2>
                <p>GoFundMe is the largest general fundraising platform but has no student verification and no ESG reporting.</p>
                <h2>3. DonorsChoose — Great for US Classrooms</h2>
                <p>DonorsChoose is excellent for US teachers but doesn&apos;t support students outside the US.</p>
                <h2>Which Platform Should You Choose?</h2>
                <p>For verified, impact-tracked education donations: <Link href={`/${locale}/fund-a-student`}>FundEd</Link>. For US classroom supplies: DonorsChoose. For microloans: Kiva.</p>
                <h2>Why Transparency Matters</h2>
                <p>On general platforms there&apos;s no way to verify your donation went to education. See <Link href={`/${locale}/transparency`}>our transparency page</Link> for how FundEd tracks every donation.</p>
                <h2>Conclusion</h2>
                <p>For an education-focused, impact-verified platform, FundEd is the best choice. <Link href={`/${locale}/how-it-works`}>See how it works</Link>.</p>
              </div>
            )}

            <div className="mt-14 pt-10 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">{isTr ? 'İlgili Makaleler' : 'Related Articles'}</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <Link href={`/${locale}/blog/scholarship-vs-crowdfunding-vs-sponsorship`} className="group flex items-start gap-3 p-4 border border-slate-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 transition-all">
                  <span className="text-emerald-500 text-lg mt-0.5 flex-shrink-0 group-hover:translate-x-1 transition-transform">→</span>
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-emerald-700 transition-colors leading-snug">{isTr ? 'Burs, Kitle Fonlaması, Sponsorluk: Hangisi Daha İyi?' : 'Scholarship vs. Crowdfunding vs. Sponsorship'}</span>
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
