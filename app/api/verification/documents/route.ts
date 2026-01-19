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
    generateSignedUrl,
    checkForMaliciousContent,
    DocumentType,
    DOCUMENT_TYPES
} from '@/lib/verification';
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
            view_url: generateSignedUrl(doc.storage_path)
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
        const storagePath = generateStoragePath(user.id, verificationId, docId, file.type);
        const safeFileName = sanitizeFileName(file.name);

        // TODO: Actually upload to storage (S3/Cloudinary)
        // For now, we just create the record
        // await uploadToStorage(storagePath, buffer);

        // Create document record
        const document = await createDocumentRecord(verificationId, user.id, {
            document_type: documentType,
            storage_path: storagePath,
            file_name: safeFileName,
            mime_type: file.type,
            file_size_bytes: buffer.length,
            sha256_hash: sha256Hash,
            is_verified: false
        });

        if (!document) {
            return NextResponse.json(
                { error: 'Failed to save document record' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: 'Document uploaded successfully',
            document: {
                ...document,
                view_url: generateSignedUrl(storagePath)
            },
            warnings: duplicateCheck.isDuplicate
                ? ['This document appears to be a duplicate']
                : undefined
        }, { status: 201 });
    } catch (error) {
        return handleAuthError(error);
    }
}
