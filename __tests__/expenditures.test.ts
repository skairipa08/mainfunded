import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as createExpenditure } from '../app/api/expenditures/route';
import { POST as reviewExpenditure } from '../app/api/admin/expenditures/[id]/action/route';
import { requireUser, requireAdminOrOps } from '../lib/authz';
import { storage } from '../lib/storage';
import { notifyDonorsForApprovedExpenditure } from '../lib/expenditure-notifications';

vi.mock('../lib/authz', () => ({
  requireUser: vi.fn(),
  getSessionUser: vi.fn(),
  requireAdminOrOps: vi.fn(),
}));

vi.mock('../lib/rate-limit', () => ({
  withRateLimit: vi.fn().mockReturnValue(null),
  RATE_LIMITS: {
    api: { windowMs: 60_000, maxRequests: 50 },
    adminAction: { windowMs: 60_000, maxRequests: 50 },
  },
}));

vi.mock('../lib/storage', () => ({
  storage: {
    upload: vi.fn(),
    getSignedUrl: vi.fn().mockReturnValue('https://example.com/signed-receipt'),
  },
}));

vi.mock('../lib/verification/upload', () => ({
  validateFile: vi.fn().mockReturnValue({ valid: true }),
  sanitizeFileName: vi.fn((name: string) => name),
  calculateFileHash: vi.fn().mockReturnValue('sha256-hash'),
}));

vi.mock('../lib/expenditure-notifications', () => ({
  notifyDonorsForApprovedExpenditure: vi.fn().mockResolvedValue({ notified: 1 }),
}));

const { mockDb } = vi.hoisted(() => ({
  mockDb: {
    collection: vi.fn(),
  },
}));

vi.mock('../lib/db', () => ({
  getDb: vi.fn().mockResolvedValue(mockDb),
}));

describe('Expenditures API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates pending expenditure with receipt upload', async () => {
    vi.mocked(requireUser).mockResolvedValue({
      id: 'user-owner-1',
      email: 'owner@test.com',
      name: 'Owner User',
      role: 'user',
    } as any);

    vi.mocked(storage.upload).mockResolvedValue({
      success: true,
      url: 'https://example.com/receipt.pdf',
      publicId: 'receipt-public-id',
    });

    const campaignsCollection = {
      findOne: vi.fn().mockResolvedValue({
        campaign_id: 'cmp_1',
        owner_id: 'user-owner-1',
        title: 'Campaign 1',
      }),
    };
    const expendituresCollection = {
      insertOne: vi.fn().mockResolvedValue({ acknowledged: true }),
    };

    vi.mocked(mockDb.collection).mockImplementation((name: string) => {
      if (name === 'campaigns') return campaignsCollection as any;
      if (name === 'expenditures') return expendituresCollection as any;
      return {} as any;
    });

    const formData = new FormData();
    formData.set('campaign_id', 'cmp_1');
    formData.set('category', 'Kitap');
    formData.set('amount', '2500');
    formData.set('description', 'Ders kitapları için harcama');
    formData.set('receipt', new File([new Uint8Array([1, 2, 3, 4])], 'receipt.pdf', { type: 'application/pdf' }));

    const request = new NextRequest('http://localhost/api/expenditures', {
      method: 'POST',
      body: formData,
    });

    const response = await createExpenditure(request);
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.success).toBe(true);
    expect(payload.data.status).toBe('pending');
    expect(expendituresCollection.insertOne).toHaveBeenCalledTimes(1);
  });

  it('approves pending expenditure and triggers donor notifications', async () => {
    vi.mocked(requireAdminOrOps).mockResolvedValue({
      id: 'admin_1',
      email: 'admin@test.com',
      name: 'Admin User',
      role: 'admin',
    } as any);

    const expendituresCollection = {
      findOne: vi
        .fn()
        .mockResolvedValueOnce({
          expenditure_id: 'exp_1',
          campaign_id: 'cmp_1',
          category: 'Kitap',
          amount: 1200,
          description: 'Kitap alımı',
          status: 'pending',
          currency: 'TRY',
        })
        .mockResolvedValueOnce({
          expenditure_id: 'exp_1',
          campaign_id: 'cmp_1',
          category: 'Kitap',
          amount: 1200,
          description: 'Kitap alımı',
          status: 'approved',
          currency: 'TRY',
          published_at: new Date().toISOString(),
        }),
      updateOne: vi.fn().mockResolvedValue({ modifiedCount: 1 }),
    };

    const campaignsCollection = {
      findOne: vi.fn().mockResolvedValue({
        campaign_id: 'cmp_1',
        title: 'Campaign 1',
      }),
    };

    vi.mocked(mockDb.collection).mockImplementation((name: string) => {
      if (name === 'expenditures') return expendituresCollection as any;
      if (name === 'campaigns') return campaignsCollection as any;
      return {} as any;
    });

    const request = new NextRequest('http://localhost/api/admin/expenditures/exp_1/action', {
      method: 'POST',
      body: JSON.stringify({ action: 'approve', note: 'Belgeler uygun' }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await reviewExpenditure(request, { params: { id: 'exp_1' } });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.data.status).toBe('approved');
    expect(notifyDonorsForApprovedExpenditure).toHaveBeenCalledTimes(1);
  });
});
