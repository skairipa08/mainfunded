# Chatbot NLP İyileştirme Tasarımı

**Tarih:** 2026-05-12  
**Kapsam:** Turkish stemming + sinonim genişletme + fuzzy matching — sıfır maliyet, LLM yok  
**Branch:** feat/corporate-matching-phase1

---

## Genel Bakış

FundEd chatbot'u kural tabanlıdır. Şu an `searchKnowledge()` sorguyu normalize edip (Türkçe harf→ASCII, küçük harf) keyword listesiyle karşılaştırıyor. Zayıf yönler:

- **Morfoloji körlüğü:** "ödeme", "ödemeleri", "ödedim" hepsi farklı keyword olarak görülüyor
- **Sinonim yokluğu:** "kredi kartı" ile "visa" ayrı intent sayılıyor
- **Typo toleransı yok:** "bağiş" → eşleşme bulunamıyor

Bu spec üç iyileştirmeyi tanımlar.

---

## Kapsam Dışı

- LLM/AI API entegrasyonu
- Tam morfolojik analiz (Zemberek vb. kütüphane kullanımı)
- Öneri motoru (recommendation-engine.ts) değişikliği
- Çok dil desteği — tüm logic Türkçe için

---

## Mimari Karar: Yeni `text-utils.ts` Dosyası

Tüm NLP logic `lib/ai-assistant/text-utils.ts` adlı yeni dosyaya taşınır. `knowledge-base.ts` sadece bu dosyayı import eder. Böylece:

- NLP fonksiyonları bağımsız test edilebilir
- `knowledge-base.ts` (zaten ~1240 satır) daha da büyümez
- Gelecekteki iyileştirmeler tek yerde toplanır

---

## Değişiklik 1 — Türkçe Stemming

### `lib/ai-assistant/text-utils.ts`

```ts
export function stemTurkish(word: string): string
```

- Girdi: normalize edilmiş kelime (ASCII, küçük harf — `normalizeText()` sonrası)
- Çıktı: kök kelime
- Min kök uzunluğu: 4 karakter (daha kısa ise orijinal döner)
- Sonekler **en uzundan en kısaya** sırayla denenir, ilk eşleşmede durulur

**Soyulan sonekler (normalize edilmiş haliyle):**

| Sonek (ASCII) | Orijinal | Örnek |
|---|---|---|
| `abilirsiniz` | -abilirsiniz | yapabilirsiniz → yap |
| `ebilirsiniz` | -ebilirsiniz | |
| `abilirsin` | -abilirsin | |
| `ebilirsin` | -ebilirsin | |
| `abilir` | -abilir | odeyebilir → ode |
| `ebilir` | -ebilir | |
| `iyor` | -iyor | oduyor → odu |
| `uyor` | -uyor | |
| `larin` | -ların | bagislarin → bagis |
| `lerin` | -lerin | |
| `lara` | -lara | |
| `lere` | -lere | |
| `larda` | -larda | |
| `lerde` | -lerde | |
| `lardan` | -lardan | |
| `lerden` | -lerden | |
| `lari` | -ları | |
| `leri` | -leri | |
| `lar` | -lar | bagislar → bagis |
| `ler` | -ler | odemeler → odeme |
| `dan` | -dan | bagisdan → bagis |
| `den` | -den | odenden → oden |
| `tan` | -tan | |
| `ten` | -ten | |
| `lik` | -lik | guvenlik → guven |
| `luk` | -luk | |
| `mak` | -mak | odemek → ode |
| `mek` | -mek | |
| `mis` | -miş | odenmis → oden |
| `dis` | -diş | |
| `im` | -im | bagisim → bagis |
| `in` | -ın/-in | |
| `da` | -da | kampanyada → kampanya |
| `de` | -de | |
| `ta` | -ta | |
| `te` | -te | |
| `yi` | -yi | kampanyayi → kampanya |
| `yu` | -yu | |
| `ya` | -ya | |
| `ye` | -ye | |

**Kritik kural:** Sonek soyulduktan sonra kök `>= 4` karakter olmalı; aksi halde orijinal kelime döner.

### `knowledge-base.ts` entegrasyonu

`searchKnowledge()` içinde:

```ts
// Mevcut
const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 1);

// Yeni — stemmed versiyonlar da eklenir
const stemmedQueryWords = queryWords.map(stemTurkish);

// Keyword eşleştirmede hem orijinal hem stem karşılaştırılır
const nk = normalizeText(keyword);
const nkStem = stemTurkish(nk);

if (normalizedQuery.includes(nk)) { score += 10 * nk.length; }
// ...mevcut logic...
// Ek stem eşleşmesi:
for (const sw of stemmedQueryWords) {
  if (nkStem === sw && sw.length >= 4) { score += 7; keywordHits++; }
}
```

---

## Değişiklik 2 — Sinonim Genişletme

### `lib/ai-assistant/text-utils.ts`

```ts
export const SYNONYM_GROUPS: string[][] = [ ... ]
export function expandSynonyms(words: string[]): string[]
```

`expandSynonyms()`: her kelime için ait olduğu sinonim grubunu bulur, tüm grup üyelerini sonuç listesine ekler (duplicate'ler kaldırılır).

**Sinonim Grupları (normalize edilmiş):**

```ts
[
  // Ödeme
  ['kart', 'kredi karti', 'banka karti', 'visa', 'mastercard', 'maestro', 'troy'],
  // Bağış
  ['bagis', 'yardim', 'destek', 'donate', 'bagisla', 'bagisci'],
  // Güven/Güvenlik
  ['guven', 'guvenli', 'guvenilir', 'ssl', '3d', 'secure', 'guvenlik'],
  // Para transferi
  ['transfer', 'havale', 'eft', 'para gonder', 'para ulasir', 'gonderim'],
  // İade/İptal
  ['iade', 'geri al', 'iptal', 'refund', 'cancel', 'vazgec', 'geri'],
  // Öğrenci
  ['ogrenci', 'universite ogrencisi', 'bursiyer', 'universite'],
  // Kampanya
  ['kampanya', 'proje', 'sayfa', 'kampanyasi'],
  // Nasıl
  ['nasil', 'ne sekilde', 'nerede', 'hangi yolla'],
  // Makbuz/Fatura
  ['makbuz', 'fatura', 'belge', 'receipt', 'dokuman'],
  // Şirket/Kurumsal
  ['sirket', 'kurumsal', 'firma', 'corporate', 'isyeri'],
  // Mentorluk
  ['mentorлuk', 'mentor', 'rehber', 'koçluk', 'kocluk'],
]
```

### `knowledge-base.ts` entegrasyonu

```ts
const expandedQueryWords = expandSynonyms(queryWords);
// expandedQueryWords = [...queryWords, ...synonym_matches]
// Keyword eşleştirmede expandedQueryWords kullanılır
```

---

## Değişiklik 3 — Fuzzy Matching (Typo Toleransı)

### `lib/ai-assistant/text-utils.ts`

```ts
export function levenshtein(a: string, b: string): number
export function fuzzyMatchScore(queryWord: string, keyword: string): number
```

`fuzzyMatchScore()` kuralları:
- Her iki kelime de `>= 5` karakter olmalı
- Levenshtein distance `<= 1` ise `2` puan döner
- Aksi halde `0` döner
- `distance == 0` ise zaten mevcut exact match logic yakalıyor, burada skip edilir

### `knowledge-base.ts` entegrasyonu

Mevcut keyword loop'unun sonuna eklenir:

```ts
// Fuzzy bonus — sadece exact/stem eşleşme bulunamazsa devreye girer
if (keywordHits === 0) {
  for (const word of queryWords) {
    for (const keyword of entry.keywords) {
      const bonus = fuzzyMatchScore(word, normalizeText(keyword));
      if (bonus > 0) { score += bonus; }
    }
  }
}
```

---

## `normalizeText` Taşıması

`normalizeText()` `knowledge-base.ts`'den `text-utils.ts`'e taşınır.
`knowledge-base.ts`'de `export { normalizeText } from './text-utils'` re-export eklenir — **geriye uyumluluk korunur.**

---

## Etkilenen Dosyalar

| Dosya | Değişiklik |
|---|---|
| `lib/ai-assistant/text-utils.ts` | **YENİ** — normalizeText, stemTurkish, SYNONYM_GROUPS, expandSynonyms, levenshtein, fuzzyMatchScore |
| `lib/ai-assistant/knowledge-base.ts` | normalizeText kaldırılır (re-export), searchKnowledge stem+sinonim+fuzzy entegrasyonu |
| `__tests__/lib/ai-assistant/text-utils.test.ts` | **YENİ** — tüm fonksiyonlar için birim testler |

---

## Test Senaryoları

| Girdi | Beklenen eşleşme |
|---|---|
| "ödemeleri" | payment entry (stem: ode) |
| "visa ile bağış yapabilir miyim" | payment-cards entry (sinonim: visa→kart) |
| "güvenlik" | security entry (stem: guven) |
| "bağiş" (typo) | donation entry (fuzzy: bagis) |
| "kampanyada ne olur" | campaign entry (stem: kampanya) |
| "şirket olarak destek" | corporate entry (sinonim: sirket→kurumsal) |
