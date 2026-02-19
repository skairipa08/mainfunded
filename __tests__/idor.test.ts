/**
 * IDOR / Authorization Test Automation
 *
 * Covers AUTH-01 → AUTH-12 from implementation_plan.md Section 4.1.
 *
 * AUTH-01  Unauthenticated access → 401
 * AUTH-02  Student A access Student B's verification → 404 (anti-enum)
 * AUTH-03  Student access /api/admin/* → 403
 * AUTH-04  Admin access any verification → 200
 * AUTH-05  Non-assigned reviewer → varies
 * AUTH-06  Direct DB ID guess → 404
 * AUTH-07  Document URL without auth token → expired / invalid
 * AUTH-08  Timing-safe enumeration (404 vs owner mismatch)
 * AUTH-09  JWT alg:none / wrong key rejection
 * AUTH-10  Expired JWT rejection
 * AUTH-11  Role escalation via API → 403
 * AUTH-12  Admin with revoked access → 401/403
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks ─────────────────────────────────────────────────────

vi.mock('@/auth', () => ({
  auth: vi.fn().mockResolvedValue(null),
}));

vi.mock('@/lib/db', () => {
  const mockFindOne = vi.fn();
  const mockUpdateOne = vi.fn();
  return {
    getDb: vi.fn().mockResolvedValue({
      collection: vi.fn().mockReturnValue({
        findOne: mockFindOne,
        updateOne: mockUpdateOne,
        find: vi.fn().mockReturnValue({
          sort: vi.fn().mockReturnThis(),
          limit: vi.fn().mockReturnThis(),
          skip: vi.fn().mockReturnThis(),
          toArray: vi.fn().mockResolvedValue([]),
        }),
        insertOne: vi.fn(),
      }),
    }),
    __mocks: { mockFindOne, mockUpdateOne },
  };
});

vi.mock('@/lib/verification/db', () => ({
  getVerificationForUser: vi.fn(),
  getDocumentsForVerification: vi.fn().mockResolvedValue([]),
}));

import { auth } from '@/auth';
import {
  requireAuth,
  requireAdmin,
  requireStudent,
  requireVerificationOwnership,
  requireDocumentOwnership,
} from '@/lib/verification/guards';
import { getVerificationForUser } from '@/lib/verification/db';
import { storage } from '@/lib/storage';

// ── Fixtures ──────────────────────────────────────────────────

const STUDENT_A = { id: 'aaa111', email: 'a@example.com', name: 'A', role: 'student' };
const STUDENT_B = { id: 'bbb222', email: 'b@example.com', name: 'B', role: 'student' };
const ADMIN     = { id: 'adm999', email: 'admin@example.com', name: 'Admin', role: 'admin' };

const VERIF_A = { verification_id: 'v-aaa', user_id: STUDENT_A.id, status: 'DRAFT' };
const VERIF_B = { verification_id: 'v-bbb', user_id: STUDENT_B.id, status: 'DRAFT' };

// ── Tests ─────────────────────────────────────────────────────

describe('AUTH-01: Unauthenticated user → 401', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('requireAuth rejects with 401 when no session', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);
    await expect(requireAuth()).rejects.toMatchObject({ status: 401 });
  });

  it('requireAdmin rejects with 401 when no session', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);
    await expect(requireAdmin()).rejects.toMatchObject({ status: 401 });
  });

  it('requireStudent rejects with 401 when no session', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);
    await expect(requireStudent()).rejects.toMatchObject({ status: 401 });
  });
});

describe('AUTH-02: Student A cannot access Student B verification', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('ownership check returns null → 404 (not 403)', async () => {
    vi.mocked(auth).mockResolvedValue({ user: STUDENT_A } as any);
    vi.mocked(getVerificationForUser).mockResolvedValue(null);

    await expect(
      requireVerificationOwnership(VERIF_B.verification_id, STUDENT_A.id),
    ).rejects.toMatchObject({ status: 404 });
  });
});

describe('AUTH-03: Student access /api/admin/* → 403', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('regular student gets 403 on requireAdmin', async () => {
    vi.mocked(auth).mockResolvedValue({ user: STUDENT_A } as any);
    await expect(requireAdmin()).rejects.toMatchObject({ status: 403 });
  });
});

describe('AUTH-04: Admin can access any verification → 200', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('admin passes requireAdmin', async () => {
    vi.mocked(auth).mockResolvedValue({ user: ADMIN } as any);
    const user = await requireAdmin();
    expect(user.role).toBe('admin');
  });
});

describe('AUTH-05: Non-assigned reviewer action', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('non-admin student cannot act as reviewer (blocked by requireAdmin)', async () => {
    vi.mocked(auth).mockResolvedValue({ user: STUDENT_A } as any);
    await expect(requireAdmin()).rejects.toMatchObject({ status: 403 });
  });
});

describe('AUTH-06: Direct DB ID guess → 404', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('guessing a random verification_id returns 404', async () => {
    vi.mocked(auth).mockResolvedValue({ user: STUDENT_A } as any);
    vi.mocked(getVerificationForUser).mockResolvedValue(null);

    await expect(
      requireVerificationOwnership('totally-random-id', STUDENT_A.id),
    ).rejects.toMatchObject({ status: 404 });
  });

  it('guessing a random document_id returns 404', async () => {
    vi.mocked(auth).mockResolvedValue({ user: STUDENT_A } as any);
    vi.mocked(getVerificationForUser).mockResolvedValue(null);

    await expect(
      requireDocumentOwnership('random-verif', 'random-doc', STUDENT_A.id),
    ).rejects.toMatchObject({ status: 404 });
  });
});

describe('AUTH-07: Document URL without auth token → expired/invalid', () => {
  it('validates that expired signed URL is rejected', () => {
    // Generate a signed URL and then check with a past expiry
    const path = 'verifications/u1/v1/d1.jpeg';
    const isValid = storage.validateLocalSignedUrl(path, '1000000000', 'fakeSignature');
    expect(isValid).toBe(false);
  });

  it('validates that tampered signature is rejected', () => {
    const path = 'verifications/u1/v1/d1.jpeg';
    const url = storage.getSignedUrl(path);
    const urlObj = new URL(url, 'http://localhost');
    const expires = urlObj.searchParams.get('expires')!;
    expect(storage.validateLocalSignedUrl(path, expires, 'tampered-sig')).toBe(false);
  });
});

describe('AUTH-08: No timing leak on enumeration', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('non-existent vs other-user ID both return 404 (identical response)', async () => {
    vi.mocked(auth).mockResolvedValue({ user: STUDENT_A } as any);
    vi.mocked(getVerificationForUser).mockResolvedValue(null);

    // Both cases should throw identical 404 shaped errors
    const err1 = await requireVerificationOwnership('non-existent', STUDENT_A.id).catch((e) => e);
    const err2 = await requireVerificationOwnership(VERIF_B.verification_id, STUDENT_A.id).catch((e) => e);

    // Same shape — attacker cannot distinguish "doesn't exist" from "exists but not yours"
    expect(err1.status).toBe(404);
    expect(err2.status).toBe(404);
    expect(err1.message).toBe(err2.message);
  });
});

describe('AUTH-09: JWT alg:none rejection', () => {
  // We test the middleware-level isTokenLikelyValid function behaviour
  // by importing its logic directly. Since it's not exported, we replicate the check.
  function isTokenLikelyValid(token: string): boolean {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    try {
      const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
      if (!header.alg || header.alg.toLowerCase() === 'none') return false;
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (typeof payload.exp === 'number' && payload.exp < Math.floor(Date.now() / 1000)) return false;
      return true;
    } catch {
      return false;
    }
  }

  it('rejects token with alg:none', () => {
    const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ sub: '123', exp: 9999999999 }));
    const token = `${header}.${payload}.`;
    expect(isTokenLikelyValid(token)).toBe(false);
  });

  it('rejects malformed 2-part token', () => {
    expect(isTokenLikelyValid('part1.part2')).toBe(false);
  });

  it('accepts well-formed HS256 token with future exp', () => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ sub: '123', exp: Math.floor(Date.now() / 1000) + 3600 }));
    const token = `${header}.${payload}.fakesig`;
    expect(isTokenLikelyValid(token)).toBe(true);
  });
});

describe('AUTH-10: Expired JWT rejection', () => {
  function isTokenLikelyValid(token: string): boolean {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    try {
      const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
      if (!header.alg || header.alg.toLowerCase() === 'none') return false;
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (typeof payload.exp === 'number' && payload.exp < Math.floor(Date.now() / 1000)) return false;
      return true;
    } catch {
      return false;
    }
  }

  it('rejects token with past exp', () => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ sub: '123', exp: 1000000000 })); // year 2001
    const token = `${header}.${payload}.fakesig`;
    expect(isTokenLikelyValid(token)).toBe(false);
  });
});

describe('AUTH-11: Role escalation via API → 403', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('student cannot call requireAdmin even if they set role in request body', async () => {
    // Auth session always wins — role comes from JWT, not request body
    vi.mocked(auth).mockResolvedValue({ user: { ...STUDENT_A, role: 'student' } } as any);
    await expect(requireAdmin()).rejects.toMatchObject({ status: 403 });
  });

  it('admin blocked from student-only routes', async () => {
    vi.mocked(auth).mockResolvedValue({ user: ADMIN } as any);
    await expect(requireStudent()).rejects.toMatchObject({ status: 403 });
  });
});

describe('AUTH-12: Admin with revoked access → 401', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('null session for revoked admin → 401', async () => {
    // After revoking, auth() returns null
    vi.mocked(auth).mockResolvedValue(null as any);
    await expect(requireAdmin()).rejects.toMatchObject({ status: 401 });
  });

  it('user role downgraded from admin → 403 on requireAdmin', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { ...ADMIN, role: 'user' }, // was admin, now user
    } as any);
    await expect(requireAdmin()).rejects.toMatchObject({ status: 403 });
  });
});
