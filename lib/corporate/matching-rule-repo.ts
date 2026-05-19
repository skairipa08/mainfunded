import { prisma } from '@/lib/prisma';
import type { MatchingRule } from '@prisma/client';
import type { MatchingRuleInput } from './validators';

export async function findRuleByCompany(companyId: string): Promise<MatchingRule | null> {
  return prisma.matchingRule.findUnique({ where: { companyId } });
}

export async function upsertRule(
  companyId: string,
  input: MatchingRuleInput
): Promise<MatchingRule> {
  return prisma.matchingRule.upsert({
    where: { companyId },
    create: {
      companyId,
      ratio: input.ratio,
      monthlyBudgetTRY: input.monthlyBudgetTRY,
      eligibleCategories: input.eligibleCategories,
      active: input.active,
    },
    update: {
      ratio: input.ratio,
      monthlyBudgetTRY: input.monthlyBudgetTRY,
      eligibleCategories: input.eligibleCategories,
      active: input.active,
    },
  });
}
