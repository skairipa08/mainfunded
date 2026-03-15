// app/[locale]/how-it-works/page.tsx
import type { Metadata } from 'next'
import { buildAlternates } from '@/lib/seo/metadata'
import { JsonLd } from '@/components/seo/JsonLd'
import { faqSchema, breadcrumbSchema } from '@/lib/seo/schemas'
import HowItWorksClient from './HowItWorksClient'

interface Props {
  params: { locale: string }
}

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isTr = locale === 'tr'
  return {
    title: isTr
      ? 'Eğitim Fonlaması Nasıl Çalışır | FundEd'
      : 'How Education Funding Works | FundEd',
    description: isTr
      ? 'FundEd, bağışçıları doğrulanmış öğrencilerle buluşturur. Şeffaf fonlama, doğrulanmış sonuçlar, gerçek etki.'
      : 'See how FundEd connects donors with verified students. Transparent funding, verified outcomes, real impact.',
    alternates: buildAlternates(locale, '/how-it-works'),
  }
}

const faqEn = [
  { question: 'Where does my donation go?', answer: 'Your donation goes directly to the student you choose. General fund donations are distributed to students with the most urgent needs. Every transaction is recorded and trackable.' },
  { question: 'Can I donate anonymously?', answer: 'Yes! Leave your name and email blank on the donation form to donate completely anonymously.' },
  { question: 'How are students verified?', answer: 'Every student application is submitted with ID, enrollment document, and a needs statement. Our team verifies all documents before the profile is published.' },
  { question: 'How can I see the impact of my donation?', answer: 'After donating, track the student\'s progress, photos, and impact reports from your personal dashboard.' },
  { question: 'Can companies donate?', answer: 'Yes! With FundEd Corporate, your company can donate, auto-generate ESG reports, and manage impact as a team.' },
]

const faqTr = [
  { question: 'Bağışım nereye gidiyor?', answer: 'Bağışınız doğrudan seçtiğiniz öğrencinin ihtiyacına yönlendirilir. Genel fona yapılan bağışlar en acil ihtiyacı olan öğrencilere dağıtılır. Her işlem kaydedilir ve takip edilebilir.' },
  { question: 'Anonim bağış yapabilir miyim?', answer: 'Evet! Bağış formunda adınızı ve e-postanızı boş bırakarak tamamen anonim bağış yapabilirsiniz.' },
  { question: 'Öğrenciler nasıl doğrulanıyor?', answer: 'Her öğrenci başvurusu kimlik belgesi, öğrenim belgesi ve ihtiyaç beyanıyla yapılır. Ekibimiz tüm belgeleri doğrular.' },
  { question: 'Bağışımın etkisini nasıl görebilirim?', answer: 'Bağış sonrası kişisel dashboard\'ınızdan öğrencinin ilerlemesini, fotoğrafları ve etki raporlarını takip edebilirsiniz.' },
  { question: 'Kurumsal bağış yapabilir miyiz?', answer: 'Evet! FundEd Kurumsal panelimiz ile şirketiniz adına bağış yapabilir, ESG raporlarınızı otomatik oluşturabilirsiniz.' },
]

export default function HowItWorksPage({ params: { locale } }: Props) {
  const isTr = locale === 'tr'
  const faqs = isTr ? faqTr : faqEn
  const breadcrumbs = isTr
    ? [{ name: 'Ana Sayfa', url: 'https://fund-ed.com/tr' }, { name: 'Nasıl Çalışır', url: 'https://fund-ed.com/tr/how-it-works' }]
    : [{ name: 'Home', url: 'https://fund-ed.com/en' }, { name: 'How It Works', url: 'https://fund-ed.com/en/how-it-works' }]

  return (
    <>
      <JsonLd schema={faqSchema(faqs)} />
      <JsonLd schema={breadcrumbSchema(breadcrumbs)} />
      <HowItWorksClient />
    </>
  )
}
