import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('../../../lib/authz', () => ({ requireAdmin: vi.fn() }));
vi.mock('../../../lib/corporate/company-repo', () => ({
  findCompanyById: vi.fn(),
  approveCompany: vi.fn(),
  rejectCompany: vi.fn(),
}));
vi.mock('../../../lib/rate-limit', () => ({
  withRateLimit: vi.fn(() => null),
  RATE_LIMITS: { api: {} },
}));

import { POST } from '../../../app/api/admin/corporate/companies/[id]/approve/route';
import { requireAdmin } from '../../../lib/authz';
import {
  findCompanyById,
  approveCompany,
  rejectCompany,
} from '../../../lib/corporate/company-repo';

function makeReq(body: any) {
  return new NextRequest('http://localhost/api/admin/corporate/companies/co_1/approve', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

describe('POST /api/admin/corporate/companies/[id]/approve', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 403 for non-admin', async () => {
    vi.mocked(requireAdmin).mockRejectedValue(
      Object.assign(new Error('Forbidden'), { statusCode: 403 })
    );
    const res = await POST(makeReq({ decision: 'APPROVE' }), { params: { id: 'co_1' } });
    expect(res.status).toBe(403);
  });

  it('returns 404 when company not found', async () => {
    vi.mocked(requireAdmin).mockResolvedValue({ id: 'admin_1' } as any);
    vi.mocked(findCompanyById).mockResolvedValue(null);
    const res = await POST(makeReq({ decision: 'APPROVE' }), { params: { id: 'co_1' } });
    expect(res.status).toBe(404);
  });

  it('approves on APPROVE', async () => {
    vi.mocked(requireAdmin).mockResolvedValue({ id: 'admin_1' } as any);
    vi.mocked(findCompanyById).mockResolvedValue({ id: 'co_1', status: 'PENDING' } as any);
    vi.mocked(approveCompany).mockResolvedValue({ id: 'co_1', status: 'APPROVED' } as any);
    const res = await POST(makeReq({ decision: 'APPROVE' }), { params: { id: 'co_1' } });
    const json = await res.json();
    expect(json.data.status).toBe('APPROVED');
    expect(approveCompany).toHaveBeenCalledWith('co_1', 'admin_1');
  });

  it('rejects when REJECT lacks reason', async () => {
    vi.mocked(requireAdmin).mockResolvedValue({ id: 'admin_1' } as any);
    vi.mocked(findCompanyById).mockResolvedValue({ id: 'co_1', status: 'PENDING' } as any);
    const res = await POST(makeReq({ decision: 'REJECT' }), { params: { id: 'co_1' } });
    expect(res.status).toBe(400);
  });

  it('rejects on REJECT with reason', async () => {
    vi.mocked(requireAdmin).mockResolvedValue({ id: 'admin_1' } as any);
    vi.mocked(findCompanyById).mockResolvedValue({ id: 'co_1', status: 'PENDING' } as any);
    vi.mocked(rejectCompany).mockResolvedValue({
      id: 'co_1',
      status: 'REJECTED',
      rejectedReason: 'Tax ID invalid',
    } as any);
    const res = await POST(
      makeReq({ decision: 'REJECT', reason: 'Tax ID invalid' }),
      { params: { id: 'co_1' } }
    );
    const json = await res.json();
    expect(json.data.status).toBe('REJECTED');
    expect(rejectCompany).toHaveBeenCalledWith('co_1', 'Tax ID invalid');
  });
});
