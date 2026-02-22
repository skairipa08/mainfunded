export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/authz';
import { successResponse, handleRouteError } from '@/lib/api-response';

/**
 * GET /api/admin/sponsor-applications
 * Admin: list all sponsor applications with status filter + pagination
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

    const totalCount = await db.collection('sponsor_applications').countDocuments(query);

    const applications = await db
      .collection('sponsor_applications')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Convert _id to string for JSON serialization
    const serialized = applications.map((app) => ({
      ...app,
      _id: app._id.toString(),
    }));

    return successResponse({
      applications: serialized,
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
