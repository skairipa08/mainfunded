/**
 * Document Upload Validation & Storage
 * 
 * Handles secure document uploads with:
 * - Magic byte validation
 * - SHA256 hash deduplication
 * - File size limits
 * - Signed URL generation
 */

import crypto from 'crypto';
import { DocumentType } from '@/types/verification';

// =======================================
// File Type Configuration
// =======================================

interface FileTypeConfig {
    magicBytes: number[] | null;
    maxSize: number;
    extensions: string[];
}

export const ALLOWED_TYPES: Record<string, FileTypeConfig> = {
    'image/jpeg': {
        magicBytes: [0xFF, 0xD8, 0xFF],
        maxSize: 8 * 1024 * 1024, // 8MB
        extensions: ['jpg', 'jpeg']
    },
    'image/png': {
        magicBytes: [0x89, 0x50, 0x4E, 0x47],
        maxSize: 8 * 1024 * 1024, // 8MB
        extensions: ['png']
    },
    'application/pdf': {
        magicBytes: [0x25, 0x50, 0x44, 0x46], // %PDF
        maxSize: 10 * 1024 * 1024, // 10MB
        extensions: ['pdf']
    },
    'image/heic': {
        magicBytes: null, // Complex format, check differently
        maxSize: 8 * 1024 * 1024,
        extensions: ['heic', 'heif']
    },
    'image/webp': {
        magicBytes: [0x52, 0x49, 0x46, 0x46], // RIFF
        maxSize: 8 * 1024 * 1024,
        extensions: ['webp']
    }
};

// Document type specific size limits
export const DOCUMENT_SIZE_LIMITS: Record<DocumentType, number> = {
    'STUDENT_ID': 5 * 1024 * 1024,      // 5MB
    'ENROLLMENT_LETTER': 10 * 1024 * 1024, // 10MB
    'GOVERNMENT_ID': 5 * 1024 * 1024,   // 5MB
    'SELFIE_WITH_ID': 5 * 1024 * 1024,  // 5MB
    'TRANSCRIPT': 10 * 1024 * 1024,     // 10MB
    'PROOF_OF_ADDRESS': 5 * 1024 * 1024, // 5MB
    'OTHER': 10 * 1024 * 1024           // 10MB
};

// =======================================
// Validation Functions
// =======================================

export interface ValidationResult {
    valid: boolean;
    error?: string;
    errorCode?: 'INVALID_TYPE' | 'SIZE_EXCEEDED' | 'MAGIC_MISMATCH' | 'EMPTY_FILE' | 'FILENAME_INVALID';
}

/**
 * Validate file based on magic bytes and size
 */
export function validateFile(
    buffer: Buffer,
    claimedMimeType: string,
    fileName: string,
    documentType?: DocumentType
): ValidationResult {
    // Check minimum size
    if (buffer.length < 1024) {
        return { valid: false, error: 'File is empty or too small', errorCode: 'EMPTY_FILE' };
    }

    // Check if mime type is allowed
    const config = ALLOWED_TYPES[claimedMimeType];
    if (!config) {
        return {
            valid: false,
            error: `File type '${claimedMimeType}' is not allowed. Allowed types: ${Object.keys(ALLOWED_TYPES).join(', ')}`,
            errorCode: 'INVALID_TYPE'
        };
    }

    // Check magic bytes
    if (config.magicBytes) {
        const matches = config.magicBytes.every((byte, i) => buffer[i] === byte);
        if (!matches) {
            return {
                valid: false,
                error: 'File content does not match claimed type',
                errorCode: 'MAGIC_MISMATCH'
            };
        }
    }

    // Check file extension
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext && !config.extensions.includes(ext)) {
        return {
            valid: false,
            error: `File extension '.${ext}' does not match expected types for ${claimedMimeType}`,
            errorCode: 'INVALID_TYPE'
        };
    }

    // Check general size limit
    if (buffer.length > config.maxSize) {
        const maxMB = Math.round(config.maxSize / (1024 * 1024));
        return {
            valid: false,
            error: `File exceeds maximum size of ${maxMB}MB`,
            errorCode: 'SIZE_EXCEEDED'
        };
    }

    // Check document-specific size limit
    if (documentType && DOCUMENT_SIZE_LIMITS[documentType]) {
        if (buffer.length > DOCUMENT_SIZE_LIMITS[documentType]) {
            const maxMB = Math.round(DOCUMENT_SIZE_LIMITS[documentType] / (1024 * 1024));
            return {
                valid: false,
                error: `${documentType} documents cannot exceed ${maxMB}MB`,
                errorCode: 'SIZE_EXCEEDED'
            };
        }
    }

    // Validate filename
    const filenameValidation = validateFileName(fileName);
    if (!filenameValidation.valid) {
        return filenameValidation;
    }

    return { valid: true };
}

/**
 * Validate and sanitize filename
 */
export function validateFileName(fileName: string): ValidationResult {
    // Check for null bytes
    if (fileName.includes('\0')) {
        return { valid: false, error: 'Invalid filename', errorCode: 'FILENAME_INVALID' };
    }

    // Check for path traversal
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
        return { valid: false, error: 'Invalid filename', errorCode: 'FILENAME_INVALID' };
    }

    // Check length
    if (fileName.length > 255) {
        return { valid: false, error: 'Filename too long', errorCode: 'FILENAME_INVALID' };
    }

    return { valid: true };
}

/**
 * Sanitize filename for storage
 */
export function sanitizeFileName(fileName: string): string {
    // Remove path components
    let sanitized = fileName.split(/[/\\]/).pop() || 'document';

    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');

    // Keep only safe characters
    sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_');

    // Ensure it's not empty
    if (!sanitized || sanitized === '.') {
        sanitized = 'document';
    }

    // Limit length
    if (sanitized.length > 100) {
        const ext = sanitized.split('.').pop();
        sanitized = sanitized.substring(0, 90) + (ext ? '.' + ext : '');
    }

    return sanitized;
}

// =======================================
// Hash Functions
// =======================================

/**
 * Calculate SHA256 hash of file buffer
 */
export function calculateFileHash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Generate storage path for document
 */
export function generateStoragePath(
    userId: string,
    verificationId: string,
    docId: string,
    mimeType: string
): string {
    const ext = mimeType.split('/')[1] || 'bin';
    return `verifications/${userId}/${verificationId}/${docId}.${ext}`;
}

// =======================================
// Signed URL Generation
// =======================================

const SIGNED_URL_EXPIRY = 15 * 60 * 1000; // 15 minutes

/**
 * Generate a signed URL for document access
 * This is a placeholder - implement with your storage provider (S3, Cloudinary, etc.)
 */
export function generateSignedUrl(
    storagePath: string,
    expiresInMs: number = SIGNED_URL_EXPIRY
): string {
    const expires = Date.now() + expiresInMs;
    const signature = crypto
        .createHmac('sha256', process.env.UPLOAD_SECRET || 'dev-secret')
        .update(`${storagePath}:${expires}`)
        .digest('hex');

    // In production, this would generate an actual signed URL from S3/Cloudinary
    // For now, return a placeholder that can be validated
    return `/api/verification/documents/file/${encodeURIComponent(storagePath)}?expires=${expires}&sig=${signature}`;
}

/**
 * Validate a signed URL
 */
export function validateSignedUrl(
    storagePath: string,
    expires: string,
    signature: string
): boolean {
    const expiresNum = parseInt(expires, 10);

    // Check if expired
    if (Date.now() > expiresNum) {
        return false;
    }

    // Verify signature
    const expectedSig = crypto
        .createHmac('sha256', process.env.UPLOAD_SECRET || 'dev-secret')
        .update(`${storagePath}:${expiresNum}`)
        .digest('hex');

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig));
}

// =======================================
// Image Processing (Metadata Stripping)
// =======================================

/**
 * Check if buffer contains potential malicious content
 * Basic checks - in production use a proper security scanner
 */
export function checkForMaliciousContent(buffer: Buffer, mimeType: string): ValidationResult {
    const content = buffer.toString('utf8', 0, Math.min(buffer.length, 10000));

    // Check for embedded scripts in images
    if (mimeType.startsWith('image/')) {
        const dangerousPatterns = [
            '<script',
            '<?php',
            '<%',
            'javascript:',
            'data:text/html',
            'onerror=',
            'onload='
        ];

        for (const pattern of dangerousPatterns) {
            if (content.toLowerCase().includes(pattern.toLowerCase())) {
                return { valid: false, error: 'Potentially malicious content detected' };
            }
        }
    }

    // Check for SVG with scripts
    if (mimeType === 'image/svg+xml') {
        if (content.includes('<script') || content.includes('javascript:')) {
            return { valid: false, error: 'SVG with scripts not allowed' };
        }
    }

    return { valid: true };
}

// =======================================
// Upload Response Types
// =======================================

export interface UploadResult {
    success: boolean;
    docId?: string;
    storagePath?: string;
    sha256Hash?: string;
    error?: string;
    errorCode?: string;
    isDuplicate?: boolean;
    duplicateVerificationId?: string;
}
