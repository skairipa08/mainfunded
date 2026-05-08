import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('../../../lib/authz', () => ({
  requireApprovedCompanyOwner: vi.fn(),
}));

vi.mock('../../../lib/corporate/matching-rule-repo', () => ({
  findRuleByCompany: vi.fn(),
}));

const aggregate = vi.fn();
const count = vi.fn();
const findMany = vi.fn();
vi.mock('../../../lib/prisma', () => ({
  prisma: {
    matchingTransaction: {
      aggregate: (...a: any[]) => aggregate(...a),
      count: (...a: any[]) => count(...a),
      findMany: (...a: any[]) => findMany(...a),
    },
  },
}));

const getSpentInPeriod = vi.fn();
vi.mock('../../../lib/corporate/budget', () => ({
  getSpentInPeriod: (...a: any[]) => getSpentInPeriod(...a),
}));

vi.mock('../../../lib/rate-limit', () => ({
  withRateLimit: vi.fn(() => null),
  RATE_LIMITS: { api: {} },
}));

import { GET } from '../../../app/api/corporate/esg/report/route';
import { requireApprovedCompanyOwner } from '../../../lib/authz';
import { findRuleByCompany } from '../../../lib/corporate/matching-rule-repo';

const company = { id: 'co_1', status: 'APPROVED', name: 'Acme Corp' } as any;

function makeReq(year?: string) {
  const url = year
    ? `http://localhost/api/corporate/esg/report?year=${year}`
    : 'http://localhost/api/corporate/esg/report';
  return new NextRequest(url);
}

describe('GET /api/corporate/esg/report', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    aggregate.mockResolvedValue({ _sum: { matchedAmountTRY: 12500 } });
    count.mockResolvedValue(5);
    findMany.mockResolvedValue([{ campaignId: 'c1' }, { campaignId: 'c2' }]);
    getSpentInPeriod.mockResolvedValue(1000);
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(requireApprovedCompanyOwner).mockRejectedValue(new Error('Unauthorized'));
    const res = await GET(makeReq('2026'));
    expect(res.status).toBe(401);
  });

  it('returns 403 when company not approved', async () => {
    vi.mocked(requireApprovedCompanyOwner).mockRejectedValue(
      Object.assign(new Error('CompanyNotApproved'), { statusCode: 403 })
    );
    const res = await GET(makeReq('2026'));
    expect(res.status).toBe(403);
  });

  it('returns a PDF with correct Content-Type and filename', async () => {
    vi.mocked(requireApprovedCompanyOwner).mockResolvedValue({ user: {} as any, company });
    vi.mocked(findRuleByCompany).mockResolvedValue({ monthlyBudgetTRY: 50000 } as any);

    const res = await GET(makeReq('2026'));
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('application/pdf');
    const disposition = res.headers.get('Content-Disposition');
    expect(disposition).toContain('attachment');
    expect(disposition).toContain('Acme-Corp');
    expect(disposition).toContain('2026');

    const buf = Buffer.from(await res.arrayBuffer());
    expect(buf.length).toBeGreaterThan(100);
    // PDF files start with %PDF
    expect(buf.subarray(0, 4).toString()).toBe('%PDF');
  });

  it('defaults year to current year when missing', async () => {
    vi.mocked(requireApprovedCompanyOwner).mockResolvedValue({ user: {} as any, company });
    vi.mocked(findRuleByCompany).mockResolvedValue({ monthlyBudgetTRY: 50000 } as any);

    const res = await GET(makeReq());
    expect(res.status).toBe(200);
    const disposition = res.headers.get('Content-Disposition');
    expect(disposition).toContain(`${new Date().getFullYear()}`);
  });

  it('produces a valid PDF even when rule is null (no budget data)', async () => {
    vi.mocked(requireApprovedCompanyOwner).mockResolvedValue({ user: {} as any, company });
    vi.mocked(findRuleByCompany).mockResolvedValue(null);

    const res = await GET(makeReq('2026'));
    expect(res.status).toBe(200);
    const buf = Buffer.from(await res.arrayBuffer());
    expect(buf.subarray(0, 4).toString()).toBe('%PDF');
  });
});
