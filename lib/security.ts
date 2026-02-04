/**
 * FundEd Security Utilities
 * Provides security features including rate limiting, input sanitization, and CSRF protection
 */

// Simple in-memory rate limiter
interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Rate limiter configuration
 */
interface RateLimitConfig {
    windowMs: number;      // Time window in milliseconds
    maxRequests: number;   // Maximum requests per window
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (e.g., IP address, user ID)
 * @param config - Rate limit configuration
 * @returns Object with allowed status and remaining requests
 */
export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig = { windowMs: 60000, maxRequests: 100 }
): { allowed: boolean; remaining: number; resetIn: number } {
    const now = Date.now();
    const entry = rateLimitStore.get(identifier);

    // Clean up expired entries periodically
    if (Math.random() < 0.01) {
        cleanupExpiredEntries();
    }

    if (!entry || now > entry.resetTime) {
        // New window
        rateLimitStore.set(identifier, {
            count: 1,
            resetTime: now + config.windowMs,
        });
        return { allowed: true, remaining: config.maxRequests - 1, resetIn: config.windowMs };
    }

    if (entry.count >= config.maxRequests) {
        return { allowed: false, remaining: 0, resetIn: entry.resetTime - now };
    }

    entry.count++;
    return { allowed: true, remaining: config.maxRequests - entry.count, resetIn: entry.resetTime - now };
}

function cleanupExpiredEntries() {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
        if (now > entry.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}

/**
 * Predefined rate limit configurations
 */
export const RateLimits = {
    // Authentication endpoints - stricter limits
    auth: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 per 15 min

    // API endpoints - moderate limits
    api: { windowMs: 60 * 1000, maxRequests: 60 }, // 60 per minute

    // Form submissions - moderate limits
    form: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 per minute

    // Search/browse - generous limits
    search: { windowMs: 60 * 1000, maxRequests: 100 }, // 100 per minute

    // File uploads - strict limits
    upload: { windowMs: 60 * 60 * 1000, maxRequests: 20 }, // 20 per hour
};

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
    if (!input) return '';

    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .replace(/`/g, '&#96;')
        .trim();
}

/**
 * Sanitize object properties recursively
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
    const sanitized: any = {};

    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            sanitized[key] = sanitizeInput(value);
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            sanitized[key] = sanitizeObject(value);
        } else if (Array.isArray(value)) {
            sanitized[key] = value.map(item =>
                typeof item === 'string' ? sanitizeInput(item) :
                    typeof item === 'object' && item !== null ? sanitizeObject(item) : item
            );
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized as T;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

/**
 * Validate phone number format (Turkish format)
 */
export function isValidPhone(phone: string): boolean {
    const phoneRegex = /^(\+90|0)?[5][0-9]{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Password strength checker
 */
export function checkPasswordStrength(password: string): {
    score: number;
    feedback: string[];
} {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score++;
    else feedback.push('En az 8 karakter olmali');

    if (password.length >= 12) score++;

    if (/[a-z]/.test(password)) score++;
    else feedback.push('Kucuk harf icermeli');

    if (/[A-Z]/.test(password)) score++;
    else feedback.push('Buyuk harf icermeli');

    if (/[0-9]/.test(password)) score++;
    else feedback.push('Rakam icermeli');

    if (/[^a-zA-Z0-9]/.test(password)) score++;
    else feedback.push('Ozel karakter icermeli (!@#$%^&*)');

    // Check for common patterns
    const commonPatterns = ['123456', 'password', 'qwerty', 'abc123'];
    if (commonPatterns.some(p => password.toLowerCase().includes(p))) {
        score = Math.max(0, score - 2);
        feedback.push('Yaygin sifreler kullanmayin');
    }

    return { score, feedback };
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const randomValues = new Uint32Array(length);

    if (typeof crypto !== 'undefined') {
        crypto.getRandomValues(randomValues);
        for (let i = 0; i < length; i++) {
            result += chars[randomValues[i] % chars.length];
        }
    } else {
        // Fallback for environments without crypto
        for (let i = 0; i < length; i++) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
    }

    return result;
}

/**
 * CSRF token management
 */
const csrfTokens = new Map<string, { token: string; expires: number }>();

export function generateCsrfToken(sessionId: string): string {
    const token = generateSecureToken(32);
    csrfTokens.set(sessionId, {
        token,
        expires: Date.now() + 60 * 60 * 1000, // 1 hour
    });
    return token;
}

export function validateCsrfToken(sessionId: string, token: string): boolean {
    const entry = csrfTokens.get(sessionId);

    if (!entry) return false;
    if (Date.now() > entry.expires) {
        csrfTokens.delete(sessionId);
        return false;
    }

    return entry.token === token;
}

/**
 * SQL Injection prevention - escape special characters
 */
export function escapeSqlLike(value: string): string {
    return value.replace(/[%_\\]/g, '\\$&');
}

/**
 * Check for common attack patterns in input
 */
export function detectMaliciousInput(input: string): boolean {
    const maliciousPatterns = [
        /<script[\s\S]*?>[\s\S]*?<\/script>/gi,  // Script tags
        /javascript:/gi,                          // JavaScript protocol
        /on\w+\s*=/gi,                           // Event handlers
        /eval\s*\(/gi,                            // Eval calls
        /document\.(cookie|location|write)/gi,   // Document manipulation
        /(union\s+select|insert\s+into|drop\s+table)/gi, // SQL injection
        /\.\.\//g,                                // Path traversal
    ];

    return maliciousPatterns.some(pattern => pattern.test(input));
}

/**
 * Mask sensitive data for logging
 */
export function maskSensitiveData(data: Record<string, any>): Record<string, any> {
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard', 'cvv', 'ssn'];
    const masked: Record<string, any> = {};

    for (const [key, value] of Object.entries(data)) {
        const isAnySensitive = sensitiveFields.some(f =>
            key.toLowerCase().includes(f.toLowerCase())
        );

        if (isAnySensitive) {
            masked[key] = typeof value === 'string' ? '***MASKED***' : value;
        } else if (typeof value === 'object' && value !== null) {
            masked[key] = maskSensitiveData(value);
        } else {
            masked[key] = value;
        }
    }

    return masked;
}

/**
 * Secure comparison to prevent timing attacks
 */
export function secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) return false;

    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
}

/**
 * IP address validation
 */
export function isValidIP(ip: string): boolean {
    // IPv4
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipv4Regex.test(ip)) {
        const parts = ip.split('.').map(Number);
        return parts.every(p => p >= 0 && p <= 255);
    }

    // IPv6
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    return ipv6Regex.test(ip);
}

/**
 * Block list for known malicious IPs/patterns
 */
const blockedIPs = new Set<string>();

export function blockIP(ip: string): void {
    blockedIPs.add(ip);
}

export function isIPBlocked(ip: string): boolean {
    return blockedIPs.has(ip);
}

/**
 * Security audit log
 */
interface SecurityEvent {
    timestamp: Date;
    type: 'rate_limit' | 'malicious_input' | 'csrf_fail' | 'auth_fail' | 'blocked_ip';
    ip?: string;
    userId?: string;
    details?: string;
}

const securityLog: SecurityEvent[] = [];

export function logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
    securityLog.push({
        ...event,
        timestamp: new Date(),
    });

    // Keep only last 1000 events in memory
    if (securityLog.length > 1000) {
        securityLog.shift();
    }

    // In production, you'd send this to a proper logging service
    console.log('[SECURITY]', JSON.stringify({ ...event, timestamp: new Date().toISOString() }));
}

export function getSecurityLog(): SecurityEvent[] {
    return [...securityLog];
}

/**
 * Content validation for file uploads
 */
export function isValidFileType(
    filename: string,
    allowedTypes: string[] = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx']
): boolean {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ext ? allowedTypes.includes(ext) : false;
}

export function isValidFileSize(sizeBytes: number, maxSizeMB: number = 10): boolean {
    return sizeBytes <= maxSizeMB * 1024 * 1024;
}

/**
 * Honeypot field validation for bot detection
 */
export function isHoneypotTriggered(formData: Record<string, any>): boolean {
    // Check common honeypot field names
    const honeypotFields = ['website', 'url', 'fax', 'phone2', 'company_url'];
    return honeypotFields.some(field => formData[field] && formData[field].trim() !== '');
}
