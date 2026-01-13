import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/authz';
import { errorResponse, getStatusCode } from '@/lib/api-error';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = withRateLimit(request, RATE_LIMITS.admin);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    await requireAdmin();
    
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '50'));
    
    const query: any = { deleted: { $ne: true } };
    if (role) {
      query.role = role;
    }
    
    const skip = (page - 1) * limit;
    const users = await db.collection('users')
      .find(query, { projection: { _id: 0, password: 0 } })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    const total = await db.collection('users').countDocuments(query);
    
    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit) || 0,
      },
    });
  } catch (error: any) {
    console.error('Admin users GET error:', error);
    return NextResponse.json(
      errorResponse(error),
      { status: getStatusCode(error) }
    );
  }
}
