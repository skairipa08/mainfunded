import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';

/**
 * Admin endpoint koruması.
 *
 * `Authorization: Bearer <ADMIN_API_TOKEN>` bekler. Token, env'den okunur ve
 * istemci ile constant-time karşılaştırılır.
 *
 * Production'da bu middleware'i bir VPN/internal subnet kuralı + JWT/SSO ile
 * birlikte zincirleyin — env tabanlı statik token sadece bootstrap içindir.
 */
export function adminAuth() {
  const expected = process.env.ADMIN_API_TOKEN;
  if (!expected) {
    // Fail-closed: token yoksa admin endpoint'leri kapalı.
    return (_req: Request, res: Response) =>
      res.status(503).json({
        error: {
          code: 'admin_disabled',
          message: 'ADMIN_API_TOKEN env değişkeni set edilmedi — admin endpoint\'leri kapalı.',
        },
      });
  }

  const expectedBuf = Buffer.from(expected);

  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.header('Authorization');
    if (!header?.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ error: { code: 'missing_bearer', message: 'Authorization: Bearer <token> gerekli' } });
    }
    const provided = Buffer.from(header.slice('Bearer '.length).trim());
    if (provided.length !== expectedBuf.length || !crypto.timingSafeEqual(provided, expectedBuf)) {
      return res.status(401).json({ error: { code: 'invalid_token', message: 'Geçersiz admin token' } });
    }
    next();
  };
}
