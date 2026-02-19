/**
 * MFA Setup API
 *
 * GET  /api/mfa/setup → Get MFA status
 * POST /api/mfa/setup → Start MFA enrollment (generate secret + QR)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { generateMfaSetup, getMfaStatus } from '@/lib/mfa';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const status = await getMfaStatus((session.user as any).id);
  return NextResponse.json({ mfa: status });
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const email = session.user.email || '';

  try {
    const setup = await generateMfaSetup(userId, email);
    return NextResponse.json({
      message: 'Scan QR code with your authenticator app, then confirm with a code.',
      qrCodeDataUrl: setup.qrCodeDataUrl,
      secret: setup.secret,
      backupCodes: setup.backupCodes,
    });
  } catch (error) {
    console.error('[MFA] Setup error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Failed to setup MFA' }, { status: 500 });
  }
}
