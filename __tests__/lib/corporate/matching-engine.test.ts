import { describe, it, expect } from 'vitest';
import { simulate } from '../../../lib/corporate/matching-engine';
import type { MatchingRule } from '@prisma/client';

const baseRule: MatchingRule = {
  id: 'rule_1',
  companyId: 'co_1',
  ratio: 2,
  monthlyBudgetTRY: 10_000,
  eligibleCategories: ['tuition', 'books'],
  active: true,
  effectiveFrom: new Date('2026-01-01'),
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

describe('simulate()', () => {
  it('matches a valid donation', () => {
    const r = simulate({
      donationAmountTRY: 100,
      category: 'tuition',
      rule: baseRule,
      spentInPeriodTRY: 0,
    });
    expect(r).toEqual({
      matched: true,
      matchedAmountTRY: 200,
      ratioApplied: 2,
      remainingBudgetTRY: 9_800,
    });
  });

  it('rejects INVALID_INPUT for zero amount', () => {
    const r = simulate({
      donationAmountTRY: 0,
      category: 'tuition',
      rule: baseRule,
      spentInPeriodTRY: 0,
    });
    expect(r).toEqual({ matched: false, reason: 'INVALID_INPUT' });
  });

  it('rejects INVALID_INPUT for negative amount', () => {
    const r = simulate({
      donationAmountTRY: -50,
      category: 'tuition',
      rule: baseRule,
      spentInPeriodTRY: 0,
    });
    expect(r).toEqual({ matched: false, reason: 'INVALID_INPUT' });
  });

  it('rejects RULE_INACTIVE when active is false', () => {
    const r = simulate({
      donationAmountTRY: 100,
      category: 'tuition',
      rule: { ...baseRule, active: false },
      spentInPeriodTRY: 0,
    });
    expect(r).toEqual({ matched: false, reason: 'RULE_INACTIVE' });
  });

  it('rejects CATEGORY_INELIGIBLE for unlisted category', () => {
    const r = simulate({
      donationAmountTRY: 100,
      category: 'travel',
      rule: baseRule,
      spentInPeriodTRY: 0,
    });
    expect(r).toEqual({ matched: false, reason: 'CATEGORY_INELIGIBLE' });
  });

  it('rejects BUDGET_EXHAUSTED when remaining is zero', () => {
    const r = simulate({
      donationAmountTRY: 100,
      category: 'tuition',
      rule: baseRule,
      spentInPeriodTRY: 10_000,
    });
    expect(r).toEqual({ matched: false, reason: 'BUDGET_EXHAUSTED' });
  });

  it('rejects BUDGET_EXHAUSTED when match exceeds remaining', () => {
    const r = simulate({
      donationAmountTRY: 100,
      category: 'tuition',
      rule: baseRule,
      spentInPeriodTRY: 9_900,
    });
    expect(r).toEqual({ matched: false, reason: 'BUDGET_EXHAUSTED' });
  });

  it('matches when match exactly equals remaining', () => {
    const r = simulate({
      donationAmountTRY: 100,
      category: 'tuition',
      rule: baseRule,
      spentInPeriodTRY: 9_800,
    });
    expect(r).toEqual({
      matched: true,
      matchedAmountTRY: 200,
      ratioApplied: 2,
      remainingBudgetTRY: 0,
    });
  });

  it('precedence: INVALID_INPUT short-circuits before RULE_INACTIVE', () => {
    const r = simulate({
      donationAmountTRY: 0,
      category: 'tuition',
      rule: { ...baseRule, active: false },
      spentInPeriodTRY: 0,
    });
    expect(r).toEqual({ matched: false, reason: 'INVALID_INPUT' });
  });

  it('precedence: RULE_INACTIVE short-circuits before CATEGORY_INELIGIBLE', () => {
    const r = simulate({
      donationAmountTRY: 100,
      category: 'travel',
      rule: { ...baseRule, active: false },
      spentInPeriodTRY: 0,
    });
    expect(r).toEqual({ matched: false, reason: 'RULE_INACTIVE' });
  });
});
