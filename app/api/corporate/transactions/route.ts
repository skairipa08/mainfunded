import { NextRequest, NextResponse } from 'next/server';
import { requireApprovedCompanyOwner } from '@/lib/authz';
import { findTransactionsByCompany } from '@/lib/corporate/transaction-repo';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import type { MatchingStatus } from '@prisma/client';

export const runtime = 'nodejs';

const VALID_STATUSES: MatchingStatus[] = ['PENDING', 'APPROVED', 'REJECTED'];

function errResponse(err: any) {
  const message = err?.message || 'Server error';
  const status = err?.statusCode || (message === 'Unauthorized' ? 401 : 500);
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function GET(request: NextRequest) {
  const rl = withRateLimit(request, RATE_LIMITS.api);
  if (rl) return rl;
  try {
    const { company } = await requireApprovedCompanyOwner();
    const url = new URL(request.url);
    const statusParam = url.searchParams.get('status') as MatchingStatus | null;
    if (statusParam && !VALID_STATUSES.includes(statusParam)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
    }
    const txs = await findTransactionsByCompany(company.id, statusParam ?? undefined);
    return NextResponse.json({
      success: true,
      data: txs,
      meta: { timestamp: new Date().toISOString(), version: '1.0' },
    });
  } catch (err) {
    return errResponse(err);
  }
}
