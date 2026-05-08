import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('../../../lib/authz', () => ({ requireAdmin: vi.fn() }));
vi.mock('../../../lib/corporate/company-repo', () => ({
  findCompaniesByStatus: vi.fn(),
}));
vi.mock('../../../lib/rate-limit', () => ({
  withRateLimit: vi.fn(() => null),
  RATE_LIMITS: { api: {} },
}));

import { GET } from '../../../app/api/admin/corporate/companies/route';
import { requireAdmin } from '../../../lib/authz';
import { findCompaniesByStatus } from '../../../lib/corporate/company-repo';

describe('GET /api/admin/corporate/companies', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 403 for non-admin', async () => {
    vi.mocked(requireAdmin).mockRejectedValue(
      Object.assign(new Error('Forbidden'), { statusCode: 403 })
    );
    const res = await GET(new NextRequest('http://localhost/api/admin/corporate/companies?status=PENDING'));
    expect(res.status).toBe(403);
  });

  it('returns PENDING list for admin', async () => {
    vi.mocked(requireAdmin).mockResolvedValue({ id: 'admin_1' } as any);
    vi.mocked(findCompaniesByStatus).mockResolvedValue([
      { id: 'co_1', status: 'PENDING' } as any,
      { id: 'co_2', status: 'PENDING' } as any,
    ]);
    const res = await GET(
      new NextRequest('http://localhost/api/admin/corporate/companies?status=PENDING')
    );
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data).toHaveLength(2);
    expect(findCompaniesByStatus).toHaveBeenCalledWith('PENDING');
  });

  it('defaults to PENDING when status missing', async () => {
    vi.mocked(requireAdmin).mockResolvedValue({ id: 'admin_1' } as any);
    vi.mocked(findCompaniesByStatus).mockResolvedValue([]);
    await GET(new NextRequest('http://localhost/api/admin/corporate/companies'));
    expect(findCompaniesByStatus).toHaveBeenCalledWith('PENDING');
  });

  it('rejects invalid status param', async () => {
    vi.mocked(requireAdmin).mockResolvedValue({ id: 'admin_1' } as any);
    const res = await GET(
      new NextRequest('http://localhost/api/admin/corporate/companies?status=BOGUS')
    );
    expect(res.status).toBe(400);
  });
});
