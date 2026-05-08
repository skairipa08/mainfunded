import { prisma } from '@/lib/prisma';
import type { MatchingTransaction, MatchingStatus, Prisma } from '@prisma/client';

export type CreateTransactionInput = Omit<
  Prisma.MatchingTransactionUncheckedCreateInput,
  'id' | 'createdAt'
>;

export async function createTransaction(
  input: CreateTransactionInput
): Promise<MatchingTransaction> {
  return prisma.matchingTransaction.create({ data: input });
}

export async function findTransactionById(id: string): Promise<MatchingTransaction | null> {
  return prisma.matchingTransaction.findUnique({ where: { id } });
}

export async function findTransactionsByCompany(
  companyId: string,
  status?: MatchingStatus
): Promise<MatchingTransaction[]> {
  return prisma.matchingTransaction.findMany({
    where: status ? { companyId, status } : { companyId },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
}

export async function approveTransaction(
  id: string,
  ownerNote?: string
): Promise<MatchingTransaction> {
  return prisma.matchingTransaction.update({
    where: { id },
    data: { status: 'APPROVED', approvedAt: new Date(), ownerNote: ownerNote ?? null },
  });
}

export async function rejectTransaction(
  id: string,
  reason: string,
  ownerNote?: string
): Promise<MatchingTransaction> {
  return prisma.matchingTransaction.update({
    where: { id },
    data: {
      status: 'REJECTED',
      rejectedAt: new Date(),
      rejectReason: reason,
      ownerNote: ownerNote ?? null,
    },
  });
}

export async function findTransactionByDonation(
  donationId: string
): Promise<MatchingTransaction | null> {
  return prisma.matchingTransaction.findUnique({ where: { donationId } });
}
