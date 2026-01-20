/**
 * Admin Verification Queue API
 * 
 * GET /api/admin/verifications - Get verification queue
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
    requireAdmin,
    handleAuthError,
    getVerificationQueue,
    VerificationStatusType,
    VERIFICATION_STATUSES
} from '@/lib/verification';

/**
 * GET /api/admin/verifications
 * Get verification queue with filters
 */
export async function GET(request: NextRequest) {
    try {
        await requireAdmin();

        const { searchParams } = new URL(request.url);

        // Parse filters
        const statusParam = searchParams.get('status');
        const status = statusParam
            ? statusParam.split(',').filter(s => VERIFICATION_STATUSES.includes(s as any)) as VerificationStatusType[]
            : undefined;

        const assignedTo = searchParams.get('assigned_to') || undefined;
        const minRiskScore = searchParams.get('min_risk')
            ? parseInt(searchParams.get('min_risk')!, 10)
            : undefined;
        const search = searchParams.get('search') || undefined;

        // Pagination
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);

        // Sorting
        const sortField = searchParams.get('sort') || 'submitted_at';
        const sortOrder = (searchParams.get('order') || 'asc') as 'asc' | 'desc';

        const result = await getVerificationQueue(
            { status, assignedTo, minRiskScore, search },
            { page, limit },
            { field: sortField, order: sortOrder }
        );

        return NextResponse.json({
            items: result.items,
            total: result.total,
            page,
            limit,
            totalPages: Math.ceil(result.total / limit)
        });
    } catch (error) {
        return handleAuthError(error);
    }
}
