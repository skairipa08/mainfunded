import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ── Hoisted mock functions (available to vi.mock factories) ──
const {
  mockFindOne,
  mockFind,
  mockInsertOne,
  mockUpdateOne,
  mockCountDocuments,
  mockAggregate,
  mockCollection,
} = vi.hoisted(() => {
  const mockFindOne = vi.fn();
  const mockFind = vi.fn();
  const mockInsertOne = vi.fn();
  const mockUpdateOne = vi.fn();
  const mockCountDocuments = vi.fn();
  const mockAggregate = vi.fn();
  const mockCollection = vi.fn().mockReturnValue({
    findOne: mockFindOne,
    find: mockFind,
    insertOne: mockInsertOne,
    updateOne: mockUpdateOne,
    countDocuments: mockCountDocuments,
    aggregate: mockAggregate,
  });
  return { mockFindOne, mockFind, mockInsertOne, mockUpdateOne, mockCountDocuments, mockAggregate, mockCollection };
});

// ── Mock authz ────────────────────────────────────────────
vi.mock('../lib/authz', () => ({
  requireUser: vi.fn(),
  requireAdmin: vi.fn(),
}));

// ── Mock DB ───────────────────────────────────────────────
vi.mock('../lib/db', () => ({
  getDb: vi.fn().mockResolvedValue({
    collection: mockCollection,
  }),
}));

// ── Mock iyzico ───────────────────────────────────────────
vi.mock('../lib/iyzico', () => ({
  deleteStoredCard: vi.fn().mockResolvedValue({ status: 'success' }),
}));

// ── Mock email ────────────────────────────────────────────
vi.mock('../lib/email', () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
  renderSubscriptionCancelledEmail: vi.fn().mockReturnValue('<html>cancelled</html>'),
}));

// ── Mock audit ────────────────────────────────────────────
vi.mock('../lib/audit', () => ({
  logAudit: vi.fn().mockResolvedValue(undefined),
}));

import { requireUser, requireAdmin } from '../lib/authz';

// ── Import route handlers ─────────────────────────────────
import { GET as getMySubscriptions } from '../app/api/subscriptions/my/route';
import { GET as getSubscriptionDetail } from '../app/api/subscriptions/[subscription_id]/route';
import { POST as cancelSubscription } from '../app/api/subscriptions/[subscription_id]/cancel/route';
import { POST as pauseSubscription } from '../app/api/subscriptions/[subscription_id]/pause/route';
import { POST as resumeSubscription } from '../app/api/subscriptions/[subscription_id]/resume/route';

// ── Helpers ───────────────────────────────────────────────
const mockUser = { id: 'user-123', email: 'donor@test.com', role: 'donor' };

function makeRequest(url: string, method = 'GET', body?: any) {
  const opts: any = { method };
  if (body) {
    opts.body = JSON.stringify(body);
    opts.headers = { 'Content-Type': 'application/json' };
  }
  return new NextRequest(`http://localhost${url}`, opts);
}

// ══════════════════════════════════════════════════════════
//  Tests
// ══════════════════════════════════════════════════════════

describe('Subscription API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireUser).mockResolvedValue(mockUser as any);
  });

  // ── GET /api/subscriptions/my ───────────────────────────
  describe('GET /api/subscriptions/my', () => {
    it('returns 500 when not authenticated (requireUser throws generic Error)', async () => {
      vi.mocked(requireUser).mockRejectedValue(new Error('Unauthorized'));
      const req = makeRequest('/api/subscriptions/my');
      const res = await getMySubscriptions(req);
      // requireUser throws plain Error (no statusCode), so handleRouteError returns 500
      expect(res.status).toBe(500);
    });

    it('returns subscriptions for the authenticated donor', async () => {
      const mockSubs = [
        {
          subscription_id: 'sub_1',
          campaign_id: 'camp_1',
          amount: 100,
          currency: 'TRY',
          status: 'active',
          billing_interval: 'monthly',
          next_billing_date: new Date().toISOString(),
          total_donated: 300,
          payment_count: 3,
        },
      ];

      // First find() = subscriptions query with projection → sort → skip → limit → toArray
      const mockToArray1 = vi.fn().mockResolvedValue(mockSubs);
      const mockLimit = vi.fn().mockReturnValue({ toArray: mockToArray1 });
      const mockSkip = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockSort = vi.fn().mockReturnValue({ skip: mockSkip });

      // Second find() = campaigns enrichment → toArray
      const mockToArray2 = vi.fn().mockResolvedValue([
        { campaign_id: 'camp_1', title: 'Test Campaign', status: 'published' },
      ]);

      mockFind
        .mockReturnValueOnce({ sort: mockSort })
        .mockReturnValueOnce({ toArray: mockToArray2 });

      mockCountDocuments.mockResolvedValue(1);

      const req = makeRequest('/api/subscriptions/my');
      const res = await getMySubscriptions(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.subscriptions).toHaveLength(1);
      expect(data.data.subscriptions[0].campaign_title).toBe('Test Campaign');
    });
  });

  // ── GET /api/subscriptions/[subscription_id] ────────────
  describe('GET /api/subscriptions/[subscription_id]', () => {
    it('returns 404 when subscription not found', async () => {
      mockFindOne.mockResolvedValue(null);

      const req = makeRequest('/api/subscriptions/sub_999');
      const res = await getSubscriptionDetail(req, {
        params: { subscription_id: 'sub_999' },
      });
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data.success).toBe(false);
    });

    it('returns 403 for IDOR attempt', async () => {
      mockFindOne.mockResolvedValue({
        subscription_id: 'sub_1',
        donor_id: 'other-user',
        campaign_id: 'camp_1',
      });

      const req = makeRequest('/api/subscriptions/sub_1');
      const res = await getSubscriptionDetail(req, {
        params: { subscription_id: 'sub_1' },
      });

      expect(res.status).toBe(403);
    });

    it('returns subscription detail with payment history', async () => {
      const mockSub = {
        subscription_id: 'sub_1',
        donor_id: 'user-123',
        campaign_id: 'camp_1',
        amount: 100,
        status: 'active',
      };

      // findOne calls: 1) subscription lookup, 2) campaign lookup
      mockFindOne
        .mockResolvedValueOnce(mockSub)
        .mockResolvedValueOnce({ campaign_id: 'camp_1', title: 'Test Campaign', status: 'published' });

      // find() for payment history: find().sort().limit().toArray()
      const mockPayToArray = vi.fn().mockResolvedValue([
        { payment_id: 'pay_1', amount: 100, status: 'success' },
      ]);
      const mockPayLimit = vi.fn().mockReturnValue({ toArray: mockPayToArray });
      const mockPaySort = vi.fn().mockReturnValue({ limit: mockPayLimit });
      mockFind.mockReturnValue({ sort: mockPaySort });

      const req = makeRequest('/api/subscriptions/sub_1');
      const res = await getSubscriptionDetail(req, {
        params: { subscription_id: 'sub_1' },
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.subscription.subscription_id).toBe('sub_1');
      expect(data.data.payments).toHaveLength(1);
    });
  });

  // ── POST /api/subscriptions/[subscription_id]/cancel ────
  describe('POST /api/subscriptions/[subscription_id]/cancel', () => {
    it('returns 404 when subscription not found', async () => {
      mockFindOne.mockReset();
      mockFindOne.mockResolvedValue(null);

      const req = makeRequest('/api/subscriptions/sub_999/cancel', 'POST', {});
      const res = await cancelSubscription(req, {
        params: { subscription_id: 'sub_999' },
      });

      expect(res.status).toBe(404);
    });

    it('returns 403 for IDOR attempt on cancel', async () => {
      mockFindOne.mockReset();
      mockFindOne.mockResolvedValue({
        subscription_id: 'sub_1',
        donor_id: 'other-user',
        status: 'active',
      });

      const req = makeRequest('/api/subscriptions/sub_1/cancel', 'POST', {});
      const res = await cancelSubscription(req, {
        params: { subscription_id: 'sub_1' },
      });

      expect(res.status).toBe(403);
    });

    it('returns 400 when already cancelled', async () => {
      mockFindOne.mockResolvedValue({
        subscription_id: 'sub_1',
        donor_id: 'user-123',
        status: 'cancelled',
      });

      const req = makeRequest('/api/subscriptions/sub_1/cancel', 'POST', {});
      const res = await cancelSubscription(req, {
        params: { subscription_id: 'sub_1' },
      });

      expect(res.status).toBe(400);
    });

    it('successfully cancels an active subscription', async () => {
      mockFindOne.mockResolvedValue({
        subscription_id: 'sub_1',
        donor_id: 'user-123',
        donor_email: 'donor@test.com',
        status: 'active',
        card_user_key: 'cuk_123',
        card_token: 'ct_123',
        campaign_id: 'camp_1',
        amount: 100,
        currency: 'TRY',
        billing_interval: 'monthly',
        total_donated: 300,
        payment_count: 3,
      });
      mockUpdateOne.mockResolvedValue({ modifiedCount: 1 });

      const req = makeRequest('/api/subscriptions/sub_1/cancel', 'POST', {
        reason: 'No longer needed',
      });
      const res = await cancelSubscription(req, {
        params: { subscription_id: 'sub_1' },
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockUpdateOne).toHaveBeenCalled();
    });
  });

  // ── POST /api/subscriptions/[subscription_id]/pause ─────
  describe('POST /api/subscriptions/[subscription_id]/pause', () => {
    it('only allows pausing active subscriptions', async () => {
      mockFindOne.mockResolvedValue({
        subscription_id: 'sub_1',
        donor_id: 'user-123',
        status: 'paused',
      });

      const req = makeRequest('/api/subscriptions/sub_1/pause', 'POST', {});
      const res = await pauseSubscription(req, {
        params: { subscription_id: 'sub_1' },
      });

      expect(res.status).toBe(400);
    });

    it('successfully pauses an active subscription', async () => {
      mockFindOne.mockResolvedValue({
        subscription_id: 'sub_1',
        donor_id: 'user-123',
        status: 'active',
      });
      mockUpdateOne.mockResolvedValue({ modifiedCount: 1 });

      const req = makeRequest('/api/subscriptions/sub_1/pause', 'POST', {});
      const res = await pauseSubscription(req, {
        params: { subscription_id: 'sub_1' },
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  // ── POST /api/subscriptions/[subscription_id]/resume ────
  describe('POST /api/subscriptions/[subscription_id]/resume', () => {
    it('only allows resuming paused subscriptions', async () => {
      mockFindOne.mockResolvedValue({
        subscription_id: 'sub_1',
        donor_id: 'user-123',
        status: 'active',
      });

      const req = makeRequest('/api/subscriptions/sub_1/resume', 'POST', {});
      const res = await resumeSubscription(req, {
        params: { subscription_id: 'sub_1' },
      });

      expect(res.status).toBe(400);
    });

    it('successfully resumes a paused subscription', async () => {
      mockFindOne.mockResolvedValue({
        subscription_id: 'sub_1',
        donor_id: 'user-123',
        status: 'paused',
      });
      mockUpdateOne.mockResolvedValue({ modifiedCount: 1 });

      const req = makeRequest('/api/subscriptions/sub_1/resume', 'POST', {});
      const res = await resumeSubscription(req, {
        params: { subscription_id: 'sub_1' },
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  // ── IDOR Protection ─────────────────────────────────────
  describe('IDOR Protection', () => {
    it('prevents accessing another user subscription detail', async () => {
      mockFindOne.mockResolvedValue({
        subscription_id: 'sub_attacker',
        donor_id: 'victim-user',
      });

      const req = makeRequest('/api/subscriptions/sub_attacker');
      const res = await getSubscriptionDetail(req, {
        params: { subscription_id: 'sub_attacker' },
      });

      expect(res.status).toBe(403);
    });

    it('prevents cancelling another user subscription', async () => {
      mockFindOne.mockResolvedValue({
        subscription_id: 'sub_attacker',
        donor_id: 'victim-user',
        status: 'active',
      });

      const req = makeRequest('/api/subscriptions/sub_attacker/cancel', 'POST', {});
      const res = await cancelSubscription(req, {
        params: { subscription_id: 'sub_attacker' },
      });

      expect(res.status).toBe(403);
    });
  });
});
