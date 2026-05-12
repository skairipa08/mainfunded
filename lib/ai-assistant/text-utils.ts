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
