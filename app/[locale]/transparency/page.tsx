// app/[locale]/transparency/page.tsx
import type { Metadata } from 'next'
import { buildAlternates } from '@/lib/seo/metadata'
import { JsonLd } from '@/components/seo/JsonLd'
import { faqSchema, breadcrumbSchema } from '@/lib/seo/schemas'
import TransparencyClient from './TransparencyClient'

interface Props {
  params: { locale: string }
}

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isTr = locale === 'tr'
  return {
    title: isTr
      ? 'Doğrulanmış ve Şeffaf Eğitim Fonlaması | FundEd'
      : 'Verified & Transparent Education Funding | FundEd',
    description: isTr
      ? 'Her bağışın tam olarak nereye gittiğini görün. FundEd canlı fon takibi ve doğrulanmış öğrenci sonuçları yayınlar.'
      : 'See exactly where every donation goes. FundEd publishes live fund tracking and verified student outcomes.',
    alternates: buildAlternates(locale, '/transparency'),
  }
}

const faqEn = [
  { question: 'How does FundEd verify students?', answer: 'Every student submits ID, enrollment documents, and a needs statement. Our team verifies all documents before any profile is published on the platform.' },
  { question: 'How is my donation tracked?', answer: 'Every donation is assigned a transaction ID and linked to a specific student or fund. You can view the complete audit trail from your donor dashboard.' },
  { question: 'What percentage goes to students?', answer: 'The vast majority of every donation reaches the student directly. A small platform fee covers operations and verification costs — displayed transparently on every donation page.' },
  { question: 'Can I see how past donations were spent?', answer: 'Yes. Every completed campaign shows a breakdown of how funds were used, with receipts and student progress updates.' },
  { question: 'Is FundEd ESG-compliant?', answer: 'Yes. FundEd provides impact reports aligned with ESG (Environmental, Social, Governance) frameworks, including SDG 4 (Quality Education) tracking for corporate donors.' },
]

const faqTr = [
  { question: 'FundEd öğrencileri nasıl doğruluyor?', answer: 'Her öğrenci kimlik, öğrenim belgesi ve ihtiyaç beyanı ile başvurur. Ekibimiz tüm belgeleri doğrular, profil ancak onaylandıktan sonra yayınlanır.' },
  { question: 'Bağışım nasıl takip edilir?', answer: 'Her bağışa bir işlem kimliği atanır ve belirli bir öğrenci veya fona bağlanır. Bağışçı dashboard\'ınızdan tam denetim izini görüntüleyebilirsiniz.' },
  { question: 'Bağışımın yüzde kaçı öğrenciye ulaşır?', answer: 'Her bağışın büyük çoğunluğu doğrudan öğrenciye ulaşır. Küçük bir platform ücreti, operasyon ve doğrulama maliyetlerini karşılar — her bağış sayfasında şeffaf biçimde gösterilir.' },
  { question: 'Geçmiş bağışların nasıl kullanıldığını görebilir miyim?', answer: 'Evet. Tamamlanan her kampanya, fonların nasıl kullanıldığını, makbuzları ve öğrenci ilerleme güncellemelerini gösterir.' },
  { question: 'FundEd ESG uyumlu mu?', answer: 'Evet. FundEd, kurumsal bağışçılar için SDG 4 (Kaliteli Eğitim) takibi dahil ESG çerçevelerine uygun etki raporları sunar.' },
]

export default function TransparencyPage({ params: { locale } }: Props) {
  const isTr = locale === 'tr'
  const faqs = isTr ? faqTr : faqEn
  const breadcrumbs = isTr
    ? [{ name: 'Ana Sayfa', url: 'https://www.fund-ed.com/tr' }, { name: 'Şeffaflık', url: 'https://www.fund-ed.com/tr/transparency' }]
    : [{ name: 'Home', url: 'https://www.fund-ed.com/en' }, { name: 'Transparency', url: 'https://www.fund-ed.com/en/transparency' }]

  return (
    <>
      <JsonLd schema={faqSchema(faqs)} />
      <JsonLd schema={breadcrumbSchema(breadcrumbs)} />
      <TransparencyClient />
    </>
  )
}
