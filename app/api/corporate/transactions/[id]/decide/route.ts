import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireApprovedCompanyOwner } from '@/lib/authz';
import {
  approveTransaction,
  findTransactionById,
  rejectTransaction,
} from '@/lib/corporate/transaction-repo';
import { simulate } from '@/lib/corporate/matching-engine';
import { getSpentInPeriod } from '@/lib/corporate/budget';
import { sendBudgetAlert } from '@/lib/corporate/email-sender';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const decideSchema = z
  .object({
    decision: z.enum(['APPROVE', 'REJECT']),
    reason: z.string().trim().min(1).max(1000).optional(),
    ownerNote: z.string().trim().max(1000).optional(),
  })
  .strict()
  .refine(
    (v) => v.decision === 'APPROVE' || (v.decision === 'REJECT' && !!v.reason),
    { message: 'reason required when REJECT', path: ['reason'] }
  );

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
    const { company } = await requireApprovedCompanyOwner();
    const body = await request.json();
    const parsed = decideSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const tx = await findTransactionById(params.id);
    if (!tx) {
      return NextResponse.json({ success: false, error: 'NOT_FOUND' }, { status: 404 });
    }
    if (tx.companyId !== company.id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    if (tx.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, error: 'ALREADY_DECIDED' },
        { status: 409 }
      );
    }

    if (parsed.data.decision === 'REJECT') {
      const updated = await rejectTransaction(
        params.id,
        parsed.data.reason!,
        parsed.data.ownerNote
      );
      return NextResponse.json({
        success: true,
        data: updated,
        meta: { timestamp: new Date().toISOString(), version: '1.0' },
      });
    }

    // APPROVE: re-run simulate against fresh budget to prevent over-spend
    const rule = await prisma.matchingRule.findUnique({ where: { companyId: company.id } });
    if (!rule) {
      return NextResponse.json(
        { success: false, error: 'NO_RULE_DEFINED' },
        { status: 400 }
      );
    }
    const spent = await getSpentInPeriod(company.id, tx.periodKey);
    const sim = simulate({
      donationAmountTRY: tx.donationAmountTRY,
      category: tx.category,
      rule,
      spentInPeriodTRY: spent,
    });
    if (!sim.matched) {
      // Budget vanished while pending — auto-reject
      const updated = await rejectTransaction(
        params.id,
        'BUDGET_EXHAUSTED_AT_APPROVAL',
        parsed.data.ownerNote
      );
      return NextResponse.json({
        success: true,
        data: updated,
        meta: { timestamp: new Date().toISOString(), version: '1.0' },
      });
    }

    const updated = await approveTransaction(params.id, parsed.data.ownerNote);

    // Threshold email — idempotent via Company.budgetAlertSentAt[periodKey]
    try {
      const newSpent = spent + tx.matchedAmountTRY;
      const limit = rule.monthlyBudgetTRY;
      const pct = newSpent / limit;
      const co = await prisma.company.findUnique({ where: { id: company.id } });
      const flagsObj = ((co?.budgetAlertSentAt as any) ?? {}) as Record<string, any>;
      const periodFlags = (flagsObj[tx.periodKey] as any) ?? {};
      let dirty = false;
      if (pct >= 1.0 && !periodFlags.threshold100) {
        await sendBudgetAlert(
          '100',
          { contactEmail: co!.contactEmail, name: co!.name },
          tx.periodKey,
          newSpent,
          limit
        );
        periodFlags.threshold100 = true;
        dirty = true;
      } else if (pct >= 0.8 && !periodFlags.threshold80) {
        await sendBudgetAlert(
          '80',
          { contactEmail: co!.contactEmail, name: co!.name },
          tx.periodKey,
          newSpent,
          limit
        );
        periodFlags.threshold80 = true;
        dirty = true;
      }
      if (dirty) {
        flagsObj[tx.periodKey] = periodFlags;
        await prisma.company.update({
          where: { id: company.id },
          data: { budgetAlertSentAt: flagsObj },
        });
      }
    } catch {
      // never fail approval because of email/threshold side effects
    }

    return NextResponse.json({
      success: true,
      data: updated,
      meta: { timestamp: new Date().toISOString(), version: '1.0' },
    });
  } catch (err) {
    return errResponse(err);
  }
}
