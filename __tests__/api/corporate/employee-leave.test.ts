import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('../../../lib/authz', () => ({
  requireUser: vi.fn(),
}));

const deactivateAffiliation = vi.fn();
vi.mock('../../../lib/corporate/affiliation-repo', () => ({
  deactivateAffiliation: (...a: any[]) => deactivateAffiliation(...a),
}));

vi.mock('../../../lib/rate-limit', () => ({
  withRateLimit: vi.fn(() => null),
  RATE_LIMITS: { api: {} },
}));

import { POST } from '../../../app/api/corporate/employee/leave/route';
import { requireUser } from '../../../lib/authz';

const user = { id: 'u_1', email: 'd@x', name: 'D', role: 'user' as const };

describe('POST /api/corporate/employee/leave', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireUser).mockResolvedValue(user as any);
  });

  it('returns 401 without auth', async () => {
    vi.mocked(requireUser).mockRejectedValue(new Error('Unauthorized'));
    const res = await POST(new NextRequest('http://localhost/x', { method: 'POST' }));
    expect(res.status).toBe(401);
  });

  it('returns 404 when user has no affiliation', async () => {
    deactivateAffiliation.mockResolvedValue(null);
    const res = await POST(new NextRequest('http://localhost/x', { method: 'POST' }));
    expect(res.status).toBe(404);
  });

  it('deactivates and returns active:false', async () => {
    deactivateAffiliation.mockResolvedValue({ id: 'a_1', userId: 'u_1', active: false });
    const res = await POST(new NextRequest('http://localhost/x', { method: 'POST' }));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.active).toBe(false);
    expect(deactivateAffiliation).toHaveBeenCalledWith('u_1');
  });
});
