import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/authz';
import { errorResponse, getStatusCode } from '@/lib/api-error';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { ObjectId } from 'mongodb';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Rate limiting
  const rateLimitResponse = withRateLimit(request, RATE_LIMITS.admin);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const admin = await requireAdmin();
    const { id } = params;
    const body = await request.json();
    const newRole = body.role;
    
    if (!['user', 'admin'].includes(newRole)) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid role. Must be "user" or "admin"' } },
        { status: 400 }
      );
    }
    
    // Prevent self-demotion
    if (id === admin.id && newRole !== 'admin') {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Cannot demote yourself' } },
        { status: 400 }
      );
    }
    
    const db = await getDb();
    
    // Find user by canonical ID
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(id) },
      { projection: { _id: 1 } }
    );
    
    if (!user) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }
    
    // Update role on adapter users collection
    await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { $set: { role: newRole } }
    );
    
    return NextResponse.json({
      success: true,
      message: `User role updated to ${newRole}`,
    });
  } catch (error: any) {
    console.error('Update user role error:', error);
    return NextResponse.json(
      errorResponse(error),
      { status: getStatusCode(error) }
    );
  }
}
