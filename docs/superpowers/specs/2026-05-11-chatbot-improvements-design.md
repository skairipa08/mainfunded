# FundEd Chatbot İyileştirme Tasarımı

**Tarih:** 2026-05-11  
**Kapsam:** Kural tabanlı AI assistant geliştirme — B+C yaklaşımı  
**Branch:** feat/corporate-matching-phase1

---

## Genel Bakış

FundEd'in sağ alt köşedeki AI Assistant widget'ı, rule-based (kural tabanlı) bir chatbot'tur. Gerçek bir LLM kullanmaz; anahtar kelime eşleştirmesi ve statik bilgi tabanı üzerinde çalışır. Bu spec, kullanıcı deneyimini ve cevap doğruluğunu iyileştiren dört değişikliği tanımlar.

---

## Kapsam Dışı

- LLM/AI API entegrasyonu (Claude, GPT vb.)
- Analitik backend (feedback verileri şimdilik sadece console.log)
- İptal/iade politikası bilgisi — platform bu politikayı sunmuyor
- "7 gün şartsız iade" bilgisi — sitede yanlış geçiyor, chatbot'a kesinlikle eklenmeyecek

---

## Değişiklik 1 — Güven Skoru ve Destek Email Yönlendirmesi

### Sorun
`searchKnowledge()` düşük eşleşmeli sorgularda bile bir sonuç döndürüyor. Bot yanlış ya da alakasız cevaplar veriyor.

### Çözüm

**`lib/ai-assistant/knowledge-base.ts`**
- Mevcut `searchKnowledge()` içinde zaten bir ham puan (`score`) hesaplanıyor ve `threshold = 5` filtresi var.
- Dönüş tipine `score: number` eklenir — mevcut iç skorun normalize edilmiş (0–1) hali değil, ham skordur.
- Dönüş tipi: `{ entry: KnowledgeEntry | null; related: KnowledgeEntry[]; score: number }` (score 0 = eşleşme yok)
- `MIN_CONFIDENCE_SCORE = 15` sabiti eklenir (ham skor; mevcut `threshold = 5` yerine geçer, daha kısıtlayıcı).

**`lib/ai-assistant/chat-engine.ts` — `processKnowledgeQuery()`**
- `score < MIN_CONFIDENCE_SCORE` ise (veya `entry === null` ise) fallback mesajı döner.
- **Farewell ve thanks case'leri bu kontrolden muaftır** — bunlar doğrudan `searchKnowledge` çağırır ama sabit kelimelerle (`'görüşürüz'`, `'teşekkür'`); yüksek güvenle eşleşirler. Bu call site'lar confidence kontrolüne tabi tutulmaz, sadece `processKnowledgeQuery()` tabi tutulur.

**Tüm fallback mesajları (`getFallbackResponse`, `getFaqNotFound`, ChatWindow satır 170–176)**
Format:
```
Bu konuyu bilgi tabanımda bulamadım 🤔

Destek ekibimize yazın: getsfunded@gmail.com

Quick replies: [📧 Mail gönder] [🎯 Öğrenci bul] [🏠 Ana menü]
```

`getKnowledgeById()` fallback'i de aynı şekilde güncellenir.

**`support_email` handler davranışı (`components/ai-assistant/ChatWindow.tsx`)**
```ts
if (value === 'support_email') {
  window.open('mailto:getsfunded@gmail.com', '_blank');
  await addBotMessage(botMessage('Mail uygulamanız açıldı 📧 Yardımcı olmaktan memnuniyet duyarız!'));
  return;
}
```

### Etkilenen dosyalar
- `lib/ai-assistant/knowledge-base.ts`
- `lib/ai-assistant/chat-engine.ts`
- `lib/ai-assistant/chat-flow.ts`
- `components/ai-assistant/ChatWindow.tsx` (satır 170–176 fallback + support_email handler)

---

## Değişiklik 2 — Öğrenci Bulma Akışı 5 → 3 Soru

### Sorun
5 soruluk akış kullanıcıyı yoruyor. Cinsiyet ve ülke soruları büyük çoğunlukla "Farketmez" seçiliyor.

### Yeni akış
`ask_field` → `ask_budget` → `ask_priority` → `searching` → `results`

### Detaylar

**`lib/ai-assistant/chat-flow.ts`**
- `getNextStep()` güncellenir: `ask_field → ask_budget → ask_priority → searching → results`
- `getGenderQuestion()` ve `getCountryQuestion()` fonksiyonları dosyada kalır (silinmez) — ancak akıştan çağrılmaz. Geriye uyumluluk.

**`types/ai-assistant.ts`** *(daha önce eksik, şimdi listeye eklendi)*
- `ChatStep` union'ından `'ask_gender'` ve `'ask_country'` **kaldırılmaz** — recommendation engine veya başka bir yer hâlâ referans edebilir.
- Bunun yerine bu step'ler "deprecated" olarak comment'lenir.

**`components/ai-assistant/ChatWindow.tsx`**
- `switch (currentStep)` bloğundan `case 'ask_gender'` ve `case 'ask_country'` kaldırılır.
- **Satır 302 kritik düzeltme:** `currentStep === 'ask_country'` → `currentStep === 'ask_priority'` olarak değiştirilir. Bu, recommendation fetch'in doğru noktada tetiklenmesi için şarttır.
- `newPrefs.gender` ve `newPrefs.country` set etme satırları kaldırılır.

**`lib/ai-assistant/recommendation-engine.ts`**
- `gender` ve `country` boş geldiğinde tüm öğrencileri filtreden geçirir (zaten `any` gibi davranmalı — mevcut davranış kontrol edilmeli; değilse düzeltilir).

### Etkilenen dosyalar
- `lib/ai-assistant/chat-flow.ts`
- `components/ai-assistant/ChatWindow.tsx` (switch case + satır 302)
- `types/ai-assistant.ts` (comment ekleme)
- `lib/ai-assistant/recommendation-engine.ts` (kontrol + gerekirse düzeltme)

---

## Değişiklik 3 — Genişletilmiş Bilgi Tabanı

### Not
Mevcut `KnowledgeCategory` union'ı aşağıdaki kategorilerin tümünü zaten içeriyor: `payment`, `legal`, `student`, `donation`, `security`, `corporate`, `mentor`, `campaign`. Tip değişikliği gerekmez.

### Eklenecek girişler

| Kategori | Konu | Örnek soru |
|----------|------|-----------|
| `payment` | Kabul edilen kartlar | "Hangi kartlarla ödeme yapabilirim?" |
| `payment` | Taksit seçeneği | "Taksitli bağış yapabilir miyim?" |
| `payment` | Uluslararası kart | "Yabancı kart kullanabilir miyim?" |
| `legal` | Bağış makbuzu | "Makbuz alabilir miyim?" |
| `legal` | Vergi indirimi | "Vergi indirimi var mı?" — cevaba "muhasebe danışmanınıza veya getsfunded@gmail.com'a yazın" notu eklenir |
| `student` | Başvuru süreci | "Öğrenci nasıl başvurur?" |
| `student` | Gerekli belgeler | "Hangi belgeler gerekiyor?" |
| `donation` | Para transferi | "Bağışım öğrenciye nasıl ulaşır?" |
| `donation` | Transfer süresi | "Ne zaman ulaşır?" |
| `security` | Kart güvenliği | "Kart bilgilerim güvende mi?" |
| `security` | SSL/3D Secure | "3D Secure var mı?" |
| `corporate` | Toplu bağış | "Şirket olarak bağış yapabilir miyim?" |
| `mentor` | Mentorluk | "Para yerine mentorluk yapabilir miyim?" |
| `campaign` | Kampanya iptali | "Kampanya iptal olursa ne olur?" — cevap email yönlendirmesidir |

**Toplam:** 14 yeni giriş. İptal/iade politikası hiçbir girişe eklenmez.

### Etkilenen dosyalar
- `lib/ai-assistant/knowledge-base.ts`

---

## Değişiklik 4 — UX İyileştirmeleri

### 4a — 👍/👎 Feedback Butonu

**`components/ai-assistant/MessageBubble.tsx`**
- `onFeedback?: (messageId: string, type: 'positive' | 'negative') => void` prop'u eklenir.
- Bot mesajlarının altında küçük, gri feedback butonları render edilir.
- Tıklandığında `onFeedback` callback'i çağrılır.

**`components/ai-assistant/ChatWindow.tsx`**
- `MessageBubble`'a `onFeedback` handler geçilir:
  ```ts
  const handleFeedback = async (messageId: string, type: 'positive' | 'negative') => {
    console.log('feedback', type, messageId);
    if (type === 'positive') {
      // opsiyonel: hafif toast (implementer kararı)
    } else {
      await addBotMessage(botMessage(
        'Üzgünüm 😔 Destek ekibimize yazarsanız yardımcı olurlar: getsfunded@gmail.com',
        [{ label: '📧 Mail gönder', value: 'support_email' }]
      ));
    }
  };
  ```
- `MessageBubble` çağrısına `onFeedback={handleFeedback}` eklenir.

### 4b — Hoşgeldin Ekranı Chip'leri

**`lib/ai-assistant/chat-engine.ts` — `generateWelcomeResponse()`**

Mevcut 4 quick reply korunur, 2 yeni eklenir:

```
🎯 Öğrenci bul       (value: 'find_student')
❓ Nasıl çalışır?    (value: 'ask_how')
🔒 Güvenilir mi?     (value: 'ask_trust')
💳 Ödeme yöntemleri  (value: 'ask_payment')   ← yeni
📋 Kampanyaları gör  (value: 'browse')
📧 Destek            (value: 'support_email')  ← yeni
```

**`components/ai-assistant/ChatWindow.tsx`**
- `ask_payment` handler: `fetchChatResponse('Hangi kartlarla ödeme yapabilirim?')` çağrısı yapar.

### 4c — Gelişmiş Fallback Mesajı

Tüm fallback noktaları (Değişiklik 1'deki format) tutarlı hale getirilir. Etkilenen lokasyonlar:
- `lib/ai-assistant/knowledge-base.ts` — `getFallbackResponse()` ve mevcut tüm knowledge entry'ler — **DİKKAT:** dosyada birden fazla yerde `info@funded.com` geçiyor (satır 163, 420, 527, 890 civarı ve getFallbackResponse). Tüm bu referanslar `getsfunded@gmail.com` ile değiştirilmelidir. Uygulama başlamadan önce `grep -n "info@funded.com" lib/ai-assistant/knowledge-base.ts` ile tam liste alınmalı.
- `lib/ai-assistant/chat-flow.ts` — `getFaqNotFound()`
- `components/ai-assistant/ChatWindow.tsx` — satır 170–176 hardcoded fallback ("Hmm, bunu tam anlayamadım 🤔...") yeni formatla değiştirilir
- `lib/ai-assistant/chat-engine.ts` — `getKnowledgeById()` fallback (satır 296–298) — quick reply olarak `[📧 Mail gönder]` eklenir

### Etkilenen dosyalar
- `components/ai-assistant/MessageBubble.tsx` (onFeedback prop + UI)
- `components/ai-assistant/ChatWindow.tsx` (handleFeedback + ask_payment handler + support_email + fallback satır 170-176)
- `lib/ai-assistant/chat-engine.ts` (welcome chips + getKnowledgeById fallback)
- `lib/ai-assistant/chat-flow.ts` (getFaqNotFound)
- `lib/ai-assistant/knowledge-base.ts` (getFallbackResponse)

---

## Özet — Etkilenen Dosyalar (Tam Liste)

| Dosya | Değişiklikler |
|-------|--------------|
| `lib/ai-assistant/knowledge-base.ts` | Score dönüş tipi + MIN_CONFIDENCE_SCORE + 14 yeni giriş + getFallbackResponse güncelleme |
| `lib/ai-assistant/chat-engine.ts` | Confidence threshold + welcome chips + getKnowledgeById fallback |
| `lib/ai-assistant/chat-flow.ts` | getNextStep 5→3 + getFaqNotFound email |
| `lib/ai-assistant/recommendation-engine.ts` | gender/country boş kontrolü |
| `types/ai-assistant.ts` | ask_gender/ask_country deprecation comment |
| `components/ai-assistant/ChatWindow.tsx` | switch case + satır 302 + support_email + ask_payment + handleFeedback + fallback satır 170-176 |
| `components/ai-assistant/MessageBubble.tsx` | onFeedback prop + 👍/👎 UI |

---

## Sonradan Yapılacak (Bu Scope Dışı)

- Sitedeki yanlış "7 gün şartsız iade" metninin kaldırılması
- Feedback verilerinin analitik sisteme gönderilmesi
- Çok dil desteği (i18n key'leri ekleme)
