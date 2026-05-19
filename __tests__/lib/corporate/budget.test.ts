import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../lib/prisma', () => ({
  prisma: {
    matchingTransaction: { aggregate: vi.fn() },
  },
}));

import { getSpentInPeriod } from '../../../lib/corporate/budget';
import { prisma } from '../../../lib/prisma';

describe('getSpentInPeriod', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns sum of matchedAmountTRY for APPROVED in period', async () => {
    vi.mocked(prisma.matchingTransaction.aggregate).mockResolvedValue({
      _sum: { matchedAmountTRY: 12500 },
    } as any);
    const spent = await getSpentInPeriod('co_1', '2026-05');
    expect(spent).toBe(12500);
    expect(prisma.matchingTransaction.aggregate).toHaveBeenCalledWith({
      where: { companyId: 'co_1', periodKey: '2026-05', status: 'APPROVED' },
      _sum: { matchedAmountTRY: true },
    });
  });

  it('returns 0 when no APPROVED transactions', async () => {
    vi.mocked(prisma.matchingTransaction.aggregate).mockResolvedValue({
      _sum: { matchedAmountTRY: null },
    } as any);
    const spent = await getSpentInPeriod('co_1', '2026-05');
    expect(spent).toBe(0);
  });
});
