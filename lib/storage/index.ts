/**
 * Unified Storage Provider
 *
 * Single entry point for all file storage operations (Cloudinary).
 * Eliminates duplicated Cloudinary code across upload routes.
 *
 * Usage:
 *   import { storage } from '@/lib/storage';
 *   const result = await storage.upload(buffer, path, 'image/jpeg');
 *   const url    = storage.getSignedUrl(path);
 *   await storage.delete(publicId);
 */

import crypto from 'crypto';

// =======================================
// Configuration
// =======================================

function getConfig() {
  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  };
}

function isConfigured(): boolean {
  const { cloudName, apiKey, apiSecret } = getConfig();
  return !!(cloudName && apiKey && apiSecret);
}

function sign(params: Record<string, string | number>, secret: string): string {
  const sorted = Object.keys(params).sort();
  const str = sorted.map((k) => `${k}=${params[k]}`).join('&');
  return crypto.createHash('sha1').update(str + secret).digest('hex');
}

// =======================================
// Types
// =======================================

export interface UploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  bytes?: number;
  error?: string;
}

export interface DeleteResult {
  success: boolean;
  error?: string;
}

// =======================================
// Upload
// =======================================

/**
 * Upload a buffer to Cloudinary.
 * Falls back to a local placeholder URL when Cloudinary is not configured
 * (dev mode without credentials).
 */
async function upload(
  buffer: Buffer,
  storagePath: string,
  mimeType: string
): Promise<UploadResult> {
  if (!isConfigured()) {
    console.warn('[Storage] Cloudinary not configured — returning local placeholder URL');
    return {
      success: true,
      url: `/api/uploads/local/${encodeURIComponent(storagePath)}`,
      publicId: storagePath,
      bytes: buffer.length,
    };
  }

  const { cloudName, apiKey, apiSecret } = getConfig();

  try {
    const timestamp = Math.round(Date.now() / 1000);
    const publicId = storagePath.replace(/\.[^/.]+$/, ''); // strip extension
    const resourceType = mimeType === 'application/pdf' ? 'raw' : 'image';

    const params: Record<string, string | number> = {
      folder: 'verifications',
      public_id: publicId,
      timestamp,
      type: 'authenticated', // private by default
    };

    const signature = sign(params, apiSecret);

    const base64 = buffer.toString('base64');
    const dataUri = `data:${mimeType};base64,${base64}`;

    const form = new FormData();
    form.append('file', dataUri);
    form.append('api_key', apiKey);
    form.append('timestamp', timestamp.toString());
    form.append('signature', signature);
    form.append('public_id', publicId);
    form.append('folder', 'verifications');
    form.append('type', 'authenticated');

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      { method: 'POST', body: form }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error('[Storage] Cloudinary upload failed:', errText);
      return { success: false, error: 'Upload to storage failed' };
    }

    const data = await res.json();
    return {
      success: true,
      url: data.secure_url,
      publicId: data.public_id,
      bytes: data.bytes,
    };
  } catch (err: any) {
    console.error('[Storage] Upload error:', err);
    return { success: false, error: err.message || 'Upload failed' };
  }
}

// =======================================
// Delete
// =======================================

async function remove(
  publicId: string,
  resourceType: 'image' | 'raw' = 'image'
): Promise<DeleteResult> {
  if (!isConfigured()) {
    return { success: true };
  }

  const { cloudName, apiKey, apiSecret } = getConfig();

  try {
    const timestamp = Math.round(Date.now() / 1000);
    const params: Record<string, string | number> = { public_id: publicId, timestamp };
    const signature = sign(params, apiSecret);

    const form = new FormData();
    form.append('public_id', publicId);
    form.append('api_key', apiKey);
    form.append('timestamp', timestamp.toString());
    form.append('signature', signature);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`,
      { method: 'POST', body: form }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error('[Storage] Cloudinary delete failed:', errText);
      return { success: false, error: 'Delete failed' };
    }

    const data = await res.json();
    return { success: data.result === 'ok' || data.result === 'not found' };
  } catch (err: any) {
    console.error('[Storage] Delete error:', err);
    return { success: false, error: err.message || 'Delete failed' };
  }
}

// =======================================
// Signed URLs
// =======================================

const SIGNED_URL_TTL_MS = 15 * 60 * 1000; // 15 min

/**
 * Generate a time-limited signed URL for private document access.
 */
function getSignedUrl(storagePath: string, ttlMs: number = SIGNED_URL_TTL_MS): string {
  if (isConfigured()) {
    return cloudinarySignedUrl(storagePath, ttlMs);
  }
  return localSignedUrl(storagePath, ttlMs);
}

function cloudinarySignedUrl(storagePath: string, ttlMs: number): string {
  const { cloudName, apiSecret } = getConfig();
  const publicId = storagePath.replace(/\.[^/.]+$/, '');
  const expiry = Math.round((Date.now() + ttlMs) / 1000);
  const isPdf = storagePath.toLowerCase().endsWith('.pdf');
  const resourceType = isPdf ? 'raw' : 'image';

  const toSign = `public_id=${publicId}&timestamp=${expiry}`;
  const sig = crypto.createHash('sha1').update(toSign + apiSecret).digest('hex');

  return `https://res.cloudinary.com/${cloudName}/${resourceType}/authenticated/s--${sig.substring(0, 8)}--/verifications/${publicId}?timestamp=${expiry}`;
}

function localSignedUrl(storagePath: string, ttlMs: number): string {
  const expires = Date.now() + ttlMs;
  const sig = crypto
    .createHmac('sha256', process.env.UPLOAD_SECRET || 'dev-secret')
    .update(`${storagePath}:${expires}`)
    .digest('hex');
  return `/api/verification/documents/file/${encodeURIComponent(storagePath)}?expires=${expires}&sig=${sig}`;
}

/**
 * Validate a locally-signed URL (used in dev when Cloudinary is not configured).
 */
function validateLocalSignedUrl(
  storagePath: string,
  expires: string,
  signature: string
): boolean {
  const exp = parseInt(expires, 10);
  if (Date.now() > exp) return false;

  const expected = crypto
    .createHmac('sha256', process.env.UPLOAD_SECRET || 'dev-secret')
    .update(`${storagePath}:${exp}`)
    .digest('hex');

  if (signature.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

// =======================================
// Public API
// =======================================

export const storage = {
  /** Whether Cloudinary credentials are configured */
  isConfigured,
  /** Upload a buffer to storage */
  upload,
  /** Delete a file from storage */
  delete: remove,
  /** Generate a time-limited signed URL */
  getSignedUrl,
  /** Validate a locally-signed URL (dev fallback) */
  validateLocalSignedUrl,
} as const;
