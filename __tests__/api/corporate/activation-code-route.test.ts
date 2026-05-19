import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('../../../lib/authz', () => ({
  requireApprovedCompanyOwner: vi.fn(),
}));

const update = vi.fn();
vi.mock('../../../lib/prisma', () => ({
  prisma: {
    company: { update: (...a: any[]) => update(...a) },
  },
}));

vi.mock('../../../lib/rate-limit', () => ({
  withRateLimit: vi.fn(() => null),
  RATE_LIMITS: { api: {} },
}));

import { GET, POST } from '../../../app/api/corporate/activation-code/route';
import { requireApprovedCompanyOwner } from '../../../lib/authz';

const company = { id: 'co_1', status: 'APPROVED', activationCode: 'ABCD2345' } as any;

describe('GET /api/corporate/activation-code', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 without auth', async () => {
    vi.mocked(requireApprovedCompanyOwner).mockRejectedValue(new Error('Unauthorized'));
    const res = await GET(new NextRequest('http://localhost/x'));
    expect(res.status).toBe(401);
  });

  it('returns current code', async () => {
    vi.mocked(requireApprovedCompanyOwner).mockResolvedValue({ user: {} as any, company });
    const res = await GET(new NextRequest('http://localhost/x'));
    const json = await res.json();
    expect(json.data.activationCode).toBe('ABCD2345');
  });

  it('returns null when no code yet', async () => {
    vi.mocked(requireApprovedCompanyOwner).mockResolvedValue({
      user: {} as any,
      company: { ...company, activationCode: null },
    });
    const res = await GET(new NextRequest('http://localhost/x'));
    const json = await res.json();
    expect(json.data.activationCode).toBeNull();
  });
});

describe('POST /api/corporate/activation-code (rotate)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireApprovedCompanyOwner).mockResolvedValue({ user: {} as any, company });
  });

  it('returns a new code on success', async () => {
    update.mockResolvedValue({ ...company, activationCode: 'NEWCODE9' });
    const res = await POST(new NextRequest('http://localhost/x', { method: 'POST' }));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(typeof json.data.activationCode).toBe('string');
    expect(update).toHaveBeenCalledTimes(1);
  });

  it('retries up to 5 times on P2002 unique conflict', async () => {
    const conflict: any = new Error('Unique constraint failed');
    conflict.code = 'P2002';
    update.mockRejectedValueOnce(conflict);
    update.mockRejectedValueOnce(conflict);
    update.mockResolvedValue({ ...company, activationCode: 'WORKED99' });
    const res = await POST(new NextRequest('http://localhost/x', { method: 'POST' }));
    expect(res.status).toBe(200);
    expect(update).toHaveBeenCalledTimes(3);
  });

  it('does not retry on non-P2002 errors', async () => {
    update.mockRejectedValue(new Error('connection lost'));
    const res = await POST(new NextRequest('http://localhost/x', { method: 'POST' }));
    expect(res.status).toBe(500);
    expect(update).toHaveBeenCalledTimes(1);
  });
});
