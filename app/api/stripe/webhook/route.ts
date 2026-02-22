/**
 * @deprecated This route is kept for backward compatibility.
 * Payment processing has been migrated to iyzico.
 * See /api/iyzico/callback for the active payment handler.
 */
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Stripe webhooks are no longer supported. Payment system has been migrated to iyzico.' },
    { status: 410 }
  );
}
