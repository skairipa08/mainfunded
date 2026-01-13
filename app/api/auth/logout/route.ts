import { NextRequest, NextResponse } from 'next/server';
import { signOut } from '@/auth';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = withRateLimit(request, RATE_LIMITS.auth);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    await signOut({ redirect: false });
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
