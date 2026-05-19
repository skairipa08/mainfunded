import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('../../../lib/authz', () => ({
  requireApprovedCompanyOwner: vi.fn(),
}));
vi.mock('../../../lib/corporate/transaction-repo', () => ({
  findTransactionsByCompany: vi.fn(),
}));
vi.mock('../../../lib/rate-limit', () => ({
  withRateLimit: vi.fn(() => null),
  RATE_LIMITS: { api: {} },
}));

import { GET } from '../../../app/api/corporate/transactions/route';
import { requireApprovedCompanyOwner } from '../../../lib/authz';
import { findTransactionsByCompany } from '../../../lib/corporate/transaction-repo';

const company = { id: 'co_1', status: 'APPROVED' } as any;

describe('GET /api/corporate/transactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns list filtered by status', async () => {
    vi.mocked(requireApprovedCompanyOwner).mockResolvedValue({ user: {} as any, company });
    vi.mocked(findTransactionsByCompany).mockResolvedValue([
      { id: 't_1', status: 'PENDING' } as any,
    ]);
    const res = await GET(
      new NextRequest('http://localhost/api/corporate/transactions?status=PENDING')
    );
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data).toHaveLength(1);
    expect(findTransactionsByCompany).toHaveBeenCalledWith('co_1', 'PENDING');
  });

  it('rejects invalid status', async () => {
    vi.mocked(requireApprovedCompanyOwner).mockResolvedValue({ user: {} as any, company });
    const res = await GET(
      new NextRequest('http://localhost/api/corporate/transactions?status=BOGUS')
    );
    expect(res.status).toBe(400);
  });
});
