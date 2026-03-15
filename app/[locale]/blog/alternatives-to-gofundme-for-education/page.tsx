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
        <main className="flex-grow max-w-3xl mx-auto px-4 py-20 w-full prose prose-slate">
          {isTr ? (
            <>
              <h1>Eğitim Fonlaması İçin En İyi GoFundMe Alternatifleri (2026)</h1>
              <p className="lead">GoFundMe, genel kitle fonlaması için iyi bilinse de eğitim odaklı platformlar — özellikle doğrulama ve etki takibi sunanlar — çok daha iyi bir seçenek sunabilir. İşte 7 platformun dürüst karşılaştırması.</p>

              <h2>Platform Karşılaştırma Tablosu</h2>
              <table>
                <thead><tr><th>Platform</th><th>Odak</th><th>Doğrulama</th><th>ESG/Etki</th><th>Kapsam</th></tr></thead>
                <tbody>
                  <tr><td><strong>FundEd</strong></td><td>Eğitim</td><td>✅ Tam doğrulama</td><td>✅ ESG raporları</td><td>Global</td></tr>
                  <tr><td>GoFundMe</td><td>Genel</td><td>❌ Yok</td><td>❌ Yok</td><td>Global</td></tr>
                  <tr><td>DonorsChoose</td><td>Sınıf projeleri</td><td>✅ Öğretmen odaklı</td><td>⚠️ Temel</td><td>Sadece ABD</td></tr>
                  <tr><td>Kiva</td><td>Mikro kredi</td><td>✅ Ortak doğrulama</td><td>⚠️ Geri ödeme odaklı</td><td>Global</td></tr>
                  <tr><td>GlobalGiving</td><td>Kar amacı gütmeyenler</td><td>✅ Kurum bazlı</td><td>✅ İlerleme raporları</td><td>Global</td></tr>
                  <tr><td>JustGiving</td><td>Hayır kurumu/bireysel</td><td>❌ Minimal</td><td>❌ Yok</td><td>Büyük ölçüde İngiltere</td></tr>
                  <tr><td>ScholarshipOwl</td><td>Burslar</td><td>✅ Burs odaklı</td><td>❌ Yok</td><td>ABD ağırlıklı</td></tr>
                </tbody>
              </table>

              <h2>1. FundEd — En İyi ESG Uyumlu Eğitim Fonlama</h2>
              <p>FundEd, eğitim fonlamasına odaklanan, tam öğrenci doğrulaması, canlı etki takibi ve ESG raporlaması sunan bir platformdur. Küresel olarak çalışır ve bireysel ile kurumsal bağışçıları destekler.</p>
              <p><strong>Avantajlar:</strong> Doğrulanmış öğrenciler, ESG uyumlu raporlama, şeffaf fon takibi, global erişim.</p>
              <p><strong>Dezavantajlar:</strong> GoFundMe kadar geniş marka tanınırlığına sahip değil (henüz).</p>

              <h2>2. GoFundMe — Genel Amaçlı, Eğitim Odaklı Değil</h2>
              <p>GoFundMe, genel bağış toplama için en büyük platformdur. Ancak öğrenci doğrulaması yoktur, fonların nasıl kullanıldığının takibi yapılamaz ve ESG raporlaması mevcut değildir. Eğitim bağışçıları için şeffaflık eksikliği önemli bir dezavantajdır.</p>

              <h2>3. DonorsChoose — ABD Sınıfları İçin Harika</h2>
              <p>DonorsChoose, ABD&apos;deki öğretmenlerin sınıf projeleri için kaynak toplamasına olanak tanır. Mükemmel bir doğrulama sürecine sahiptir ancak ABD dışındaki öğrencileri veya genel eğitim ihtiyaçlarını desteklemez.</p>

              <h2>Hangi Platformu Seçmelisiniz?</h2>
              <p>Eğitime özel, doğrulanmış ve etkisi ölçülebilir bir bağış yapmak istiyorsanız: <Link href={`/${locale}/fund-a-student`}>FundEd</Link>&apos;i tercih edin. Sadece ABD&apos;deki sınıf materyalleri için: DonorsChoose ideal. Mikro kredi + eğitim karışımı için: Kiva değerlendirilebilir.</p>

              <h2>Şeffaflık Neden Önemli?</h2>
              <p>GoFundMe gibi genel platformlarda bağışınızın gerçekten eğitime gittiğini doğrulamanın yolu yoktur. <Link href={`/${locale}/transparency`}>Şeffaflık sayfamızda</Link> FundEd&apos;in her bağışı nasıl izlediğini görebilirsiniz.</p>

              <h2>Sonuç</h2>
              <p>Eğitim odaklı, güvenli ve etkisi doğrulanmış bir bağış platformu arıyorsanız, FundEd en iyi seçenektir. <Link href={`/${locale}/how-it-works`}>Nasıl çalıştığını öğrenin</Link> ve bugün bir öğrencinin eğitimine katkıda bulunun.</p>
            </>
          ) : (
            <>
              <h1>Best Alternatives to GoFundMe for Education Funding (2026)</h1>
              <p className="lead">While GoFundMe is well-known for general crowdfunding, education-focused platforms — especially those offering verification and impact tracking — can be far better choices. Here&apos;s an honest comparison of 7 platforms.</p>

              <h2>Platform Comparison Table</h2>
              <table>
                <thead><tr><th>Platform</th><th>Focus</th><th>Verification</th><th>ESG/Impact</th><th>Scope</th></tr></thead>
                <tbody>
                  <tr><td><strong>FundEd</strong></td><td>Education</td><td>✅ Full verification</td><td>✅ ESG reports</td><td>Global</td></tr>
                  <tr><td>GoFundMe</td><td>General</td><td>❌ None</td><td>❌ None</td><td>Global</td></tr>
                  <tr><td>DonorsChoose</td><td>Classroom projects</td><td>✅ Teacher-focused</td><td>⚠️ Basic</td><td>US only</td></tr>
                  <tr><td>Kiva</td><td>Microloans</td><td>✅ Partner-verified</td><td>⚠️ Repayment-focused</td><td>Global</td></tr>
                  <tr><td>GlobalGiving</td><td>Nonprofits</td><td>✅ Org-level</td><td>✅ Progress reports</td><td>Global</td></tr>
                  <tr><td>JustGiving</td><td>Charity/personal</td><td>❌ Minimal</td><td>❌ None</td><td>Mostly UK</td></tr>
                  <tr><td>ScholarshipOwl</td><td>Scholarships</td><td>✅ Scholarship-focused</td><td>❌ None</td><td>US-heavy</td></tr>
                </tbody>
              </table>

              <h2>1. FundEd — Best ESG-Aligned Education Platform</h2>
              <p>FundEd is purpose-built for education funding, offering full student verification, live impact tracking, and ESG reporting. It operates globally and supports individual and corporate donors.</p>
              <p><strong>Pros:</strong> Verified students, ESG-compliant reporting, transparent fund tracking, global reach.</p>
              <p><strong>Cons:</strong> Doesn&apos;t have GoFundMe&apos;s brand recognition (yet).</p>

              <h2>2. GoFundMe — General Purpose, Not Education-Focused</h2>
              <p>GoFundMe is the largest general fundraising platform. However, it has no student verification, no tracking of how funds are used, and no ESG reporting. The lack of transparency is a significant drawback for education donors.</p>

              <h2>3. DonorsChoose — Great for US Classrooms</h2>
              <p>DonorsChoose lets US teachers raise funds for classroom projects. It has an excellent verification process but doesn&apos;t support students outside the US or general educational needs.</p>

              <h2>Which Platform Should You Choose?</h2>
              <p>For verified, impact-tracked education donations: choose <Link href={`/${locale}/fund-a-student`}>FundEd</Link>. For US classroom supplies only: DonorsChoose is ideal. For microloans with an education component: Kiva is worth considering.</p>

              <h2>Why Transparency Matters</h2>
              <p>On general platforms like GoFundMe, there&apos;s no way to verify your donation actually went to education. See <Link href={`/${locale}/transparency`}>our transparency page</Link> for how FundEd tracks every donation.</p>

              <h2>Conclusion</h2>
              <p>If you want an education-focused, secure, and impact-verified donation platform, FundEd is the best choice. <Link href={`/${locale}/how-it-works`}>See how it works</Link> and start funding a student&apos;s education today.</p>
            </>
          )}

          <div className="not-prose mt-10 border-t border-slate-100 pt-8">
            <p className="font-semibold text-slate-700 mb-4">{isTr ? 'İlgili Makaleler' : 'Related Articles'}</p>
            <div className="flex flex-col gap-2">
              <Link href={`/${locale}/blog/scholarship-vs-crowdfunding-vs-sponsorship`} className="text-emerald-600 underline underline-offset-4">
                {isTr ? 'Burs, Kitle Fonlaması, Sponsorluk: Hangisi Daha İyi?' : 'Scholarship vs. Crowdfunding vs. Sponsorship: Which Is Best?'}
              </Link>
              <Link href={`/${locale}/blog/esg-education-impact`} className="text-emerald-600 underline underline-offset-4">
                {isTr ? 'ESG Uyumlu Eğitim Bağışı Nedir?' : 'What Is ESG-Aligned Giving in Education?'}
              </Link>
            </div>
          </div>
          <div className="not-prose mt-8 p-6 bg-emerald-50 rounded-2xl">
            <p className="font-semibold text-slate-900 mb-2">{isTr ? 'Hemen başlayın' : 'Get started now'}</p>
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
