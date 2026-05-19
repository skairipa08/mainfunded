import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('../../../lib/authz', () => ({
  requireCompanyOwner: vi.fn(),
  requireApprovedCompanyOwner: vi.fn(),
}));
vi.mock('../../../lib/corporate/matching-rule-repo', () => ({
  findRuleByCompany: vi.fn(),
}));
vi.mock('../../../lib/corporate/company-repo', () => ({
  updateCompanyProfile: vi.fn(),
}));
vi.mock('../../../lib/rate-limit', () => ({
  withRateLimit: vi.fn(() => null),
  RATE_LIMITS: { api: {} },
}));

import { GET, PATCH } from '../../../app/api/corporate/me/route';
import { requireCompanyOwner, requireApprovedCompanyOwner } from '../../../lib/authz';
import { findRuleByCompany } from '../../../lib/corporate/matching-rule-repo';
import { updateCompanyProfile } from '../../../lib/corporate/company-repo';

const company = { id: 'co_1', status: 'APPROVED', name: 'Acme', taxId: '123' } as any;

describe('GET /api/corporate/me', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 without auth', async () => {
    vi.mocked(requireCompanyOwner).mockRejectedValue(new Error('Unauthorized'));
    const res = await GET(new NextRequest('http://localhost/api/corporate/me'));
    expect(res.status).toBe(401);
  });

  it('returns company + matchingRule', async () => {
    vi.mocked(requireCompanyOwner).mockResolvedValue({ user: { id: 'u' } as any, company });
    vi.mocked(findRuleByCompany).mockResolvedValue({ id: 'r_1', companyId: 'co_1' } as any);
    const res = await GET(new NextRequest('http://localhost/api/corporate/me'));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.company.id).toBe('co_1');
    expect(json.data.matchingRule.id).toBe('r_1');
  });

  it('returns null matchingRule when no rule exists', async () => {
    vi.mocked(requireCompanyOwner).mockResolvedValue({ user: { id: 'u' } as any, company });
    vi.mocked(findRuleByCompany).mockResolvedValue(null);
    const res = await GET(new NextRequest('http://localhost/api/corporate/me'));
    const json = await res.json();
    expect(json.data.matchingRule).toBeNull();
  });
});

describe('PATCH /api/corporate/me', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 403 when company not approved', async () => {
    vi.mocked(requireApprovedCompanyOwner).mockRejectedValue(
      Object.assign(new Error('CompanyNotApproved'), { statusCode: 403 })
    );
    const req = new NextRequest('http://localhost/api/corporate/me', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'New' }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(403);
  });

  it('rejects taxId in body', async () => {
    vi.mocked(requireApprovedCompanyOwner).mockResolvedValue({ user: { id: 'u' } as any, company });
    const req = new NextRequest('http://localhost/api/corporate/me', {
      method: 'PATCH',
      body: JSON.stringify({ taxId: '999' }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
  });

  it('updates allowed fields', async () => {
    vi.mocked(requireApprovedCompanyOwner).mockResolvedValue({ user: { id: 'u' } as any, company });
    vi.mocked(updateCompanyProfile).mockResolvedValue({ ...company, name: 'New Name' } as any);
    const req = new NextRequest('http://localhost/api/corporate/me', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'New Name' }),
    });
    const res = await PATCH(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.name).toBe('New Name');
    expect(updateCompanyProfile).toHaveBeenCalledWith('co_1', { name: 'New Name' });
  });
});
