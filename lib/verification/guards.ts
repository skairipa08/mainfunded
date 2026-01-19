/**
 * Authentication & Authorization Guards
 * 
 * These guards ensure proper access control for verification endpoints.
 * CRITICAL: Always use these helpers to prevent IDOR vulnerabilities.
 */

import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { getVerificationForUser, getDocumentsForVerification } from './db';

export interface AuthUser {
    id: string;
    email: string;
    name?: string;
    role: 'student' | 'donor' | 'institution' | 'admin';
}

export interface AuthError {
    status: 401 | 403 | 404;
    message: string;
}

/**
 * Require authenticated user
 * Returns user or throws AuthError
 */
export async function requireAuth(): Promise<AuthUser> {
    const session = await auth();

    if (!session?.user?.id) {
        throw { status: 401, message: 'Unauthorized' } as AuthError;
    }

    return {
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.name || undefined,
        role: (session.user as any).role || 'student'
    };
}

/**
 * Require admin role
 * Returns user or throws AuthError
 */
export async function requireAdmin(): Promise<AuthUser> {
    const user = await requireAuth();

    if (user.role !== 'admin') {
        throw { status: 403, message: 'Forbidden: Admin access required' } as AuthError;
    }

    return user;
}

/**
 * Require student role
 */
export async function requireStudent(): Promise<AuthUser> {
    const user = await requireAuth();

    if (user.role !== 'student') {
        throw { status: 403, message: 'Forbidden: Student access required' } as AuthError;
    }

    return user;
}

/**
 * Get verification with ownership check
 * CRITICAL: Always returns 404 (not 403) to prevent enumeration
 */
export async function requireVerificationOwnership(
    verificationId: string,
    userId: string
) {
    const verification = await getVerificationForUser(verificationId, userId);

    if (!verification) {
        // CRITICAL: Return 404 not 403 to prevent ID enumeration
        throw { status: 404, message: 'Verification not found' } as AuthError;
    }

    return verification;
}

/**
 * Get document with ownership check through verification
 */
export async function requireDocumentOwnership(
    verificationId: string,
    documentId: string,
    userId: string
) {
    const verification = await getVerificationForUser(verificationId, userId);

    if (!verification) {
        throw { status: 404, message: 'Not found' } as AuthError;
    }

    const documents = await getDocumentsForVerification(verificationId, userId);
    const document = documents.find(d => d.doc_id === documentId);

    if (!document) {
        throw { status: 404, message: 'Document not found' } as AuthError;
    }

    return { verification, document };
}

/**
 * Handle auth errors and return proper NextResponse
 */
export function handleAuthError(error: unknown): NextResponse {
    if (typeof error === 'object' && error !== null && 'status' in error) {
        const authError = error as AuthError;
        return NextResponse.json(
            { error: authError.message },
            { status: authError.status }
        );
    }

    // Unknown error, log and return 500
    console.error('Unexpected auth error:', error);
    return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
    );
}

/**
 * Wrapper for API routes that require authentication
 */
export function withAuth<T>(
    handler: (user: AuthUser, ...args: any[]) => Promise<T>
) {
    return async (...args: any[]): Promise<T | NextResponse> => {
        try {
            const user = await requireAuth();
            return handler(user, ...args);
        } catch (error) {
            return handleAuthError(error);
        }
    };
}

/**
 * Wrapper for API routes that require admin role
 */
export function withAdmin<T>(
    handler: (user: AuthUser, ...args: any[]) => Promise<T>
) {
    return async (...args: any[]): Promise<T | NextResponse> => {
        try {
            const user = await requireAdmin();
            return handler(user, ...args);
        } catch (error) {
            return handleAuthError(error);
        }
    };
}
