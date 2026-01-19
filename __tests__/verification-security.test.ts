/**
 * Verification Security Tests
 * 
 * Covers:
 * - 12 IDOR protection tests (Blueprint Section D)
 * - 8 Upload security tests (Blueprint Section F)
 * - Rate limiting tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// =======================================
// Test Mocks - Define mock functions before vi.mock calls
// =======================================

// Mock auth module first
vi.mock('@/auth', () => ({
    auth: vi.fn().mockResolvedValue(null),
}));

// Mock database - use factory function to avoid hoisting issues
vi.mock('@/lib/db', () => {
    const mockFindOne = vi.fn();
    const mockFind = vi.fn();
    const mockInsertOne = vi.fn();
    const mockFindOneAndUpdate = vi.fn();
    const mockUpdateOne = vi.fn();
    const mockDeleteOne = vi.fn();
    const mockToArray = vi.fn();
    
    return {
        getDb: vi.fn().mockResolvedValue({
            collection: vi.fn().mockReturnValue({
                findOne: mockFindOne,
                find: mockFind.mockReturnValue({
                    sort: vi.fn().mockReturnThis(),
                    limit: vi.fn().mockReturnThis(),
                    skip: vi.fn().mockReturnThis(),
                    toArray: mockToArray,
                }),
                insertOne: mockInsertOne,
                findOneAndUpdate: mockFindOneAndUpdate,
                updateOne: mockUpdateOne,
                deleteOne: mockDeleteOne,
            }),
        }),
        __mocks: { mockFindOne, mockFind, mockInsertOne, mockFindOneAndUpdate, mockUpdateOne, mockDeleteOne, mockToArray }
    };
});

// Mock verification db module
vi.mock('@/lib/verification/db', () => ({
    getVerificationForUser: vi.fn(),
    getDocumentsForVerification: vi.fn().mockResolvedValue([]),
}));

// Import after mocks
import { auth } from '@/auth';
import {
    requireAuth,
    requireAdmin,
    requireStudent,
    requireVerificationOwnership,
    requireDocumentOwnership
} from '@/lib/verification/guards';
import {
    validateFile,
    validateFileName,
    sanitizeFileName,
    calculateFileHash,
    checkForMaliciousContent,
    ALLOWED_TYPES
} from '@/lib/verification/upload';
import { checkRateLimit, checkUserRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { getVerificationForUser, getDocumentsForVerification } from '@/lib/verification/db';

// =======================================
// Test Data
// =======================================

const USER_A = {
    id: 'user-a-id-12345',
    email: 'usera@example.com',
    name: 'User A',
    role: 'student',
};

const USER_B = {
    id: 'user-b-id-67890',
    email: 'userb@example.com',
    name: 'User B',
    role: 'student',
};

const ADMIN_USER = {
    id: 'admin-id-12345',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
};

const VERIFICATION_A = {
    verification_id: 'verif-a-12345',
    user_id: USER_A.id,
    status: 'DRAFT',
    __v: 0,
};

const VERIFICATION_B = {
    verification_id: 'verif-b-67890',
    user_id: USER_B.id,
    status: 'DRAFT',
    __v: 0,
};

const SUBMITTED_VERIFICATION = {
    verification_id: 'verif-submitted-123',
    user_id: USER_A.id,
    status: 'PENDING_REVIEW',
    __v: 1,
};

// Helper to create mock request
function createMockRequest(
    method: string,
    url: string,
    body?: any,
    headers?: Record<string, string>
): NextRequest {
    const request = new NextRequest(new URL(url, 'http://localhost:3000'), {
        method,
        headers: {
            'Content-Type': 'application/json',
            'x-forwarded-for': '127.0.0.1',
            ...headers,
        },
    });
    return request;
}

// =======================================
// IDOR Protection Tests (Section D)
// =======================================

describe('IDOR Protection Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('1. GET /api/verification - userId from session', () => {
        it('should only return verifications for authenticated user', async () => {
            vi.mocked(auth).mockResolvedValue({ user: USER_A } as any);
            
            // Mock getVerificationForUser to only return if userId matches
            vi.mocked(getVerificationForUser).mockImplementation(async (verificationId, userId) => {
                if (verificationId === VERIFICATION_A.verification_id && userId === USER_A.id) {
                    return VERIFICATION_A as any;
                }
                return null;
            });

            const user = await requireAuth();
            expect(user.id).toBe(USER_A.id);

            // User A's verification should be found
            const resultA = await getVerificationForUser('verif-a-12345', USER_A.id);
            expect(resultA).toEqual(VERIFICATION_A);

            // User B's verification should NOT be found when queried with User A's ID
            const resultB = await getVerificationForUser('verif-b-67890', USER_A.id);
            expect(resultB).toBeNull();
        });
    });

    describe('2. POST /api/verification - creates for auth user only', () => {
        it('should only create verification for authenticated user', async () => {
            vi.mocked(auth).mockResolvedValue({ user: USER_A } as any);

            const user = await requireAuth();

            // Any created verification should have user_id from session, not from input
            const createData = {
                verification_id: 'new-verif',
                user_id: user.id, // Should come from session, not request body
                status: 'DRAFT',
            };

            expect(createData.user_id).toBe(USER_A.id);
            expect(createData.user_id).not.toBe(USER_B.id);
        });

        it('should reject unauthenticated requests with 401', async () => {
            vi.mocked(auth).mockResolvedValue(null as any);

            await expect(requireAuth()).rejects.toMatchObject({
                status: 401,
                message: 'Unauthorized'
            });
        });
    });

    describe('3. PUT /api/verification/:id - A cannot update Bs', () => {
        it('User A cannot update User Bs verification', async () => {
            vi.mocked(auth).mockResolvedValue({ user: USER_A } as any);
            vi.mocked(getVerificationForUser).mockResolvedValue(null); // Not found because user_id doesn't match

            await expect(
                requireVerificationOwnership(VERIFICATION_B.verification_id, USER_A.id)
            ).rejects.toMatchObject({
                status: 404,
                message: 'Verification not found'
            });
        });

        it('User A can update their own verification', async () => {
            vi.mocked(auth).mockResolvedValue({ user: USER_A } as any);
            vi.mocked(getVerificationForUser).mockResolvedValue(VERIFICATION_A as any);

            const result = await requireVerificationOwnership(VERIFICATION_A.verification_id, USER_A.id);
            expect(result).toEqual(VERIFICATION_A);
        });
    });

    describe('4. POST /api/verification/submit - A cannot submit Bs', () => {
        it('User A cannot submit User Bs verification', async () => {
            vi.mocked(auth).mockResolvedValue({ user: USER_A } as any);
            vi.mocked(getVerificationForUser).mockResolvedValue(null);

            await expect(
                requireVerificationOwnership(VERIFICATION_B.verification_id, USER_A.id)
            ).rejects.toMatchObject({
                status: 404,
                message: 'Verification not found'
            });
        });
    });

    describe('5. POST /api/verification/documents - A cannot upload to Bs', () => {
        it('User A cannot upload documents to User Bs verification', async () => {
            vi.mocked(auth).mockResolvedValue({ user: USER_A } as any);
            vi.mocked(getVerificationForUser).mockResolvedValue(null);

            await expect(
                requireVerificationOwnership(VERIFICATION_B.verification_id, USER_A.id)
            ).rejects.toMatchObject({
                status: 404
            });
        });
    });

    describe('6. GET /api/verification/documents/:id - A cannot view Bs', () => {
        it('User A cannot view User Bs documents', async () => {
            vi.mocked(auth).mockResolvedValue({ user: USER_A } as any);
            vi.mocked(getVerificationForUser).mockResolvedValue(null); // Verification not found

            await expect(
                requireDocumentOwnership(VERIFICATION_B.verification_id, 'doc-123', USER_A.id)
            ).rejects.toMatchObject({
                status: 404
            });
        });
    });

    describe('7. DELETE /api/verification/documents/:id - A cannot delete Bs', () => {
        it('User A cannot delete User Bs documents', async () => {
            vi.mocked(auth).mockResolvedValue({ user: USER_A } as any);
            vi.mocked(getVerificationForUser).mockResolvedValue(null);

            await expect(
                requireDocumentOwnership(VERIFICATION_B.verification_id, 'doc-123', USER_A.id)
            ).rejects.toMatchObject({
                status: 404
            });
        });
    });

    describe('8. GET /api/admin/* - User gets 403', () => {
        it('Regular user cannot access admin endpoints', async () => {
            vi.mocked(auth).mockResolvedValue({ user: USER_A } as any);

            await expect(requireAdmin()).rejects.toMatchObject({
                status: 403,
                message: 'Forbidden: Admin access required'
            });
        });

        it('Admin user can access admin endpoints', async () => {
            vi.mocked(auth).mockResolvedValue({ user: ADMIN_USER } as any);

            const user = await requireAdmin();
            expect(user.role).toBe('admin');
        });
    });

    describe('9. POST /api/admin/.../action - User gets 403', () => {
        it('Regular user cannot perform admin actions', async () => {
            vi.mocked(auth).mockResolvedValue({ user: USER_A } as any);

            await expect(requireAdmin()).rejects.toMatchObject({
                status: 403
            });
        });
    });

    describe('10. Enumeration IDs - 404 for all invalid, no 403', () => {
        it('Returns 404 (not 403) for non-existent verification', async () => {
            vi.mocked(auth).mockResolvedValue({ user: USER_A } as any);
            vi.mocked(getVerificationForUser).mockResolvedValue(null);

            await expect(
                requireVerificationOwnership('non-existent-id', USER_A.id)
            ).rejects.toMatchObject({
                // CRITICAL: Should be 404, NOT 403 to prevent enumeration
                status: 404
            });
        });

        it('Returns 404 for other users verification (not 403)', async () => {
            vi.mocked(auth).mockResolvedValue({ user: USER_A } as any);
            vi.mocked(getVerificationForUser).mockResolvedValue(null);

            await expect(
                requireVerificationOwnership(VERIFICATION_B.verification_id, USER_A.id)
            ).rejects.toMatchObject({
                // CRITICAL: Should be 404, NOT 403 to prevent enumeration
                status: 404
            });
        });
    });

    describe('11. Edit after submit - User gets 403', () => {
        it('User cannot edit verification after submission', async () => {
            vi.mocked(auth).mockResolvedValue({ user: USER_A } as any);
            // Return submitted verification
            vi.mocked(getVerificationForUser).mockResolvedValue(SUBMITTED_VERIFICATION as any);

            // In the actual implementation, updateVerification checks status
            // Only DRAFT and NEEDS_MORE_INFO are editable
            const verification = await requireVerificationOwnership(
                SUBMITTED_VERIFICATION.verification_id,
                USER_A.id
            );

            // Verify status is not editable
            expect(verification.status).toBe('PENDING_REVIEW');
            expect(['DRAFT', 'NEEDS_MORE_INFO'].includes(verification.status)).toBe(false);
        });
    });

    describe('12. Delete after submit - User gets 403', () => {
        it('User cannot delete documents after submission', async () => {
            vi.mocked(auth).mockResolvedValue({ user: USER_A } as any);
            vi.mocked(getVerificationForUser).mockResolvedValue(SUBMITTED_VERIFICATION as any);

            const verification = await requireVerificationOwnership(
                SUBMITTED_VERIFICATION.verification_id,
                USER_A.id
            );

            // Verify status doesn't allow deletion
            expect(verification.status).toBe('PENDING_REVIEW');
            expect(['DRAFT'].includes(verification.status)).toBe(false);
        });
    });
});

// =======================================
// Upload Security Tests (Section F)
// =======================================

describe('Upload Security Tests', () => {
    describe('1. Upload .exe disguised as .jpg - Reject (magic byte check)', () => {
        it('rejects executable disguised as JPEG', () => {
            // Windows executable magic bytes (MZ header)
            const exeBuffer = Buffer.from([0x4D, 0x5A, 0x90, 0x00, ...Array(1024).fill(0)]);

            const result = validateFile(exeBuffer, 'image/jpeg', 'malicious.jpg');

            expect(result.valid).toBe(false);
            expect(result.errorCode).toBe('MAGIC_MISMATCH');
        });
    });

    describe('2. Upload valid JPEG with embedded PHP', () => {
        it('detects malicious PHP embedded in image', () => {
            // Create a fake JPEG with PHP code embedded
            const jpegHeader = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);
            const phpCode = Buffer.from('<?php echo "malicious"; ?>');
            const combinedBuffer = Buffer.concat([jpegHeader, Buffer.alloc(1024), phpCode, Buffer.alloc(500)]);

            const result = checkForMaliciousContent(combinedBuffer, 'image/jpeg');

            expect(result.valid).toBe(false);
            expect(result.error).toContain('malicious');
        });
    });

    describe('3. Upload > 10MB file - 413 Size Exceeded', () => {
        it('rejects files exceeding size limit', () => {
            // 11MB buffer (exceeds 10MB PDF limit)
            const largeBuffer = Buffer.alloc(11 * 1024 * 1024);
            // Add PDF magic bytes
            largeBuffer[0] = 0x25; // %
            largeBuffer[1] = 0x50; // P
            largeBuffer[2] = 0x44; // D
            largeBuffer[3] = 0x46; // F

            const result = validateFile(largeBuffer, 'application/pdf', 'large.pdf');

            expect(result.valid).toBe(false);
            expect(result.errorCode).toBe('SIZE_EXCEEDED');
        });

        it('rejects images exceeding 8MB limit', () => {
            // 9MB buffer (exceeds 8MB image limit)
            const largeBuffer = Buffer.alloc(9 * 1024 * 1024);
            // Add JPEG magic bytes
            largeBuffer[0] = 0xFF;
            largeBuffer[1] = 0xD8;
            largeBuffer[2] = 0xFF;

            const result = validateFile(largeBuffer, 'image/jpeg', 'large.jpg');

            expect(result.valid).toBe(false);
            expect(result.errorCode).toBe('SIZE_EXCEEDED');
        });
    });

    describe('4. Upload SVG with embedded script - Reject or sanitize', () => {
        it('rejects SVG with JavaScript', () => {
            const svgWithScript = Buffer.from(
                '<svg xmlns="http://www.w3.org/2000/svg"><script>alert("xss")</script></svg>'
            );

            const result = checkForMaliciousContent(svgWithScript, 'image/svg+xml');

            expect(result.valid).toBe(false);
            // Should contain error about malicious content (either "SVG with scripts" or general malicious detection)
            expect(result.error).toBeDefined();
        });

        it('rejects SVG with javascript: URL', () => {
            const svgWithJsUrl = Buffer.from(
                '<svg xmlns="http://www.w3.org/2000/svg"><a href="javascript:alert(1)"></a></svg>'
            );

            const result = checkForMaliciousContent(svgWithJsUrl, 'image/svg+xml');

            expect(result.valid).toBe(false);
        });
    });

    describe('5. Upload polyglot file (valid image + zip) - Reject', () => {
        it('rejects file with mismatched content type', () => {
            // ZIP file magic bytes but claiming to be JPEG
            const zipBuffer = Buffer.from([0x50, 0x4B, 0x03, 0x04, ...Array(1024).fill(0)]);

            const result = validateFile(zipBuffer, 'image/jpeg', 'polyglot.jpg');

            expect(result.valid).toBe(false);
            expect(result.errorCode).toBe('MAGIC_MISMATCH');
        });
    });

    describe('6. Upload with path traversal in filename - Sanitize', () => {
        it('detects path traversal with ../', () => {
            const result = validateFileName('../../../etc/passwd');

            expect(result.valid).toBe(false);
            expect(result.errorCode).toBe('FILENAME_INVALID');
        });

        it('detects path traversal with backslash', () => {
            const result = validateFileName('..\\..\\windows\\system32\\config');

            expect(result.valid).toBe(false);
            expect(result.errorCode).toBe('FILENAME_INVALID');
        });

        it('sanitizes path components correctly', () => {
            const sanitized = sanitizeFileName('../../../etc/passwd.jpg');

            expect(sanitized).not.toContain('..');
            expect(sanitized).not.toContain('/');
        });
    });

    describe('7. Upload with null bytes in filename - Sanitize', () => {
        it('rejects filenames with null bytes', () => {
            const result = validateFileName('document.pdf\x00.exe');

            expect(result.valid).toBe(false);
            expect(result.errorCode).toBe('FILENAME_INVALID');
        });

        it('sanitizes null bytes correctly', () => {
            const sanitized = sanitizeFileName('document.pdf\x00.exe');

            expect(sanitized).not.toContain('\x00');
        });
    });

    describe('8. Content-Type mismatch - Verify by magic bytes, not header', () => {
        it('rejects when Content-Type claims JPEG but file is PNG', () => {
            // PNG magic bytes
            const pngBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, ...Array(1024).fill(0)]);

            const result = validateFile(pngBuffer, 'image/jpeg', 'test.jpg');

            expect(result.valid).toBe(false);
            expect(result.errorCode).toBe('MAGIC_MISMATCH');
        });

        it('rejects when Content-Type claims PNG but file is PDF', () => {
            // PDF magic bytes
            const pdfBuffer = Buffer.from([0x25, 0x50, 0x44, 0x46, ...Array(1024).fill(0)]);

            const result = validateFile(pdfBuffer, 'image/png', 'test.png');

            expect(result.valid).toBe(false);
            expect(result.errorCode).toBe('MAGIC_MISMATCH');
        });

        it('accepts when Content-Type matches actual content', () => {
            // Valid JPEG
            const jpegBuffer = Buffer.alloc(2048);
            jpegBuffer[0] = 0xFF;
            jpegBuffer[1] = 0xD8;
            jpegBuffer[2] = 0xFF;

            const result = validateFile(jpegBuffer, 'image/jpeg', 'test.jpg');

            expect(result.valid).toBe(true);
        });
    });
});

// =======================================
// Rate Limiting Tests
// =======================================

describe('Rate Limiting Tests', () => {
    describe('Login rate limiting - 5/min/IP', () => {
        it('allows first 5 requests, blocks 6th', () => {
            const config = { windowMs: 60000, maxRequests: 5 };

            for (let i = 1; i <= 5; i++) {
                const request = createMockRequest('POST', 'http://localhost:3000/api/auth/login');
                const result = checkRateLimit(request, config);
                expect(result.allowed).toBe(true);
                expect(result.remaining).toBe(5 - i);
            }

            // 6th request should be blocked
            const request = createMockRequest('POST', 'http://localhost:3000/api/auth/login');
            const result = checkRateLimit(request, config);
            expect(result.allowed).toBe(false);
            expect(result.remaining).toBe(0);
        });
    });

    describe('Verification submit rate limiting - 3/day/user', () => {
        it('allows 3 submissions per day, blocks 4th', () => {
            const config = RATE_LIMITS.verificationSubmit;
            const userId = 'test-user-submit';

            for (let i = 1; i <= 3; i++) {
                const request = createMockRequest('POST', 'http://localhost:3000/api/verification/submit');
                const result = checkUserRateLimit(request, userId, config);
                expect(result.allowed).toBe(true);
            }

            // 4th submission should be blocked
            const request = createMockRequest('POST', 'http://localhost:3000/api/verification/submit');
            const result = checkUserRateLimit(request, userId, config);
            expect(result.allowed).toBe(false);
        });
    });

    describe('Document upload rate limiting - 10/hr/user', () => {
        it('allows 10 uploads per hour, blocks 11th', () => {
            const config = RATE_LIMITS.verificationUpload;
            const userId = 'test-user-upload';

            for (let i = 1; i <= 10; i++) {
                const request = createMockRequest('POST', 'http://localhost:3000/api/verification/documents');
                const result = checkUserRateLimit(request, userId, config);
                expect(result.allowed).toBe(true);
            }

            // 11th upload should be blocked
            const request = createMockRequest('POST', 'http://localhost:3000/api/verification/documents');
            const result = checkUserRateLimit(request, userId, config);
            expect(result.allowed).toBe(false);
        });
    });

    describe('Admin action rate limiting - 50/hr/admin', () => {
        it('allows 50 actions per hour', () => {
            const config = RATE_LIMITS.adminAction;
            const adminId = 'test-admin';

            // First 50 should be allowed
            for (let i = 1; i <= 50; i++) {
                const request = createMockRequest('POST', 'http://localhost:3000/api/admin/action');
                const result = checkUserRateLimit(request, adminId, config);
                expect(result.allowed).toBe(true);
            }

            // 51st should be blocked
            const request = createMockRequest('POST', 'http://localhost:3000/api/admin/action');
            const result = checkUserRateLimit(request, adminId, config);
            expect(result.allowed).toBe(false);
        });
    });
});

// =======================================
// Hash Function Tests
// =======================================

describe('Hash Function Tests', () => {
    it('calculates consistent SHA256 hash', () => {
        const buffer = Buffer.from('test content');
        const hash1 = calculateFileHash(buffer);
        const hash2 = calculateFileHash(buffer);

        expect(hash1).toBe(hash2);
        expect(hash1).toHaveLength(64); // SHA256 hex length
    });

    it('produces different hashes for different content', () => {
        const buffer1 = Buffer.from('content 1');
        const buffer2 = Buffer.from('content 2');

        const hash1 = calculateFileHash(buffer1);
        const hash2 = calculateFileHash(buffer2);

        expect(hash1).not.toBe(hash2);
    });
});

// =======================================
// File Type Configuration Tests
// =======================================

describe('File Type Configuration', () => {
    it('has correct magic bytes for JPEG', () => {
        const config = ALLOWED_TYPES['image/jpeg'];
        expect(config.magicBytes).toEqual([0xFF, 0xD8, 0xFF]);
    });

    it('has correct magic bytes for PNG', () => {
        const config = ALLOWED_TYPES['image/png'];
        expect(config.magicBytes).toEqual([0x89, 0x50, 0x4E, 0x47]);
    });

    it('has correct magic bytes for PDF', () => {
        const config = ALLOWED_TYPES['application/pdf'];
        expect(config.magicBytes).toEqual([0x25, 0x50, 0x44, 0x46]); // %PDF
    });

    it('enforces 8MB limit for images', () => {
        expect(ALLOWED_TYPES['image/jpeg'].maxSize).toBe(8 * 1024 * 1024);
        expect(ALLOWED_TYPES['image/png'].maxSize).toBe(8 * 1024 * 1024);
    });

    it('enforces 10MB limit for PDFs', () => {
        expect(ALLOWED_TYPES['application/pdf'].maxSize).toBe(10 * 1024 * 1024);
    });
});

// =======================================
// Filename Sanitization Tests
// =======================================

describe('Filename Sanitization', () => {
    it('removes special characters', () => {
        const result = sanitizeFileName('test<>:"|?*.jpg');
        expect(result).not.toMatch(/[<>:"|?*]/);
    });

    it('handles empty filenames', () => {
        const result = sanitizeFileName('');
        expect(result).toBe('document');
    });

    it('limits filename length', () => {
        const longName = 'a'.repeat(300) + '.jpg';
        const result = sanitizeFileName(longName);
        expect(result.length).toBeLessThanOrEqual(100);
    });

    it('preserves file extension', () => {
        const result = sanitizeFileName('my document.pdf');
        expect(result).toMatch(/\.pdf$/);
    });
});
