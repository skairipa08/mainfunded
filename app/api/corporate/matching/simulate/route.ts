import { NextRequest, NextResponse } from 'next/server';
import { requireApprovedCompanyOwner } from '@/lib/authz';
import { findRuleByCompany } from '@/lib/corporate/matching-rule-repo';
import { simulateSchema } from '@/lib/corporate/validators';
import { simulate } from '@/lib/corporate/matching-engine';
import { getSpentInPeriod } from '@/lib/corporate/budget';
import { periodKey } from '@/lib/corporate/period';
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
    const { company } = await requireApprovedCompanyOwner();
    const body = await request.json();
    const parsed = simulateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const rule = await findRuleByCompany(company.id);
    if (!rule) {
      return NextResponse.json(
        { success: false, error: 'NO_RULE_DEFINED' },
        { status: 404 }
      );
    }

    // Phase 2: real `spentInPeriodTRY` from APPROVED transactions in current period.
    const period = periodKey(new Date());
    const spent = await getSpentInPeriod(company.id, period);
    const result = simulate({
      donationAmountTRY: parsed.data.donationAmountTRY,
      category: parsed.data.category,
      rule,
      spentInPeriodTRY: spent,
    });

    return NextResponse.json({
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString(), version: '1.0' },
    });
  } catch (err) {
    return errResponse(err);
  }
}
