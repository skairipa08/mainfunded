# Chatbot NLP İyileştirme Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Turkish stemming, synonym expansion, and fuzzy matching to the rule-based chatbot's `searchKnowledge()` function so queries like "ödemeleri", "visa ile bağış", and "bağiş" (typo) correctly match knowledge base entries.

**Architecture:** All NLP logic is extracted to a new `lib/ai-assistant/text-utils.ts` file. `knowledge-base.ts` imports from it and re-exports `normalizeText` for backward compatibility. `searchKnowledge()` is extended with three new matching layers: stem match (+7), synonym expansion (same weight as exact), and fuzzy fallback (+2 when no other hit).

**Tech Stack:** TypeScript, Vitest, zero external dependencies

---

## Chunk 1: text-utils.ts + Tests + knowledge-base.ts Integration

### Task 1: Create `lib/ai-assistant/text-utils.ts` with stub exports

**Files:**
- Create: `lib/ai-assistant/text-utils.ts`

- [ ] **Step 1: Create the file with all exports stubbed**

```ts
// lib/ai-assistant/text-utils.ts

/** Türkçe karakterleri normalize eder ve küçük harfe çevirir */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

const SUFFIXES = [
  'abilirsiniz', 'ebilirsiniz',
  'abilirsin',   'ebilirsin',
  'abilir',      'ebilir',
  'iyor',        'uyor',
  'larin',       'lerin',
  'lara',        'lere',
  'larda',       'lerde',
  'lardan',      'lerden',
  'lari',        'leri',
  'lar',         'ler',
  'dan',         'den',   'tan',  'ten',
  'lik',         'luk',
  'mak',         'mek',
  'mis',         'mus',
  'im',          'in',
  'da',          'de',    'ta',   'te',
  'yi',          'yu',    'ya',   'ye',
];

/**
 * Normalize edilmiş (ASCII, küçük harf) bir kelimeden Türkçe sonekleri soyar.
 * Minimum kök uzunluğu: 4 karakter.
 */
export function stemTurkish(word: string): string {
  for (const suffix of SUFFIXES) {
    if (word.endsWith(suffix) && word.length - suffix.length >= 4) {
      return word.slice(0, word.length - suffix.length);
    }
  }
  return word;
}

/**
 * Tek kelimeli sinonim grupları.
 * Çok kelimeli üyeler (boşluk içerenler) searchKnowledge() içinde
 * normalizedQuery.includes() ile ayrıca kontrol edilir.
 */
export const SYNONYM_GROUPS: string[][] = [
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
  // Makbuz/Fatura
  ['makbuz', 'fatura', 'belge', 'receipt', 'dokuman'],
  // Şirket/Kurumsal
  ['sirket', 'kurumsal', 'firma', 'corporate', 'isyeri'],
  // Mentorluk
  ['mentorluk', 'mentor', 'rehber', 'kocluk'],
  // Nasıl/Süreç
  ['nasil', 'ne sekilde', 'nerede', 'hangi yolla'],
];

/**
 * Sorgu kelimelerini tek kelimeli sinonimlerle genişletir.
 * Çok kelimeli sinonimler bu fonksiyonun sorumluluğunda değildir.
 */
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

/** İki string arasındaki Levenshtein (edit) mesafesini hesaplar */
export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

/**
 * Fuzzy eşleşme skoru döner.
 * Her iki kelime de >= 5 karakter olmalı; Levenshtein distance <= 1 ise 2 puan.
 * distance == 0 (tam eşleşme) 0 döner — exact match zaten ana logic tarafından yakalanır.
 */
export function fuzzyMatchScore(queryWord: string, keyword: string): number {
  if (queryWord.length < 5 || keyword.length < 5) return 0;
  const dist = levenshtein(queryWord, keyword);
  if (dist === 0) return 0;
  return dist <= 1 ? 2 : 0;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | grep "text-utils"`
Expected: no errors for text-utils.ts (pre-existing errors in other files are OK)

---

### Task 2: Write tests for `text-utils.ts`

**Files:**
- Create: `__tests__/lib/ai-assistant/text-utils.test.ts`

- [ ] **Step 1: Create the test file**

```ts
// __tests__/lib/ai-assistant/text-utils.test.ts
import { describe, it, expect } from 'vitest';
import {
  normalizeText,
  stemTurkish,
  expandSynonyms,
  levenshtein,
  fuzzyMatchScore,
} from '@/lib/ai-assistant/text-utils';

describe('normalizeText', () => {
  it('converts Turkish chars to ASCII', () => {
    expect(normalizeText('ödeme')).toBe('odeme');
    expect(normalizeText('güvenlik')).toBe('guvenlik');
    expect(normalizeText('şifre')).toBe('sifre');
    expect(normalizeText('ülke')).toBe('ulke');
    expect(normalizeText('ıssız')).toBe('issiz');
    expect(normalizeText('çalışma')).toBe('calisma');
  });

  it('lowercases and trims', () => {
    expect(normalizeText('  ÖDEME  ')).toBe('odeme');
  });

  it('removes non-alphanumeric except spaces', () => {
    expect(normalizeText('ödeme?!')).toBe('odeme');
  });
});

describe('stemTurkish', () => {
  it('strips plural -ler suffix', () => {
    expect(stemTurkish('odemeler')).toBe('odeme');
  });

  it('strips plural -leri suffix', () => {
    expect(stemTurkish('odemeleri')).toBe('odeme');
  });

  it('strips locative -da suffix', () => {
    expect(stemTurkish('kampanyada')).toBe('kampanya');
  });

  it('strips -lik suffix', () => {
    expect(stemTurkish('guvenlik')).toBe('guven');
  });

  it('strips -dan suffix', () => {
    expect(stemTurkish('bagisdan')).toBe('bagis');
  });

  it('strips -lar suffix', () => {
    expect(stemTurkish('bagislar')).toBe('bagis');
  });

  it('strips -mis suffix', () => {
    // 'odemis' (6 chars) - 'mis' (3) = 'odem' (4 chars) >= 4 min → stripped
    expect(stemTurkish('odemis')).toBe('odem');
  });

  it('does not strip when root would be < 4 chars', () => {
    // 'gelmis' (6 chars) - 'mis' (3) = 'gel' (3 chars) < 4 min → not stripped
    expect(stemTurkish('gelmis')).toBe('gelmis');
    expect(stemTurkish('ada')).toBe('ada');
  });

  it('strips longest matching suffix first', () => {
    // 'leri' (4) beats 'ler' (3) and 'i' (1)
    expect(stemTurkish('kampanyaleri')).toBe('kampanya');
  });

  it('returns word unchanged when no suffix matches', () => {
    expect(stemTurkish('platform')).toBe('platform');
    expect(stemTurkish('fund')).toBe('fund');
  });
});

describe('expandSynonyms', () => {
  it('expands a payment synonym', () => {
    const result = expandSynonyms(['visa']);
    expect(result).toContain('visa');
    expect(result).toContain('kart');
    expect(result).toContain('mastercard');
  });

  it('expands a security synonym', () => {
    const result = expandSynonyms(['guvenilir']);
    expect(result).toContain('guven');
    expect(result).toContain('guvenli');
    expect(result).toContain('ssl');
  });

  it('does not add multi-word synonyms', () => {
    const result = expandSynonyms(['visa']);
    const multiWords = result.filter(s => s.includes(' '));
    expect(multiWords).toHaveLength(0);
  });

  it('returns original words when no synonym group matches', () => {
    const result = expandSynonyms(['nedir', 'platform']);
    expect(result).toContain('nedir');
    expect(result).toContain('platform');
    expect(result).toHaveLength(2);
  });

  it('deduplicates — does not repeat words already in input', () => {
    const result = expandSynonyms(['kart', 'visa']);
    const karts = result.filter(w => w === 'kart');
    expect(karts).toHaveLength(1);
  });
});

describe('levenshtein', () => {
  it('returns 0 for identical strings', () => {
    expect(levenshtein('bagis', 'bagis')).toBe(0);
  });

  it('returns 1 for single substitution', () => {
    expect(levenshtein('bagis', 'bagit')).toBe(1);
  });

  it('returns 1 for single insertion', () => {
    expect(levenshtein('bagis', 'bagiss')).toBe(1);
  });

  it('returns 1 for single deletion', () => {
    expect(levenshtein('bagis', 'agis')).toBe(1);
  });

  it('returns 2 for two-character typo', () => {
    expect(levenshtein('bagis', 'bagxx')).toBe(2);
  });

  it('handles empty strings', () => {
    expect(levenshtein('', 'abc')).toBe(3);
    expect(levenshtein('abc', '')).toBe(3);
    expect(levenshtein('', '')).toBe(0);
  });
});

describe('fuzzyMatchScore', () => {
  it('returns 2 for a single-char typo (distance=1)', () => {
    expect(fuzzyMatchScore('bagis', 'bagiss')).toBe(2); // insert
    expect(fuzzyMatchScore('bagis', 'bagit')).toBe(2);  // substitute
  });

  it('returns 0 for exact match (distance=0)', () => {
    // exact matches are handled by main scoring logic, not fuzzy
    expect(fuzzyMatchScore('bagis', 'bagis')).toBe(0);
  });

  it('returns 0 for distance > 1', () => {
    expect(fuzzyMatchScore('bagis', 'bagxx')).toBe(0);
  });

  it('returns 0 when either word is < 5 chars', () => {
    expect(fuzzyMatchScore('bag', 'baga')).toBe(0);
    expect(fuzzyMatchScore('bagis', 'bag')).toBe(0);
  });
});
```

- [ ] **Step 2: Run tests — verify they pass**

Run: `npx vitest run __tests__/lib/ai-assistant/text-utils.test.ts`
Expected: all tests pass

**Note on stem tests:** `stemTurkish('odemis')` → `'odem'` (4 chars, valid). `stemTurkish('gelmis')` → `'gelmis'` unchanged because root `'gel'` = 3 chars < 4 minimum.

- [ ] **Step 3: Commit**

```bash
git add lib/ai-assistant/text-utils.ts __tests__/lib/ai-assistant/text-utils.test.ts
git commit -m "feat: add text-utils (stemTurkish, expandSynonyms, fuzzyMatchScore)"
```

---

### Task 3: Update `knowledge-base.ts` — migrate normalizeText + wire NLP into searchKnowledge

**Files:**
- Modify: `lib/ai-assistant/knowledge-base.ts`

**Context:** `normalizeText` is currently a non-exported `function` defined at line 1099. No file outside `knowledge-base.ts` imports it. The migration adds it as a re-export from `text-utils.ts`.

- [ ] **Step 1: Add import + re-export at top of file, remove old normalizeText definition**

At the very top of `lib/ai-assistant/knowledge-base.ts` (line 1, before the first comment or after it):

```ts
import {
  normalizeText,
  stemTurkish,
  expandSynonyms,
  fuzzyMatchScore,
  SYNONYM_GROUPS,
} from './text-utils';
export { normalizeText } from './text-utils';
```

Then **delete** the existing `normalizeText` function (lines 1098–1110 in the original file):

```ts
// DELETE this entire block:
/** Türkçe karakterleri normalize eder ve küçük harfe çevirir */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}
```

- [ ] **Step 2: Verify TypeScript compiles — no new errors**

Run: `npx tsc --noEmit 2>&1 | grep -v "\.worktrees\|worktrees\|bold-rosalind\|tax-documents\|i18n/context\|notification-helpers\|expenditure" | grep "error"`
Expected: no output (pre-existing errors in worktrees/i18n are excluded by grep)

- [ ] **Step 3: Update `searchKnowledge()` — add stem + synonym + multi-word synonym + fuzzy**

Find `searchKnowledge()` in `knowledge-base.ts`. It starts with:

```ts
export function searchKnowledge(query: string): { ... } {
  const normalizedQuery = normalizeText(query);
  const queryWords = normalizedQuery.split(/\s+/).filter((w) => w.length > 1);

  if (queryWords.length === 0) return { entry: null, related: [], score: 0 };
```

Replace the block up to and including the `if (queryWords.length === 0)` guard with:

```ts
export function searchKnowledge(query: string): {
  entry: KnowledgeEntry | null;
  related: KnowledgeEntry[];
  score: number;
} {
  const normalizedQuery = normalizeText(query);
  const queryWords = normalizedQuery.split(/\s+/).filter((w) => w.length > 1);

  if (queryWords.length === 0) return { entry: null, related: [], score: 0 };

  // Stem query words (run after normalization)
  const stemmedQueryWords = queryWords.map(stemTurkish);

  // Single-word synonym expansion
  const expandedQueryWords = expandSynonyms(queryWords);

  // Multi-word synonym expansion — check against full normalizedQuery
  for (const group of SYNONYM_GROUPS) {
    const multiWordHit = group.some(s => s.includes(' ') && normalizedQuery.includes(s));
    if (multiWordHit) {
      group
        .filter(s => !s.includes(' '))
        .forEach(s => { if (!expandedQueryWords.includes(s)) expandedQueryWords.push(s); });
    }
  }
```

**Note:** `expandedQueryWords` is declared with `const` in `expandSynonyms` but we push to it afterward. Since `expandSynonyms` returns a plain `string[]` (not readonly), and we assign it to a `const` variable, we can call `.push()` on it (push mutates the array, not the variable binding). This is valid TypeScript.

- [ ] **Step 4: Replace the keyword loop inside `searchKnowledge()` to use expandedQueryWords + add stem match**

Find this block inside the `for (const entry of KNOWLEDGE_BASE)` loop:

```ts
    // 1. Keyword eşleşme (en yüksek ağırlık)
    for (const keyword of entry.keywords) {
      const nk = normalizeText(keyword);

      // Tam içerme: "güvenilir mi" query'si "güvenilir" keyword'ünü içerir
      if (normalizedQuery.includes(nk)) {
        score += 10 * nk.length;
        keywordHits++;
      }

      // Kelime bazlı eşleşme (tam kelime eşleşmeleri)
      for (const word of queryWords) {
        if (nk === word) {
          score += 8;  // tam kelime eşleşmesi
          keywordHits++;
        } else if (nk.includes(word) && word.length >= 4) {
          score += 3;
          keywordHits++;
        } else if (word.includes(nk) && nk.length >= 4) {
          score += 3;
          keywordHits++;
        }
        // Kök eşleşme: sadece 4+ karakter ve çok kısa olmayan kelimeler
        // (3 karakter kök eşleşmesi çok fazla yanlış pozitif üretiyor)
        if (word.length >= 5 && nk.length >= 5 && word.substring(0, 4) === nk.substring(0, 4)) {
          score += 1;
        }
      }
    }
```

Replace with:

```ts
    // 1. Keyword eşleşme (en yüksek ağırlık)
    for (const keyword of entry.keywords) {
      const nk = normalizeText(keyword);

      // Tam içerme: "güvenilir mi" query'si "güvenilir" keyword'ünü içerir
      if (normalizedQuery.includes(nk)) {
        score += 10 * nk.length;
        keywordHits++;
      }

      // Kelime bazlı eşleşme — sinonimlerle genişletilmiş kelime listesi kullanılır
      for (const word of expandedQueryWords) {
        if (nk === word) {
          score += 8;
          keywordHits++;
        } else if (nk.includes(word) && word.length >= 4) {
          score += 3;
          keywordHits++;
        } else if (word.includes(nk) && nk.length >= 4) {
          score += 3;
          keywordHits++;
        }
        if (word.length >= 5 && nk.length >= 5 && word.substring(0, 4) === nk.substring(0, 4)) {
          score += 1;
        }
      }

      // Stem eşleşmesi — +7 (exact-word +8 altında, partial +3 üstünde)
      const nkStem = stemTurkish(nk);
      for (const sw of stemmedQueryWords) {
        if (sw.length >= 4 && nkStem === sw) {
          score += 7;
          keywordHits++;
        }
      }
    }

    // Fuzzy fallback — sadece hiç keyword hit yoksa devreye girer
    if (keywordHits === 0) {
      for (const word of queryWords) {
        for (const kw of entry.keywords) {
          const bonus = fuzzyMatchScore(word, normalizeText(kw));
          if (bonus > 0) { score += bonus; }
        }
      }
    }
```

- [ ] **Step 5: Verify TypeScript compiles — no new errors**

Run: `npx tsc --noEmit 2>&1 | grep -v "\.worktrees\|worktrees\|bold-rosalind\|tax-documents\|i18n/context\|notification-helpers\|expenditure" | grep "error"`
Expected: no output

- [ ] **Step 6: Run the full test suite**

Run: `npx vitest run 2>&1 | tail -5`
Expected output contains:
```
Test Files  X failed | Y passed
Tests       X failed | Z passed
```
Where failing tests are all in `.worktrees/` or `.claude/worktrees/` paths only (pre-existing failures). Zero new failures.

- [ ] **Step 7: Commit**

```bash
git add lib/ai-assistant/knowledge-base.ts
git commit -m "feat: wire stemming, synonym expansion, and fuzzy matching into searchKnowledge"
```

---

## End-to-End Verification

After all tasks complete, verify the full chatbot improvement works:

- [ ] Run text-utils tests: `npx vitest run __tests__/lib/ai-assistant/text-utils.test.ts` — all pass
- [ ] Run full suite: `npx vitest run` — no new failures vs. baseline (31 pre-existing failures)
- [ ] TypeScript clean: `npx tsc --noEmit 2>&1 | grep -v "\.worktrees\|worktrees\|bold-rosalind\|tax-documents\|i18n/context\|notification-helpers\|expenditure" | grep "error"` — no output
