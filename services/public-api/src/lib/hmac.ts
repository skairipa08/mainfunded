import crypto from 'node:crypto';

/**
 * HMAC-SHA256 imzalama / doğrulama.
 * Header formatı:   X-FundEd-Signature: t=<unix>,v1=<hex>
 * İmzalanan içerik:  `${unix}.${rawBody}`
 *
 * Replay koruması: 5 dakikalık tolerans.
 */

const TOLERANCE_SEC = 5 * 60;

export function sign(rawBody: string, secret: string, timestamp = Math.floor(Date.now() / 1000)): string {
  const payload = `${timestamp}.${rawBody}`;
  const v1 = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return `t=${timestamp},v1=${v1}`;
}

export interface VerifyResult {
  ok: boolean;
  reason?: 'malformed' | 'stale' | 'mismatch';
}

export function verify(rawBody: string, header: string | undefined, secret: string, now = Date.now()): VerifyResult {
  if (!header || typeof header !== 'string') return { ok: false, reason: 'malformed' };

  // `k=v` çiftleri — value içinde ek `=` olabilir, sadece ilk ayırıcıdan böl.
  const parts: Record<string, string> = {};
  for (const segment of header.split(',')) {
    const trimmed = segment.trim();
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const k = trimmed.slice(0, eq);
    const v = trimmed.slice(eq + 1);
    if (k && v) parts[k] = v;
  }
  const t = Number(parts.t);
  const v1 = parts.v1;
  if (!Number.isFinite(t) || t <= 0 || !v1 || !/^[0-9a-f]+$/i.test(v1)) {
    return { ok: false, reason: 'malformed' };
  }

  if (Math.abs(now / 1000 - t) > TOLERANCE_SEC) return { ok: false, reason: 'stale' };

  const expected = crypto.createHmac('sha256', secret).update(`${t}.${rawBody}`).digest('hex');

  // Constant-time karşılaştırma — timing attack'a karşı.
  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(v1, 'hex');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { ok: false, reason: 'mismatch' };
  }
  return { ok: true };
}

/* ── Express middleware: gelen webhook'ları doğrulamak için ───────────────── */
import type { Request, Response, NextFunction } from 'express';

export function verifyWebhookMiddleware(getSecret: (req: Request) => Promise<string | null> | string | null) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const raw = (req as any).rawBody as string | undefined;
    if (!raw) return res.status(400).json({ error: { code: 'no_raw_body', message: 'rawBody parser missing' } });

    const secret = await getSecret(req);
    if (!secret) return res.status(401).json({ error: { code: 'unknown_endpoint', message: 'No secret' } });

    const result = verify(raw, req.header('X-FundEd-Signature'), secret);
    if (!result.ok) {
      return res.status(401).json({ error: { code: `signature_${result.reason}`, message: 'Invalid signature' } });
    }
    next();
  };
}
