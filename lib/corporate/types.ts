import type { MatchingRule } from '@prisma/client';

export const ELIGIBLE_CATEGORIES = [
  'tuition',
  'books',
  'laptop',
  'housing',
  'travel',
  'emergency',
] as const;

export type EligibleCategory = (typeof ELIGIBLE_CATEGORIES)[number];

export type SimulateInput = {
  donationAmountTRY: number;
  category: string;
  rule: MatchingRule;
  spentInPeriodTRY: number;
};

export type SimulateRejectReason =
  | 'RULE_INACTIVE'
  | 'CATEGORY_INELIGIBLE'
  | 'BUDGET_EXHAUSTED'
  | 'INVALID_INPUT';

export type SimulateResult =
  | {
      matched: true;
      matchedAmountTRY: number;
      ratioApplied: number;
      remainingBudgetTRY: number;
    }
  | {
      matched: false;
      reason: SimulateRejectReason;
    };
