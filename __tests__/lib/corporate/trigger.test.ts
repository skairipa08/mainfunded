import { describe, it, expect, vi, beforeEach } from 'vitest';

const findUnique = vi.fn();
vi.mock('../../../lib/prisma', () => ({
  prisma: {
    company: { findUnique: (...a: any[]) => findUnique(...a) },
  },
}));

const findActiveAffiliationByUser = vi.fn();
vi.mock('../../../lib/corporate/affiliation-repo', () => ({
  findActiveAffiliationByUser: (...a: any[]) => findActiveAffiliationByUser(...a),
}));

const createTransaction = vi.fn();
const findTransactionByDonation = vi.fn();
vi.mock('../../../lib/corporate/transaction-repo', () => ({
  createTransaction: (...a: any[]) => createTransaction(...a),
  findTransactionByDonation: (...a: any[]) => findTransactionByDonation(...a),
}));

const getSpentInPeriod = vi.fn();
vi.mock('../../../lib/corporate/budget', () => ({
  getSpentInPeriod: (...a: any[]) => getSpentInPeriod(...a),
}));

import { onDonationCreated } from '../../../lib/corporate/trigger';

const baseEvent = {
  donationId: '507f1f77bcf86cd799439001',
  donorUserId: 'user_1',
  campaignId: '507f1f77bcf86cd799439002',
  amountTRY: 100,
  category: 'tuition',
};

const baseRule = {
  id: 'rule_1',
  ratio: 2,
  monthlyBudgetTRY: 10_000,
  eligibleCategories: ['tuition'],
  active: true,
};

describe('onDonationCreated', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findTransactionByDonation.mockResolvedValue(null);
    getSpentInPeriod.mockResolvedValue(0);
  });

  it('skips when no affiliation', async () => {
    findActiveAffiliationByUser.mockResolvedValue(null);
    await onDonationCreated(baseEvent);
    expect(createTransaction).not.toHaveBeenCalled();
  });

  it('skips when transaction already exists for donation', async () => {
    findTransactionByDonation.mockResolvedValue({ id: 'existing' });
    await onDonationCreated(baseEvent);
    expect(findActiveAffiliationByUser).not.toHaveBeenCalled();
    expect(createTransaction).not.toHaveBeenCalled();
  });

  it('skips when company not APPROVED', async () => {
    findActiveAffiliationByUser.mockResolvedValue({ companyId: 'co_1' });
    findUnique.mockResolvedValue({ id: 'co_1', status: 'PENDING', matchingRule: baseRule });
    await onDonationCreated(baseEvent);
    expect(createTransaction).not.toHaveBeenCalled();
  });

  it('skips when no matching rule', async () => {
    findActiveAffiliationByUser.mockResolvedValue({ companyId: 'co_1' });
    findUnique.mockResolvedValue({ id: 'co_1', status: 'APPROVED', matchingRule: null });
    await onDonationCreated(baseEvent);
    expect(createTransaction).not.toHaveBeenCalled();
  });

  it('creates PENDING transaction on match', async () => {
    findActiveAffiliationByUser.mockResolvedValue({ companyId: 'co_1' });
    findUnique.mockResolvedValue({ id: 'co_1', status: 'APPROVED', matchingRule: baseRule });
    await onDonationCreated(baseEvent);
    expect(createTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        companyId: 'co_1',
        donationId: baseEvent.donationId,
        donationAmountTRY: 100,
        matchedAmountTRY: 200,
        ratioApplied: 2,
        status: 'PENDING',
      })
    );
  });

  it('writes REJECTED audit row when category ineligible', async () => {
    findActiveAffiliationByUser.mockResolvedValue({ companyId: 'co_1' });
    findUnique.mockResolvedValue({ id: 'co_1', status: 'APPROVED', matchingRule: baseRule });
    await onDonationCreated({ ...baseEvent, category: 'travel' });
    expect(createTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'REJECTED',
        rejectReason: 'CATEGORY_INELIGIBLE',
        matchedAmountTRY: 0,
      })
    );
  });

  it('writes REJECTED audit row when budget exhausted', async () => {
    findActiveAffiliationByUser.mockResolvedValue({ companyId: 'co_1' });
    findUnique.mockResolvedValue({ id: 'co_1', status: 'APPROVED', matchingRule: baseRule });
    getSpentInPeriod.mockResolvedValue(10_000);
    await onDonationCreated(baseEvent);
    expect(createTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'REJECTED',
        rejectReason: 'BUDGET_EXHAUSTED',
      })
    );
  });

  it('does not throw when downstream errors', async () => {
    findActiveAffiliationByUser.mockRejectedValue(new Error('DB lost'));
    await expect(onDonationCreated(baseEvent)).resolves.toBeUndefined();
  });
});
