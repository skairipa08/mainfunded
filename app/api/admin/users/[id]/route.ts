import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/authz';
import { errorResponse, getStatusCode } from '@/lib/api-error';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { ObjectId } from 'mongodb';

export async function DELETE(
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
    
    // Prevent self-deletion
    if (id === admin.id) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Cannot delete yourself' } },
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
    
    // Check for existing campaigns (prevent orphaned campaigns)
    const campaignCount = await db.collection('campaigns').countDocuments(
      { owner_id: id },
      { limit: 1 }
    );
    
    if (campaignCount > 0) {
      return NextResponse.json(
        { error: { code: 'CONFLICT', message: 'Cannot delete user with existing campaigns. Delete or transfer campaigns first.' } },
        { status: 409 }
      );
    }
    
    // Soft delete on adapter users collection
    await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { $set: { deleted: true, deletedAt: new Date() } }
    );
    
    // Delete NextAuth sessions
    await db.collection('sessions').deleteMany({ userId: id });
    
    return NextResponse.json({
      success: true,
      message: 'User deleted',
    });
  } catch (error: any) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      errorResponse(error),
      { status: getStatusCode(error) }
    );
  }
}
