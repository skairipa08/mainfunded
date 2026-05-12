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
- `lib/mentorship/matching.ts` içindeki `normalizeText` fonksiyonu — bu bağımsız bir implementasyon, `tr-TR` locale ve NFD normalizasyonu kullanır; bu spec kapsamında kesinlikle değiştirilmez

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

**Soyulan sonekler (normalize edilmiş haliyle, orijinal Türkçe karşılığıyla):**

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
| `den` | -den | |
| `tan` | -tan | |
| `ten` | -ten | |
| `lik` | -lik | guvenlik → guven |
| `luk` | -luk | |
| `mak` | -mak | odemek → ode |
| `mek` | -mek | |
| `mis` | -miş | gelmis → gel |
| `mus` | -muş | olmus → ol (4 char guard: ol=2, döner: "olmus") |
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

**Kritik kural:** Sonek soyulduktan sonra kök `>= 4` karakter olmalı; aksi halde orijinal kelime döner. Bu kural, `-da/-de/-ta/-te` gibi lokativ soneklerinin kısa kelimelerde yanlış soyulmasını engeller ("ada" → "a" yerine "ada" döner). Bazı kelimelerde lokativ soyma yanlış pozitif üretebilir — bu, kural tabanlı bir sistemde kabul edilmiş bir trade-off'tur; domain kelime dağarcığı dikkate alındığında etkisi düşüktür.

### `knowledge-base.ts` entegrasyonu

`searchKnowledge()` içinde sorgu kelimeleri hem orijinal hem stem haliyle eşleştirilir:

```ts
const stemmedQueryWords = queryWords.map(stemTurkish);

// Keyword loop içinde, mevcut logic'e ek olarak:
const nkStem = stemTurkish(nk);
for (const sw of stemmedQueryWords) {
  if (nkStem === sw && sw.length >= 4) {
    score += 7; // exact-word (+8) altında, partial (+3) üstünde — stem daha belirsizdir
    keywordHits++;
  }
}
```

Stem eşleşmesi `+7` puan alır: exact-word (`+8`) ile partial (`+3`) arasında kasıtlı olarak konumlandırılmıştır çünkü stem eşleşmeleri daha yüksek belirsizlik taşır.

---

## Değişiklik 2 — Sinonim Genişletme

### `lib/ai-assistant/text-utils.ts`

```ts
export const SYNONYM_GROUPS: string[][] = [ ... ]
export function expandSynonyms(queryWords: string[]): string[]
```

`expandSynonyms()` **yalnızca tek kelimeli** sinonimler üzerinde çalışır ve kelime listesi döner. Çok kelimeli sinonimler (`'kredi karti'`, `'para gonder'` vb.) `searchKnowledge()` içinde `normalizedQuery.includes(multiWordSynonym)` ile ayrıca kontrol edilir — bu sorumluluk `expandSynonyms`'a ait değildir.

```ts
export function expandSynonyms(queryWords: string[]): string[] {
  const expanded = new Set(queryWords);
  for (const group of SYNONYM_GROUPS) {
    const singleWordMembers = group.filter(s => !s.includes(' '));
    const hit = singleWordMembers.some(synonym => queryWords.includes(synonym));
    if (hit) {
      singleWordMembers.forEach(synonym => expanded.add(synonym));
    }
  }
  return Array.from(expanded);
}
```

Sinonim eşleşmesi `keywordHits`'i artırır (aşağıdaki entegrasyon pseudocode'da gösterilmiştir).

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
  ['mentorluk', 'mentor', 'rehber', 'kocluk'],
]
```

### `knowledge-base.ts` entegrasyonu

```ts
// Tek kelimeli sinonim genişletme
const expandedQueryWords = expandSynonyms(queryWords);

// Çok kelimeli sinonim kontrolü — normalizedQuery üzerinde doğrudan
for (const group of SYNONYM_GROUPS) {
  const multiWordHit = group.some(s => s.includes(' ') && normalizedQuery.includes(s));
  if (multiWordHit) {
    group.filter(s => !s.includes(' ')).forEach(s => {
      if (!expandedQueryWords.includes(s)) expandedQueryWords.push(s);
    });
  }
}

// keyword loop'unda expandedQueryWords kullanılır, eşleşme bulunursa keywordHits artırılır
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
- `distance == 0` ise zaten mevcut exact match logic yakalıyor — burada skip

### `knowledge-base.ts` entegrasyonu

Fuzzy matching, **sadece o entry için `keywordHits === 0`** olduğunda devreye girer. Hem exact/stem hem de sinonim eşleşmeleri `keywordHits`'i artırdığından, bu guard her üç önceki katmanı da doğru şekilde kapsar:

```ts
// Keyword loop bittikten SONRA:
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

**Önemli:** `lib/mentorship/matching.ts` dosyası kendi bağımsız `normalizeText` implementasyonunu barındırır (`toLocaleLowerCase('tr-TR')` + NFD). Bu dosyaya dokunulmaz.

---

## Etkilenen Dosyalar

| Dosya | Değişiklik |
|---|---|
| `lib/ai-assistant/text-utils.ts` | **YENİ** — normalizeText, stemTurkish, SYNONYM_GROUPS, expandSynonyms, levenshtein, fuzzyMatchScore |
| `lib/ai-assistant/knowledge-base.ts` | normalizeText import'u güncellenir (re-export), searchKnowledge stem+sinonim+fuzzy entegrasyonu |
| `__tests__/lib/ai-assistant/text-utils.test.ts` | **YENİ** — tüm fonksiyonlar için birim testler |

---

## Test Senaryoları

| Girdi | Beklenen eşleşme | Tetiklenen katman |
|---|---|---|
| "ödemeleri" | payment entry | stem: `odemeler` + `i` → `odeme` (`leri` soyulur, 5 char, geçerli) |
| "visa ile bağış yapabilir miyim" | payment-cards entry | sinonim: `visa` → `kart` grubu (tek kelime) |
| "kredi kartı var mı" | payment-cards entry | sinonim: `kredi karti` çok kelimeli — `normalizedQuery.includes` ile yakalanır |
| "guvenlik" | security entry | stem: `guvenlik` → `guven`; ayrıca sinonim: `guven` grubu |
| "bağiş" (typo) | donation entry | fuzzy: `bagis` edit distance 1 |
| "kampanyada ne olur" | campaign entry | stem: `kampanyada` → `kampanya` |
| "şirket olarak destek" | corporate entry | sinonim: `sirket` → `kurumsal` grubu |
| "mentorluk yapabilir miyim" | mentor entry | sinonim: `mentorluk` → mentor grubu |
