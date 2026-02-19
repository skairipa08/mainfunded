/**
 * Multi-Factor Authentication (TOTP) Module
 *
 * Provides TOTP-based MFA for admin accounts using RFC 6238.
 *
 * Flow:
 *  1. Admin enables MFA → generateSecret() → QR code + backup codes
 *  2. Admin scans QR with Google Authenticator / Authy
 *  3. Admin enters TOTP code to confirm setup → verifyAndEnable()
 *  4. On login, if MFA enabled → verifyToken() before granting access
 *
 * Storage: `mfa` sub-document on users collection.
 */

import { TOTP, Secret } from 'otpauth';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { getDb } from '@/lib/db';

// ── Constants ─────────────────────────────────────────────────

const ISSUER = 'FundEd';
const TOTP_PERIOD = 30;            // seconds
const TOTP_DIGITS = 6;
const TOTP_ALGORITHM = 'SHA1';     // Most authenticator apps use SHA1
const BACKUP_CODE_COUNT = 8;
const BACKUP_CODE_LENGTH = 8;      // 8 hex chars each

// ── Types ─────────────────────────────────────────────────────

export interface MfaSetupResult {
  secret: string;         // base32-encoded secret (for manual entry)
  otpauthUri: string;     // otpauth:// URI for QR
  qrCodeDataUrl: string;  // data:image/png;base64,... ready for <img>
  backupCodes: string[];  // one-time recovery codes
}

export interface MfaStatus {
  enabled: boolean;
  enrolledAt?: string;
}

// ── Secret Generation ─────────────────────────────────────────

/**
 * Generate a new MFA secret + QR code for the user.
 * Does NOT persist anything — call `confirmMfaSetup` after user verifies.
 */
export async function generateMfaSetup(
  userId: string,
  userEmail: string,
): Promise<MfaSetupResult> {
  const secret = new Secret({ size: 20 }); // 160-bit secret

  const totp = new TOTP({
    issuer: ISSUER,
    label: userEmail,
    algorithm: TOTP_ALGORITHM,
    digits: TOTP_DIGITS,
    period: TOTP_PERIOD,
    secret,
  });

  const otpauthUri = totp.toString();
  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUri, { width: 256 });

  const backupCodes = Array.from({ length: BACKUP_CODE_COUNT }, () =>
    crypto.randomBytes(BACKUP_CODE_LENGTH / 2).toString('hex'),
  );

  // Store the pending setup in DB (not yet enabled)
  const db = await getDb();
  await db.collection('users').updateOne(
    { _id: userId as any },
    {
      $set: {
        'mfa.pending_secret': secret.base32,
        'mfa.pending_backup_codes': backupCodes.map(hashBackupCode),
        'mfa.pending_backup_codes_plain': backupCodes, // will be cleared on confirm
        'mfa.pending_at': new Date().toISOString(),
      },
    },
  );

  return {
    secret: secret.base32,
    otpauthUri,
    qrCodeDataUrl,
    backupCodes,
  };
}

// ── Verification ──────────────────────────────────────────────

/**
 * Verify a TOTP token against a base32 secret.
 * Allows ±1 window for clock skew.
 */
export function verifyToken(secret: string, token: string): boolean {
  const totp = new TOTP({
    issuer: ISSUER,
    algorithm: TOTP_ALGORITHM,
    digits: TOTP_DIGITS,
    period: TOTP_PERIOD,
    secret: Secret.fromBase32(secret),
  });

  const delta = totp.validate({ token, window: 1 });
  return delta !== null;
}

/**
 * Confirm MFA setup: user provides first valid TOTP code.
 * Moves pending secret to active and removes plaintext backup codes.
 */
export async function confirmMfaSetup(
  userId: string,
  token: string,
): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  const user = await db.collection('users').findOne({ _id: userId as any });

  if (!user?.mfa?.pending_secret) {
    return { success: false, error: 'No pending MFA setup found' };
  }

  if (!verifyToken(user.mfa.pending_secret, token)) {
    return { success: false, error: 'Invalid TOTP code' };
  }

  // Activate MFA
  await db.collection('users').updateOne(
    { _id: userId as any },
    {
      $set: {
        'mfa.enabled': true,
        'mfa.secret': user.mfa.pending_secret,
        'mfa.backup_codes': user.mfa.pending_backup_codes,
        'mfa.enrolled_at': new Date().toISOString(),
      },
      $unset: {
        'mfa.pending_secret': '',
        'mfa.pending_backup_codes': '',
        'mfa.pending_backup_codes_plain': '',
        'mfa.pending_at': '',
      },
    },
  );

  return { success: true };
}

/**
 * Verify MFA for login. Checks TOTP code first, then backup codes.
 */
export async function verifyMfa(
  userId: string,
  token: string,
): Promise<{ success: boolean; usedBackupCode?: boolean; error?: string }> {
  const db = await getDb();
  const user = await db.collection('users').findOne({ _id: userId as any });

  if (!user?.mfa?.enabled || !user.mfa.secret) {
    return { success: false, error: 'MFA not enabled' };
  }

  // 1. Try TOTP code
  if (verifyToken(user.mfa.secret, token)) {
    return { success: true };
  }

  // 2. Try backup codes
  const hashedInput = hashBackupCode(token);
  const codes: string[] = user.mfa.backup_codes || [];
  const idx = codes.indexOf(hashedInput);

  if (idx !== -1) {
    // Consume the backup code (one-time use)
    const updated = [...codes];
    updated.splice(idx, 1);
    await db.collection('users').updateOne(
      { _id: userId as any },
      { $set: { 'mfa.backup_codes': updated } },
    );
    return { success: true, usedBackupCode: true };
  }

  return { success: false, error: 'Invalid MFA code' };
}

// ── Status / Disable ──────────────────────────────────────────

/**
 * Get MFA status for a user.
 */
export async function getMfaStatus(userId: string): Promise<MfaStatus> {
  const db = await getDb();
  const user = await db.collection('users').findOne(
    { _id: userId as any },
    { projection: { 'mfa.enabled': 1, 'mfa.enrolled_at': 1 } },
  );

  return {
    enabled: !!user?.mfa?.enabled,
    enrolledAt: user?.mfa?.enrolled_at,
  };
}

/**
 * Disable MFA for a user. Requires valid TOTP or backup code.
 */
export async function disableMfa(
  userId: string,
  token: string,
): Promise<{ success: boolean; error?: string }> {
  const result = await verifyMfa(userId, token);
  if (!result.success) {
    return { success: false, error: result.error };
  }

  const db = await getDb();
  await db.collection('users').updateOne(
    { _id: userId as any },
    { $unset: { mfa: '' } },
  );

  return { success: true };
}

/**
 * Check if user has MFA enabled (fast check, no full user load).
 */
export async function isMfaRequired(userId: string): Promise<boolean> {
  const db = await getDb();
  const user = await db.collection('users').findOne(
    { _id: userId as any },
    { projection: { 'mfa.enabled': 1 } },
  );
  return !!user?.mfa?.enabled;
}

// ── Helpers ───────────────────────────────────────────────────

function hashBackupCode(code: string): string {
  return crypto.createHash('sha256').update(code.trim().toLowerCase()).digest('hex');
}
