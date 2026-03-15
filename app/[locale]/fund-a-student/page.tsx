// app/[locale]/fund-a-student/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { buildAlternates } from '@/lib/seo/metadata'
import { JsonLd } from '@/components/seo/JsonLd'
import { faqSchema, breadcrumbSchema } from '@/lib/seo/schemas'
import { getDb } from '@/lib/db'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

interface Props {
  params: { locale: string }
}

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isTr = locale === 'tr'
  return {
    title: isTr
      ? 'Bir Öğrenciyi Destekle — Şeffaf Etki | FundEd'
      : 'Fund a Student — Transparent Impact | FundEd',
    description: isTr
      ? 'Desteklemek istediğiniz doğrulanmış bir öğrenci seçin. Her bağış takip edilir ve etki olarak raporlanır. $25 ile başlayın.'
      : 'Choose a verified student to fund. Every donation is tracked and impact-reported. Start with $25.',
    alternates: buildAlternates(locale, '/fund-a-student'),
    openGraph: {
      images: ['/og-image.png'],
    },
  }
}

async function getFeaturedCampaigns() {
  try {
    const db = await getDb()
    return db.collection('campaigns')
      .find({ status: { $in: ['active', 'published'] } })
      .sort({ created_at: -1 })
      .limit(6)
      .toArray()
  } catch {
    return []
  }
}

const faqEn = [
  { question: 'How do I fund a student?', answer: 'Browse verified student profiles, choose one that resonates with you, and donate any amount. You\'ll receive progress updates directly to your email.' },
  { question: 'Is my donation tax-deductible?', answer: 'Depending on your country, donations may be tax-deductible. We provide a donation receipt for all transactions. Consult your local tax authority for eligibility.' },
  { question: 'How are students selected?', answer: 'Students apply with verified ID, enrollment documents, and a detailed needs assessment. Only verified students appear on the platform.' },
  { question: 'Can I fund a student monthly?', answer: 'Yes. You can set up recurring monthly donations to support a student throughout their academic year.' },
  { question: 'What happens if a campaign reaches its goal?', answer: 'Once fully funded, the student receives the funds directly for their specified educational needs. You\'ll be notified and receive a final impact report.' },
]

const faqTr = [
  { question: 'Bir öğrenciyi nasıl desteklerim?', answer: 'Doğrulanmış öğrenci profillerine göz atın, size uygun olanı seçin ve istediğiniz miktarda bağış yapın. İlerleme güncellemelerini doğrudan e-postanıza alacaksınız.' },
  { question: 'Bağışım vergiden düşülebilir mi?', answer: 'Ülkenize bağlı olarak bağışlar vergiden düşülebilir. Tüm işlemler için bağış makbuzu sağlıyoruz. Uygunluk için yerel vergi otoritenize danışın.' },
  { question: 'Öğrenciler nasıl seçiliyor?', answer: 'Öğrenciler doğrulanmış kimlik, öğrenim belgesi ve ayrıntılı ihtiyaç değerlendirmesiyle başvurur. Yalnızca doğrulanmış öğrenciler platformda yer alır.' },
  { question: 'Aylık düzenli bağış yapabilir miyim?', answer: 'Evet. Bir öğrenciyi akademik yıl boyunca desteklemek için aylık yinelenen bağış kurabilirsiniz.' },
  { question: 'Bir kampanya hedefine ulaşırsa ne olur?', answer: 'Tamamen fonlandığında, öğrenci belirlenen eğitim ihtiyaçları için doğrudan fonu alır. Bildirim alırsınız ve son bir etki raporu gönderilir.' },
]

export default async function FundAStudentPage({ params: { locale } }: Props) {
  const isTr = locale === 'tr'
  const campaigns = await getFeaturedCampaigns()
  const faqs = isTr ? faqTr : faqEn
  const breadcrumbs = isTr
    ? [{ name: 'Ana Sayfa', url: 'https://fund-ed.com/tr' }, { name: 'Öğrenci Destekle', url: 'https://fund-ed.com/tr/fund-a-student' }]
    : [{ name: 'Home', url: 'https://fund-ed.com/en' }, { name: 'Fund a Student', url: 'https://fund-ed.com/en/fund-a-student' }]

  return (
    <>
      <JsonLd schema={faqSchema(faqs)} />
      <JsonLd schema={breadcrumbSchema(breadcrumbs)} />
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-grow">

          {/* HERO */}
          <section className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 py-24 px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
                {isTr
                  ? 'Doğrulanmış Etki Takibiyle Bir Öğrencinin Eğitimini Destekle'
                  : "Fund a Student's Education with Verified Impact Tracking"}
              </h1>
              <p className="text-lg text-emerald-100 max-w-2xl mx-auto mb-8">
                {isTr
                  ? 'FundEd, bağışçıları doğrulanmış öğrencilerle buluşturan ilk ESG uyumlu eğitim fonlama platformudur. Her bağış takip edilir.'
                  : 'FundEd is the first ESG-aligned education funding platform connecting donors with verified students. Every donation is tracked.'}
              </p>
              <Link
                href={`/${locale}/browse`}
                className="inline-block bg-white text-emerald-700 font-semibold px-8 py-4 rounded-2xl text-lg hover:bg-emerald-50 transition-colors"
              >
                {isTr ? 'Öğrencileri Keşfet' : 'Browse Students'}
              </Link>
            </div>
          </section>

          {/* IMPACT STATS */}
          <section className="py-16 bg-emerald-50">
            <div className="max-w-5xl mx-auto px-4 grid grid-cols-3 gap-8 text-center">
              <div>
                <p className="text-4xl font-bold text-emerald-700">{campaigns.length}+</p>
                <p className="text-slate-600 mt-2">{isTr ? 'Aktif Kampanya' : 'Active Campaigns'}</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-emerald-700">100%</p>
                <p className="text-slate-600 mt-2">{isTr ? 'Doğrulanmış Öğrenci' : 'Verified Students'}</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-emerald-700">ESG</p>
                <p className="text-slate-600 mt-2">{isTr ? 'Uyumlu Raporlama' : 'Aligned Reporting'}</p>
              </div>
            </div>
          </section>

          {/* STUDENT GRID */}
          {campaigns.length > 0 && (
            <section className="py-20 px-4">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
                  {isTr ? 'Desteklenmeyi Bekleyen Öğrenciler' : 'Students Waiting to Be Funded'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {campaigns.map((c: any) => (
                    <Link
                      key={c._id?.toString()}
                      href={`/${locale}/campaign/${c.campaign_id || c._id}`}
                      className="block bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-shadow p-6"
                    >
                      <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">{c.title}</h3>
                      <p className="text-sm text-slate-500 line-clamp-3">{c.story?.substring(0, 120)}</p>
                    </Link>
                  ))}
                </div>
                <div className="text-center mt-10">
                  <Link href={`/${locale}/browse`} className="inline-block bg-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors">
                    {isTr ? 'Tüm Öğrencileri Gör' : 'See All Students'}
                  </Link>
                </div>
              </div>
            </section>
          )}

          {/* HOW IT WORKS MINI */}
          <section className="py-20 bg-slate-50 px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
                {isTr ? 'Nasıl Çalışır' : 'How It Works'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { step: '01', en: 'Browse verified students', tr: 'Doğrulanmış öğrencilere göz at' },
                  { step: '02', en: 'Donate securely', tr: 'Güvenli bağış yap' },
                  { step: '03', en: 'Track real impact', tr: 'Gerçek etkiyi takip et' },
                ].map((s) => (
                  <div key={s.step} className="text-center">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <span className="font-bold text-emerald-700">{s.step}</span>
                    </div>
                    <p className="font-semibold text-slate-800">{isTr ? s.tr : s.en}</p>
                  </div>
                ))}
              </div>
              <div className="text-center mt-10 flex flex-wrap justify-center gap-4">
                <Link href={`/${locale}/how-it-works`} className="text-emerald-600 underline underline-offset-4 font-medium">
                  {isTr ? 'Detaylı Rehberi Oku' : 'Read the full guide'}
                </Link>
                <Link href={`/${locale}/transparency`} className="text-emerald-600 underline underline-offset-4 font-medium">
                  {isTr ? 'Şeffaflık Politikamız' : 'Our Transparency Policy'}
                </Link>
                <Link href={`/${locale}/education-funding-calculator`} className="text-emerald-600 underline underline-offset-4 font-medium">
                  {isTr ? 'Etki Hesaplayıcı' : 'Impact Calculator'}
                </Link>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-20 px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
                {isTr ? 'Sık Sorulan Sorular' : 'Frequently Asked Questions'}
              </h2>
              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <details key={i} className="bg-slate-50 rounded-xl border border-slate-100 p-6">
                    <summary className="font-semibold text-slate-800 cursor-pointer">{faq.question}</summary>
                    <p className="mt-3 text-slate-500 leading-relaxed">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>

        </main>
        <Footer />
      </div>
    </>
  )
}
