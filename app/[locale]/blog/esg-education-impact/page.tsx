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

  return (
    <>
      <JsonLd schema={schema} />
      <JsonLd schema={breadcrumbSchema(crumbs)} />
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-grow max-w-3xl mx-auto px-4 py-20 w-full prose prose-slate">
          {isTr ? (
            <>
              <h1>ESG Uyumlu Eğitim Bağışı Nedir?</h1>
              <p className="lead">ESG (Çevre, Sosyal, Yönetişim) yatırımı artık bireysel bağışçılar ve kurumsal bağışçılar için standart bir çerçeve haline geliyor. Eğitim bağışları, özellikle &quot;Sosyal&quot; bileşen açısından güçlü bir ESG yatırımıdır. Bu makalede ESG&apos;nin ne olduğunu, eğitimin neden güçlü bir sosyal yatırım aracı olduğunu ve FundEd&apos;in bu çerçeveyle nasıl hizalandığını inceleyeceğiz.</p>

              <h2>ESG Nedir?</h2>
              <p>ESG, bir yatırımın veya bağışın üç boyutta değerlendirildiği bir çerçevedir: <strong>Çevresel (Environmental)</strong> etki, <strong>Sosyal (Social)</strong> etki ve <strong>Yönetişim (Governance)</strong> kalitesi. Bu çerçeve, kurumsal yatırım dünyasında başladı; ancak artık bireysel bağışçılar, vakıflar ve sivil toplum kuruluşları da ESG ilkelerini benimsemektedir.</p>
              <p>Dünya genelinde ESG uyumlu yatırım pazarının 2035 yılına kadar 191 trilyon dolara ulaşması beklenmektedir. Bu büyüme, &quot;iyi hissetmek&quot; için değil, somut ve ölçülebilir etkiyi tercih eden bilinçli bağışçı ve yatırımcıların talebini yansıtmaktadır.</p>

              <h2>Eğitim Neden Güçlü Bir ESG Yatırımıdır?</h2>
              <p>Eğitim, BM&apos;nin Sürdürülebilir Kalkınma Hedefleri&apos;nden (SDG) 4. hedefe — &quot;Kaliteli Eğitim&quot; — doğrudan katkıda bulunur. Bunun yanı sıra eğitim yatırımının çok boyutlu etkileri vardır:</p>
              <ul>
                <li><strong>SDG 1 — Yoksulluğun Sona Erdirilmesi:</strong> Eğitimli bireyler daha yüksek gelir elde etme kapasitesine sahip olur.</li>
                <li><strong>SDG 5 — Cinsiyet Eşitliği:</strong> Kız çocuklarının eğitime erişimi toplumsal cinsiyet uçurumunu kapatır.</li>
                <li><strong>SDG 8 — İnsana Yakışır İş ve Ekonomik Büyüme:</strong> Nitelikli iş gücü oluşturarak yerel ekonomileri güçlendirir.</li>
                <li><strong>SDG 10 — Eşitsizliklerin Azaltılması:</strong> Dezavantajlı öğrencilere erişim sağlamak, yapısal eşitsizlikleri giderir.</li>
              </ul>
              <p>Bu çok boyutlu etki, eğitim bağışlarını ESG portföyünde diğer sosyal yatırımlardan ayıran kritik özelliğidir.</p>

              <h2>ESG Raporlamasında Eğitim Metrikler</h2>
              <p>Kurumsal bağışçılar için en önemli soru şudur: &quot;Bu yatırımın etkisini nasıl belgeliyoruz?&quot; FundEd, her bağış için ölçülebilir çıktılar sağlar:</p>
              <ul>
                <li>Desteklenen öğrenci sayısı ve profilleri</li>
                <li>Tamamlanan eğitim süresi (gün/hafta/dönem)</li>
                <li>Karşılanan spesifik ihtiyaçlar (kitap, yemek, okul malzemeleri)</li>
                <li>SDG 4 hizalaması ve ilerleme raporu</li>
                <li>Doğrulanmış öğrenci sonuçları (sınıf geçme, devam oranı)</li>
              </ul>

              <h2>FundEd ESG Raporlamasını Nasıl Sağlar?</h2>
              <p>FundEd Kurumsal, şirketlerin her bağış için otomatik ESG raporları almasını sağlar. Raporlar SDG hizalamasını, etki metriklerini ve doğrulanmış öğrenci sonuçlarını içerir. <Link href={`/${locale}/transparency`}>Şeffaflık sayfamızda</Link> metodolojimizi ve doğrulama sürecimizi ayrıntılı olarak inceleyebilirsiniz.</p>
              <p>Bireysel bağışçılar da kişisel dashboard üzerinden her bağışlarının izini takip edebilir. Bu şeffaflık, FundEd&apos;i genel kitle fonlama platformlarından temelden ayırmaktadır.</p>

              <h2>Bireysel Bağışçılar Nasıl ESG Uyumlu Bağış Yapabilir?</h2>
              <p>FundEd üzerinde <Link href={`/${locale}/fund-a-student`}>doğrulanmış bir öğrenciyi destekleyerek</Link> ESG &quot;S&quot; (Sosyal) bileşenine doğrudan katkıda bulunursunuz. Süreç şu şekilde işler:</p>
              <ol>
                <li>Doğrulanmış öğrenci profillerinden size uygun olanı seçin</li>
                <li>Güvenli ödeme ile bağışınızı tamamlayın</li>
                <li>Dashboard üzerinden öğrencinin ilerlemesini ve etki raporlarını takip edin</li>
                <li>Yıllık ESG özet raporunuzu indirin (Kurumsal üyelerde otomatik)</li>
              </ol>
              <p>Her bağış takip edilir ve raporlanır. <Link href={`/${locale}/education-funding-calculator`}>Etki hesaplayıcımızla</Link> bağışınızın somut etkisini önceden görün — $25 bağış 3 ders kitabına, $100 bağış ise 20 tam eğitim gününe karşılık gelmektedir. <Link href={`/${locale}/how-it-works`}>Nasıl çalıştığını</Link> öğrenerek bugün başlayın.</p>
            </>
          ) : (
            <>
              <h1>What Is ESG-Aligned Giving in Education?</h1>
              <p className="lead">ESG (Environmental, Social, Governance) investing is becoming standard for individual and corporate donors. Education donations, particularly for the &quot;Social&quot; component, represent a powerful ESG investment. In this article we examine what ESG is, why education is a strong social investment vehicle, and how FundEd aligns with this framework.</p>

              <h2>What Is ESG?</h2>
              <p>ESG is a framework for evaluating an investment or donation across three dimensions: <strong>Environmental</strong> impact, <strong>Social</strong> impact, and <strong>Governance</strong> quality. The framework originated in institutional investing but is now embraced by individual donors, foundations, and nonprofits as well.</p>
              <p>The global ESG-aligned investment market is expected to reach $191 trillion by 2035. This growth reflects the demand from conscious donors and investors who prefer concrete, measurable impact over vague &quot;doing good&quot; narratives.</p>

              <h2>Why Education Is a Strong ESG Investment</h2>
              <p>Education directly contributes to UN Sustainable Development Goal 4 — &quot;Quality Education.&quot; Beyond SDG 4, education investments have multi-dimensional impact:</p>
              <ul>
                <li><strong>SDG 1 — No Poverty:</strong> Educated individuals have higher lifetime earning potential.</li>
                <li><strong>SDG 5 — Gender Equality:</strong> Girls&apos; access to education closes gender gaps systematically.</li>
                <li><strong>SDG 8 — Decent Work and Economic Growth:</strong> A skilled workforce strengthens local economies.</li>
                <li><strong>SDG 10 — Reduced Inequalities:</strong> Funding disadvantaged students directly addresses structural inequality.</li>
              </ul>
              <p>This multi-dimensional impact is what distinguishes education donations from other social investments in an ESG portfolio.</p>

              <h2>ESG Metrics in Education Reporting</h2>
              <p>For corporate donors, the critical question is: &quot;How do we document this investment&apos;s impact?&quot; FundEd provides measurable outputs for every donation:</p>
              <ul>
                <li>Number of students supported and their verified profiles</li>
                <li>Education duration completed (days/weeks/semesters)</li>
                <li>Specific needs met (textbooks, meals, school supplies)</li>
                <li>SDG 4 alignment and progress reporting</li>
                <li>Verified student outcomes (grade completion, attendance rate)</li>
              </ul>

              <h2>How FundEd Provides ESG Reporting</h2>
              <p>FundEd Corporate allows companies to receive automatic ESG reports for every donation. Reports include SDG alignment, impact metrics, and verified student outcomes. See <Link href={`/${locale}/transparency`}>our transparency page</Link> for our methodology and verification process in detail.</p>
              <p>Individual donors can also track every donation&apos;s audit trail from their personal dashboard. This transparency is what fundamentally distinguishes FundEd from general crowdfunding platforms.</p>

              <h2>How Individual Donors Can Give in an ESG-Aligned Way</h2>
              <p>By <Link href={`/${locale}/fund-a-student`}>supporting a verified student on FundEd</Link>, you directly contribute to the ESG &quot;S&quot; (Social) component. Here&apos;s how the process works:</p>
              <ol>
                <li>Browse verified student profiles and choose one that resonates with you</li>
                <li>Complete your donation through secure payment</li>
                <li>Track the student&apos;s progress and impact reports from your dashboard</li>
                <li>Download your annual ESG summary report (automatic for Corporate members)</li>
              </ol>
              <p>Every donation is tracked and reported. Use our <Link href={`/${locale}/education-funding-calculator`}>impact calculator</Link> to see the concrete impact of your donation before you give — a $25 donation provides 3 textbooks, and a $100 donation covers 20 full days of education. <Link href={`/${locale}/how-it-works`}>Learn how it works</Link> and start today.</p>
            </>
          )}

          <div className="not-prose mt-10 border-t border-slate-100 pt-8">
            <p className="font-semibold text-slate-700 mb-4">{isTr ? 'İlgili Makaleler' : 'Related Articles'}</p>
            <div className="flex flex-col gap-2">
              <Link href={`/${locale}/blog/alternatives-to-gofundme-for-education`} className="text-emerald-600 underline underline-offset-4">
                {isTr ? 'Eğitim için GoFundMe Alternatifleri (2026)' : 'Best Alternatives to GoFundMe for Education (2026)'}
              </Link>
              <Link href={`/${locale}/blog/scholarship-vs-crowdfunding-vs-sponsorship`} className="text-emerald-600 underline underline-offset-4">
                {isTr ? 'Burs, Kitle Fonlaması, Sponsorluk: Hangisi Daha İyi?' : 'Scholarship vs. Crowdfunding vs. Sponsorship: Which Is Best?'}
              </Link>
            </div>
          </div>
          <div className="not-prose mt-8 p-6 bg-emerald-50 rounded-2xl">
            <Link href={`/${locale}/fund-a-student`} className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors">
              {isTr ? 'ESG uyumlu bağış yap →' : 'Make an ESG-aligned donation →'}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    </>
  )
}
