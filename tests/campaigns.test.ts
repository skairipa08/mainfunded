import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '../app/api/campaigns/route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/db', () => ({
  getDb: vi.fn(() => Promise.resolve({
    collection: vi.fn(() => ({
      find: vi.fn(() => ({
        skip: vi.fn(() => ({
          limit: vi.fn(() => ({
            toArray: vi.fn(() => Promise.resolve([])),
          })),
        })),
      })),
      findOne: vi.fn(() => Promise.resolve(null)),
      insertOne: vi.fn(() => Promise.resolve({})),
      countDocuments: vi.fn(() => Promise.resolve(0)),
    })),
  })),
}));

vi.mock('@/lib/authz', () => ({
  requireVerifiedStudent: vi.fn(() => Promise.resolve({
    id: 'user123',
    role: 'student',
  })),
}));

vi.mock('@/lib/validators/campaign', () => ({
  createCampaignSchema: {
    safeParse: vi.fn((data) => ({
      success: true,
      data: {
        body: {
          title: 'Test Campaign',
          story: 'Test story',
          category: 'tuition',
          goal_amount: 1000,
        },
      },
    })),
  },
}));

describe('Campaign Routes', () => {
  describe('POST /api/campaigns', () => {
    it('requires verified student', async () => {
      const { requireVerifiedStudent } = await import('@/lib/authz');
      
      const request = new NextRequest('http://localhost/api/campaigns', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Campaign',
          story: 'Test story',
          category: 'tuition',
          goal_amount: 1000,
        }),
      });
      
      await POST(request);
      
      expect(requireVerifiedStudent).toHaveBeenCalled();
    });
  });
});
