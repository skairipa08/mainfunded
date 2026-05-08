import type { SimulateInput, SimulateResult } from './types';

export function simulate(input: SimulateInput): SimulateResult {
  const { donationAmountTRY, category, rule, spentInPeriodTRY } = input;

  if (!Number.isFinite(donationAmountTRY) || donationAmountTRY <= 0) {
    return { matched: false, reason: 'INVALID_INPUT' };
  }

  if (!rule.active) {
    return { matched: false, reason: 'RULE_INACTIVE' };
  }

  if (!rule.eligibleCategories.includes(category)) {
    return { matched: false, reason: 'CATEGORY_INELIGIBLE' };
  }

  const wouldMatch = donationAmountTRY * rule.ratio;
  const remaining = rule.monthlyBudgetTRY - spentInPeriodTRY;

  if (remaining <= 0 || wouldMatch > remaining) {
    return { matched: false, reason: 'BUDGET_EXHAUSTED' };
  }

  return {
    matched: true,
    matchedAmountTRY: wouldMatch,
    ratioApplied: rule.ratio,
    remainingBudgetTRY: remaining - wouldMatch,
  };
}
