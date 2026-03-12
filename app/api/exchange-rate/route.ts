import { NextResponse } from 'next/server';
import { getExchangeRate, updateExchangeRate } from '@/lib/exchange-rate';

export const dynamic = 'force-dynamic'; // Prevent aggressive static caching

// Cache is considered stale after 6 hours
const STALE_THRESHOLD_MS = 6 * 60 * 60 * 1000;

/**
 * GET /api/exchange-rate
 * Returns the USD/TRY exchange rate.
 * If cache is empty or stale, fetches fresh rate from API on-demand.
 */
export async function GET() {
  try {
    let data = await getExchangeRate('USD', 'TRY');

    // If rate is stale (epoch = never fetched, or older than threshold), try refreshing
    const isStale =
      data.updatedAt.getTime() === 0 ||
      Date.now() - data.updatedAt.getTime() > STALE_THRESHOLD_MS;

    if (isStale) {
      try {
        data = await updateExchangeRate();
        console.log('[API] exchange-rate: refreshed stale rate on-demand');
      } catch (refreshErr) {
        console.warn('[API] exchange-rate: on-demand refresh failed, using cached/default:', refreshErr);
        // Continue with whatever we got from getExchangeRate (cached or default)
      }
    }

    return NextResponse.json(
      {
        from: data.from,
        to: data.to,
        rate: data.rate,
        updatedAt: data.updatedAt.toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
      }
    );
  } catch (error) {
    console.error('[API] exchange-rate GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exchange rate' },
      { status: 500 }
    );
  }
}
