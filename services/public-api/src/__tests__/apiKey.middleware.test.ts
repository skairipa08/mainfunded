import { describe, it, expect, vi, beforeEach } from 'vitest';

const lookup = vi.fn();
vi.mock('../services/apiKeys', () => ({
  lookupApiKey: (k: string) => lookup(k),
}));

import { apiKeyAuth, requireScope } from '../middleware/apiKey';

function makeReqRes(header?: string) {
  const req: any = { header: (h: string) => (h === 'X-API-Key' ? header : undefined) };
  const res: any = {
    statusCode: 200,
    body: undefined,
    headers: {} as Record<string, string>,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(b: unknown) {
      this.body = b;
      return this;
    },
    setHeader(k: string, v: string) {
      this.headers[k] = v;
    },
  };
  const next = vi.fn();
  return { req, res, next };
}

beforeEach(() => lookup.mockReset());

describe('apiKeyAuth', () => {
  it('rejects missing header with 401', async () => {
    const { req, res, next } = makeReqRes(undefined);
    await apiKeyAuth()(req, res, next);
    expect(res.statusCode).toBe(401);
    expect(res.body).toMatchObject({ error: { code: 'missing_api_key' } });
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects unknown / revoked key with 401', async () => {
    lookup.mockResolvedValue(null);
    const { req, res, next } = makeReqRes('fk_live_bad');
    await apiKeyAuth()(req, res, next);
    expect(res.statusCode).toBe(401);
    expect(res.body).toMatchObject({ error: { code: 'invalid_api_key' } });
    expect(next).not.toHaveBeenCalled();
  });

  it('attaches record + sets X-FundEd-Environment header', async () => {
    const record = {
      id: 'k1',
      school_id: 's1',
      name: 'n',
      environment: 'sandbox',
      scopes: ['campaigns:read'],
      rate_limit_rpm: 100,
      status: 'active',
    };
    lookup.mockResolvedValue(record);
    const { req, res, next } = makeReqRes('fk_test_xxx');
    await apiKeyAuth()(req, res, next);
    expect(req.apiKey).toEqual(record);
    expect(res.headers['X-FundEd-Environment']).toBe('sandbox');
    expect(next).toHaveBeenCalledOnce();
  });
});

describe('requireScope', () => {
  it('403 when scope missing', () => {
    const { req, res, next } = makeReqRes();
    req.apiKey = { scopes: ['campaigns:read'] };
    requireScope('donations:read')(req, res, next);
    expect(res.statusCode).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('passes when scope present', () => {
    const { req, res, next } = makeReqRes();
    req.apiKey = { scopes: ['donations:read'] };
    requireScope('donations:read')(req, res, next);
    expect(next).toHaveBeenCalledOnce();
  });
});
