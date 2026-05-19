import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import Redis from 'ioredis';
import type { Request } from 'express';

/**
 * API key başına dakikada 100 istek.
 * - Redis varsa: dağıtık store (production).
 * - Yoksa: in-memory (single-instance dev).
 *
 * Anonim istekler IP başına aynı limite tabi.
 */

const redisUrl = process.env.REDIS_URL;
const redis = redisUrl ? new Redis(redisUrl, { enableOfflineQueue: false }) : null;

export const publicApiRateLimiter = rateLimit({
  windowMs: 60_000,
  limit: (req: Request) => req.apiKey?.rate_limit_rpm ?? 100,
  standardHeaders: 'draft-7', // RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset
  legacyHeaders: false,
  keyGenerator: (req: Request) => req.apiKey?.id ?? `ip:${req.ip}`,
  message: {
    error: {
      code: 'rate_limit_exceeded',
      message: 'Dakikada 100 istek limiti aşıldı. Retry-After header\'ına bakın.',
    },
  },
  store: redis
    ? new RedisStore({
        sendCommand: (...args: string[]) =>
          redis.call(args[0], ...args.slice(1)) as unknown as Promise<any>,
        prefix: 'rl:public-api:',
      })
    : undefined,
});
