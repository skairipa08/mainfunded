import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const findUnique = vi.fn();
vi.mock('../../../lib/prisma', () => ({
  prisma: { company: { findUnique: (...a: any[]) => findUnique(...a) } },
}));

vi.mock('../../../lib/authz', () => ({ requireUser: vi.fn() }));

const findAffiliationByUser = vi.fn();
const activateAffiliation = vi.fn();
vi.mock('../../../lib/corporate/affiliation-repo', () => ({
  findAffiliationByUser: (...a: any[]) => findAffiliationByUser(...a),
  activateAffiliation: (...a: any[]) => activateAffiliation(...a),
}));

vi.mock('../../../lib/rate-limit', () => ({
  withRateLimit: vi.fn(() => null),
  RATE_LIMITS: { api: {} },
}));

import { POST } from '../../../app/api/corporate/employee/activate/route';
import { requireUser } from '../../../lib/authz';

const user = { id: 'u_1', email: 'donor@x.com', name: 'D', role: 'user' as const };

function makeReq(body: any) {
  return new NextRequest('http://localhost/api/corporate/employee/activate', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

describe('POST /api/corporate/employee/activate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireUser).mockResolvedValue(user as any);
  });

  it('rejects malformed code', async () => {
    const res = await POST(makeReq({ code: 'abc1' }));
    expect(res.status).toBe(400);
  });

  it('returns INVALID_CODE when no company has that code', async () => {
    findUnique.mockResolvedValue(null);
    const res = await POST(makeReq({ code: 'ABCDEFGH' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('INVALID_CODE');
  });

  it('returns COMPANY_NOT_APPROVED for pending company', async () => {
    findUnique.mockResolvedValue({ id: 'co_1', status: 'PENDING', name: 'X' });
    const res = await POST(makeReq({ code: 'ABCDEFGH' }));
    const json = await res.json();
    expect(json.error).toBe('COMPANY_NOT_APPROVED');
  });

  it('returns ALREADY_AFFILIATED to a different company', async () => {
    findUnique.mockResolvedValue({ id: 'co_1', status: 'APPROVED', name: 'X' });
    findAffiliationByUser.mockResolvedValue({ companyId: 'co_other', active: true });
    const res = await POST(makeReq({ code: 'ABCDEFGH' }));
    expect(res.status).toBe(409);
  });

  it('activates on valid code', async () => {
    findUnique.mockResolvedValue({ id: 'co_1', status: 'APPROVED', name: 'Acme' });
    findAffiliationByUser.mockResolvedValue(null);
    activateAffiliation.mockResolvedValue({ id: 'aff_1' });
    const res = await POST(makeReq({ code: 'ABCDEFGH' }));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.companyName).toBe('Acme');
    expect(activateAffiliation).toHaveBeenCalledWith('u_1', 'co_1');
  });
});
