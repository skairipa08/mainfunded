/**
 * Upload & Storage Integration Tests
 *
 * Covers:
 * - File validation (magic bytes, size limits, filename)
 * - SHA256 hash calculation
 * - Filename sanitisation
 * - Storage path generation
 * - Malicious content detection
 * - Image processing (EXIF strip, thumbnail)
 * - Storage provider (upload, delete, signed URLs)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Validation helpers (pure functions, no mocks needed) ────────────────────

import {
  validateFile,
  validateFileName,
  sanitizeFileName,
  calculateFileHash,
  generateStoragePath,
  checkForMaliciousContent,
  ALLOWED_TYPES,
} from '@/lib/verification/upload';

// ═════════════════════════════════════════════════
// 1. Magic Byte Validation
// ═════════════════════════════════════════════════

describe('validateFile – magic bytes', () => {
  it('accepts valid JPEG', () => {
    const buf = Buffer.alloc(2048);
    buf[0] = 0xff;
    buf[1] = 0xd8;
    buf[2] = 0xff;

    const result = validateFile(buf, 'image/jpeg', 'photo.jpg');
    expect(result.valid).toBe(true);
  });

  it('accepts valid PNG', () => {
    const buf = Buffer.alloc(2048);
    buf[0] = 0x89;
    buf[1] = 0x50;
    buf[2] = 0x4e;
    buf[3] = 0x47;

    const result = validateFile(buf, 'image/png', 'doc.png');
    expect(result.valid).toBe(true);
  });

  it('accepts valid PDF', () => {
    const buf = Buffer.alloc(2048);
    buf[0] = 0x25;
    buf[1] = 0x50;
    buf[2] = 0x44;
    buf[3] = 0x46;

    const result = validateFile(buf, 'application/pdf', 'transcript.pdf');
    expect(result.valid).toBe(true);
  });

  it('rejects JPEG with wrong magic bytes', () => {
    const buf = Buffer.alloc(2048); // all zeros
    const result = validateFile(buf, 'image/jpeg', 'photo.jpg');
    expect(result.valid).toBe(false);
    expect(result.errorCode).toBe('MAGIC_MISMATCH');
  });

  it('rejects disallowed MIME types', () => {
    const buf = Buffer.alloc(2048);
    const result = validateFile(buf, 'application/zip', 'file.zip');
    expect(result.valid).toBe(false);
    expect(result.errorCode).toBe('INVALID_TYPE');
  });
});

// ═════════════════════════════════════════════════
// 2. File Size Limits
// ═════════════════════════════════════════════════

describe('validateFile – size limits', () => {
  function makeJpeg(size: number): Buffer {
    const buf = Buffer.alloc(size);
    buf[0] = 0xff;
    buf[1] = 0xd8;
    buf[2] = 0xff;
    return buf;
  }

  it('rejects file smaller than 1 KB', () => {
    const buf = makeJpeg(512);
    const result = validateFile(buf, 'image/jpeg', 'tiny.jpg');
    expect(result.valid).toBe(false);
    expect(result.errorCode).toBe('EMPTY_FILE');
  });

  it('accepts file within general size limit', () => {
    const buf = makeJpeg(4 * 1024 * 1024); // 4 MB < 8 MB limit
    const result = validateFile(buf, 'image/jpeg', 'photo.jpg');
    expect(result.valid).toBe(true);
  });

  it('rejects file exceeding general size limit', () => {
    const buf = makeJpeg(9 * 1024 * 1024); // 9 MB > 8 MB
    const result = validateFile(buf, 'image/jpeg', 'huge.jpg');
    expect(result.valid).toBe(false);
    expect(result.errorCode).toBe('SIZE_EXCEEDED');
  });

  it('enforces document-type-specific STUDENT_ID limit', () => {
    const buf = makeJpeg(6 * 1024 * 1024); // 6 MB > 5 MB student id limit
    const result = validateFile(buf, 'image/jpeg', 'id.jpg', 'STUDENT_ID');
    expect(result.valid).toBe(false);
    expect(result.errorCode).toBe('SIZE_EXCEEDED');
  });
});

// ═════════════════════════════════════════════════
// 3. Filename Validation & Sanitisation
// ═════════════════════════════════════════════════

describe('validateFileName', () => {
  it('accepts normal filename', () => {
    expect(validateFileName('photo_2024.jpg').valid).toBe(true);
  });

  it('rejects null bytes', () => {
    expect(validateFileName('file\0.jpg').valid).toBe(false);
  });

  it('rejects path traversal (..)', () => {
    expect(validateFileName('../../etc/passwd').valid).toBe(false);
  });

  it('rejects forward slashes', () => {
    expect(validateFileName('a/b.jpg').valid).toBe(false);
  });

  it('rejects backslashes', () => {
    expect(validateFileName('a\\b.jpg').valid).toBe(false);
  });

  it('rejects very long filenames', () => {
    expect(validateFileName('a'.repeat(256) + '.jpg').valid).toBe(false);
  });
});

describe('sanitizeFileName', () => {
  it('strips path components', () => {
    expect(sanitizeFileName('/usr/local/file.jpg')).toBe('file.jpg');
    expect(sanitizeFileName('C:\\Users\\file.jpg')).toBe('file.jpg');
  });

  it('replaces special characters with underscore', () => {
    expect(sanitizeFileName('photo (1)@2x.jpg')).toBe('photo__1__2x.jpg');
  });

  it('handles empty or dot-only names', () => {
    expect(sanitizeFileName('')).toBe('document');
    expect(sanitizeFileName('.')).toBe('document');
  });

  it('truncates very long names preserving extension', () => {
    const long = 'a'.repeat(200) + '.pdf';
    const result = sanitizeFileName(long);
    expect(result.length).toBeLessThanOrEqual(100);
    expect(result).toMatch(/\.pdf$/);
  });
});

// ═════════════════════════════════════════════════
// 4. SHA256 Hash
// ═════════════════════════════════════════════════

describe('calculateFileHash', () => {
  it('returns hex SHA256', () => {
    const buf = Buffer.from('hello world');
    const hash = calculateFileHash(buf);
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('same content → same hash', () => {
    const a = calculateFileHash(Buffer.from('abc'));
    const b = calculateFileHash(Buffer.from('abc'));
    expect(a).toBe(b);
  });

  it('different content → different hash', () => {
    const a = calculateFileHash(Buffer.from('abc'));
    const b = calculateFileHash(Buffer.from('abd'));
    expect(a).not.toBe(b);
  });
});

// ═════════════════════════════════════════════════
// 5. Storage Path Generation
// ═════════════════════════════════════════════════

describe('generateStoragePath', () => {
  it('includes userId, verificationId, docId, and mime-derived extension', () => {
    const path = generateStoragePath('u1', 'v2', 'd3', 'image/jpeg');
    expect(path).toBe('verifications/u1/v2/d3.jpeg');
  });

  it('handles PDF resource type', () => {
    const path = generateStoragePath('u1', 'v2', 'd3', 'application/pdf');
    expect(path).toBe('verifications/u1/v2/d3.pdf');
  });

  it('falls back to bin for unknown mimeType', () => {
    const path = generateStoragePath('u1', 'v2', 'd3', 'application');
    // application → split('/')[1] gives undefined → 'bin'
    expect(path).toMatch(/\.bin$/);
  });
});

// ═════════════════════════════════════════════════
// 6. Malicious Content Detection
// ═════════════════════════════════════════════════

describe('checkForMaliciousContent', () => {
  it('passes clean image buffer', () => {
    const buf = Buffer.alloc(4096);
    const result = checkForMaliciousContent(buf, 'image/jpeg');
    expect(result.valid).toBe(true);
  });

  it('detects embedded <script> tag in image', () => {
    const buf = Buffer.from('<html><script>alert(1)</script></html>');
    const result = checkForMaliciousContent(buf, 'image/jpeg');
    expect(result.valid).toBe(false);
  });

  it('detects PHP tags in image', () => {
    const buf = Buffer.from('<?php system("cmd");?>');
    const result = checkForMaliciousContent(buf, 'image/png');
    expect(result.valid).toBe(false);
  });

  it('detects javascript: protocol in image', () => {
    const buf = Buffer.from('javascript:alert(1)');
    const result = checkForMaliciousContent(buf, 'image/jpeg');
    expect(result.valid).toBe(false);
  });

  it('detects data:text/html URI in image', () => {
    const buf = Buffer.from('data:text/html,<script>alert(1)</script>');
    const result = checkForMaliciousContent(buf, 'image/jpeg');
    expect(result.valid).toBe(false);
  });
});

// ═════════════════════════════════════════════════
// 7. Storage Provider (lib/storage)
// ═════════════════════════════════════════════════

describe('storage – signed URL', () => {
  let storageMod: typeof import('@/lib/storage/index');

  beforeEach(async () => {
    vi.resetModules();
    // Ensure Cloudinary is NOT configured so local signing is used
    vi.stubEnv('CLOUDINARY_CLOUD_NAME', '');
    vi.stubEnv('CLOUDINARY_API_KEY', '');
    vi.stubEnv('CLOUDINARY_API_SECRET', '');
    vi.stubEnv('UPLOAD_SECRET', 'test-secret-key');
    storageMod = await import('@/lib/storage/index');
  });

  it('generates local signed URL when Cloudinary is not configured', () => {
    const url = storageMod.storage.getSignedUrl('verifications/u1/v2/d3.jpeg');
    expect(url).toContain('/api/verification/documents/file/');
    expect(url).toContain('expires=');
    expect(url).toContain('sig=');
  });

  it('validates a recently generated local signed URL', () => {
    const path = 'verifications/u1/v2/d3.jpeg';
    const url = storageMod.storage.getSignedUrl(path);

    // Parse query params from returned URL
    const urlObj = new URL(url, 'http://localhost');
    const expires = urlObj.searchParams.get('expires')!;
    const sig = urlObj.searchParams.get('sig')!;

    expect(storageMod.storage.validateLocalSignedUrl(path, expires, sig)).toBe(true);
  });

  it('rejects tampered signed URL', () => {
    const path = 'verifications/u1/v2/d3.jpeg';
    const url = storageMod.storage.getSignedUrl(path);

    const urlObj = new URL(url, 'http://localhost');
    const expires = urlObj.searchParams.get('expires')!;

    expect(storageMod.storage.validateLocalSignedUrl(path, expires, 'tampered')).toBe(false);
  });

  it('returns local placeholder on upload when Cloudinary is not configured', async () => {
    const result = await storageMod.storage.upload(
      Buffer.from('test'),
      'verifications/u1/v2/d3.jpeg',
      'image/jpeg'
    );
    expect(result.success).toBe(true);
    expect(result.url).toContain('/api/uploads/local/');
  });
});

// ═════════════════════════════════════════════════
// 8. Image Processing (sharp)
// ═════════════════════════════════════════════════

describe('image processing', () => {
  // These tests require the sharp binary — skip if not installed
  let processImage: typeof import('@/lib/storage/image-processing').processImage;
  let generateThumbnail: typeof import('@/lib/storage/image-processing').generateThumbnail;

  beforeEach(async () => {
    const mod = await import('@/lib/storage/image-processing');
    processImage = mod.processImage;
    generateThumbnail = mod.generateThumbnail;
  });

  it('returns null for non-image MIME types', async () => {
    const buf = Buffer.from('%PDF-1.4 fake content');
    const result = await processImage(buf, 'application/pdf');
    expect(result).toBeNull();
  });

  it('returns null for SVGs (not processed)', async () => {
    const buf = Buffer.from('<svg></svg>');
    const result = await processImage(buf, 'image/svg+xml');
    expect(result).toBeNull();
  });

  it('processes a minimal valid JPEG', async () => {
    // Create a 1x1 red pixel JPEG using sharp
    const sharp = (await import('sharp')).default;
    const jpegBuf = await sharp({
      create: { width: 10, height: 10, channels: 3, background: { r: 255, g: 0, b: 0 } },
    })
      .jpeg()
      .toBuffer();

    const result = await processImage(jpegBuf, 'image/jpeg');
    expect(result).not.toBeNull();
    expect(result!.mimeType).toBe('image/jpeg');
    expect(result!.width).toBeGreaterThan(0);
    expect(result!.height).toBeGreaterThan(0);
  });

  it('processes a PNG', async () => {
    const sharp = (await import('sharp')).default;
    const pngBuf = await sharp({
      create: { width: 20, height: 20, channels: 4, background: { r: 0, g: 0, b: 255, alpha: 1 } },
    })
      .png()
      .toBuffer();

    const result = await processImage(pngBuf, 'image/png');
    expect(result).not.toBeNull();
    expect(result!.mimeType).toBe('image/png');
  });

  it('generates thumbnail smaller than original', async () => {
    const sharp = (await import('sharp')).default;
    const jpegBuf = await sharp({
      create: { width: 500, height: 500, channels: 3, background: { r: 128, g: 128, b: 128 } },
    })
      .jpeg()
      .toBuffer();

    const thumb = await generateThumbnail(jpegBuf, 'image/jpeg', 100);
    expect(thumb).not.toBeNull();
    expect(thumb!.length).toBeLessThan(jpegBuf.length);
  });

  it('returns null thumbnail for non-images', async () => {
    const result = await generateThumbnail(Buffer.from('pdf-data'), 'application/pdf');
    expect(result).toBeNull();
  });
});
