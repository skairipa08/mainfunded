// app/[locale]/blog/esg-education-impact/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { buildAlternates } from '@/lib/seo/metadata'
import { JsonLd } from '@/components/seo/JsonLd'
import { articleSchema, breadcrumbSchema } from '@/lib/seo/schemas'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

interface Props { params: { locale: string } }

const DATE = '2026-03-15'
const SLUG = '/blog/esg-education-impact'

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isTr = locale === 'tr'
  return {
    title: isTr
      ? 'ESG Uyumlu Eğitim Bağışı Nedir? | FundEd'
      : 'What Is ESG-Aligned Giving in Education? | FundEd',
    description: isTr
      ? 'Eğitim bağışları ESG çerçevelerine nasıl uyar, SDG 4 nedir ve kurumsal bağışçılar neden eğitimi tercih ediyor.'
      : 'How education donations fit into ESG frameworks, what SDG 4 means, and why corporate donors choose education.',
    alternates: buildAlternates(locale, SLUG),
  }
}

export default function BlogPostEsg({ params: { locale } }: Props) {
  const isTr = locale === 'tr'
  const base = `https://fund-ed.com/${locale}`
  const crumbs = [
    { name: isTr ? 'Ana Sayfa' : 'Home', url: `https://fund-ed.com/${locale}` },
    { name: 'Blog', url: `${base}/blog` },
    { name: isTr ? 'ESG Eğitim Etkisi' : 'ESG Education Impact', url: `${base}${SLUG}` },
  ]
  const schema = articleSchema({
    title: isTr ? 'ESG Uyumlu Eğitim Bağışı Nedir?' : 'What Is ESG-Aligned Giving in Education?',
    description: isTr ? 'Eğitim bağışları ve ESG çerçeveleri.' : 'Education donations and ESG frameworks.',
    url: `https://fund-ed.com/${locale}${SLUG}`,
    datePublished: DATE,
  })

  const sdgs = isTr ? [
    { code: 'SDG 1', title: 'Yoksulluğun Sonu', desc: 'Eğitimli bireyler daha yüksek gelir kapasitesine sahip olur.', bg: 'bg-red-50', badge: 'bg-red-100 text-red-700', border: 'border-red-100' },
    { code: 'SDG 5', title: 'Cinsiyet Eşitliği', desc: 'Kız çocuklarının eğitime erişimi toplumsal uçurumu kapatır.', bg: 'bg-orange-50', badge: 'bg-orange-100 text-orange-700', border: 'border-orange-100' },
    { code: 'SDG 8', title: 'İnsana Yakışır İş', desc: 'Nitelikli iş gücü yerel ekonomileri güçlendirir.', bg: 'bg-purple-50', badge: 'bg-purple-100 text-purple-700', border: 'border-purple-100' },
    { code: 'SDG 10', title: 'Eşitsizlik Azalır', desc: 'Dezavantajlı öğrencilere erişim yapısal uçurumları giderir.', bg: 'bg-pink-50', badge: 'bg-pink-100 text-pink-700', border: 'border-pink-100' },
  ] : [
    { code: 'SDG 1', title: 'No Poverty', desc: 'Educated individuals have higher lifetime earning potential.', bg: 'bg-red-50', badge: 'bg-red-100 text-red-700', border: 'border-red-100' },
    { code: 'SDG 5', title: 'Gender Equality', desc: "Girls' access to education closes gender gaps systematically.", bg: 'bg-orange-50', badge: 'bg-orange-100 text-orange-700', border: 'border-orange-100' },
    { code: 'SDG 8', title: 'Decent Work', desc: 'A skilled workforce strengthens local economies.', bg: 'bg-purple-50', badge: 'bg-purple-100 text-purple-700', border: 'border-purple-100' },
    { code: 'SDG 10', title: 'Reduced Inequalities', desc: 'Funding disadvantaged students addresses structural inequality.', bg: 'bg-pink-50', badge: 'bg-pink-100 text-pink-700', border: 'border-pink-100' },
  ]

  const metrics = isTr ? [
    'Desteklenen öğrenci sayısı ve profilleri',
    'Tamamlanan eğitim süresi (gün/hafta/dönem)',
    'Karşılanan ihtiyaçlar (kitap, yemek, malzeme)',
    'SDG 4 hizalaması ve ilerleme raporu',
    'Doğrulanmış öğrenci sonuçları',
  ] : [
    'Number of students supported and their verified profiles',
    'Education duration completed (days/weeks/semesters)',
    'Specific needs met (textbooks, meals, school supplies)',
    'SDG 4 alignment and progress reporting',
    'Verified student outcomes (grade completion, attendance)',
  ]

  const steps = isTr ? [
    { n: '01', text: 'Doğrulanmış öğrenci profillerinden size uygun olanı seçin' },
    { n: '02', text: 'Güvenli ödeme ile bağışınızı tamamlayın' },
    { n: '03', text: 'Dashboard üzerinden öğrencinin ilerlemesini takip edin' },
    { n: '04', text: 'Yıllık ESG özet raporunuzu indirin' },
  ] : [
    { n: '01', text: 'Browse verified student profiles and choose one that resonates' },
    { n: '02', text: 'Complete your donation through secure payment' },
    { n: '03', text: "Track the student's progress from your dashboard" },
    { n: '04', text: 'Download your annual ESG summary report' },
  ]

  return (
    <>
      <JsonLd schema={schema} />
      <JsonLd schema={breadcrumbSchema(crumbs)} />
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />

        {/* Hero */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="max-w-3xl mx-auto px-6 pt-16 pb-12">
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <span className="bg-amber-900/60 text-amber-300 text-xs px-3 py-1 rounded-full border border-amber-800/60 font-semibold">
                ESG
              </span>
              <span className="text-slate-500 text-xs">· {isTr ? '7 dk okuma' : '7 min read'}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-4">
              {isTr ? 'ESG Uyumlu Eğitim Bağışı Nedir?' : 'What Is ESG-Aligned Giving in Education?'}
            </h1>
            <p className="text-slate-400 text-base leading-relaxed max-w-2xl">
              {isTr
                ? 'ESG yatırımı bireysel ve kurumsal bağışçılar için standart bir çerçeve haline geliyor. Eğitim bağışları, özellikle "Sosyal" bileşen açısından güçlü bir ESG yatırımıdır.'
                : 'ESG investing is becoming standard for individual and corporate donors. Education donations, particularly for the "Social" component, represent a powerful ESG investment.'}
            </p>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="bg-white border-b border-slate-100">
          <div className="max-w-3xl mx-auto px-6 py-3 flex items-center gap-2 text-xs text-slate-400">
            <Link href={`/${locale}`} className="hover:text-slate-700 transition-colors">
              {isTr ? 'Ana Sayfa' : 'Home'}
            </Link>
            <span>›</span>
            <Link href={`/${locale}/blog`} className="hover:text-slate-700 transition-colors">Blog</Link>
            <span>›</span>
            <span className="text-slate-700 font-medium">
              {isTr ? 'ESG Eğitim Etkisi' : 'ESG Education Impact'}
            </span>
          </div>
        </div>

        <main className="flex-grow">
          <div className="max-w-3xl mx-auto px-4 w-full">

            {/* Section: What is ESG */}
            <section className="py-10 border-b border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                {isTr ? 'ESG Nedir?' : 'What Is ESG?'}
              </p>
              {/* E / S / G three pillars */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { letter: 'E', label: isTr ? 'Çevresel' : 'Environmental', color: 'bg-emerald-50 border-emerald-200 text-emerald-800', badge: 'bg-emerald-100 text-emerald-700' },
                  { letter: 'S', label: isTr ? 'Sosyal' : 'Social',          color: 'bg-amber-50  border-amber-200  text-amber-800',  badge: 'bg-amber-500 text-white', highlight: true },
                  { letter: 'G', label: isTr ? 'Yönetişim' : 'Governance',   color: 'bg-indigo-50 border-indigo-200 text-indigo-800', badge: 'bg-indigo-100 text-indigo-700' },
                ].map(p => (
                  <div key={p.letter} className={`border rounded-2xl p-4 text-center ${p.color} ${p.highlight ? 'ring-2 ring-amber-400 ring-offset-1' : ''}`}>
                    <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full mb-2 ${p.badge}`}>{p.letter}</span>
                    <p className="text-sm font-bold">{p.label}</p>
                    {p.highlight && (
                      <p className="text-xs text-amber-600 mt-1 font-medium">
                        {isTr ? '← Eğitim burada' : '← Education fits here'}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                {isTr
                  ? 'ESG çerçevesi kurumsal yatırım dünyasında başladı; artık bireysel bağışçılar, vakıflar ve sivil toplum da benimsemektedir.'
                  : 'The ESG framework originated in institutional investing and is now embraced by individual donors, foundations, and nonprofits.'}
              </p>
            </section>

            {/* Big stat */}
            <section className="py-10 border-b border-slate-100">
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-6">
                <div className="text-center sm:text-left flex-shrink-0">
                  <p className="text-4xl md:text-5xl font-black text-white">$191T</p>
                  <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mt-1">2035</p>
                </div>
                <div className="w-px h-12 bg-slate-700 hidden sm:block flex-shrink-0" />
                <p className="text-slate-300 text-sm leading-relaxed text-center sm:text-left">
                  {isTr
                    ? 'ESG uyumlu küresel yatırım pazarının 2035 yılına kadar ulaşması beklenen büyüklük. Bu büyüme, somut ve ölçülebilir etkiyi tercih eden bilinçli yatırımcıların talebini yansıtmaktadır.'
                    : 'Projected size of the global ESG-aligned investment market by 2035. This growth reflects demand from conscious investors who prefer concrete, measurable impact over vague "doing good" narratives.'}
                </p>
              </div>
            </section>

            {/* Section: Why education */}
            <section className="py-10 border-b border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                {isTr ? 'Neden Eğitim Güçlü Bir ESG Yatırımıdır?' : 'Why Education Is a Strong ESG Investment'}
              </p>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                {isTr
                  ? 'Eğitim, BM\'nin SDG 4 hedefine doğrudan katkıda bulunurken 4 ek hedefe daha etki eder.'
                  : "Education directly contributes to UN SDG 4 — Quality Education — while impacting 4 additional goals."}
              </p>
              {/* SDG 4 anchor */}
              <div className="flex items-center gap-3 mb-5 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                <span className="text-2xl font-black text-amber-600 flex-shrink-0">4</span>
                <div>
                  <p className="text-sm font-bold text-amber-900">
                    {isTr ? 'SDG 4 — Kaliteli Eğitim' : 'SDG 4 — Quality Education'}
                  </p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    {isTr ? 'Eğitim bağışlarının doğrudan katkı sağladığı birincil hedef' : 'The primary goal education donations directly contribute to'}
                  </p>
                </div>
              </div>
              {/* SDG 2x2 grid */}
              <div className="grid grid-cols-2 gap-3">
                {sdgs.map(s => (
                  <div key={s.code} className={`${s.bg} border ${s.border} rounded-2xl p-4`}>
                    <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-lg mb-2 ${s.badge}`}>{s.code}</span>
                    <p className="text-sm font-bold text-slate-800 mb-1">{s.title}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Section: ESG Metrics */}
            <section className="py-10 border-b border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                {isTr ? 'ESG Raporlamasında Eğitim Metrikleri' : 'ESG Metrics in Education Reporting'}
              </p>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                {isTr
                  ? 'FundEd, kurumsal bağışçılar için her bağış başına ölçülebilir çıktılar sağlar.'
                  : 'FundEd provides measurable outputs for every donation for corporate donors.'}
              </p>
              <div className="flex flex-wrap gap-2">
                {metrics.map((m, i) => (
                  <span key={i} className="flex items-center gap-2 bg-slate-50 border border-slate-200 text-slate-700 text-xs px-3 py-2 rounded-xl font-medium">
                    <span className="text-emerald-500 text-sm">✓</span>
                    {m}
                  </span>
                ))}
              </div>
            </section>

            {/* Section: How FundEd provides ESG reporting */}
            <section className="py-10 border-b border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                {isTr ? 'FundEd ESG Raporlamasını Nasıl Sağlar?' : 'How FundEd Provides ESG Reporting'}
              </p>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                {isTr
                  ? 'FundEd Kurumsal, şirketlerin her bağış için otomatik ESG raporları almasını sağlar. Raporlar SDG hizalamasını, etki metriklerini ve doğrulanmış öğrenci sonuçlarını içerir.'
                  : 'FundEd Corporate allows companies to receive automatic ESG reports for every donation. Reports include SDG alignment, impact metrics, and verified student outcomes.'}
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { icon: '📊', label: isTr ? 'Otomatik ESG Raporları' : 'Automatic ESG Reports' },
                  { icon: '🎯', label: isTr ? 'SDG Hizalama Belgesi' : 'SDG Alignment Documentation' },
                  { icon: '🔍', label: isTr ? 'Doğrulanmış Öğrenci Sonuçları' : 'Verified Student Outcomes' },
                  { icon: '📈', label: isTr ? 'Canlı Etki Takibi' : 'Live Impact Tracking' },
                ].map(f => (
                  <div key={f.label} className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-xl flex-shrink-0">{f.icon}</span>
                    <span className="text-sm font-semibold text-slate-700">{f.label}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-4">
                {isTr ? (
                  <><Link href={`/${locale}/transparency`} className="text-emerald-600 hover:underline">Şeffaflık sayfamızda</Link> metodolojimizi ve doğrulama sürecimizi ayrıntılı olarak inceleyebilirsiniz.</>
                ) : (
                  <>See <Link href={`/${locale}/transparency`} className="text-emerald-600 hover:underline">our transparency page</Link> for our methodology and verification process in detail.</>
                )}
              </p>
            </section>

            {/* Section: How to donate */}
            <section className="py-10 border-b border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                {isTr ? 'Bireysel Bağışçılar Nasıl ESG Uyumlu Bağış Yapabilir?' : 'How Individual Donors Can Give in an ESG-Aligned Way'}
              </p>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                {isTr
                  ? 'FundEd üzerinde doğrulanmış bir öğrenciyi destekleyerek ESG "S" (Sosyal) bileşenine doğrudan katkıda bulunursunuz.'
                  : 'By supporting a verified student on FundEd, you directly contribute to the ESG "S" (Social) component.'}
              </p>
              <div className="space-y-3">
                {steps.map(s => (
                  <div key={s.n} className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-9 h-9 rounded-xl bg-slate-900 text-white text-xs font-black flex items-center justify-center">
                      {s.n}
                    </span>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed pt-2">{s.text}</p>
                  </div>
                ))}
              </div>

              {/* Impact callout */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-black text-emerald-700">$25</p>
                  <p className="text-xs text-emerald-600 mt-1">
                    {isTr ? '3 ders kitabı' : '3 textbooks'}
                  </p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-black text-emerald-700">$100</p>
                  <p className="text-xs text-emerald-600 mt-1">
                    {isTr ? '20 tam eğitim günü' : '20 full days of education'}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-400 mt-4">
                {isTr ? (
                  <><Link href={`/${locale}/education-funding-calculator`} className="text-emerald-600 hover:underline">Etki hesaplayıcımızla</Link> bağışınızın somut etkisini önceden görün. <Link href={`/${locale}/how-it-works`} className="text-emerald-600 hover:underline">Nasıl çalıştığını</Link> öğrenerek bugün başlayın.</>
                ) : (
                  <>Use our <Link href={`/${locale}/education-funding-calculator`} className="text-emerald-600 hover:underline">impact calculator</Link> to see the concrete impact before you give. <Link href={`/${locale}/how-it-works`} className="text-emerald-600 hover:underline">Learn how it works</Link> and start today.</>
                )}
              </p>
            </section>

            {/* Related Articles */}
            <div className="pt-10 pb-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">
                {isTr ? 'İlgili Makaleler' : 'Related Articles'}
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <Link
                  href={`/${locale}/blog/alternatives-to-gofundme-for-education`}
                  className="group flex items-start gap-3 p-4 border border-slate-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 transition-all"
                >
                  <span className="text-emerald-500 text-lg mt-0.5 flex-shrink-0 group-hover:translate-x-1 transition-transform">→</span>
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-emerald-700 transition-colors leading-snug">
                    {isTr ? 'Eğitim için GoFundMe Alternatifleri (2026)' : 'Best Alternatives to GoFundMe for Education (2026)'}
                  </span>
                </Link>
                <Link
                  href={`/${locale}/blog/scholarship-vs-crowdfunding-vs-sponsorship`}
                  className="group flex items-start gap-3 p-4 border border-slate-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 transition-all"
                >
                  <span className="text-emerald-500 text-lg mt-0.5 flex-shrink-0 group-hover:translate-x-1 transition-transform">→</span>
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-emerald-700 transition-colors leading-snug">
                    {isTr ? 'Burs, Kitle Fonlaması, Sponsorluk: Hangisi Daha İyi?' : 'Scholarship vs. Crowdfunding vs. Sponsorship: Which Is Best?'}
                  </span>
                </Link>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-4 mb-12 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">
                  {isTr ? 'ESG Uyumlu Bağış' : 'ESG-Aligned Giving'}
                </p>
                <p className="text-white font-bold text-xl mb-1">
                  {isTr ? 'Ölçülebilir etki, doğrulanmış öğrenciler' : 'Measurable impact, verified students'}
                </p>
                <p className="text-slate-400 text-sm">
                  {isTr
                    ? 'Her bağış takip edilir, raporlanır ve SDG 4\'e hizalanır.'
                    : 'Every donation tracked, reported, and aligned to SDG 4.'}
                </p>
              </div>
              <Link
                href={`/${locale}/fund-a-student`}
                className="flex-shrink-0 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors whitespace-nowrap"
              >
                {isTr ? 'ESG uyumlu bağış yap →' : 'Make an ESG-aligned donation →'}
              </Link>
            </div>

          </div>
        </main>

        <Footer />
      </div>
    </>
  )
}
