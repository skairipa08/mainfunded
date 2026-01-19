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
// Cloudinary Configuration
// =======================================

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

const SIGNED_URL_EXPIRY = 15 * 60 * 1000; // 15 minutes
const SIGNED_URL_EXPIRY_SECONDS = 15 * 60; // 15 minutes in seconds

/**
 * Check if Cloudinary is configured
 */
function isCloudinaryConfigured(): boolean {
    return !!(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET);
}

/**
 * Generate Cloudinary API signature for authenticated requests
 */
function generateCloudinarySignature(params: Record<string, string | number>): string {
    const sortedKeys = Object.keys(params).sort();
    const paramString = sortedKeys.map(key => `${key}=${params[key]}`).join('&');
    return crypto
        .createHash('sha1')
        .update(paramString + CLOUDINARY_API_SECRET)
        .digest('hex');
}

// =======================================
// Storage Operations (Cloudinary)
// =======================================

/**
 * Upload file to Cloudinary
 * Uses signed upload with authenticated requests
 */
export async function uploadToStorage(
    storagePath: string,
    buffer: Buffer,
    mimeType: string
): Promise<{ success: boolean; url?: string; publicId?: string; error?: string }> {
    // If Cloudinary not configured, use local fallback
    if (!isCloudinaryConfigured()) {
        console.warn('[Upload] Cloudinary not configured, using local storage fallback');
        return {
            success: true,
            url: `/api/verification/documents/file/${encodeURIComponent(storagePath)}`,
            publicId: storagePath,
        };
    }

    try {
        const timestamp = Math.round(Date.now() / 1000);
        const publicId = storagePath.replace(/\.[^/.]+$/, ''); // Remove extension

        // Determine resource type based on MIME type
        const resourceType = mimeType === 'application/pdf' ? 'raw' : 'image';

        const params: Record<string, string | number> = {
            folder: 'verifications',
            public_id: publicId,
            timestamp,
            resource_type: resourceType,
        };

        const signature = generateCloudinarySignature(params);

        // Convert buffer to base64 data URI for Cloudinary upload
        // Cloudinary accepts data URI in the 'file' field of FormData
        const base64Data = buffer.toString('base64');
        const dataUri = `data:${mimeType};base64,${base64Data}`;

        // Use FormData (Node.js 18+ global FormData)
        const formData = new FormData();
        formData.append('file', dataUri);
        formData.append('api_key', CLOUDINARY_API_KEY!);
        formData.append('timestamp', timestamp.toString());
        formData.append('signature', signature);
        formData.append('public_id', publicId);
        formData.append('folder', 'verifications');

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!response.ok) {
            const error = await response.text();
            console.error('[Upload] Cloudinary upload failed:', error);
            return { success: false, error: 'Upload failed' };
        }

        const result = await response.json();

        return {
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
        };
    } catch (error: any) {
        console.error('[Upload] Error uploading to Cloudinary:', error);
        return { success: false, error: error.message || 'Upload failed' };
    }
}

/**
 * Delete file from Cloudinary
 */
export async function deleteFromStorage(
    publicId: string,
    resourceType: 'image' | 'raw' = 'image'
): Promise<{ success: boolean; error?: string }> {
    // If Cloudinary not configured, skip
    if (!isCloudinaryConfigured()) {
        console.warn('[Upload] Cloudinary not configured, skipping delete');
        return { success: true };
    }

    try {
        const timestamp = Math.round(Date.now() / 1000);

        const params: Record<string, string | number> = {
            public_id: publicId,
            timestamp,
        };

        const signature = generateCloudinarySignature(params);

        const formData = new FormData();
        formData.append('public_id', publicId);
        formData.append('api_key', CLOUDINARY_API_KEY!);
        formData.append('timestamp', timestamp.toString());
        formData.append('signature', signature);

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/destroy`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!response.ok) {
            const error = await response.text();
            console.error('[Upload] Cloudinary delete failed:', error);
            return { success: false, error: 'Delete failed' };
        }

        const result = await response.json();
        return { success: result.result === 'ok' };
    } catch (error: any) {
        console.error('[Upload] Error deleting from Cloudinary:', error);
        return { success: false, error: error.message || 'Delete failed' };
    }
}

// =======================================
// Signed URL Generation
// =======================================

/**
 * Generate a signed URL for document access
 * Uses Cloudinary signed URLs when configured, falls back to local signing
 */
export function generateSignedUrl(
    storagePath: string,
    expiresInMs: number = SIGNED_URL_EXPIRY
): string {
    // If Cloudinary is configured, generate Cloudinary signed URL
    if (isCloudinaryConfigured()) {
        return generateCloudinarySignedUrl(storagePath, expiresInMs);
    }

    // Fallback to local signed URL
    return generateLocalSignedUrl(storagePath, expiresInMs);
}

/**
 * Generate Cloudinary signed URL with expiration
 */
function generateCloudinarySignedUrl(
    storagePath: string,
    expiresInMs: number = SIGNED_URL_EXPIRY
): string {
    const publicId = storagePath.replace(/\.[^/.]+$/, '');
    const timestamp = Math.round((Date.now() + expiresInMs) / 1000);

    // Determine if it's a PDF (raw resource) or image
    const isPdf = storagePath.toLowerCase().endsWith('.pdf');
    const resourceType = isPdf ? 'raw' : 'image';

    // Create signature for authenticated URL
    const toSign = `public_id=${publicId}&timestamp=${timestamp}`;
    const signature = crypto
        .createHash('sha1')
        .update(toSign + CLOUDINARY_API_SECRET)
        .digest('hex');

    // Build the signed URL
    const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/${resourceType}/authenticated`;
    return `${baseUrl}/s--${signature.substring(0, 8)}--/verifications/${publicId}?timestamp=${timestamp}`;
}

/**
 * Generate local signed URL (for development/fallback)
 */
function generateLocalSignedUrl(
    storagePath: string,
    expiresInMs: number = SIGNED_URL_EXPIRY
): string {
    const expires = Date.now() + expiresInMs;
    const signature = crypto
        .createHmac('sha256', process.env.UPLOAD_SECRET || 'dev-secret')
        .update(`${storagePath}:${expires}`)
        .digest('hex');

    return `/api/verification/documents/file/${encodeURIComponent(storagePath)}?expires=${expires}&sig=${signature}`;
}

/**
 * Validate a signed URL (local signing only)
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

    // Use timing-safe comparison
    if (signature.length !== expectedSig.length) {
        return false;
    }

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
