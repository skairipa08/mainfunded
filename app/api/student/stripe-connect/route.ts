/**
 * @deprecated Stripe Connect is no longer used.
 * Payment system has been migrated to iyzico.
 * Student payouts are managed via alternative methods (Papara, IBAN, etc.)
 */
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'Stripe Connect is no longer supported. Please use alternative payout methods.' },
    { status: 410 }
  );
}
