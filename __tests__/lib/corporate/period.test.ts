import { describe, it, expect } from 'vitest';
import { periodKey } from '../../../lib/corporate/period';

describe('periodKey (Europe/Istanbul)', () => {
  it('formats a mid-month UTC date as YYYY-MM', () => {
    expect(periodKey(new Date('2026-05-15T12:00:00Z'))).toBe('2026-05');
  });

  it('respects Istanbul timezone for end-of-month UTC', () => {
    // 2026-05-31 22:30 UTC = 2026-06-01 01:30 Istanbul → '2026-06'
    expect(periodKey(new Date('2026-05-31T22:30:00Z'))).toBe('2026-06');
  });

  it('respects Istanbul timezone for start-of-month UTC', () => {
    // 2026-06-01 00:30 UTC = 2026-06-01 03:30 Istanbul → '2026-06'
    expect(periodKey(new Date('2026-06-01T00:30:00Z'))).toBe('2026-06');
  });

  it('pads single-digit months', () => {
    expect(periodKey(new Date('2026-01-15T12:00:00Z'))).toBe('2026-01');
  });
});
