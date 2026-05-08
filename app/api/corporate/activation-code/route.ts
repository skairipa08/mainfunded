import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApprovedCompanyOwner } from '@/lib/authz';
import { generateActivationCode } from '@/lib/corporate/activation-code';
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
    return NextResponse.json({
      success: true,
      data: { activationCode: company.activationCode ?? null },
      meta: { timestamp: new Date().toISOString(), version: '1.0' },
    });
  } catch (err) {
    return errResponse(err);
  }
}

/** Rotate (or initialize) the activation code. Up to 5 retries on collision. */
export async function POST(request: NextRequest) {
  const rl = withRateLimit(request, RATE_LIMITS.api);
  if (rl) return rl;
  try {
    const { company } = await requireApprovedCompanyOwner();
    let lastErr: any;
    for (let i = 0; i < 5; i++) {
      const code = generateActivationCode();
      try {
        const updated = await prisma.company.update({
          where: { id: company.id },
          data: { activationCode: code },
        });
        return NextResponse.json({
          success: true,
          data: { activationCode: updated.activationCode },
          meta: { timestamp: new Date().toISOString(), version: '1.0' },
        });
      } catch (e: any) {
        lastErr = e;
        // Prisma unique constraint conflict — try again
        if (e?.code !== 'P2002') throw e;
      }
    }
    throw lastErr || new Error('CODE_GENERATION_FAILED');
  } catch (err) {
    return errResponse(err);
  }
}
