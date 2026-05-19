import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('../../../lib/authz', () => ({
  requireApprovedCompanyOwner: vi.fn(),
}));

const findUnique = vi.fn();
const updateCompany = vi.fn();
vi.mock('../../../lib/prisma', () => ({
  prisma: {
    matchingRule: { findUnique: vi.fn() },
    company: { findUnique: (...a: any[]) => findUnique(...a), update: (...a: any[]) => updateCompany(...a) },
  },
}));

const findTransactionById = vi.fn();
const approveTransaction = vi.fn();
const rejectTransaction = vi.fn();
vi.mock('../../../lib/corporate/transaction-repo', () => ({
  findTransactionById: (...a: any[]) => findTransactionById(...a),
  approveTransaction: (...a: any[]) => approveTransaction(...a),
  rejectTransaction: (...a: any[]) => rejectTransaction(...a),
}));

const getSpentInPeriod = vi.fn();
vi.mock('../../../lib/corporate/budget', () => ({
  getSpentInPeriod: (...a: any[]) => getSpentInPeriod(...a),
}));

const sendBudgetAlert = vi.fn();
vi.mock('../../../lib/corporate/email-sender', () => ({
  sendBudgetAlert: (...a: any[]) => sendBudgetAlert(...a),
}));

vi.mock('../../../lib/rate-limit', () => ({
  withRateLimit: vi.fn(() => null),
  RATE_LIMITS: { api: {} },
}));

import { POST } from '../../../app/api/corporate/transactions/[id]/decide/route';
import { requireApprovedCompanyOwner } from '../../../lib/authz';
import { prisma } from '../../../lib/prisma';

const company = { id: 'co_1', status: 'APPROVED', contactEmail: 'o@x', name: 'X' } as any;
const baseRule = {
  ratio: 2,
  monthlyBudgetTRY: 10_000,
  eligibleCategories: ['tuition'],
  active: true,
};
const baseTx = {
  id: 't_1',
  companyId: 'co_1',
  donationAmountTRY: 100,
  matchedAmountTRY: 200,
  ratioApplied: 2,
  category: 'tuition',
  status: 'PENDING' as const,
  periodKey: '2026-05',
};

function makeReq(body: any) {
  return new NextRequest('http://localhost/x', { method: 'POST', body: JSON.stringify(body) });
}

describe('POST /api/corporate/transactions/[id]/decide', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireApprovedCompanyOwner).mockResolvedValue({ user: {} as any, company });
  });

  it('rejects REJECT without reason', async () => {
    findTransactionById.mockResolvedValue(baseTx);
    const res = await POST(makeReq({ decision: 'REJECT' }), { params: { id: 't_1' } });
    expect(res.status).toBe(400);
  });

  it('returns 404 when transaction not found', async () => {
    findTransactionById.mockResolvedValue(null);
    const res = await POST(makeReq({ decision: 'APPROVE' }), { params: { id: 't_1' } });
    expect(res.status).toBe(404);
  });

  it('returns 403 when transaction belongs to a different company', async () => {
    findTransactionById.mockResolvedValue({ ...baseTx, companyId: 'co_other' });
    const res = await POST(makeReq({ decision: 'APPROVE' }), { params: { id: 't_1' } });
    expect(res.status).toBe(403);
  });

  it('returns 409 when already decided', async () => {
    findTransactionById.mockResolvedValue({ ...baseTx, status: 'APPROVED' });
    const res = await POST(makeReq({ decision: 'APPROVE' }), { params: { id: 't_1' } });
    expect(res.status).toBe(409);
  });

  it('rejects with reason', async () => {
    findTransactionById.mockResolvedValue(baseTx);
    rejectTransaction.mockResolvedValue({ ...baseTx, status: 'REJECTED' });
    const res = await POST(
      makeReq({ decision: 'REJECT', reason: 'duplicate' }),
      { params: { id: 't_1' } }
    );
    expect(res.status).toBe(200);
    expect(rejectTransaction).toHaveBeenCalledWith('t_1', 'duplicate', undefined);
  });

  it('approves when budget allows + sends 80% threshold email', async () => {
    findTransactionById.mockResolvedValue(baseTx);
    vi.mocked(prisma.matchingRule.findUnique).mockResolvedValue(baseRule as any);
    getSpentInPeriod.mockResolvedValue(7800); // after this approval: 8000 = 80% of 10000
    approveTransaction.mockResolvedValue({ ...baseTx, status: 'APPROVED' });
    findUnique.mockResolvedValue({ ...company, budgetAlertSentAt: null });

    const res = await POST(makeReq({ decision: 'APPROVE' }), { params: { id: 't_1' } });
    expect(res.status).toBe(200);
    expect(approveTransaction).toHaveBeenCalled();
    expect(sendBudgetAlert).toHaveBeenCalledWith(
      '80',
      expect.objectContaining({ name: 'X' }),
      '2026-05',
      8000,
      10000
    );
  });

  it('auto-rejects approval when budget vanished mid-pending', async () => {
    findTransactionById.mockResolvedValue(baseTx);
    vi.mocked(prisma.matchingRule.findUnique).mockResolvedValue(baseRule as any);
    getSpentInPeriod.mockResolvedValue(10_000); // budget already exhausted
    rejectTransaction.mockResolvedValue({ ...baseTx, status: 'REJECTED' });

    const res = await POST(makeReq({ decision: 'APPROVE' }), { params: { id: 't_1' } });
    expect(res.status).toBe(200);
    expect(rejectTransaction).toHaveBeenCalledWith(
      't_1',
      'BUDGET_EXHAUSTED_AT_APPROVAL',
      undefined
    );
    expect(approveTransaction).not.toHaveBeenCalled();
  });
});
