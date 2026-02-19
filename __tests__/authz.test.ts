import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSessionUser, requireUser, requireRole, requireAdmin, requireVerifiedStudent } from '../lib/authz';
import { auth } from '../auth';

// Mock NextAuth
vi.mock('../auth', () => ({
  auth: vi.fn(),
}));

// Mock database
vi.mock('../lib/db', () => ({
  getDb: vi.fn().mockResolvedValue({
    collection: vi.fn().mockReturnValue({
      findOne: vi.fn(),
    }),
  }),
}));

describe('Authz Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSessionUser', () => {
    it('returns null when no session', async () => {
      vi.mocked(auth).mockResolvedValue(null as any);
      const user = await getSessionUser();
      expect(user).toBeNull();
    });

    it('returns user with canonical ID when session exists', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: {
          id: '507f1f77bcf86cd799439011',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
        },
      } as any);

      const user = await getSessionUser();
      expect(user).toEqual({
        id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      });
    });
  });

  describe('requireUser', () => {
    it('throws error when no session', async () => {
      vi.mocked(auth).mockResolvedValue(null as any);
      await expect(requireUser()).rejects.toThrow('Unauthorized');
    });

    it('returns user when session exists', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: {
          id: '507f1f77bcf86cd799439011',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
        },
      } as any);

      const user = await requireUser();
      expect(user).toBeDefined();
      expect(user.id).toBe('507f1f77bcf86cd799439011');
    });
  });

  describe('requireRole', () => {
    it('throws error when role does not match', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: {
          id: '507f1f77bcf86cd799439011',
          email: 'test@example.com',
          name: 'Test User',
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
          id: '507f1f77bcf86cd799439011',
          email: 'test@example.com',
          name: 'Test User',
          role: 'admin',
        },
      } as any);

      const user = await requireRole(['admin']);
      expect(user.role).toBe('admin');
    });
  });

  describe('requireAdmin', () => {
    it('throws error when not admin', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: {
          id: '507f1f77bcf86cd799439011',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
        },
      } as any);

      await expect(requireAdmin()).rejects.toMatchObject({
        statusCode: 403,
        message: 'Insufficient permissions',
      });
    });

    it('returns user when admin', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: {
          id: '507f1f77bcf86cd799439011',
          email: 'test@example.com',
          name: 'Test User',
          role: 'admin',
        },
      } as any);

      const user = await requireAdmin();
      expect(user.role).toBe('admin');
    });
  });

  describe('requireVerifiedStudent', () => {
    it('allows admin to bypass verification', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: {
          id: '507f1f77bcf86cd799439011',
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'admin',
        },
      } as any);

      const result = await requireVerifiedStudent();
      expect(result.role).toBe('admin');
      expect(result.studentProfile).toBeNull();
    });

    it('throws error when student profile not found', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: {
          id: '507f1f77bcf86cd799439011',
          email: 'student@example.com',
          name: 'Student User',
          role: 'user',
        },
      } as any);

      const { getDb } = await import('../lib/db');
      const db = await getDb();
      vi.mocked(db.collection).mockReturnValue({
        findOne: vi.fn().mockResolvedValue(null),
      } as any);

      await expect(requireVerifiedStudent()).rejects.toThrow('STUDENT_PROFILE_NOT_FOUND');
    });

    it('throws error when student not verified', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: {
          id: '507f1f77bcf86cd799439011',
          email: 'student@example.com',
          name: 'Student User',
          role: 'user',
        },
      } as any);

      const { getDb } = await import('../lib/db');
      const db = await getDb();
      vi.mocked(db.collection).mockReturnValue({
        findOne: vi.fn().mockResolvedValue({
          user_id: '507f1f77bcf86cd799439011',
          verificationStatus: 'pending',
        }),
      } as any);

      await expect(requireVerifiedStudent()).rejects.toThrow('STUDENT_NOT_VERIFIED');
    });

    it('returns verified student', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: {
          id: '507f1f77bcf86cd799439011',
          email: 'student@example.com',
          name: 'Student User',
          role: 'user',
        },
      } as any);

      const { getDb } = await import('../lib/db');
      const db = await getDb();
      vi.mocked(db.collection).mockReturnValue({
        findOne: vi.fn().mockResolvedValue({
          user_id: '507f1f77bcf86cd799439011',
          verificationStatus: 'verified',
          country: 'US',
          fieldOfStudy: 'Computer Science',
          university: 'Example University',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      } as any);

      const result = await requireVerifiedStudent();
      expect(result.studentProfile.verificationStatus).toBe('verified');
      expect(result.studentProfile.user_id).toBe('507f1f77bcf86cd799439011');
    });
  });
});
