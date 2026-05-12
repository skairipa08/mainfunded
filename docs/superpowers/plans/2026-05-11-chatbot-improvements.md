# Chatbot İyileştirmeleri — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Kural tabanlı AI Assistant chatbot'unu daha doğru, daha kısa akışlı ve daha iyi UX'e kavuşturmak.

**Architecture:** Dört bağımsız değişiklik katmanı — (1) knowledge-base veri katmanı, (2) chat-engine/chat-flow mantık katmanı, (3) UI bileşenleri. Her katman bağımsız commit edilebilir.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, Lucide React

**Spec:** `docs/superpowers/specs/2026-05-11-chatbot-improvements-design.md`

---

## Chunk 1: Knowledge Base — Email Düzeltme + Skor + Yeni Girişler

### Task 1: info@funded.com → getsfunded@gmail.com

**Files:**
- Modify: `lib/ai-assistant/knowledge-base.ts`

- [ ] **Step 1: Mevcut yanlış emaili bul**

Bash tool kullan (Windows'ta grep için):
```bash
grep -n "info@funded.com" lib/ai-assistant/knowledge-base.ts
```

Beklenen çıktı: birden fazla satır (satır 163, 420, 527, 890 civarı ve FALLBACK_RESPONSES içinde).

- [ ] **Step 2: Tüm dosyada replace yap**

`lib/ai-assistant/knowledge-base.ts` içinde `info@funded.com` → `getsfunded@gmail.com` olarak değiştir (tüm occurrences, replace_all: true).

- [ ] **Step 3: Doğrula**

Bash tool kullan:
```bash
grep -n "info@funded.com" lib/ai-assistant/knowledge-base.ts
```

Beklenen: çıktı yok.

- [ ] **Step 4: TypeScript kontrolü**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Beklenen: hata yok.

- [ ] **Step 5: Commit**

```bash
git add lib/ai-assistant/knowledge-base.ts
git commit -m "fix: replace wrong support email with getsfunded@gmail.com"
```

---

### Task 2: searchKnowledge'a skor dönüşü + güven eşiği

**Files:**
- Modify: `lib/ai-assistant/knowledge-base.ts`

**Context:** `searchKnowledge()` şu an `{ entry, related }` döndürüyor. `processKnowledgeQuery()` düşük skorlu eşleşmelerde bile cevap veriyor. Mevcut threshold `5` — bunu `15`'e yükseltip dış katmana da expose etmemiz lazım.

- [ ] **Step 1: Sabit tanımla ve return tipini güncelle**

`lib/ai-assistant/knowledge-base.ts` içinde `searchKnowledge` fonksiyonunu bul (satır ~1009). İki değişiklik yap:

```typescript
// Sabit — fonksiyonun üstüne ekle (satır 1009 civarı)
export const MIN_CONFIDENCE_SCORE = 15;

// Return tipini güncelle
export function searchKnowledge(query: string): {
  entry: KnowledgeEntry | null;
  related: KnowledgeEntry[];
  score: number;
} {
```

- [ ] **Step 2: İç threshold + relatedThreshold + topScore güncelle**

Aynı fonksiyonda üç değişiklik yap (hepsini aynı anda):

```typescript
// Eski (~satır 1071-1072 ve 1079):
const threshold = 5;
const best = scored[0]?.score >= threshold ? scored[0].entry : null;
// ...
const relatedThreshold = threshold * 1.5;

// Yeni (threshold değişkenini tamamen sil, MIN_CONFIDENCE_SCORE kullan):
const best = scored[0]?.score >= MIN_CONFIDENCE_SCORE ? scored[0].entry : null;
const topScore = scored[0]?.score ?? 0;
// ...
const relatedThreshold = MIN_CONFIDENCE_SCORE * 1.5;
```

**ÖNEMLİ:** `const threshold = 5;` satırını tamamen sil — sadece usage'ını değiştirme.
`const relatedThreshold = threshold * 1.5;` satırını da `MIN_CONFIDENCE_SCORE * 1.5` olarak güncelle (aksi halde `threshold is not defined` compile hatası alırsın).

Fonksiyonun sonundaki return'ü güncelle:

```typescript
// Eski:
return { entry: best, related };

// Yeni:
return { entry: best, related, score: topScore };
```

- [ ] **Step 3: chat-engine.ts'i güncelle**

`lib/ai-assistant/chat-engine.ts` dosyasının başındaki import'a `MIN_CONFIDENCE_SCORE` ekle:

```typescript
import {
  searchKnowledge,
  getFallbackResponse,
  // ... diğer importlar korunur ...
  MIN_CONFIDENCE_SCORE,  // ← ekle
} from './knowledge-base';
```

`processKnowledgeQuery` fonksiyonunda destructure'u güncelle:

```typescript
// Eski (satır ~250):
const { entry, related } = searchKnowledge(query);

// Yeni:
const { entry, related, score } = searchKnowledge(query);

// Confidence kontrolü — !entry yeterli ama score da expose edildiği için explicit check yapıyoruz.
// searchKnowledge içindeki threshold zaten MIN_CONFIDENCE_SCORE olduğundan bu belt-and-suspenders.
if (!entry || score < MIN_CONFIDENCE_SCORE) {
```

**Farewell ve thanks case'leri (`case 'farewell'`, `case 'thanks'`) DEĞİŞTİRME** — bunlar `result.entry?.answer` şeklinde dot-notation kullanıyor, TypeScript hatası oluşmaz ve bu case'lerde confidence kontrolü gerekmez.

- [ ] **Step 4: TypeScript kontrolü**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Beklenen: hata yok. Hata çıkarsa büyük ihtimalle `threshold` referansı kalmış — Bash tool ile `grep -n "threshold" lib/ai-assistant/knowledge-base.ts` ile kontrol et ve kalan referansları `MIN_CONFIDENCE_SCORE` ile değiştir.

- [ ] **Step 6: Commit**

```bash
git add lib/ai-assistant/knowledge-base.ts lib/ai-assistant/chat-engine.ts
git commit -m "feat: add confidence scoring to searchKnowledge (threshold=15)"
```

---

### Task 3: 14 yeni FAQ girişi

**Files:**
- Modify: `lib/ai-assistant/knowledge-base.ts`

**Not:** `KnowledgeCategory` union'ında tüm kategoriler zaten mevcut — tip değişikliği gerekmez.

- [ ] **Step 1: Yeni girişleri ekle**

`KNOWLEDGE_BASE` array'inin sonuna (special days ve motivation girdilerinden önce, yaklaşık son `// ─── ...` bölümünden önce) aşağıdaki girişleri ekle:

```typescript
// ─── ÖDEME ──────────────────────────────────────────────────
{
  id: 'payment-1',
  category: 'payment',
  keywords: ['kart', 'kredi', 'banka', 'ödeme', 'ödeme yöntemi', 'hangi kart', 'visa', 'mastercard'],
  question: 'Hangi kartlarla ödeme yapabilirim?',
  answer: 'Visa, Mastercard ve Troy logolu tüm banka ve kredi kartlarıyla güvenle bağış yapabilirsiniz. Ödeme işlemleri 3D Secure teknolojisiyle korunur.',
  followUp: 'Başka bir sorunuz var mı?',
  priority: 8,
},
{
  id: 'payment-2',
  category: 'payment',
  keywords: ['taksit', 'taksitli', 'aylık', 'peşin'],
  question: 'Taksitli bağış yapabilir miyim?',
  answer: 'Aylık düzenli bağış seçeneğimiz var! Kampanya sayfasında "Aylık bağış" seçeneğini işaretleyerek belirlediğiniz tutarı her ay otomatik olarak bağışlayabilirsiniz. Tek seferlik veya taksitli banka ödemesi için bankanızın kart taksit seçeneklerini kullanabilirsiniz.',
  priority: 7,
},
{
  id: 'payment-3',
  category: 'payment',
  keywords: ['yabancı kart', 'uluslararası', 'dolar', 'euro', 'döviz', 'türkiye dışı'],
  question: 'Yurt dışındaki bir kartla bağış yapabilir miyim?',
  answer: 'Evet! Uluslararası Visa ve Mastercard kartlarla yurt dışından bağış yapabilirsiniz. Ödeme Türk Lirası üzerinden gerçekleşir; döviz çevrimi bankanız tarafından yapılır.',
  priority: 6,
},

// ─── HUKUKİ / VERGİ ─────────────────────────────────────────
{
  id: 'legal-1',
  category: 'legal',
  keywords: ['makbuz', 'bağış makbuzu', 'dekont', 'fiş', 'belge', 'fatura'],
  question: 'Bağış makbuzu alabilir miyim?',
  answer: 'Her bağış sonrasında e-posta adresinize otomatik olarak bağış dekontu gönderilir. Hesabınızın "Bağışlarım" bölümünden geçmiş bağışlarınızın dekontlarına erişebilirsiniz.',
  priority: 7,
},
{
  id: 'legal-2',
  category: 'legal',
  keywords: ['vergi', 'vergi indirimi', 'vergi avantajı', 'beyanname', 'gelir vergisi'],
  question: 'Vergi indirimi alabilir miyim?',
  answer: 'Vergi avantajları bireysel durumunuza ve bağışın yapıldığı kuruma göre değişiklik gösterir. Bu konuda muhasebe danışmanınıza veya getsfunded@gmail.com adresine yazmanızı öneririz.',
  priority: 6,
},

// ─── ÖĞRENCİ BAŞVURUSU ──────────────────────────────────────
{
  id: 'student-apply-1',
  category: 'student',
  keywords: ['öğrenci başvuru', 'nasıl başvuru', 'başvurma', 'kayıt', 'kampanya aç', 'öğrenci olarak'],
  question: 'Öğrenci olarak nasıl başvurabilirim?',
  answer: 'Başvuru adımları:\n\n1️⃣ Ana sayfadan "Başvur" butonuna tıklayın\n2️⃣ Öğrenci formunu doldurun (kişisel bilgiler, okul, bölüm)\n3️⃣ Belgelerinizi yükleyin\n4️⃣ Ekibimiz başvurunuzu inceler (1-3 iş günü)\n5️⃣ Onay sonrası kampanyanız yayına girer\n\nDetaylı bilgi: getsfunded@gmail.com',
  priority: 7,
},
{
  id: 'student-apply-2',
  category: 'student',
  keywords: ['belge', 'evrak', 'gerekli', 'öğrenci belgesi', 'transkript', 'kayıt belgesi'],
  question: 'Başvuru için hangi belgeler gerekiyor?',
  answer: 'Başvuru için genellikle şunlar istenir:\n\n📄 Öğrenci belgesi (güncel)\n📊 Transkript veya not ortalaması belgesi\n🪪 Kimlik belgesi\n\nEk belgeler duruma göre talep edilebilir. Sorularınız için: getsfunded@gmail.com',
  priority: 6,
},

// ─── BAĞIŞ / PARA TRANSFERİ ─────────────────────────────────
{
  id: 'donation-transfer-1',
  category: 'donation',
  keywords: ['para nasıl', 'transfer', 'ulaşır', 'öğrenciye gider', 'nereye gidiyor', 'kim alır'],
  question: 'Bağışım öğrenciye nasıl ulaşır?',
  answer: 'Kampanya hedefine ulaştığında bağış tutarı, ekibimiz tarafından doğrulanmış öğrencinin banka hesabına aktarılır. Ödeme doğrudan öğrenciye yapılır; aracı kurum ücreti bağıştan kesilmez.',
  followUp: 'Şeffaf sürecimiz hakkında başka sorunuz var mı?',
  priority: 8,
},
{
  id: 'donation-transfer-2',
  category: 'donation',
  keywords: ['ne zaman', 'kaç gün', 'süre', 'transfer süresi', 'bekleme'],
  question: 'Bağışım ne zaman öğrenciye ulaşır?',
  answer: 'Kampanya hedefine ulaştıktan sonra transfer işlemi genellikle 3-5 iş günü içinde tamamlanır. Süreç içinde hem bağışçıya hem öğrenciye bildirim gönderilir.',
  priority: 7,
},

// ─── GÜVENLİK ───────────────────────────────────────────────
{
  id: 'security-card-1',
  category: 'security',
  keywords: ['kart güvenli', 'kart bilgisi', 'güvende mi', 'çalınır mı', 'dolandırıcılık'],
  question: 'Kart bilgilerim güvende mi?',
  answer: 'Evet! Kart bilgileriniz FundEd sunucularında saklanmaz. Tüm ödeme işlemleri PCI-DSS sertifikalı ödeme altyapısı üzerinden gerçekleşir. Kart numaranız şifreli olarak yalnızca ödeme sağlayıcısına iletilir.',
  priority: 9,
},
{
  id: 'security-3dsecure-1',
  category: 'security',
  keywords: ['3d secure', '3ds', 'sms onay', 'doğrulama', 'şifre', 'ssl'],
  question: '3D Secure ve SSL koruması var mı?',
  answer: 'Evet, tüm ödemeler 256-bit SSL şifreleme ve 3D Secure ile korunur. Ödeme sırasında bankanızdan SMS veya uygulama onayı alırsınız. Bu sistem kartın gerçek sahibinin siz olduğunuzu doğrular.',
  priority: 8,
},

// ─── KURUMSAL ───────────────────────────────────────────────
{
  id: 'corporate-1',
  category: 'corporate',
  keywords: ['şirket', 'kurumsal', 'toplu bağış', 'firma', 'kurum', 'iş yeri', 'csr', 'sosyal sorumluluk'],
  question: 'Şirket olarak toplu bağış yapabilir miyim?',
  answer: 'Kesinlikle! Kurumsal bağış ve sosyal sorumluluk programları için özel çözümlerimiz var. Kurumsal Dashboard üzerinden toplu bağış yönetimi, etki raporları ve özel kampanyalar oluşturabilirsiniz.\n\nDetaylı bilgi için: getsfunded@gmail.com',
  followUp: 'Kurumsal Dashboard hakkında bilgi almak ister misiniz?',
  priority: 7,
},

// ─── MENTORLUK ──────────────────────────────────────────────
{
  id: 'mentor-1',
  category: 'mentor',
  keywords: ['mentor', 'mentorluk', 'rehber', 'para değil', 'gönüllü', 'destek başka', 'tavsiye', 'yönlendirme'],
  question: 'Para yerine mentorluk desteği verebilir miyim?',
  answer: 'Evet! FundEd\'de mentorluk programı da var. Öğrencilere kariyer rehberliği, CV/mülakat hazırlığı veya alan uzmanlığınızla destek olabilirsiniz. Mentör olmak için getsfunded@gmail.com adresine yazın.',
  priority: 6,
},

// ─── KAMPANYA İPTALİ ────────────────────────────────────────
{
  id: 'campaign-cancel-1',
  category: 'campaign',
  keywords: ['kampanya iptal', 'iptal olursa', 'bağış geri', 'hedef dolmaz', 'başarısız kampanya'],
  question: 'Kampanya hedefine ulaşamazsa ne olur?',
  answer: 'Kampanya süresi dolduğunda hedefe ulaşılamamışsa bağışçılar bilgilendirilir. Detaylı politika için getsfunded@gmail.com adresine yazabilirsiniz.',
  priority: 7,
},
```

- [ ] **Step 2: TypeScript kontrolü**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Beklenen: hata yok.

- [ ] **Step 3: Commit**

```bash
git add lib/ai-assistant/knowledge-base.ts
git commit -m "feat: add 14 new FAQ entries (payment, legal, student, security, corporate, mentor)"
```

---

## Chunk 2: Chat Engine + Flow — Fallback + Akış Kısaltma

### Task 4: Tüm fallback mesajlarını güncelle

**Files:**
- Modify: `lib/ai-assistant/knowledge-base.ts` (FALLBACK_RESPONSES)
- Modify: `lib/ai-assistant/chat-flow.ts` (getFaqNotFound)
- Modify: `lib/ai-assistant/chat-engine.ts` (getKnowledgeById fallback)
- Modify: `components/ai-assistant/ChatWindow.tsx` (satır ~170-176 hardcoded fallback)

**Not:** Fallback'lerdeki quick reply'lar sadece `ChatWindow`'un handleQuickReply'ının anlayacağı value'lar kullanmalı: `find_student`, `home`, `support_email`.

- [ ] **Step 1: knowledge-base.ts — FALLBACK_RESPONSES güncelle**

```typescript
// Eski FALLBACK_RESPONSES array'ini tamamen bu ile değiştir:
const FALLBACK_RESPONSES = [
  'Bu konuyu bilgi tabanımda bulamadım 🤔\n\nDestek ekibimize yazın: getsfunded@gmail.com',
  'Bu soruyu tam anlayamadım 🤔\n\nDestek ekibimize yazın: getsfunded@gmail.com',
  'Bu konuda kesin bilgim yok 🤔\n\nDestek ekibimize yazın: getsfunded@gmail.com',
];
```

`getFallbackResponse()` fonksiyonunu değiştirme — sadece string döndürüyor, quick reply'ları ChatWindow/chat-engine ekleyecek.

- [ ] **Step 2: chat-engine.ts — processKnowledgeQuery fallback quick reply'larını güncelle**

`processKnowledgeQuery()` içindeki fallback return'ünü bul ve güncelle:

```typescript
// Eski (entry null veya skor düşük durumu):
return {
  messages: [botMessage(getFallbackResponse())],
  quickReplies: [
    { label: '🎯 Öğrenci bul', value: 'find_student' },
    { label: '❓ Nasıl çalışır?', value: 'ask_how' },
    { label: '🔒 Güvenilir mi?', value: 'ask_trust' },
  ],
};

// Yeni:
return {
  messages: [botMessage(getFallbackResponse())],
  quickReplies: [
    { label: '📧 Mail gönder', value: 'support_email' },
    { label: '🎯 Öğrenci bul', value: 'find_student' },
    { label: '🏠 Ana menü', value: 'home' },
  ],
};
```

- [ ] **Step 3: chat-engine.ts — getKnowledgeById fallback quick reply'larını güncelle**

`getKnowledgeById()` içindeki entry null durumunu bul:

```typescript
// Eski:
return {
  messages: [botMessage(getFallbackResponse())],
};

// Yeni:
return {
  messages: [botMessage(getFallbackResponse())],
  quickReplies: [
    { label: '📧 Mail gönder', value: 'support_email' },
    { label: '🎯 Öğrenci bul', value: 'find_student' },
    { label: '🏠 Ana menü', value: 'home' },
  ],
};
```

- [ ] **Step 4: chat-flow.ts — getFaqNotFound güncelle**

```typescript
// Eski:
export function getFaqNotFound(): ChatMessage {
  return botMessage(
    'Bu konuda kesin bir cevabım yok 😅 Ama destek ekibimiz sana yardımcı olabilir. Başka bir sorun var mı?',
    [
      { label: '🎓 Öğrenci bul', value: 'find_student' },
      { label: '❓ Başka sorum var', value: 'ask_faq' },
    ]
  );
}

// Yeni:
export function getFaqNotFound(): ChatMessage {
  return botMessage(
    'Bu konuyu bilgi tabanımda bulamadım 🤔\n\nDestek ekibimize yazın: getsfunded@gmail.com',
    [
      { label: '📧 Mail gönder', value: 'support_email' },
      { label: '🎯 Öğrenci bul', value: 'find_student' },
      { label: '🏠 Ana menü', value: 'home' },
    ]
  );
}
```

- [ ] **Step 5: ChatWindow.tsx — satır ~170-176 hardcoded fallback güncelle**

`fetchChatResponse` içinde `data.messages.length === 0` durumundaki fallback'i bul:

```typescript
// Eski (~satır 170-176):
await addBotMessage(
  botMessage('Hmm, bunu tam anlayamadım 🤔 Başka türlü sormayı dener misiniz?', [
    { label: '🎯 Öğrenci bul', value: 'find_student' },
    { label: '❓ Nasıl çalışır?', value: 'ask_how' },
  ]),
  500,
);

// Yeni:
await addBotMessage(
  botMessage('Bu konuyu bilgi tabanımda bulamadım 🤔\n\nDestek ekibimize yazın: getsfunded@gmail.com', [
    { label: '📧 Mail gönder', value: 'support_email' },
    { label: '🎯 Öğrenci bul', value: 'find_student' },
    { label: '🏠 Ana menü', value: 'home' },
  ]),
  500,
);
```

- [ ] **Step 6: TypeScript kontrolü**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 7: Commit**

```bash
git add lib/ai-assistant/knowledge-base.ts lib/ai-assistant/chat-flow.ts lib/ai-assistant/chat-engine.ts components/ai-assistant/ChatWindow.tsx
git commit -m "feat: unified fallback messages with support email (getsfunded@gmail.com)"
```

---

### Task 5: Akışı 5 → 3 soruya kısalt

**Files:**
- Modify: `lib/ai-assistant/chat-flow.ts`
- Modify: `components/ai-assistant/ChatWindow.tsx`
- Modify: `types/ai-assistant.ts`

- [ ] **Step 1: types/ai-assistant.ts — deprecated comment ekle**

`ChatStep` type'ını bul ve `ask_gender` / `ask_country` satırlarına comment ekle:

```typescript
// Eski:
export type ChatStep =
  | 'idle'
  | 'welcome'
  | 'ask_field'
  | 'ask_gender'
  | 'ask_budget'
  | 'ask_priority'
  | 'ask_country'
  | 'searching'
  | 'results'
  | 'faq'
  | 'faq_answer';

// Yeni:
export type ChatStep =
  | 'idle'
  | 'welcome'
  | 'ask_field'
  | 'ask_gender'   // @deprecated — akıştan çıkarıldı, tip uyumu için tutuluyor
  | 'ask_budget'
  | 'ask_priority'
  | 'ask_country'  // @deprecated — akıştan çıkarıldı, tip uyumu için tutuluyor
  | 'searching'
  | 'results'
  | 'faq'
  | 'faq_answer';
```

- [ ] **Step 2: chat-flow.ts — getNextStep güncelle**

```typescript
// Eski:
export function getNextStep(currentStep: ChatStep): ChatStep {
  const flow: ChatStep[] = [
    'welcome',
    'ask_field',
    'ask_gender',
    'ask_budget',
    'ask_priority',
    'ask_country',
    'searching',
    'results',
  ];
  const idx = flow.indexOf(currentStep);
  if (idx === -1 || idx >= flow.length - 1) return 'results';
  return flow[idx + 1];
}

// Yeni:
export function getNextStep(currentStep: ChatStep): ChatStep {
  const flow: ChatStep[] = [
    'welcome',
    'ask_field',
    'ask_budget',
    'ask_priority',
    'searching',
    'results',
  ];
  const idx = flow.indexOf(currentStep);
  if (idx === -1 || idx >= flow.length - 1) return 'results';
  return flow[idx + 1];
}
```

- [ ] **Step 3: ChatWindow.tsx — switch case güncelle**

`handleQuickReply` içindeki `switch (currentStep)` bloğunu bul. `ask_gender` ve `ask_country` case'lerini kaldır:

```typescript
// Kaldır bu iki case'i:
case 'ask_gender':
  newPrefs.gender = value;
  break;
// ...
case 'ask_country':
  newPrefs.country = value;
  break;
```

`newPrefs.gender = value` ve `newPrefs.country = value` satırlarını da kaldır.

**Not — `DonorPreferences` tipi:** `types/ai-assistant.ts` içindeki `DonorPreferences` type'ında `gender` ve `country` alanları **bırakılır** (silinmez). Bu alanlar `recommendation-engine.ts` tarafından hâlâ kullanılıyor; akıştan çıkarılmaları type'ı bozmaz.

**Not — `getStepMessage()` içindeki `ask_gender`/`ask_country` case'leri:** `chat-flow.ts` içindeki `getStepMessage` fonksiyonunda bu iki case kalmaya devam edecek — bu dead code ama akıştan erişilemez. Silme; TypeScript tip uyumu açısından gerekli.

- [ ] **Step 4: ChatWindow.tsx — satır 302 termination condition düzelt**

Bu kritik — akış `ask_priority`'de bitmeli:

```typescript
// Eski (~satır 302):
if (nextStep === 'searching' || currentStep === 'ask_country') {

// Yeni:
if (nextStep === 'searching' || currentStep === 'ask_priority') {
```

- [ ] **Step 5: TypeScript kontrolü**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Beklenen: hata yok.

- [ ] **Step 6: Manuel test — akış doğrulaması**

1. Tarayıcıda `localhost:3000` aç
2. Chat'i aç → "Öğrenci bul" seç
3. **Beklenen sıra:** Alan → Bütçe → Öncelik → "Arıyorum..." → Sonuçlar
4. Cinsiyet ve Ülke sorularının ÇIKMADIĞINI doğrula

- [ ] **Step 7: Commit**

```bash
git add types/ai-assistant.ts lib/ai-assistant/chat-flow.ts components/ai-assistant/ChatWindow.tsx
git commit -m "feat: reduce student-finding flow from 5 to 3 questions"
```

---

### Task 6: Welcome chips ve support_email + ask_payment handler

**Files:**
- Modify: `lib/ai-assistant/chat-engine.ts`
- Modify: `components/ai-assistant/ChatWindow.tsx`

- [ ] **Step 1: chat-engine.ts — generateWelcomeResponse quick reply'ları güncelle**

```typescript
// Eski quickReplies:
quickReplies: [
  { label: '🎯 Öğrenci bul', value: 'find_student' },
  { label: '❓ Nasıl çalışır?', value: 'ask_how' },
  { label: '🔒 Güvenilir mi?', value: 'ask_trust' },
  { label: '📋 Kampanyaları gör', value: 'browse' },
],

// Yeni quickReplies (6 chip):
quickReplies: [
  { label: '🎯 Öğrenci bul', value: 'find_student' },
  { label: '❓ Nasıl çalışır?', value: 'ask_how' },
  { label: '🔒 Güvenilir mi?', value: 'ask_trust' },
  { label: '💳 Ödeme yöntemleri', value: 'ask_payment' },
  { label: '📋 Kampanyaları gör', value: 'browse' },
  { label: '📧 Destek', value: 'support_email' },
],
```

- [ ] **Step 2: ChatWindow.tsx — support_email handler ekle**

`handleQuickReply` içinde `if (value === 'dismiss')` bloğunun hemen arkasına ekle:

```typescript
if (value === 'support_email') {
  window.open('mailto:getsfunded@gmail.com', '_blank');
  await addBotMessage(
    botMessage('Mail uygulamanız açıldı 📧 Yardımcı olmaktan memnuniyet duyarız!', [
      { label: '🎯 Öğrenci bul', value: 'find_student' },
      { label: '🏠 Ana menü', value: 'home' },
    ])
  );
  return;
}
```

- [ ] **Step 3: ChatWindow.tsx — ask_payment handler ekle**

`if (value === 'ask_trust')` bloğunun hemen arkasına ekle:

```typescript
if (value === 'ask_payment') {
  await fetchChatResponse('Hangi kartlarla ödeme yapabilirim?');
  return;
}
```

- [ ] **Step 4: TypeScript kontrolü**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 5: Manuel test**

1. Chat'i aç
2. Hoşgeldin ekranında 6 chip'in göründüğünü doğrula
3. "💳 Ödeme yöntemleri" chip'ine tıkla → kart bilgisi cevabı gelmeli
4. "📧 Destek" chip'ine tıkla → mail uygulaması açılmalı + bot mesajı gelmeli

- [ ] **Step 6: Commit**

```bash
git add lib/ai-assistant/chat-engine.ts components/ai-assistant/ChatWindow.tsx
git commit -m "feat: add welcome chips (payment, support) and support_email handler"
```

---

## Chunk 3: UI — Feedback Butonları

### Task 7: MessageBubble'a 👍/👎 feedback butonu ekle

**Files:**
- Modify: `components/ai-assistant/MessageBubble.tsx`
- Modify: `components/ai-assistant/ChatWindow.tsx`

- [ ] **Step 1: MessageBubble.tsx — onFeedback prop ve UI ekle**

Mevcut `MessageBubble` bileşenini bul ve güncelle:

```typescript
// Props interface güncelle:
interface MessageBubbleProps {
  message: ChatMessage;
  onFeedback?: (messageId: string, type: 'positive' | 'negative') => void;
}

// Component imzasını güncelle:
export function MessageBubble({ message, onFeedback }: MessageBubbleProps) {
```

Bot mesajı render eden bloğun sonuna feedback butonları ekle:

```typescript
{/* Feedback butonları — sadece bot mesajlarında */}
{message.sender === 'bot' && onFeedback && (
  <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
    <button
      onClick={() => onFeedback(message.id, 'positive')}
      className="text-xs text-gray-400 hover:text-green-500 transition-colors px-1"
      title="Faydalıydı"
    >
      👍
    </button>
    <button
      onClick={() => onFeedback(message.id, 'negative')}
      className="text-xs text-gray-400 hover:text-red-400 transition-colors px-1"
      title="Faydalı değildi"
    >
      👎
    </button>
  </div>
)}
```

Bot mesajı dış wrapper div'ine `group` class'ı ekle (hover için gerekli). **ÖNEMLİ:** Mevcut `cn()` ifadesini bozmadan ekle:

```typescript
// Mevcut kod şuna benzer (MessageBubble.tsx satır ~16):
<div className={cn('flex w-full mb-3', isBot ? 'justify-start' : 'justify-end')}>

// Doğru güncelleme — cn() içine isBot && 'group' ekle:
<div className={cn('flex w-full mb-3', isBot ? 'justify-start' : 'justify-end', isBot && 'group')}>
```

`cn()` çağrısını tamamen değiştirme — sadece üçüncü argümanı ekle.

- [ ] **Step 2: ChatWindow.tsx — handleFeedback fonksiyonu ekle**

`handleReset` fonksiyonunun hemen üstüne ekle:

```typescript
const handleFeedback = async (messageId: string, type: 'positive' | 'negative') => {
  console.log('chatbot_feedback', { type, messageId, timestamp: Date.now() });
  if (type === 'negative') {
    await addBotMessage(
      botMessage(
        'Üzgünüm 😔 Daha iyi yardım için destek ekibimize yazabilirsiniz: getsfunded@gmail.com',
        [{ label: '📧 Mail gönder', value: 'support_email' }]
      )
    );
  }
};
```

- [ ] **Step 3: ChatWindow.tsx — MessageBubble'a prop geç**

```typescript
// Eski:
<MessageBubble key={msg.id} message={msg} />

// Yeni:
<MessageBubble key={msg.id} message={msg} onFeedback={handleFeedback} />
```

- [ ] **Step 4: TypeScript kontrolü**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Beklenen: hata yok.

- [ ] **Step 5: Manuel test**

1. Chat'i aç, bir bot mesajının üzerine hover yap
2. 👍/👎 butonlarının göründüğünü doğrula
3. 👎'ya tıkla → bot "Üzgünüm 😔 ..." mesajı ve "📧 Mail gönder" butonu göstermeli
4. 👍'ya tıkla → konsola `chatbot_feedback {type: "positive"}` logu düşmeli

- [ ] **Step 6: Commit**

```bash
git add components/ai-assistant/MessageBubble.tsx components/ai-assistant/ChatWindow.tsx
git commit -m "feat: add feedback buttons (thumbs up/down) to bot messages"
```

---

## Son Kontrol

- [ ] **Tüm TypeScript kontrolü**

```bash
npx tsc --noEmit 2>&1
```

Beklenen: hata yok.

- [ ] **Tam akış testi**

1. Chat aç → 6 hoşgeldin chip'i görünüyor mu?
2. "Öğrenci bul" → 3 soru (alan, bütçe, öncelik) → Sonuçlar
3. Bilgi tabanında olmayan soru yaz (örn: "uçak bileti") → fallback + email görünüyor mu?
4. "📧 Destek" → mail açılıyor mu?
5. Bot mesajı hover → 👍/👎 görünüyor mu?
6. 👎 → destek mesajı geliyor mu?

- [ ] **Final commit (varsa uncommitted değişiklik)**

```bash
git status
git add -p  # sadece gerekli dosyalar
git commit -m "chore: chatbot improvements final cleanup"
```
