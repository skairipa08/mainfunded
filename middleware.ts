import { NextResponse, type NextRequest } from 'next/server';

// ⚠️ DO NOT import from './auth' here!
// Middleware runs on Vercel Edge Runtime which cannot import NextAuth/MongoDB.
// See VERCEL_MIDDLEWARE_FIX.md for details.

// Routes that require authentication
const protectedRoutes = ['/account', '/admin', '/dashboard', '/create-campaign', '/my-donations'];

// Routes that are only for admins (protected at API/page level, not middleware)
const adminRoutes = ['/admin'];

// ═══════════════════════════════════════════════════════
// Rate Limiting — per-path tiers with IP + optional user
// ═══════════════════════════════════════════════════════

interface RateTier {
  windowMs: number;
  max: number;
}

/**
 * Per-path rate-limit tiers.
 * More sensitive endpoints get stricter limits.
 * Match order matters — first match wins.
 */
const RATE_TIERS: { pattern: RegExp; tier: RateTier }[] = [
  // Auth / Login — 20 req/min
  { pattern: /^\/(api\/auth|login)/, tier: { windowMs: 60_000, max: 20 } },
  // Stripe checkout — 10 req/min
  { pattern: /^\/api\/checkout/, tier: { windowMs: 60_000, max: 10 } },
  // Verification submit — 5 req/min
  { pattern: /^\/api\/verification\/submit/, tier: { windowMs: 60_000, max: 5 } },
  // Document uploads — 15 req/min
  { pattern: /^\/api\/verification\/documents/, tier: { windowMs: 60_000, max: 15 } },
  // Admin APIs — 100 req/min
  { pattern: /^\/api\/admin/, tier: { windowMs: 60_000, max: 100 } },
  // General API — 60 req/min
  { pattern: /^\/api\//, tier: { windowMs: 60_000, max: 60 } },
  // Pages — 120 req/min
  { pattern: /.*/, tier: { windowMs: 60_000, max: 120 } },
];

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function getRateLimitKey(request: NextRequest, tierIdx: number): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return `${tierIdx}:${ip}`;
}

function matchTier(pathname: string): { tier: RateTier; idx: number } {
  for (let i = 0; i < RATE_TIERS.length; i++) {
    if (RATE_TIERS[i].pattern.test(pathname)) {
      return { tier: RATE_TIERS[i].tier, idx: i };
    }
  }
  return { tier: { windowMs: 60_000, max: 120 }, idx: -1 };
}

function checkRateLimit(key: string, tier: RateTier): { allowed: boolean; remaining: number } {
  // Defensive fallback — should never happen, but protects against HMR edge cases
  const t = tier ?? { windowMs: 60_000, max: 120 };
  const now = Date.now();

  // Probabilistic cleanup (1 %)
  if (Math.random() < 0.01) {
    for (const [k, v] of rateLimitMap.entries()) {
      if (now > v.resetTime) rateLimitMap.delete(k);
    }
  }

  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + t.windowMs });
    return { allowed: true, remaining: t.max - 1 };
  }

  if (entry.count >= t.max) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: t.max - entry.count };
}

// ═══════════════════════════════════════════════════════
// Session Cookie Validation (Edge-compatible)
// ═══════════════════════════════════════════════════════

/**
 * Check if user has a valid session cookie.
 * next-auth v5 (authjs) uses these cookie names:
 *   - Development (HTTP):  "authjs.session-token"
 *   - Production  (HTTPS): "__Secure-authjs.session-token"
 * Older versions / configurations may use "next-auth.session-token".
 */
function getSessionToken(request: NextRequest): string | undefined {
  const cookies = request.cookies;
  return (
    cookies.get('authjs.session-token')?.value ||
    cookies.get('__Secure-authjs.session-token')?.value ||
    cookies.get('next-auth.session-token')?.value ||
    cookies.get('__Secure-next-auth.session-token')?.value ||
    undefined
  );
}

/**
 * Light-weight JWT structure + expiry check.
 * We cannot verify the signature on Edge (no access to AUTH_SECRET via crypto),
 * but we CAN reject obviously malformed or expired tokens early.
 */
function isTokenLikelyValid(token: string): boolean {
  const parts = token.split('.');
  // JWTs have 3 parts (header.payload.signature)
  // JWEs have 5 parts (header.encryptedKey.iv.ciphertext.tag)
  // NextAuth v5 uses JWE (encrypted tokens) by default
  if (parts.length !== 3 && parts.length !== 5) return false;

  // JWE tokens are encrypted — we cannot inspect the payload on Edge,
  // but we can confirm structural validity.
  // For JWE with "alg":"dir" (direct key agreement, used by NextAuth v5),
  // the encrypted key (part[1]) is EMPTY — this is valid per RFC 7516.
  // Structure: header.encryptedKey.iv.ciphertext.tag
  if (parts.length === 5) {
    // header, iv, ciphertext, and tag must be non-empty; encryptedKey can be empty for dir
    return parts[0].length > 0 && parts[2].length > 0 && parts[3].length > 0 && parts[4].length > 0;
  }

  // Standard JWT validation (3 parts)
  try {
    // Decode payload (second segment) — Edge runtime has atob()
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

    // Check expiry
    if (typeof payload.exp === 'number') {
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) return false; // expired
    }

    // Reject alg:none in header
    const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
    if (!header.alg || header.alg.toLowerCase() === 'none') return false;

    return true;
  } catch {
    // Malformed base64 / JSON → reject
    return false;
  }
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files (they are served by CDN, no need for middleware)
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('.')  // static files (favicon, images, etc.)
  ) {
    return NextResponse.next();
  }

  // ── Rate limiting (per-path tiers) ──────────────────────────
  const { tier, idx } = matchTier(pathname);
  const rlKey = getRateLimitKey(request, idx);
  const rateLimit = checkRateLimit(rlKey, tier);

  if (!rateLimit.allowed) {
    return new NextResponse(
      JSON.stringify({ error: 'Too Many Requests', message: 'Çok fazla istek gönderdiniz. Lütfen bekleyin.' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil(tier.windowMs / 1000).toString(),
          'X-RateLimit-Limit': tier.max.toString(),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  // ── Auth check for protected routes ─────────────────────────
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    const token = getSessionToken(request);

    // No cookie at all → redirect to login
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Cookie exists but malformed / expired → redirect to login
    if (!isTokenLikelyValid(token)) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      // Clear the stale cookie
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete('authjs.session-token');
      res.cookies.delete('__Secure-authjs.session-token');
      return res;
    }
  }

  // ── Build response with security headers ────────────────────
  const response = NextResponse.next();

  // Rate limit headers (always present)
  response.headers.set('X-RateLimit-Limit', tier.max.toString());
  response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());

  // ── Security Headers ────────────────────────────────────────
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  );
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  // X-XSS-Protection is deprecated, but still useful for older browsers
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), browsing-topics=()'
  );
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');

  // ── Content Security Policy ─────────────────────────────────
  // Next.js requires 'unsafe-inline' for styles (CSS-in-JS / styled-jsx).
  // Development mode requires 'unsafe-eval' for webpack HMR / React Fast Refresh.
  // Cloudinary domain added for image delivery.
  const isDev = process.env.NODE_ENV === 'development';
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://accounts.google.com https://apis.google.com https://js.stripe.com`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https://lh3.googleusercontent.com https://res.cloudinary.com https://picsum.photos https://images.unsplash.com",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://accounts.google.com https://www.googleapis.com https://api.stripe.com https://vitals.vercel-insights.com",
    "frame-src 'self' https://accounts.google.com https://js.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://accounts.google.com",
    "frame-ancestors 'self'",
    // Only upgrade insecure requests in production (breaks localhost dev)
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
