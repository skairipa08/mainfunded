import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('../../../lib/authz', () => ({
  requireApprovedCompanyOwner: vi.fn(),
}));
vi.mock('../../../lib/corporate/matching-rule-repo', () => ({
  findRuleByCompany: vi.fn(),
}));
vi.mock('../../../lib/corporate/budget', () => ({
  getSpentInPeriod: vi.fn().mockResolvedValue(0),
}));
vi.mock('../../../lib/rate-limit', () => ({
  withRateLimit: vi.fn(() => null),
  RATE_LIMITS: { api: {} },
}));

import { POST } from '../../../app/api/corporate/matching/simulate/route';
import { requireApprovedCompanyOwner } from '../../../lib/authz';
import { findRuleByCompany } from '../../../lib/corporate/matching-rule-repo';

const company = { id: 'co_1', status: 'APPROVED' } as any;
const baseRule = {
  id: 'r_1',
  companyId: 'co_1',
  ratio: 2,
  monthlyBudgetTRY: 10_000,
  eligibleCategories: ['tuition'],
  active: true,
} as any;

function makeReq(body: any) {
  return new NextRequest('http://localhost/api/corporate/matching/simulate', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

describe('POST /api/corporate/matching/simulate', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns NO_RULE_DEFINED when company has no rule', async () => {
    vi.mocked(requireApprovedCompanyOwner).mockResolvedValue({ user: {} as any, company });
    vi.mocked(findRuleByCompany).mockResolvedValue(null);
    const res = await POST(makeReq({ donationAmountTRY: 100, category: 'tuition' }));
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe('NO_RULE_DEFINED');
  });

  it('returns matched result for valid donation', async () => {
    vi.mocked(requireApprovedCompanyOwner).mockResolvedValue({ user: {} as any, company });
    vi.mocked(findRuleByCompany).mockResolvedValue(baseRule);
    const res = await POST(makeReq({ donationAmountTRY: 100, category: 'tuition' }));
    const json = await res.json();
    expect(json.data.matched).toBe(true);
    expect(json.data.matchedAmountTRY).toBe(200);
  });

  it('returns RULE_INACTIVE when rule.active is false', async () => {
    vi.mocked(requireApprovedCompanyOwner).mockResolvedValue({ user: {} as any, company });
    vi.mocked(findRuleByCompany).mockResolvedValue({ ...baseRule, active: false });
    const res = await POST(makeReq({ donationAmountTRY: 100, category: 'tuition' }));
    const json = await res.json();
    expect(json.data.matched).toBe(false);
    expect(json.data.reason).toBe('RULE_INACTIVE');
  });

  it('returns CATEGORY_INELIGIBLE for unlisted category', async () => {
    vi.mocked(requireApprovedCompanyOwner).mockResolvedValue({ user: {} as any, company });
    vi.mocked(findRuleByCompany).mockResolvedValue(baseRule);
    const res = await POST(makeReq({ donationAmountTRY: 100, category: 'travel' }));
    const json = await res.json();
    expect(json.data.matched).toBe(false);
    expect(json.data.reason).toBe('CATEGORY_INELIGIBLE');
  });

  it('returns 400 on invalid body', async () => {
    vi.mocked(requireApprovedCompanyOwner).mockResolvedValue({ user: {} as any, company });
    const res = await POST(makeReq({ donationAmountTRY: -5, category: 'tuition' }));
    expect(res.status).toBe(400);
  });
});
