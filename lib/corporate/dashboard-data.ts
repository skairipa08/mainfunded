import { prisma } from '@/lib/prisma';
import { periodKey } from './period';
import { getSpentInPeriod } from './budget';
import type { MatchingRule } from '@prisma/client';

export type DashboardStats = {
  totalMatchedAllTime: number;
  affectedStudents: number;
  approvedTxCount: number;
  pendingTxCount: number;
  rejectedTxCount: number;
  currentPeriodSpent: number;
  monthlyBudget: number;
  budgetUsedPct: number;
};

export type TrendPoint = { periodKey: string; matched: number };

export async function getDashboardStats(
  companyId: string,
  rule: MatchingRule | null
): Promise<DashboardStats> {
  const [agg, approved, pending, rejected, distinctCampaigns] = await Promise.all([
    prisma.matchingTransaction.aggregate({
      where: { companyId, status: 'APPROVED' },
      _sum: { matchedAmountTRY: true },
    }),
    prisma.matchingTransaction.count({ where: { companyId, status: 'APPROVED' } }),
    prisma.matchingTransaction.count({ where: { companyId, status: 'PENDING' } }),
    prisma.matchingTransaction.count({ where: { companyId, status: 'REJECTED' } }),
    prisma.matchingTransaction.findMany({
      where: { companyId, status: 'APPROVED' },
      select: { campaignId: true },
      distinct: ['campaignId'],
    }),
  ]);

  const period = periodKey(new Date());
  const currentPeriodSpent = await getSpentInPeriod(companyId, period);
  const monthlyBudget = rule?.monthlyBudgetTRY ?? 0;
  const budgetUsedPct = monthlyBudget > 0 ? currentPeriodSpent / monthlyBudget : 0;

  return {
    totalMatchedAllTime: agg._sum.matchedAmountTRY ?? 0,
    affectedStudents: distinctCampaigns.length,
    approvedTxCount: approved,
    pendingTxCount: pending,
    rejectedTxCount: rejected,
    currentPeriodSpent,
    monthlyBudget,
    budgetUsedPct,
  };
}

/** Last N periods of APPROVED matched amounts. Generates contiguous YYYY-MM keys. */
export async function getTrend(
  companyId: string,
  monthsBack = 12
): Promise<TrendPoint[]> {
  const now = new Date();
  const points: TrendPoint[] = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 15);
    const pk = periodKey(d);
    const matched = await getSpentInPeriod(companyId, pk);
    points.push({ periodKey: pk, matched });
  }
  return points;
}

/** Category distribution among APPROVED matches, as percentages of count. */
export async function getCategoryDistribution(
  companyId: string
): Promise<Array<{ name: string; value: number }>> {
  const grouped = await prisma.matchingTransaction.groupBy({
    by: ['category'],
    where: { companyId, status: 'APPROVED' },
    _count: { _all: true },
  });
  const total = grouped.reduce((acc, g) => acc + g._count._all, 0);
  if (total === 0) return [];
  return grouped
    .map((g) => ({
      name: g.category,
      value: Math.round((g._count._all / total) * 100),
    }))
    .sort((a, b) => b.value - a.value);
}

/** Sponsor lookup: which companies have APPROVED matches for this campaign? */
export async function getSponsorsForCampaign(
  campaignId: string
): Promise<{ id: string; name: string; logoUrl: string | null }[]> {
  const sponsors = await prisma.matchingTransaction.findMany({
    where: { campaignId, status: 'APPROVED' },
    select: { company: { select: { id: true, name: true, logoUrl: true } } },
    distinct: ['companyId'],
  });
  return sponsors.map((s) => s.company);
}
