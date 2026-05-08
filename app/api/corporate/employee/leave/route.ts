import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/authz';
import { deactivateAffiliation } from '@/lib/corporate/affiliation-repo';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export const runtime = 'nodejs';

function errResponse(err: any) {
  const message = err?.message || 'Server error';
  const status = err?.statusCode || (message === 'Unauthorized' ? 401 : 500);
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function POST(request: NextRequest) {
  const rl = withRateLimit(request, RATE_LIMITS.api);
  if (rl) return rl;
  try {
    const user = await requireUser();
    const result = await deactivateAffiliation(user.id);
    if (!result) {
      return NextResponse.json({ success: false, error: 'NO_AFFILIATION' }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      data: { active: false },
      meta: { timestamp: new Date().toISOString(), version: '1.0' },
    });
  } catch (err) {
    return errResponse(err);
  }
}
