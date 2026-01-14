import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireUser } from '@/lib/authz';
import { errorResponse, getStatusCode } from '@/lib/api-error';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    
    const db = await getDb();
    
    // Get campaigns owned by canonical user.id
    const campaigns = await db.collection('campaigns')
      .find(
        { owner_id: user.id }, // Canonical NextAuth user.id
        { projection: { _id: 0 } }
      )
      .sort({ created_at: -1 })
      .limit(100)
      .toArray();
    
    return NextResponse.json({
      success: true,
      data: campaigns,
    });
  } catch (error: any) {
    console.error('My campaigns GET error:', error);
    return NextResponse.json(
      errorResponse(error),
      { status: getStatusCode(error) }
    );
  }
}
