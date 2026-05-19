import crypto from 'node:crypto';
import { query } from '../lib/db';

export interface ApiKeyRecord {
  id: string;
  school_id: string;
  name: string;
  environment: 'live' | 'sandbox';
  scopes: string[];
  rate_limit_rpm: number;
  status: 'active' | 'revoked';
}

function sha256(s: string): string {
  return crypto.createHash('sha256').update(s).digest('hex');
}

/** Yeni API key oluştur. Plaintext yalnızca BİR kez döner. */
export async function createApiKey(input: {
  school_id: string;
  name: string;
  environment: 'live' | 'sandbox';
  scopes?: string[];
}): Promise<{ record: ApiKeyRecord; plaintext: string }> {
  const prefix = input.environment === 'live' ? 'fk_live_' : 'fk_test_';
  const secret = crypto.randomBytes(24).toString('base64url'); // 32 char
  const plaintext = `${prefix}${secret}`;
  const key_hash = sha256(plaintext);

  const [row] = await query<ApiKeyRecord>(
    `INSERT INTO api_keys (school_id, name, key_prefix, key_hash, environment, scopes)
     VALUES ($1,$2,$3,$4,$5, COALESCE($6, ARRAY['campaigns:read','students:read','donations:read']))
     RETURNING id, school_id, name, environment, scopes, rate_limit_rpm, status`,
    [input.school_id, input.name, prefix, key_hash, input.environment, input.scopes ?? null],
  );
  return { record: row, plaintext };
}

export async function revokeApiKey(id: string): Promise<void> {
  await query(`UPDATE api_keys SET status='revoked', revoked_at=now() WHERE id=$1`, [id]);
}

/** Plaintext key → aktif kayıt. last_used_at güncellenir. */
export async function lookupApiKey(plaintext: string): Promise<ApiKeyRecord | null> {
  if (!plaintext.startsWith('fk_live_') && !plaintext.startsWith('fk_test_')) return null;
  const key_hash = sha256(plaintext);
  const [row] = await query<ApiKeyRecord>(
    `UPDATE api_keys
        SET last_used_at = now()
      WHERE key_hash = $1 AND status = 'active'
      RETURNING id, school_id, name, environment, scopes, rate_limit_rpm, status`,
    [key_hash],
  );
  return row ?? null;
}
