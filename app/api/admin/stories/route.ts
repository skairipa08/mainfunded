export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/authz';
import { successResponse, handleRouteError } from '@/lib/api-response';

/**
 * GET /api/admin/stories
 * Admin: list all stories with status filter + pagination
 */
export async function GET(request: NextRequest) {
    try {
        await requireAdmin();

        const db = await getDb();
        const { searchParams } = new URL(request.url);

        const status = searchParams.get('status') || '';
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));
        const skip = (page - 1) * limit;

        const query: any = {};
        if (status && status !== 'all') {
            query.status = status;
        }

        const totalCount = await db.collection('success_stories').countDocuments(query);

        const stories = await db.collection('success_stories')
            .find(query, { projection: { _id: 0 } })
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();

        return successResponse({
            stories,
            pagination: {
                page,
                limit,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit),
            },
        });
    } catch (error) {
        return handleRouteError(error);
    }
}
