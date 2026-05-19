import { prisma } from '@/lib/prisma';

export async function getSpentInPeriod(
  companyId: string,
  periodKey: string
): Promise<number> {
  const result = await prisma.matchingTransaction.aggregate({
    where: { companyId, periodKey, status: 'APPROVED' },
    _sum: { matchedAmountTRY: true },
  });
  return result._sum.matchedAmountTRY ?? 0;
}
