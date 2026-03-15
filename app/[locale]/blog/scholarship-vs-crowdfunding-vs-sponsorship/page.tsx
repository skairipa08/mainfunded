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
    title: isTr
      ? 'Burs, Kitle Fonlaması, Sponsorluk: Fark Ne? | FundEd'
      : 'Scholarship vs. Crowdfunding vs. Sponsorship: What\'s the Difference? | FundEd',
    description: isTr
      ? 'Öğrenci eğitimini desteklemenin üç yolu karşılaştırıldı. Hangisi sizin için doğru?'
      : 'Three ways to fund a student\'s education compared. Which is right for you?',
    alternates: buildAlternates(locale, SLUG),
  }
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
    title: isTr ? 'Burs, Kitle Fonlaması, Sponsorluk: Fark Ne?' : 'Scholarship vs. Crowdfunding vs. Sponsorship',
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
        <main className="flex-grow max-w-3xl mx-auto px-4 py-20 w-full prose prose-slate">
          {isTr ? (
            <>
              <h1>Burs, Kitle Fonlaması ve Sponsorluk: Bir Öğrencinin Eğitimini Desteklemek İçin En İyi Yol Hangisi?</h1>
              <p className="lead">Bir öğrencinin eğitimini desteklemenin birden fazla yolu vardır. Burs, kitle fonlaması ve sponsorluk — her birinin avantajları ve sınırlılıkları farklıdır.</p>

              <h2>Karşılaştırma Tablosu</h2>
              <table>
                <thead><tr><th>Model</th><th>Kim Başvurabilir</th><th>Süreç</th><th>Etki Takibi</th><th>Esneklik</th></tr></thead>
                <tbody>
                  <tr><td><strong>Kitle Fonlaması (FundEd)</strong></td><td>Herhangi bir öğrenci</td><td>Hızlı başvuru</td><td>✅ Gerçek zamanlı</td><td>✅ Yüksek</td></tr>
                  <tr><td>Burs</td><td>Kriterlere uyanlar</td><td>Uzun başvuru</td><td>❌ Genellikle yok</td><td>❌ Düşük</td></tr>
                  <tr><td>Sponsorluk</td><td>Kurumsal ilişkiler gerektirir</td><td>Müzakere bazlı</td><td>⚠️ Değişken</td><td>⚠️ Orta</td></tr>
                </tbody>
              </table>

              <h2>Burs</h2>
              <p>Burslar, belirli kriterleri karşılayan öğrencilere (akademik başarı, mali durum, demografik) verilen hibe fonlardır. Avantajı, geri ödeme gerektirmemesidir. Dezavantajı ise rekabetçi olması, başvuru sürecinin uzun sürmesi ve çoğu zaman etki takibinin yapılmamasıdır.</p>

              <h2>Kitle Fonlaması</h2>
              <p>FundEd gibi kitle fonlama platformları, öğrencilerin doğrudan bağışçılarla bağlantı kurmasını sağlar. Süreç daha hızlıdır, herhangi bir öğrenci başvurabilir ve bağışçılar fonların nasıl kullanıldığını gerçek zamanlı takip edebilir. <Link href={`/${locale}/fund-a-student`}>Bir öğrenciyi desteklemek</Link> için ideal bir modeldir.</p>

              <h2>Sponsorluk</h2>
              <p>Kurumsal sponsorluk, bir şirketin belirli bir öğrenciyi veya programı doğrudan finanse etmesini içerir. ESG hedefleri için güçlü olabilir ancak bireysel bağışçılar için pratik değildir ve kurumsal ilişkiler gerektirir.</p>

              <h2>Sonuç</h2>
              <p>Hızlı etki, şeffaflık ve esneklik istiyorsanız kitle fonlaması — özellikle <Link href={`/${locale}/fund-a-student`}>FundEd</Link> — en iyi seçenektir. <Link href={`/${locale}/education-funding-calculator`}>Etki hesaplayıcımızla</Link> bağışınızın ne kadar fark yaratabileceğini görün.</p>
            </>
          ) : (
            <>
              <h1>Scholarship vs. Crowdfunding vs. Sponsorship: Which Is Best for Funding a Student&apos;s Education?</h1>
              <p className="lead">There are multiple ways to support a student&apos;s education. Scholarships, crowdfunding, and sponsorship each have different advantages and limitations.</p>

              <h2>Comparison Table</h2>
              <table>
                <thead><tr><th>Model</th><th>Who Can Apply</th><th>Process</th><th>Impact Tracking</th><th>Flexibility</th></tr></thead>
                <tbody>
                  <tr><td><strong>Crowdfunding (FundEd)</strong></td><td>Any student</td><td>Fast application</td><td>✅ Real-time</td><td>✅ High</td></tr>
                  <tr><td>Scholarship</td><td>Criteria-based</td><td>Long application</td><td>❌ Usually none</td><td>❌ Low</td></tr>
                  <tr><td>Sponsorship</td><td>Requires corporate relationships</td><td>Negotiation-based</td><td>⚠️ Variable</td><td>⚠️ Medium</td></tr>
                </tbody>
              </table>

              <h2>Scholarships</h2>
              <p>Scholarships are grants given to students meeting specific criteria (academic merit, financial need, demographics). The advantage is no repayment required. The disadvantages are high competition, long application processes, and usually no impact tracking.</p>

              <h2>Crowdfunding</h2>
              <p>Crowdfunding platforms like FundEd allow students to connect directly with donors. The process is faster, any student can apply, and donors can track how funds are used in real time. It&apos;s the ideal model for <Link href={`/${locale}/fund-a-student`}>funding a student</Link>.</p>

              <h2>Sponsorship</h2>
              <p>Corporate sponsorship involves a company directly funding a specific student or program. It can be powerful for ESG goals but isn&apos;t practical for individual donors and requires corporate relationships.</p>

              <h2>Conclusion</h2>
              <p>If you want speed, transparency, and flexibility, crowdfunding — especially <Link href={`/${locale}/fund-a-student`}>FundEd</Link> — is the best choice. Use our <Link href={`/${locale}/education-funding-calculator`}>impact calculator</Link> to see how much difference your donation can make.</p>
            </>
          )}

          <div className="not-prose mt-10 border-t border-slate-100 pt-8">
            <p className="font-semibold text-slate-700 mb-4">{isTr ? 'İlgili Makaleler' : 'Related Articles'}</p>
            <div className="flex flex-col gap-2">
              <Link href={`/${locale}/blog/alternatives-to-gofundme-for-education`} className="text-emerald-600 underline underline-offset-4">
                {isTr ? 'Eğitim için GoFundMe Alternatifleri (2026)' : 'Best Alternatives to GoFundMe for Education (2026)'}
              </Link>
              <Link href={`/${locale}/blog/esg-education-impact`} className="text-emerald-600 underline underline-offset-4">
                {isTr ? 'ESG Uyumlu Eğitim Bağışı Nedir?' : 'What Is ESG-Aligned Giving in Education?'}
              </Link>
            </div>
          </div>
          <div className="not-prose mt-8 p-6 bg-emerald-50 rounded-2xl">
            <Link href={`/${locale}/fund-a-student`} className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors">
              {isTr ? 'Bir öğrenciyi destekle →' : 'Fund a student →'}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    </>
  )
}
