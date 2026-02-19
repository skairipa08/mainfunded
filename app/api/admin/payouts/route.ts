import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/authz';
import { logAudit } from '@/lib/audit';
import crypto from 'crypto';
import type { PayoutMethodType } from '@/types';

// GET — aggregation: students with available balance, grouped by method
export async function GET() {
  try {
    const admin = await requireAdmin();
    const db = await getDb();

    const balances = await db.collection('student_balances')
      .aggregate([
        { $match: { available: { $gt: 0 } } },
        {
          $lookup: {
            from: 'student_profiles',
            localField: 'user_id',
            foreignField: 'user_id',
            as: 'profile',
          },
        },
        { $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'users',
            let: { uid: '$user_id' },
            pipeline: [
              { $match: { $expr: { $eq: [{ $toString: '$_id' }, '$$uid'] } } },
              { $project: { _id: 0, name: 1, email: 1 } },
            ],
            as: 'user',
          },
        },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 0,
            user_id: 1,
            userName: '$user.name',
            userEmail: '$user.email',
            available: 1,
            totalEarned: 1,
            totalWithdrawn: 1,
            payoutMethods: '$profile.payoutMethods',
          },
        },
      ])
      .toArray();

    // Group by method type
    const grouped: Record<string, unknown[]> = {
      stripe_connect: [],
      paypal: [],
      wise: [],
      papara: [],
    };

    for (const b of balances) {
      const methods: Array<{ type: string; isDefault?: boolean }> = b.payoutMethods ?? [];
      const defaultMethod = methods.find((m) => m.isDefault) ?? methods[0];
      const methodType = (defaultMethod?.type as string) || 'unknown';

      const entry = {
        user_id: b.user_id,
        userName: b.userName ?? 'Bilinmiyor',
        userEmail: b.userEmail ?? '',
        available: b.available,
        totalEarned: b.totalEarned,
        totalWithdrawn: b.totalWithdrawn,
        method: defaultMethod ?? null,
      };

      if (methodType in grouped) {
        grouped[methodType].push(entry);
      }
    }

    return NextResponse.json({ success: true, data: grouped });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ error: { code: 'ERROR', message } }, { status });
  }
}

// POST — process a single payout
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const db = await getDb();
    const body = await request.json();

    const { user_id, amount, method_type, reference_code, notes } = body as {
      user_id: string;
      amount: number;
      method_type: PayoutMethodType;
      reference_code: string;
      notes?: string;
    };

    if (!user_id || !amount || !method_type || !reference_code) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'user_id, amount, method_type ve reference_code zorunludur' } },
        { status: 400 },
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Tutar 0\'dan büyük olmalıdır' } },
        { status: 400 },
      );
    }

    // Check balance
    const balance = await db.collection('student_balances').findOne({ user_id });
    if (!balance || (balance.available ?? 0) < amount) {
      return NextResponse.json(
        { error: { code: 'INSUFFICIENT_BALANCE', message: 'Yetersiz bakiye' } },
        { status: 400 },
      );
    }

    const payoutId = `payout_${crypto.randomBytes(6).toString('hex')}`;
    const isAutomatic = method_type === 'stripe_connect';
    const transferNote = isAutomatic
      ? 'Stripe Connect ile otomatik transfer edildi'
      : 'Manuel transfer yapıldı';

    // Decrease available, increase totalWithdrawn
    await db.collection('student_balances').updateOne(
      { user_id },
      {
        $inc: { available: -amount, totalWithdrawn: amount },
        $set: { lastUpdated: new Date().toISOString() },
      },
    );

    // Insert payout record
    await db.collection('payouts').insertOne({
      payout_id: payoutId,
      user_id,
      amount,
      method_type,
      status: 'completed',
      reference_code,
      notes: notes ?? transferNote,
      transfer_note: transferNote,
      created_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    });

    // Audit log
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    await logAudit(db, {
      actor_user_id: admin.id,
      actor_email: admin.email,
      action: 'payout.processed',
      target_type: 'student_balance',
      target_id: user_id,
      target_details: { amount, method_type, reference_code, payout_id: payoutId },
      ip_address: ip,
      severity: 'info',
    });

    return NextResponse.json({
      success: true,
      message: `Ödeme işlendi: ${transferNote}`,
      data: { payout_id: payoutId },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ error: { code: 'ERROR', message } }, { status });
  }
}
