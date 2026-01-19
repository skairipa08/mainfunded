/**
 * Admin Verification Detail API
 * 
 * GET /api/admin/verifications/[id] - Get verification details
 */

import { NextRequest, NextResponse } from 'next/server';
import {
    requireAdmin,
    handleAuthError,
    getVerificationDetail,
    generateSignedUrl
} from '@/lib/verification';

interface Params {
    params: {
        id: string;
    };
}

/**
 * GET /api/admin/verifications/[id]
 * Get full verification detail with documents, events, notes
 */
export async function GET(request: NextRequest, { params }: Params) {
    try {
        await requireAdmin();

        const { id } = params;

        if (!id) {
            return NextResponse.json({ error: 'Verification ID required' }, { status: 400 });
        }

        const detail = await getVerificationDetail(id);

        if (!detail) {
            return NextResponse.json({ error: 'Verification not found' }, { status: 404 });
        }

        // Add signed URLs to documents
        const documentsWithUrls = detail.documents.map(doc => ({
            ...doc,
            view_url: generateSignedUrl(doc.storage_path)
        }));

        return NextResponse.json({
            verification: {
                ...detail,
                documents: documentsWithUrls
            }
        });
    } catch (error) {
        return handleAuthError(error);
    }
}
