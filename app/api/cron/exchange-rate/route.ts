import { NextRequest, NextResponse } from 'next/server';
import { updateExchangeRate } from '@/lib/exchange-rate';

/**
 * GET /api/cron/exchange-rate
 *
 * Cron endpoint to update the USD/TRY exchange rate.
 * Protected by CRON_SECRET — Vercel Cron passes this automatically,
 * or call manually with ?secret=YOUR_SECRET.
 *
 * Scheduled via vercel.json: 3× daily at 08:00, 14:00, 20:00 UTC
 */
export async function GET(request: NextRequest) {
  // Verify cron secret
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get('authorization');
    const querySecret = request.nextUrl.searchParams.get('secret');

    const bearerMatch = authHeader === `Bearer ${cronSecret}`;
    const queryMatch = querySecret === cronSecret;

    if (!bearerMatch && !queryMatch) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const result = await updateExchangeRate();
    return NextResponse.json({
      success: true,
      rate: result.rate,
      updatedAt: result.updatedAt.toISOString(),
    });
  } catch (error: any) {
    console.error('[Cron] exchange-rate update failed:', error);
    return NextResponse.json(
      { error: 'Failed to update exchange rate', message: error.message },
      { status: 500 }
    );
  }
}
