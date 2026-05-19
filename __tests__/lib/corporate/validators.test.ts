import { describe, it, expect } from 'vitest';
import {
  signupSchema,
  matchingRuleSchema,
  simulateSchema,
  profileUpdateSchema,
  approveDecisionSchema,
} from '../../../lib/corporate/validators';

describe('signupSchema', () => {
  const valid = {
    name: 'Acme Corp',
    taxId: '1234567890',
    contactEmail: 'owner@acme.com',
    password: 'StrongPass1!',
  };

  it('accepts a minimal valid payload', () => {
    expect(signupSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects short password', () => {
    expect(signupSchema.safeParse({ ...valid, password: 'short' }).success).toBe(false);
  });

  it('rejects invalid email', () => {
    expect(signupSchema.safeParse({ ...valid, contactEmail: 'not-an-email' }).success).toBe(false);
  });

  it('rejects empty taxId', () => {
    expect(signupSchema.safeParse({ ...valid, taxId: '' }).success).toBe(false);
  });

  it('rejects empty name', () => {
    expect(signupSchema.safeParse({ ...valid, name: '' }).success).toBe(false);
  });

  it('accepts optional fields', () => {
    const result = signupSchema.safeParse({
      ...valid,
      legalName: 'Acme Anonim Şirketi',
      contactPhone: '+905551234567',
      websiteUrl: 'https://acme.com',
      logoUrl: 'https://cdn.example.com/logo.png',
    });
    expect(result.success).toBe(true);
  });
});

describe('matchingRuleSchema', () => {
  it('accepts ratio 1, 2, 3', () => {
    for (const ratio of [1, 2, 3]) {
      expect(
        matchingRuleSchema.safeParse({
          ratio,
          monthlyBudgetTRY: 50000,
          eligibleCategories: ['tuition'],
          active: true,
        }).success
      ).toBe(true);
    }
  });

  it('rejects ratio 0, 4, -1', () => {
    for (const ratio of [0, 4, -1]) {
      expect(
        matchingRuleSchema.safeParse({
          ratio,
          monthlyBudgetTRY: 50000,
          eligibleCategories: ['tuition'],
          active: true,
        }).success
      ).toBe(false);
    }
  });

  it('rejects budget <= 0', () => {
    expect(
      matchingRuleSchema.safeParse({
        ratio: 2,
        monthlyBudgetTRY: 0,
        eligibleCategories: ['tuition'],
        active: true,
      }).success
    ).toBe(false);
  });

  it('rejects unknown category', () => {
    expect(
      matchingRuleSchema.safeParse({
        ratio: 2,
        monthlyBudgetTRY: 50000,
        eligibleCategories: ['unknown'],
        active: true,
      }).success
    ).toBe(false);
  });

  it('rejects empty category list', () => {
    expect(
      matchingRuleSchema.safeParse({
        ratio: 2,
        monthlyBudgetTRY: 50000,
        eligibleCategories: [],
        active: true,
      }).success
    ).toBe(false);
  });
});

describe('simulateSchema', () => {
  it('accepts valid body', () => {
    expect(
      simulateSchema.safeParse({ donationAmountTRY: 500, category: 'tuition' }).success
    ).toBe(true);
  });

  it('rejects negative amount', () => {
    expect(
      simulateSchema.safeParse({ donationAmountTRY: -1, category: 'tuition' }).success
    ).toBe(false);
  });

  it('rejects unknown category', () => {
    expect(
      simulateSchema.safeParse({ donationAmountTRY: 500, category: 'foo' }).success
    ).toBe(false);
  });
});

describe('profileUpdateSchema (PATCH /me allow-list)', () => {
  it('accepts mutable fields', () => {
    expect(
      profileUpdateSchema.safeParse({
        name: 'New Name',
        contactEmail: 'new@acme.com',
      }).success
    ).toBe(true);
  });

  it('rejects taxId in body', () => {
    expect(
      profileUpdateSchema.safeParse({ taxId: '9999999999' }).success
    ).toBe(false);
  });

  it('rejects status in body', () => {
    expect(
      profileUpdateSchema.safeParse({ status: 'APPROVED' }).success
    ).toBe(false);
  });

  it('rejects ownerUserId in body', () => {
    expect(
      profileUpdateSchema.safeParse({ ownerUserId: 'abc' }).success
    ).toBe(false);
  });
});

describe('approveDecisionSchema', () => {
  it('accepts APPROVE without reason', () => {
    expect(approveDecisionSchema.safeParse({ decision: 'APPROVE' }).success).toBe(true);
  });

  it('accepts REJECT with reason', () => {
    expect(
      approveDecisionSchema.safeParse({ decision: 'REJECT', reason: 'Tax ID invalid' }).success
    ).toBe(true);
  });

  it('rejects REJECT without reason', () => {
    const result = approveDecisionSchema.safeParse({ decision: 'REJECT' });
    expect(result.success).toBe(false);
  });

  it('rejects REJECT with empty reason', () => {
    expect(
      approveDecisionSchema.safeParse({ decision: 'REJECT', reason: '' }).success
    ).toBe(false);
  });
});
