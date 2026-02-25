import type { FaqEntry } from '@/types/ai-assistant';

// ─── FAQ Database ────────────────────────────────────────────────────
// Keyword-based matching for the rule-based MVP.

export const FAQ_ENTRIES: FaqEntry[] = [
  // ── Trust & Security ───────────────────────────────────────────────
  {
    id: 'faq_trust_1',
    question: 'FundEd güvenilir mi?',
    answer:
      'FundEd, her öğrenciyi doğrulama sürecinden geçirir. Öğrenci belgeleri, üniversite kaydı ve kimlik bilgileri bağımsız olarak kontrol edilir. Şeffaflık raporlarımızı istediğiniz zaman inceleyebilirsiniz.',
    keywords: ['güven', 'güvenilir', 'dolandırıcılık', 'sahte', 'emin', 'gerçek', 'trust', 'safe'],
    category: 'trust',
  },
  {
    id: 'faq_trust_2',
    question: 'Bağışım güvende mi?',
    answer:
      'Evet! Tüm ödemeler iyzico/Stripe gibi lisanslı ödeme altyapıları üzerinden güvenle işlenir. Kart bilgileriniz sunucularımızda saklanmaz. SSL şifreleme ile korunursunuz.',
    keywords: ['güvende', 'güvenli', 'ödeme', 'kart', 'bilgi', 'sakla', 'ssl', 'secure', 'payment'],
    category: 'payment',
  },
  {
    id: 'faq_trust_3',
    question: 'Öğrenciler nasıl doğrulanıyor?',
    answer:
      'Her öğrenci 3 aşamalı doğrulamadan geçer: 1) Kimlik belgesi kontrolü, 2) Üniversite öğrenci belgesi doğrulaması, 3) Bölüm ve transkript onayı. Sadece doğrulanmış öğrenciler kampanya oluşturabilir.',
    keywords: ['doğrula', 'doğrulama', 'verification', 'verify', 'kontrol', 'onay', 'belge'],
    category: 'trust',
  },

  // ── Payment & Donation ────────────────────────────────────────────
  {
    id: 'faq_payment_1',
    question: 'Nasıl bağış yapabilirim?',
    answer:
      'Beğendiğiniz kampanyayı seçin ve "Bağış Yap" butonuna tıklayın. Kredi kartı, banka kartı veya havale/EFT ile bağış yapabilirsiniz. İsterseniz anonim olarak da bağış yapabilirsiniz.',
    keywords: ['nasıl', 'bağış', 'yap', 'ödeme', 'donate', 'how', 'kredi', 'kart'],
    category: 'payment',
  },
  {
    id: 'faq_payment_2',
    question: 'Minimum bağış tutarı nedir?',
    answer:
      'Minimum bağış tutarı ₺10\'dur. Her miktar önemlidir - küçük bağışlar da öğrencilerin hayatında büyük fark yaratır!',
    keywords: ['minimum', 'en az', 'tutar', 'miktar', 'kaç', 'amount', 'min'],
    category: 'payment',
  },
  {
    id: 'faq_payment_3',
    question: 'Vergi indirimi alabilir miyim?',
    answer:
      'FundEd şu anda vergi indirimi için resmi belge düzenlememektedir. Ancak bağış makbuzunuz otomatik olarak e-posta adresinize gönderilir. Vergi avantajları hakkında mali müşavirinize danışmanızı öneriyoruz.',
    keywords: ['vergi', 'indirim', 'makbuz', 'fatura', 'tax', 'receipt', 'deduction'],
    category: 'payment',
  },
  {
    id: 'faq_payment_4',
    question: 'Bağışımı geri alabilir miyim?',
    answer:
      'Bağış yapıldıktan sonra 24 saat içinde iade talebinde bulunabilirsiniz. Bunun için destek ekibimize ulaşmanız yeterlidir. 24 saat sonrasında iadeler kampanya durumuna göre değerlendirilir.',
    keywords: ['iade', 'geri', 'iptal', 'refund', 'cancel', 'return'],
    category: 'payment',
  },

  // ── Process & Platform ────────────────────────────────────────────
  {
    id: 'faq_process_1',
    question: 'Öğrenci parayı nasıl kullanıyor?',
    answer:
      'Öğrenciler kampanyalarında belirttikleri kalemler doğrultusunda harcama yapar. Harcama raporlarını ve ilerleme güncellemelerini kampanya sayfasından takip edebilirsiniz. FundEd, şeffaflık ilkesiyle çalışır.',
    keywords: ['harca', 'kullan', 'para', 'nereye', 'ne için', 'spend', 'money', 'use'],
    category: 'process',
  },
  {
    id: 'faq_process_2',
    question: 'Öğrenciyle iletişime geçebilir miyim?',
    answer:
      'Evet! Bağış yaptığınız öğrenciye mesaj gönderebilirsiniz. Kampanya sayfasındaki mesaj bölümünden veya profil sayfasından iletişim kurabilirsiniz.',
    keywords: ['iletişim', 'mesaj', 'yaz', 'contact', 'message', 'ulaş', 'görüş'],
    category: 'student',
  },
  {
    id: 'faq_process_3',
    question: 'Kampanya hedefine ulaşamazsa ne olur?',
    answer:
      'Kampanya süresi dolduğunda hedefe ulaşılamamış olsa bile toplanan miktar öğrenciye aktarılır. Böylece her bağış anlamlı olur ve öğrenci kısmi destek bile alabilir.',
    keywords: ['hedef', 'ulaşamaz', 'başarısız', 'süre', 'dol', 'fail', 'goal', 'expire'],
    category: 'process',
  },
  {
    id: 'faq_process_4',
    question: 'Düzenli bağış yapabilir miyim?',
    answer:
      'Şu anda düzenli (aylık) bağış özelliği geliştirme aşamasındadır. İstediğiniz zaman tekrar bağış yaparak öğrencileri desteklemeye devam edebilirsiniz.',
    keywords: ['düzenli', 'aylık', 'recurring', 'monthly', 'otomatik', 'subscription'],
    category: 'payment',
  },

  // ── Student Related ───────────────────────────────────────────────
  {
    id: 'faq_student_1',
    question: 'Hangi öğrencilere bağış yapabilirim?',
    answer:
      'Doğrulanmış tüm öğrencilere bağış yapabilirsiniz. Kampanyaları bölüm, ülke veya kategoriye göre filtreleyebilir, ya da bana tercihlerinizi söyleyerek en uygun öğrenciyi bulmanıza yardımcı olabilirim!',
    keywords: ['hangi', 'öğrenci', 'kim', 'seç', 'which', 'student', 'choose'],
    category: 'student',
  },
  {
    id: 'faq_student_2',
    question: 'Bağışımın etkisini nasıl görebilirim?',
    answer:
      'Kampanya sayfasında ilerleme çubuğu ve güncellemeleri takip edebilirsiniz. Ayrıca "Bağışlarım" sayfasından tüm desteklediğiniz kampanyaların durumunu görebilirsiniz.',
    keywords: ['etki', 'impact', 'sonuç', 'takip', 'ilerleme', 'progress', 'track'],
    category: 'student',
  },

  // ── General ───────────────────────────────────────────────────────
  {
    id: 'faq_general_1',
    question: 'FundEd nedir?',
    answer:
      'FundEd, doğrulanmış üniversite öğrencilerinin eğitim ihtiyaçları için bağış toplayabildiği güvenli bir kitle fonlama platformudur. Eğitim, kitap, barınma, teknoloji gibi çeşitli kategorilerde kampanyalar bulabilirsiniz.',
    keywords: ['nedir', 'ne', 'hakkında', 'funded', 'platform', 'about', 'what'],
    category: 'general',
  },
  {
    id: 'faq_general_2',
    question: 'FundEd komisyon alıyor mu?',
    answer:
      'FundEd, platformun sürdürülebilirliği için minimal bir hizmet bedeli alır. Bağışınızın büyük çoğunluğu doğrudan öğrenciye ulaşır. Detaylı bilgi için şeffaflık sayfamızı ziyaret edebilirsiniz.',
    keywords: ['komisyon', 'kesinti', 'ücret', 'fee', 'commission', 'cut', 'charge'],
    category: 'general',
  },
];

/**
 * Simple keyword-based FAQ search. Returns the best matching FAQ entry.
 * Scores each entry by counting keyword hits in the query string.
 * Related entries are filtered to same category for relevance.
 */
export function searchFaq(query: string): { entry: FaqEntry | null; related: FaqEntry[] } {
  const normalised = query.toLocaleLowerCase('tr');

  const scored = FAQ_ENTRIES.map((entry) => {
    let score = 0;
    let exactHits = 0;
    for (const kw of entry.keywords) {
      if (normalised.includes(kw.toLocaleLowerCase('tr'))) {
        score += 1;
        exactHits += 1;
      }
    }
    // Bonus when question itself is a substring match
    if (normalised.includes(entry.question.toLocaleLowerCase('tr').replace('?', ''))) {
      score += 3;
    }
    return { entry, score, exactHits };
  });

  scored.sort((a, b) => b.score - a.score);

  const best = scored[0]?.score > 0 ? scored[0].entry : null;

  // Related = next 2 entries with score > 0, same category as best, excluding best
  const related = best
    ? scored
        .filter(
          (s) =>
            s.score > 0 &&
            s.entry.id !== best.id &&
            s.entry.category === best.category &&
            s.exactHits >= 1,
        )
        .slice(0, 2)
        .map((s) => s.entry)
    : [];

  return { entry: best, related };
}
