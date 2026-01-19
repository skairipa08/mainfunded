import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

interface RequestRecord {
  count: number;
  resetAt: number;
}

const store = new Map<string, RequestRecord>();
const CLEANUP_INTERVAL = 60000;
let cleanupTimer: NodeJS.Timeout | null = null;

function startCleanup() {
  if (cleanupTimer) return;

  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (record.resetAt < now) {
        store.delete(key);
      }
    }
  }, CLEANUP_INTERVAL);
}

function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const ips = forwarded.split(',').map(ip => ip.trim());
    return ips[0] || 'unknown';
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetAt: number } {
  startCleanup();

  const identifier = getClientIdentifier(request);
  const now = Date.now();
  const key = identifier;

  let record = store.get(key);

  if (!record || record.resetAt < now) {
    record = {
      count: 1,
      resetAt: now + config.windowMs,
    };
    store.set(key, record);
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: record.resetAt,
    };
  }

  record.count++;

  if (record.count > config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.resetAt,
    };
  }

  store.set(key, record);
  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetAt: record.resetAt,
  };
}

export function createRateLimitMiddleware(config: RateLimitConfig) {
  return (request: NextRequest): NextResponse | null => {
    const result = checkRateLimit(request, config);

    if (!result.allowed) {
      return NextResponse.json(
        {
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please try again later.',
          },
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': Math.ceil(result.resetAt / 1000).toString(),
            'Retry-After': Math.ceil((result.resetAt - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    return null; // Allow request
  };
}

export function withRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): NextResponse | null {
  const middleware = createRateLimitMiddleware(config);
  return middleware(request);
}

export const RATE_LIMITS = {
  admin: { windowMs: 60 * 1000, maxRequests: 100 },
  checkout: { windowMs: 60 * 1000, maxRequests: 10 },
  auth: { windowMs: 60 * 1000, maxRequests: 20 },
  // Verification rate limits
  verificationSubmit: { windowMs: 24 * 60 * 60 * 1000, maxRequests: 3 }, // 3/day
  verificationUpload: { windowMs: 60 * 60 * 1000, maxRequests: 10 }, // 10/hour
  verificationApi: { windowMs: 60 * 1000, maxRequests: 30 }, // 30/minute
  adminAction: { windowMs: 60 * 60 * 1000, maxRequests: 50 }, // 50/hour
};

/**
 * Check rate limit with user ID scope
 */
export function checkUserRateLimit(
  request: NextRequest,
  userId: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetAt: number } {
  startCleanup();

  const now = Date.now();
  const key = `user:${userId}`;

  let record = store.get(key);

  if (!record || record.resetAt < now) {
    record = {
      count: 1,
      resetAt: now + config.windowMs,
    };
    store.set(key, record);
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: record.resetAt,
    };
  }

  record.count++;

  if (record.count > config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.resetAt,
    };
  }

  store.set(key, record);
  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetAt: record.resetAt,
  };
}