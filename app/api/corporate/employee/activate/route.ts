import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/authz';
import { activateAffiliation, findAffiliationByUser } from '@/lib/corporate/affiliation-repo';
import { isValidActivationCodeShape } from '@/lib/corporate/activation-code';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const bodySchema = z.object({ code: z.string().trim().toUpperCase() }).strict();

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
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success || !isValidActivationCodeShape(parsed.data.code)) {
      return NextResponse.json({ success: false, error: 'INVALID_CODE' }, { status: 400 });
    }

    const company = await prisma.company.findUnique({
      where: { activationCode: parsed.data.code },
    });
    if (!company) {
      return NextResponse.json({ success: false, error: 'INVALID_CODE' }, { status: 400 });
    }
    if (company.status !== 'APPROVED') {
      return NextResponse.json(
        { success: false, error: 'COMPANY_NOT_APPROVED' },
        { status: 400 }
      );
    }

    // Already affiliated to a *different* active company?
    const existing = await findAffiliationByUser(user.id);
    if (existing && existing.active && existing.companyId !== company.id) {
      return NextResponse.json(
        { success: false, error: 'ALREADY_AFFILIATED' },
        { status: 409 }
      );
    }

    const affiliation = await activateAffiliation(user.id, company.id);
    return NextResponse.json({
      success: true,
      data: { companyId: company.id, companyName: company.name, affiliationId: affiliation.id },
      meta: { timestamp: new Date().toISOString(), version: '1.0' },
    });
  } catch (err) {
    return errResponse(err);
  }
}
