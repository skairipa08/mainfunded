import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

/**
 * X-Request-Id header'ını alır, yoksa üretir, response'a yansıtır.
 * Tüm log'lar `req.id` ile correlate edilebilir.
 */
export function requestId() {
  return (req: Request, res: Response, next: NextFunction) => {
    const incoming = req.header('X-Request-Id');
    const id = incoming && /^[\w-]{1,128}$/.test(incoming) ? incoming : crypto.randomUUID();
    req.id = id;
    res.setHeader('X-Request-Id', id);
    next();
  };
}
