/**
 * Document Upload API
 * 
 * GET  /api/verification/documents - List documents for verification
 * POST /api/verification/documents - Upload a new document
 */

import { NextRequest, NextResponse } from 'next/server';
import {
    requireStudent,
    handleAuthError,
    requireVerificationOwnership,
    getDocumentsForVerification,
    createDocumentRecord,
    checkDocumentDuplicate,
    addRiskFlag,
    validateFile,
    calculateFileHash,
    sanitizeFileName,
    generateStoragePath,
    checkForMaliciousContent,
    DocumentType,
    DOCUMENT_TYPES
} from '@/lib/verification';
import { storage } from '@/lib/storage';
import { processImage, generateThumbnail } from '@/lib/storage/image-processing';
import crypto from 'crypto';

/**
 * GET /api/verification/documents
 * List documents for the user's verification
 */
export async function GET(request: NextRequest) {
    try {
        const user = await requireStudent();

        const { searchParams } = new URL(request.url);
        const verificationId = searchParams.get('verification_id');

        if (!verificationId) {
            return NextResponse.json(
                { error: 'verification_id is required' },
                { status: 400 }
            );
        }

        // Verify ownership
        await requireVerificationOwnership(verificationId, user.id);

        const documents = await getDocumentsForVerification(verificationId, user.id);

        // Add signed URLs for viewing
        const docsWithUrls = documents.map(doc => ({
            ...doc,
            view_url: storage.getSignedUrl(doc.storage_path)
        }));

        return NextResponse.json({ documents: docsWithUrls });
    } catch (error) {
        return handleAuthError(error);
    }
}

/**
 * POST /api/verification/documents
 * Upload a new document
 */
export async function POST(request: NextRequest) {
    try {
        const user = await requireStudent();

        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const verificationId = formData.get('verification_id') as string | null;
        const documentType = formData.get('document_type') as DocumentType | null;

        // Validate required fields
        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (!verificationId) {
            return NextResponse.json({ error: 'verification_id is required' }, { status: 400 });
        }

        if (!documentType || !DOCUMENT_TYPES.includes(documentType)) {
            return NextResponse.json(
                { error: `Invalid document_type. Must be one of: ${DOCUMENT_TYPES.join(', ')}` },
                { status: 400 }
            );
        }

        // Verify ownership and status
        const verification = await requireVerificationOwnership(verificationId, user.id);

        if (!['DRAFT', 'NEEDS_MORE_INFO'].includes(verification.status)) {
            return NextResponse.json(
                { error: 'Cannot upload documents in current status' },
                { status: 403 }
            );
        }

        // Read file buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // Validate file
        const validation = validateFile(buffer, file.type, file.name, documentType);
        if (!validation.valid) {
            return NextResponse.json(
                { error: validation.error, code: validation.errorCode },
                { status: 400 }
            );
        }

        // Check for malicious content
        const securityCheck = checkForMaliciousContent(buffer, file.type);
        if (!securityCheck.valid) {
            return NextResponse.json(
                { error: securityCheck.error },
                { status: 400 }
            );
        }

        // Calculate hash
        const sha256Hash = calculateFileHash(buffer);

        // Check for duplicates
        const duplicateCheck = await checkDocumentDuplicate(sha256Hash, verificationId);
        if (duplicateCheck.isDuplicate) {
            // Flag the verification but allow upload
            await addRiskFlag(verificationId, 'DUPLICATE_DOCUMENT', user.id);
        }

        // Generate storage path
        const docId = crypto.randomUUID();
        const safeFileName = sanitizeFileName(file.name);

        // Process images: strip EXIF metadata and re-encode for security
        let uploadBuffer = buffer;
        let uploadMimeType = file.type;

        if (file.type.startsWith('image/')) {
            const processed = await processImage(buffer, file.type);
            if (!processed) {
                return NextResponse.json(
                    { error: 'Image could not be processed. The file may be corrupted.' },
                    { status: 400 }
                );
            }
            uploadBuffer = Buffer.from(processed.buffer);
            uploadMimeType = processed.mimeType;
        }

        const storagePath = generateStoragePath(user.id, verificationId, docId, uploadMimeType);

        // Upload to Cloudinary (or local fallback in dev)
        const uploadResult = await storage.upload(uploadBuffer, storagePath, uploadMimeType);
        if (!uploadResult.success) {
            return NextResponse.json(
                { error: 'Failed to upload file to storage' },
                { status: 500 }
            );
        }

        // Generate thumbnail for admin preview (non-blocking, best-effort)
        let thumbnailUrl: string | undefined;
        if (file.type.startsWith('image/')) {
            const thumb = await generateThumbnail(uploadBuffer, uploadMimeType);
            if (thumb) {
                const thumbPath = generateStoragePath(user.id, verificationId, `${docId}_thumb`, 'image/jpeg');
                const thumbResult = await storage.upload(thumb, thumbPath, 'image/jpeg');
                if (thumbResult.success) {
                    thumbnailUrl = thumbResult.url;
                }
            }
        }

        // Create document record in database
        const document = await createDocumentRecord(verificationId, user.id, {
            document_type: documentType,
            storage_path: storagePath,
            file_name: safeFileName,
            mime_type: uploadMimeType,
            file_size_bytes: uploadBuffer.length,
            sha256_hash: sha256Hash,
            is_verified: false
        });

        if (!document) {
            // Cleanup: delete the uploaded file since DB write failed
            const publicId = storagePath.replace(/\.[^/.]+$/, '');
            await storage.delete(publicId, uploadMimeType === 'application/pdf' ? 'raw' : 'image');
            return NextResponse.json(
                { error: 'Failed to save document record' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: 'Document uploaded successfully',
            document: {
                ...document,
                view_url: storage.getSignedUrl(storagePath),
                thumbnail_url: thumbnailUrl
            },
            warnings: duplicateCheck.isDuplicate
                ? ['This document appears to be a duplicate']
                : undefined
        }, { status: 201 });
    } catch (error) {
        return handleAuthError(error);
    }
}
