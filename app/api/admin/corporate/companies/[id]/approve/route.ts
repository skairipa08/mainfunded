import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/authz';
import {
  findCompanyById,
  approveCompany,
  rejectCompany,
} from '@/lib/corporate/company-repo';
import { approveDecisionSchema } from '@/lib/corporate/validators';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export const runtime = 'nodejs';

function errResponse(err: any) {
  const message = err?.message || 'Server error';
  const status = err?.statusCode || (message === 'Unauthorized' ? 401 : 500);
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const rl = withRateLimit(request, RATE_LIMITS.api);
  if (rl) return rl;
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const parsed = approveDecisionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await findCompanyById(params.id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'COMPANY_NOT_FOUND' },
        { status: 404 }
      );
    }

    const updated =
      parsed.data.decision === 'APPROVE'
        ? await approveCompany(params.id, admin.id)
        : await rejectCompany(params.id, parsed.data.reason!);

    return NextResponse.json({
      success: true,
      data: updated,
      meta: { timestamp: new Date().toISOString(), version: '1.0' },
    });
  } catch (err) {
    return errResponse(err);
  }
}
