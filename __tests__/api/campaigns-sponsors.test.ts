import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const findMany = vi.fn();
vi.mock('../../lib/prisma', () => ({
  prisma: {
    matchingTransaction: { findMany: (...a: any[]) => findMany(...a) },
  },
}));

vi.mock('../../lib/rate-limit', () => ({
  withRateLimit: vi.fn(() => null),
  RATE_LIMITS: { api: {} },
}));

import { POST } from '../../app/api/campaigns/sponsors/route';

function makeReq(body: any) {
  return new NextRequest('http://localhost/api/campaigns/sponsors', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

describe('POST /api/campaigns/sponsors', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 on invalid body', async () => {
    const res = await POST(makeReq({}));
    expect(res.status).toBe(400);
  });

  it('returns map keyed by campaignId, deduped sponsors', async () => {
    findMany.mockResolvedValue([
      { campaignId: 'c1', company: { id: 'co_1', name: 'Acme', logoUrl: null } },
      { campaignId: 'c1', company: { id: 'co_1', name: 'Acme', logoUrl: null } }, // duplicate
      { campaignId: 'c1', company: { id: 'co_2', name: 'Bcorp', logoUrl: null } },
      { campaignId: 'c2', company: { id: 'co_1', name: 'Acme', logoUrl: null } },
    ]);
    const res = await POST(makeReq({ campaignIds: ['c1', 'c2', 'c3'] }));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.c1).toHaveLength(2);
    expect(json.data.c2).toHaveLength(1);
    expect(json.data.c3).toEqual([]);
  });
});
