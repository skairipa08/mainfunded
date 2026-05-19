import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../auth', () => ({ auth: vi.fn() }));
vi.mock('../../../lib/prisma', () => ({
  prisma: {
    company: { findUnique: vi.fn() },
  },
}));

import {
  requireCompanyOwner,
  requireApprovedCompanyOwner,
} from '../../../lib/authz';
import { auth } from '../../../auth';
import { prisma } from '../../../lib/prisma';

const sessionUser = {
  id: '507f1f77bcf86cd799439011',
  email: 'owner@acme.com',
  name: 'Owner',
  role: 'company_owner',
};

describe('requireCompanyOwner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws Unauthorized when no session', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);
    await expect(requireCompanyOwner()).rejects.toThrow('Unauthorized');
  });

  it('throws Forbidden when role is not company_owner', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { ...sessionUser, role: 'user' } } as any);
    await expect(requireCompanyOwner()).rejects.toThrow('Forbidden');
  });

  it('throws Forbidden when no Company record exists', async () => {
    vi.mocked(auth).mockResolvedValue({ user: sessionUser } as any);
    vi.mocked(prisma.company.findUnique).mockResolvedValue(null);
    await expect(requireCompanyOwner()).rejects.toThrow('Forbidden');
  });

  it('returns user + company on success', async () => {
    vi.mocked(auth).mockResolvedValue({ user: sessionUser } as any);
    vi.mocked(prisma.company.findUnique).mockResolvedValue({
      id: 'co_1',
      status: 'PENDING',
      ownerUserId: sessionUser.id,
    } as any);
    const ctx = await requireCompanyOwner();
    expect(ctx.user.id).toBe(sessionUser.id);
    expect(ctx.company.id).toBe('co_1');
  });
});

describe('requireApprovedCompanyOwner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws CompanyNotApproved when status is PENDING', async () => {
    vi.mocked(auth).mockResolvedValue({ user: sessionUser } as any);
    vi.mocked(prisma.company.findUnique).mockResolvedValue({
      id: 'co_1',
      status: 'PENDING',
      ownerUserId: sessionUser.id,
    } as any);
    await expect(requireApprovedCompanyOwner()).rejects.toThrow('CompanyNotApproved');
  });

  it('returns context when status is APPROVED', async () => {
    vi.mocked(auth).mockResolvedValue({ user: sessionUser } as any);
    vi.mocked(prisma.company.findUnique).mockResolvedValue({
      id: 'co_1',
      status: 'APPROVED',
      ownerUserId: sessionUser.id,
    } as any);
    const ctx = await requireApprovedCompanyOwner();
    expect(ctx.company.status).toBe('APPROVED');
  });
});
