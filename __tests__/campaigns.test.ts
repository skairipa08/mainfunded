import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as createCampaign } from '../app/api/campaigns/route';
import { requireVerifiedStudent } from '../lib/authz';

// Mock authz
vi.mock('../lib/authz', () => ({
  requireVerifiedStudent: vi.fn(),
  requireUser: vi.fn(),
  requireAdmin: vi.fn(),
}));

// Mock database
vi.mock('../lib/db', () => ({
  getDb: vi.fn().mockResolvedValue({
    collection: vi.fn().mockReturnValue({
      findOne: vi.fn(),
      insertOne: vi.fn(),
    }),
  }),
}));

describe('Campaign API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/campaigns', () => {
    it('requires verified student', async () => {
      vi.mocked(requireVerifiedStudent).mockRejectedValue(new Error('Unauthorized'));
      
      const request = new NextRequest('http://localhost/api/campaigns', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Campaign',
          story: 'Test story',
          category: 'tuition',
          goal_amount: 1000,
        }),
      });

      const response = await createCampaign(request);
      expect(response.status).toBe(401);
    });

    it('returns 403 if student not verified', async () => {
      vi.mocked(requireVerifiedStudent).mockRejectedValue(
        new Error('STUDENT_NOT_VERIFIED: pending')
      );

      const request = new NextRequest('http://localhost/api/campaigns', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Campaign',
          story: 'Test story',
          category: 'tuition',
          goal_amount: 1000,
        }),
      });

      const response = await createCampaign(request);
      expect(response.status).toBe(403);
      
      const data = await response.json();
      expect(data.error.code).toBe('STUDENT_NOT_VERIFIED');
    });

    it('returns 400 if student profile not found', async () => {
      vi.mocked(requireVerifiedStudent).mockRejectedValue(
        new Error('STUDENT_PROFILE_NOT_FOUND')
      );

      const request = new NextRequest('http://localhost/api/campaigns', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Campaign',
          story: 'Test story',
          category: 'tuition',
          goal_amount: 1000,
        }),
      });

      const response = await createCampaign(request);
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error.code).toBe('STUDENT_PROFILE_NOT_FOUND');
    });

    it('creates campaign for verified student', async () => {
      vi.mocked(requireVerifiedStudent).mockResolvedValue({
        id: '507f1f77bcf86cd799439011',
        email: 'student@example.com',
        name: 'Student User',
        role: 'user',
        studentProfile: {
          user_id: '507f1f77bcf86cd799439011',
          verificationStatus: 'verified',
          country: 'US',
          fieldOfStudy: 'Computer Science',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      } as any);

      const { getDb } = await import('../lib/db');
      const db = await getDb();
      vi.mocked(db.collection).mockReturnValue({
        findOne: vi.fn().mockResolvedValue({
          country: 'US',
          fieldOfStudy: 'Computer Science',
        }),
        insertOne: vi.fn().mockResolvedValue({}),
      } as any);

      const request = new NextRequest('http://localhost/api/campaigns', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Campaign',
          story: 'Test story',
          category: 'tuition',
          goal_amount: 1000,
        }),
      });

      const response = await createCampaign(request);
      expect(response.status).toBe(201);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.title).toBe('Test Campaign');
      expect(data.data.owner_id).toBe('507f1f77bcf86cd799439011'); // Canonical user.id
    });

    it('validates input with Zod', async () => {
      vi.mocked(requireVerifiedStudent).mockResolvedValue({
        id: '507f1f77bcf86cd799439011',
        email: 'student@example.com',
        name: 'Student User',
        role: 'user',
        studentProfile: {
          user_id: '507f1f77bcf86cd799439011',
          verificationStatus: 'verified',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      } as any);

      const request = new NextRequest('http://localhost/api/campaigns', {
        method: 'POST',
        body: JSON.stringify({
          title: '', // Invalid: empty title
          story: 'Test story',
          category: 'tuition',
          goal_amount: 1000,
        }),
      });

      const response = await createCampaign(request);
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
