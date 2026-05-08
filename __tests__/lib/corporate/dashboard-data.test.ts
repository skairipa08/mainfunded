import { describe, it, expect, vi, beforeEach } from 'vitest';

const aggregate = vi.fn();
const count = vi.fn();
const findMany = vi.fn();
const groupBy = vi.fn();

vi.mock('../../../lib/prisma', () => ({
  prisma: {
    matchingTransaction: {
      aggregate: (...a: any[]) => aggregate(...a),
      count: (...a: any[]) => count(...a),
      findMany: (...a: any[]) => findMany(...a),
      groupBy: (...a: any[]) => groupBy(...a),
    },
  },
}));

vi.mock('../../../lib/corporate/budget', () => ({
  getSpentInPeriod: vi.fn().mockResolvedValue(0),
}));

import {
  getCategoryDistribution,
  getDashboardStats,
  getSponsorsForCampaign,
} from '../../../lib/corporate/dashboard-data';

const rule = { monthlyBudgetTRY: 10000 } as any;

describe('getDashboardStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('aggregates and computes pct correctly', async () => {
    aggregate.mockResolvedValue({ _sum: { matchedAmountTRY: 5000 } });
    count.mockResolvedValueOnce(3); // approved
    count.mockResolvedValueOnce(2); // pending
    count.mockResolvedValueOnce(1); // rejected
    findMany.mockResolvedValue([{ campaignId: 'c1' }, { campaignId: 'c2' }]);

    const stats = await getDashboardStats('co_1', rule);
    expect(stats.totalMatchedAllTime).toBe(5000);
    expect(stats.approvedTxCount).toBe(3);
    expect(stats.pendingTxCount).toBe(2);
    expect(stats.rejectedTxCount).toBe(1);
    expect(stats.affectedStudents).toBe(2);
    expect(stats.monthlyBudget).toBe(10000);
  });

  it('handles null rule (zero budget, zero pct)', async () => {
    aggregate.mockResolvedValue({ _sum: { matchedAmountTRY: 0 } });
    count.mockResolvedValue(0);
    findMany.mockResolvedValue([]);

    const stats = await getDashboardStats('co_1', null);
    expect(stats.monthlyBudget).toBe(0);
    expect(stats.budgetUsedPct).toBe(0);
  });
});

describe('getSponsorsForCampaign', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('dedupes by company and returns minimal company data', async () => {
    findMany.mockResolvedValue([
      { company: { id: 'co_1', name: 'Acme', logoUrl: 'http://x/l.png' } },
      { company: { id: 'co_2', name: 'Bcorp', logoUrl: null } },
    ]);
    const sponsors = await getSponsorsForCampaign('camp_1');
    expect(sponsors).toHaveLength(2);
    expect(sponsors[0].name).toBe('Acme');
  });

  it('returns empty list when no APPROVED transactions', async () => {
    findMany.mockResolvedValue([]);
    expect(await getSponsorsForCampaign('camp_2')).toEqual([]);
  });
});

describe('getCategoryDistribution', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty when no APPROVED transactions', async () => {
    groupBy.mockResolvedValue([]);
    expect(await getCategoryDistribution('co_1')).toEqual([]);
  });

  it('computes percentages and sorts descending', async () => {
    groupBy.mockResolvedValue([
      { category: 'tuition', _count: { _all: 6 } },
      { category: 'books', _count: { _all: 3 } },
      { category: 'laptop', _count: { _all: 1 } },
    ]);
    const dist = await getCategoryDistribution('co_1');
    expect(dist).toEqual([
      { name: 'tuition', value: 60 },
      { name: 'books', value: 30 },
      { name: 'laptop', value: 10 },
    ]);
  });
});
