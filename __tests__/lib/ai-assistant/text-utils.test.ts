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
  it('strips plural -leri suffix', () => {
    expect(stemTurkish('odemeleri')).toBe('odeme');
  });

  it('strips plural -ler suffix', () => {
    expect(stemTurkish('odemeler')).toBe('odeme');
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

  it('does not over-strip past-tense words ending in -lmis via -is suffix', () => {
    // 'gelmis' ends with 'lmis' → guard prevents -is from stripping
    expect(stemTurkish('gelmis')).toBe('gelmis');
    // 'kilmis' (6 chars) - 'mis' (3) = 'kil' (3 chars) < 4 min → not stripped
    // Also ends with 'lmis', so -is suffix guard also applies
    expect(stemTurkish('kilmis')).toBe('kilmis');
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
    expect(fuzzyMatchScore('bagis', 'bagiss')).toBe(2);
    expect(fuzzyMatchScore('bagis', 'bagit')).toBe(2);
  });

  it('returns 0 for exact match (distance=0)', () => {
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
