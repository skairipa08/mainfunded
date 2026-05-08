import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('../../../lib/authz', () => ({
  requireApprovedCompanyOwner: vi.fn(),
}));
vi.mock('../../../lib/corporate/matching-rule-repo', () => ({
  findRuleByCompany: vi.fn(),
  upsertRule: vi.fn(),
}));
vi.mock('../../../lib/rate-limit', () => ({
  withRateLimit: vi.fn(() => null),
  RATE_LIMITS: { api: {} },
}));

import { GET, PUT } from '../../../app/api/corporate/matching-rule/route';
import { requireApprovedCompanyOwner } from '../../../lib/authz';
import { findRuleByCompany, upsertRule } from '../../../lib/corporate/matching-rule-repo';

const company = { id: 'co_1', status: 'APPROVED' } as any;

describe('GET /api/corporate/matching-rule', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns null when no rule exists', async () => {
    vi.mocked(requireApprovedCompanyOwner).mockResolvedValue({ user: {} as any, company });
    vi.mocked(findRuleByCompany).mockResolvedValue(null);
    const res = await GET(new NextRequest('http://localhost/api/corporate/matching-rule'));
    const json = await res.json();
    expect(json.data).toBeNull();
  });

  it('returns rule when present', async () => {
    vi.mocked(requireApprovedCompanyOwner).mockResolvedValue({ user: {} as any, company });
    vi.mocked(findRuleByCompany).mockResolvedValue({ id: 'r_1', ratio: 2 } as any);
    const res = await GET(new NextRequest('http://localhost/api/corporate/matching-rule'));
    const json = await res.json();
    expect(json.data.id).toBe('r_1');
  });
});

describe('PUT /api/corporate/matching-rule', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejects invalid ratio', async () => {
    vi.mocked(requireApprovedCompanyOwner).mockResolvedValue({ user: {} as any, company });
    const req = new NextRequest('http://localhost/api/corporate/matching-rule', {
      method: 'PUT',
      body: JSON.stringify({
        ratio: 5,
        monthlyBudgetTRY: 1000,
        eligibleCategories: ['tuition'],
        active: true,
      }),
    });
    const res = await PUT(req);
    expect(res.status).toBe(400);
  });

  it('upserts rule on valid input', async () => {
    vi.mocked(requireApprovedCompanyOwner).mockResolvedValue({ user: {} as any, company });
    vi.mocked(upsertRule).mockResolvedValue({ id: 'r_1', ratio: 2 } as any);
    const req = new NextRequest('http://localhost/api/corporate/matching-rule', {
      method: 'PUT',
      body: JSON.stringify({
        ratio: 2,
        monthlyBudgetTRY: 50_000,
        eligibleCategories: ['tuition', 'books'],
        active: true,
      }),
    });
    const res = await PUT(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.id).toBe('r_1');
    expect(upsertRule).toHaveBeenCalledWith('co_1', expect.objectContaining({ ratio: 2 }));
  });

  it('returns 403 when company not approved', async () => {
    vi.mocked(requireApprovedCompanyOwner).mockRejectedValue(
      Object.assign(new Error('CompanyNotApproved'), { statusCode: 403 })
    );
    const req = new NextRequest('http://localhost/api/corporate/matching-rule', {
      method: 'PUT',
      body: JSON.stringify({
        ratio: 2,
        monthlyBudgetTRY: 50_000,
        eligibleCategories: ['tuition'],
        active: true,
      }),
    });
    const res = await PUT(req);
    expect(res.status).toBe(403);
  });
});
