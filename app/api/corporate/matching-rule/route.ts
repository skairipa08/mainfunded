import { NextRequest, NextResponse } from 'next/server';
import { requireApprovedCompanyOwner } from '@/lib/authz';
import {
  findRuleByCompany,
  upsertRule,
} from '@/lib/corporate/matching-rule-repo';
import { matchingRuleSchema } from '@/lib/corporate/validators';
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
    const { company } = await requireApprovedCompanyOwner();
    const rule = await findRuleByCompany(company.id);
    return NextResponse.json({
      success: true,
      data: rule,
      meta: { timestamp: new Date().toISOString(), version: '1.0' },
    });
  } catch (err) {
    return errResponse(err);
  }
}

export async function PUT(request: NextRequest) {
  const rl = withRateLimit(request, RATE_LIMITS.api);
  if (rl) return rl;
  try {
    const { company } = await requireApprovedCompanyOwner();
    const body = await request.json();
    const parsed = matchingRuleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const updated = await upsertRule(company.id, parsed.data);
    return NextResponse.json({
      success: true,
      data: updated,
      meta: { timestamp: new Date().toISOString(), version: '1.0' },
    });
  } catch (err) {
    return errResponse(err);
  }
}
