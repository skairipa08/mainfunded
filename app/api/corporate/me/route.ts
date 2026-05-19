import { NextRequest, NextResponse } from 'next/server';
import { requireCompanyOwner, requireApprovedCompanyOwner } from '@/lib/authz';
import { findRuleByCompany } from '@/lib/corporate/matching-rule-repo';
import { updateCompanyProfile } from '@/lib/corporate/company-repo';
import { profileUpdateSchema } from '@/lib/corporate/validators';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export const runtime = 'nodejs';

function errResponse(err: any) {
  const message = err?.message || 'Server error';
  const status = err?.statusCode || (message === 'Unauthorized' ? 401 : 500);
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function GET(request: NextRequest) {
  const rl = withRateLimit(request, RATE_LIMITS.api);
  if (rl) return rl;
  try {
    const { company } = await requireCompanyOwner();
    const matchingRule = await findRuleByCompany(company.id);
    return NextResponse.json({
      success: true,
      data: { company, matchingRule },
      meta: { timestamp: new Date().toISOString(), version: '1.0' },
    });
  } catch (err) {
    return errResponse(err);
  }
}

export async function PATCH(request: NextRequest) {
  const rl = withRateLimit(request, RATE_LIMITS.api);
  if (rl) return rl;
  try {
    const { company } = await requireApprovedCompanyOwner();
    const body = await request.json();
    const parsed = profileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const updated = await updateCompanyProfile(company.id, parsed.data as any);
    return NextResponse.json({
      success: true,
      data: updated,
      meta: { timestamp: new Date().toISOString(), version: '1.0' },
    });
  } catch (err) {
    return errResponse(err);
  }
}
