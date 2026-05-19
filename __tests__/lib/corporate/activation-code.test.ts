import { describe, it, expect } from 'vitest';
import {
  generateActivationCode,
  isValidActivationCodeShape,
} from '../../../lib/corporate/activation-code';

describe('generateActivationCode', () => {
  it('generates an 8-character code from the safe alphabet', () => {
    for (let i = 0; i < 50; i++) {
      const code = generateActivationCode();
      expect(code).toMatch(/^[A-HJ-NP-Z2-9]{8}$/);
    }
  });

  it('produces different codes on successive calls (probabilistic)', () => {
    const codes = new Set<string>();
    for (let i = 0; i < 20; i++) codes.add(generateActivationCode());
    expect(codes.size).toBeGreaterThan(15);
  });
});

describe('isValidActivationCodeShape', () => {
  it('accepts a valid code', () => {
    expect(isValidActivationCodeShape('ABCDEFGH')).toBe(true);
  });

  it('rejects lowercase', () => {
    expect(isValidActivationCodeShape('abcdefgh')).toBe(false);
  });

  it('rejects 0/O/1/I (ambiguous chars)', () => {
    expect(isValidActivationCodeShape('ABCDEFG0')).toBe(false);
    expect(isValidActivationCodeShape('ABCDEFGO')).toBe(false);
    expect(isValidActivationCodeShape('ABCDEFG1')).toBe(false);
    expect(isValidActivationCodeShape('ABCDEFGI')).toBe(false);
  });

  it('rejects wrong length', () => {
    expect(isValidActivationCodeShape('ABCDEFG')).toBe(false);
    expect(isValidActivationCodeShape('ABCDEFGHJ')).toBe(false);
  });
});
