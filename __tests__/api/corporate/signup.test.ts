import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const insertOne = vi.fn();
const findOne = vi.fn();
const deleteOne = vi.fn();

vi.mock('../../../lib/db', () => ({
  getDb: vi.fn().mockResolvedValue({
    collection: vi.fn(() => ({ insertOne, findOne, deleteOne })),
  }),
}));

const createCompany = vi.fn();
const isTaxIdTaken = vi.fn();
vi.mock('../../../lib/corporate/company-repo', () => ({
  createCompany: (...args: any[]) => createCompany(...args),
  isTaxIdTaken: (...args: any[]) => isTaxIdTaken(...args),
}));

vi.mock('../../../lib/rate-limit', () => ({
  withRateLimit: vi.fn(() => null),
  RATE_LIMITS: { api: {} },
}));

import { POST as signup } from '../../../app/api/corporate/signup/route';

function makeRequest(body: any) {
  return new NextRequest('http://localhost/api/corporate/signup', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

const validBody = {
  name: 'Acme Corp',
  taxId: '1234567890',
  contactEmail: 'owner@acme.com',
  password: 'StrongPass1!',
};

describe('POST /api/corporate/signup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    insertOne.mockReset();
    findOne.mockReset();
    deleteOne.mockReset();
    createCompany.mockReset();
    isTaxIdTaken.mockReset();
  });

  it('creates User and Company on valid input', async () => {
    findOne.mockResolvedValue(null);
    isTaxIdTaken.mockResolvedValue(false);
    insertOne.mockResolvedValue({ insertedId: { toString: () => '507f1f77bcf86cd799439001' } });
    createCompany.mockResolvedValue({ id: 'co_1', status: 'PENDING' });

    const res = await signup(makeRequest(validBody));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.companyId).toBe('co_1');
    expect(json.data.status).toBe('PENDING');
    expect(insertOne).toHaveBeenCalledTimes(1);
    expect(createCompany).toHaveBeenCalledTimes(1);
  });

  it('returns 400 on invalid body', async () => {
    const res = await signup(makeRequest({ name: 'A', password: 'x' }));
    expect(res.status).toBe(400);
  });

  it('returns 409 when email is already taken', async () => {
    findOne.mockResolvedValue({ _id: 'existing', email: validBody.contactEmail });
    const res = await signup(makeRequest(validBody));
    expect(res.status).toBe(409);
  });

  it('returns 409 when taxId is already taken', async () => {
    findOne.mockResolvedValue(null);
    isTaxIdTaken.mockResolvedValue(true);
    const res = await signup(makeRequest(validBody));
    expect(res.status).toBe(409);
  });

  it('compensates by deleting User if Company creation fails', async () => {
    findOne.mockResolvedValue(null);
    isTaxIdTaken.mockResolvedValue(false);
    const fakeId = '507f1f77bcf86cd799439099';
    insertOne.mockResolvedValue({ insertedId: { toString: () => fakeId } });
    createCompany.mockRejectedValue(new Error('DB exploded'));

    const res = await signup(makeRequest(validBody));
    expect(res.status).toBe(500);
    expect(deleteOne).toHaveBeenCalledTimes(1);
    const deleteArg = deleteOne.mock.calls[0][0];
    expect(deleteArg._id.toString()).toBe(fakeId);
  });
});
