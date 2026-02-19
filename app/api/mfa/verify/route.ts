/**
 * MFA Verify API
 *
 * POST /api/mfa/verify → Confirm MFA setup (first valid code) or verify on login
 * DELETE /api/mfa/verify → Disable MFA
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { confirmMfaSetup, verifyMfa, disableMfa } from '@/lib/mfa';

/**
 * POST — Confirm MFA setup OR verify MFA code
 * Body: { token: string, action?: 'confirm' | 'verify' }
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    const body = await request.json();
    const { token, action = 'confirm' } = body;

    if (!token || typeof token !== 'string' || token.length < 6) {
      return NextResponse.json(
        { error: 'A valid 6-digit code is required' },
        { status: 400 },
      );
    }

    if (action === 'confirm') {
      const result = await confirmMfaSetup(userId, token);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ message: 'MFA enabled successfully' });
    }

    if (action === 'verify') {
      const result = await verifyMfa(userId, token);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 403 });
      }
      return NextResponse.json({
        message: 'MFA verified',
        usedBackupCode: result.usedBackupCode || false,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[MFA] Verify error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'MFA verification failed' }, { status: 500 });
  }
}

/**
 * DELETE — Disable MFA (requires valid TOTP or backup code)
 * Body: { token: string }
 */
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'A valid MFA code is required to disable MFA' },
        { status: 400 },
      );
    }

    const result = await disableMfa(userId, token);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 403 });
    }

    return NextResponse.json({ message: 'MFA disabled successfully' });
  } catch (error) {
    console.error('[MFA] Disable error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Failed to disable MFA' }, { status: 500 });
  }
}
