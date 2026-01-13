import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSessionUser, requireUser, requireRole, requireVerifiedStudent } from '../lib/authz';

// Mock NextAuth
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  getDb: vi.fn(() => Promise.resolve({
    collection: vi.fn(() => ({
      findOne: vi.fn(),
    })),
  })),
}));

import { auth } from '@/auth';

describe('Authz Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSessionUser', () => {
    it('returns null when no session', async () => {
      vi.mocked(auth).mockResolvedValue(null);
      const user = await getSessionUser();
      expect(user).toBeNull();
    });

    it('returns null when session has no user', async () => {
      vi.mocked(auth).mockResolvedValue({} as any);
      const user = await getSessionUser();
      expect(user).toBeNull();
    });

    it('returns user when session exists', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: {
          id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
        },
      } as any);
      const user = await getSessionUser();
      expect(user).toEqual({
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      });
    });
  });

  describe('requireUser', () => {
    it('throws 401 when no session', async () => {
      vi.mocked(auth).mockResolvedValue(null);
      await expect(requireUser()).rejects.toThrow('Unauthorized');
    });

    it('returns user when session exists', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: {
          id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
        },
      } as any);
      const user = await requireUser();
      expect(user.id).toBe('user123');
    });
  });

  describe('requireRole', () => {
    it('throws 403 when role does not match', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: {
          id: 'user123',
          role: 'user',
        },
      } as any);
      await expect(requireRole(['admin'])).rejects.toMatchObject({
        statusCode: 403,
        message: 'Insufficient permissions',
      });
    });

    it('returns user when role matches', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: {
          id: 'user123',
          role: 'admin',
        },
      } as any);
      const user = await requireRole(['admin']);
      expect(user.role).toBe('admin');
    });
  });
});
