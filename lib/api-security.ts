/**
 * API Route Security Wrapper
 * Provides consistent security checks for all API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, RATE_LIMITS } from './rate-limit';
import {
    sanitizeObject,
    detectMaliciousInput,
    logSecurityEvent,
    isHoneypotTriggered
} from './security';

interface SecureHandlerOptions {
    rateLimit?: { windowMs: number; maxRequests: number };
    requireAuth?: boolean;
    sanitizeBody?: boolean;
    checkMalicious?: boolean;
}

type ApiHandler = (
    request: NextRequest,
    context?: { params?: Record<string, string> }
) => Promise<NextResponse>;

/**
 * Wrap an API handler with security checks
 */
export function withSecurity(
    handler: ApiHandler,
    options: SecureHandlerOptions = {}
): ApiHandler {
    return async (request: NextRequest, context?: { params?: Record<string, string> }) => {
        const {
            rateLimit = RATE_LIMITS.verificationApi,
            sanitizeBody = true,
            checkMalicious = true,
        } = options;

        // Get client IP for logging
        const forwarded = request.headers.get('x-forwarded-for');
        const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';

        // Rate limiting using the canonical rate-limit module
        const rateLimitResult = checkRateLimit(request, rateLimit);
        if (!rateLimitResult.allowed) {
            logSecurityEvent({
                type: 'rate_limit',
                ip,
                details: `Rate limit exceeded for ${request.nextUrl.pathname}`,
            });

            return NextResponse.json(
                { error: 'Too Many Requests', message: 'Cok fazla istek gonderdiniz.' },
                {
                    status: 429,
                    headers: {
                        'Retry-After': Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000).toString(),
                        'X-RateLimit-Remaining': '0',
                    },
                }
            );
        }

        // Check for malicious input in body
        if (checkMalicious && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
            try {
                const body = await request.clone().json();
                const bodyString = JSON.stringify(body);

                if (detectMaliciousInput(bodyString)) {
                    logSecurityEvent({
                        type: 'malicious_input',
                        ip,
                        details: `Malicious input detected in ${request.nextUrl.pathname}`,
                    });

                    return NextResponse.json(
                        { error: 'Bad Request', message: 'Gecersiz girdi tespit edildi.' },
                        { status: 400 }
                    );
                }

                // Check honeypot
                if (isHoneypotTriggered(body)) {
                    logSecurityEvent({
                        type: 'malicious_input',
                        ip,
                        details: `Bot detected via honeypot in ${request.nextUrl.pathname}`,
                    });

                    // Silently accept but don't process (to not alert bots)
                    return NextResponse.json({ success: true });
                }
            } catch {
                // Body is not JSON, skip these checks
            }
        }

        // Call the original handler
        return handler(request, context);
    };
}

/**
 * Create a response with security headers
 */
export function secureResponse<T>(
    data: T,
    options: {
        status?: number;
        headers?: Record<string, string>;
    } = {}
): NextResponse<T> {
    const { status = 200, headers = {} } = options;

    return NextResponse.json(data, {
        status,
        headers: {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'Cache-Control': 'no-store, max-age=0',
            ...headers,
        },
    });
}

/**
 * Validate required fields in request body
 */
export function validateRequiredFields(
    body: Record<string, any>,
    requiredFields: string[]
): { valid: boolean; missing: string[] } {
    const missing = requiredFields.filter(field => !body[field] || body[field] === '');
    return {
        valid: missing.length === 0,
        missing,
    };
}

/**
 * Create error response
 */
export function errorResponse(
    message: string,
    status: number = 400,
    details?: Record<string, any>
): NextResponse {
    return NextResponse.json(
        {
            error: true,
            message,
            ...details,
        },
        { status }
    );
}
