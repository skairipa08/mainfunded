import { NextResponse, type NextRequest } from 'next/server';

// ⚠️ DO NOT import from './auth' here!
// Middleware runs on Vercel Edge Runtime which cannot import NextAuth/MongoDB.
// See VERCEL_MIDDLEWARE_FIX.md for details.

// Routes that require authentication
const protectedRoutes = ['/account', '/admin', '/dashboard', '/create-campaign', '/my-donations'];

// Routes that are only for admins (protected at API/page level, not middleware)
const adminRoutes = ['/admin'];

// Simple in-memory rate limiter for middleware
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 100; // 100 requests per minute

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return ip;
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  // Cleanup old entries periodically (1% chance)
  if (Math.random() < 0.01) {
    for (const [k, v] of rateLimitMap.entries()) {
      if (now > v.resetTime) rateLimitMap.delete(k);
    }
  }

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count };
}

/**
 * Check if user has a valid session cookie (Edge-compatible, no auth import).
 * next-auth v5 (authjs) uses these cookie names:
 *   - Development (HTTP):  "authjs.session-token"
 *   - Production  (HTTPS): "__Secure-authjs.session-token"
 * Older versions / configurations may use "next-auth.session-token".
 */
function hasSessionCookie(request: NextRequest): boolean {
  const cookies = request.cookies;
  return (
    cookies.has('authjs.session-token') ||
    cookies.has('__Secure-authjs.session-token') ||
    cookies.has('next-auth.session-token') ||
    cookies.has('__Secure-next-auth.session-token')
  );
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files and API routes (API routes handle their own auth)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // static files
  ) {
    return NextResponse.next();
  }

  // Rate limiting
  const rateLimitKey = getRateLimitKey(request);
  const rateLimit = checkRateLimit(rateLimitKey);

  if (!rateLimit.allowed) {
    return new NextResponse(
      JSON.stringify({ error: 'Too Many Requests', message: 'Cok fazla istek gonderdiniz. Lutfen bekleyin.' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60',
          'X-RateLimit-Limit': RATE_LIMIT_MAX.toString(),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Redirect to login if not authenticated on protected routes
  // Uses Edge-compatible cookie check instead of auth() call
  if (isProtectedRoute && !hasSessionCookie(request)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Note: Admin role checks are handled at the API/page level via requireAdmin()
  // We cannot decode JWT on Edge without importing auth, so skip admin check here.

  // Create response with security headers
  const response = NextResponse.next();

  // Rate limit headers
  response.headers.set('X-RateLimit-Limit', RATE_LIMIT_MAX.toString());
  response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());

  // Security Headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  );
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), browsing-topics=()'
  );

  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https: http:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://accounts.google.com https://www.googleapis.com https://api.stripe.com",
    "frame-src 'self' https://accounts.google.com https://js.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "upgrade-insecure-requests",
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
