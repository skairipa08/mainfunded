import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/authz';
import { findCompaniesByStatus } from '@/lib/corporate/company-repo';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import type { CompanyStatus } from '@prisma/client';

export const runtime = 'nodejs';

const VALID_STATUSES: CompanyStatus[] = ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'];

function errResponse(err: any) {
  const message = err?.message || 'Server error';
  const status = err?.statusCode || (message === 'Unauthorized' ? 401 : 500);
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function GET(request: NextRequest) {
  const rl = withRateLimit(request, RATE_LIMITS.api);
  if (rl) return rl;
  try {
    await requireAdmin();
    const url = new URL(request.url);
    const statusParam = (url.searchParams.get('status') || 'PENDING') as CompanyStatus;
    if (!VALID_STATUSES.includes(statusParam)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
    }
    const companies = await findCompaniesByStatus(statusParam);
    return NextResponse.json({
      success: true,
      data: companies,
      meta: { timestamp: new Date().toISOString(), version: '1.0' },
    });
  } catch (err) {
    return errResponse(err);
  }
}
