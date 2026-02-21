import { NextResponse } from 'next/server';
import { getExchangeRate } from '@/lib/exchange-rate';

/**
 * GET /api/exchange-rate
 * Returns the cached USD/TRY exchange rate for client-side use.
 */
export async function GET() {
  try {
    const data = await getExchangeRate('USD', 'TRY');

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
