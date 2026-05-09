import type { Request, Response, NextFunction } from 'express';
import { lookupApiKey, type ApiKeyRecord } from '../services/apiKeys';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      apiKey?: ApiKeyRecord;
    }
  }
}

/**
 * X-API-Key header'ını çözer, kaydı bulur, req.apiKey'e bağlar.
 * Sandbox/live ayrımı: sandbox key'leri `req.apiKey.environment === 'sandbox'`
 * route handler'larda bu alana göre test datası döndürmeli.
 */
export function apiKeyAuth() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const header = req.header('X-API-Key');
    if (!header) {
      return res.status(401).json({
        error: { code: 'missing_api_key', message: 'X-API-Key header zorunludur' },
      });
    }
    const record = await lookupApiKey(header.trim());
    if (!record) {
      return res.status(401).json({
        error: { code: 'invalid_api_key', message: 'API key geçersiz veya iptal edilmiş' },
      });
    }
    req.apiKey = record;
    res.setHeader('X-FundEd-Environment', record.environment);
    next();
  };
}

/** Belirli bir scope gerektiren endpoint'ler için. */
export function requireScope(scope: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.apiKey?.scopes.includes(scope)) {
      return res.status(403).json({
        error: { code: 'insufficient_scope', message: `Bu endpoint '${scope}' scope'u gerektirir` },
      });
    }
    next();
  };
}
