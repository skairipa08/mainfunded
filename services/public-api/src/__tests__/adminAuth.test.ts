import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import { adminAuth } from '../middleware/adminAuth';

function makeReqRes(authHeader?: string) {
  const req: any = { header: (h: string) => (h === 'Authorization' ? authHeader : undefined) };
  const res: any = {
    statusCode: 200,
    body: undefined,
    status(c: number) {
      this.statusCode = c;
      return this;
    },
    json(b: unknown) {
      this.body = b;
      return this;
    },
  };
  return { req, res, next: vi.fn() };
}

const ORIGINAL = process.env.ADMIN_API_TOKEN;
afterAll(() => {
  process.env.ADMIN_API_TOKEN = ORIGINAL;
});

describe('adminAuth — fail-closed when token unset', () => {
  beforeEach(() => {
    delete process.env.ADMIN_API_TOKEN;
  });
  it('returns 503 if ADMIN_API_TOKEN missing', () => {
    const { req, res, next } = makeReqRes('Bearer whatever');
    (adminAuth() as any)(req, res, next);
    expect(res.statusCode).toBe(503);
    expect(next).not.toHaveBeenCalled();
  });
});

describe('adminAuth — token configured', () => {
  beforeEach(() => {
    process.env.ADMIN_API_TOKEN = 'super-secret-token-1234';
  });

  it('401 on missing Authorization', () => {
    const { req, res, next } = makeReqRes(undefined);
    adminAuth()(req, res, next);
    expect(res.statusCode).toBe(401);
    expect(res.body).toMatchObject({ error: { code: 'missing_bearer' } });
  });

  it('401 on wrong token', () => {
    const { req, res, next } = makeReqRes('Bearer wrong-token');
    adminAuth()(req, res, next);
    expect(res.statusCode).toBe(401);
    expect(res.body).toMatchObject({ error: { code: 'invalid_token' } });
  });

  it('401 on differing length (timing-safe path covered)', () => {
    const { req, res, next } = makeReqRes('Bearer short');
    adminAuth()(req, res, next);
    expect(res.statusCode).toBe(401);
  });

  it('passes on correct token', () => {
    const { req, res, next } = makeReqRes('Bearer super-secret-token-1234');
    adminAuth()(req, res, next);
    expect(next).toHaveBeenCalledOnce();
  });
});
