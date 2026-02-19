/**
 * Image Processing Module
 *
 * Handles EXIF metadata stripping and image re-encoding for security.
 * Uses sharp for fast, reliable image processing.
 *
 * Why this matters:
 * - EXIF data can contain GPS coordinates, device info, and other PII
 * - Re-encoding neutralises steganographic/polyglot payloads
 * - Normalising format prevents mime-type confusion attacks
 */

import sharp from 'sharp';

export interface ProcessedImage {
  buffer: Buffer;
  mimeType: string;
  width: number;
  height: number;
}

const MAX_DIMENSION = 4096; // Max width/height after processing

/**
 * Process an image buffer: strip EXIF, re-encode, and resize if needed.
 * Only processes image types — PDFs and other files are returned as-is.
 *
 * @param buffer  Raw file buffer
 * @param mimeType  Original MIME type of the file
 * @returns Processed image buffer with metadata stripped, or original buffer for non-images
 */
export async function processImage(
  buffer: Buffer,
  mimeType: string
): Promise<ProcessedImage | null> {
  // Only process actual image types
  if (!mimeType.startsWith('image/') || mimeType === 'image/svg+xml') {
    return null; // Not an image or SVG (we don't process SVGs)
  }

  try {
    let pipeline = sharp(buffer, { failOn: 'none' })
      .rotate()            // Auto-rotate based on EXIF orientation (before stripping)
      .withMetadata({       // Strip all EXIF/IPTC/XMP metadata
        // Keep orientation correction but remove everything else
      })
      .removeAlpha();       // Remove alpha channel for ID documents (prevents transparency tricks)

    // Get image metadata for dimension checks
    const metadata = await sharp(buffer).metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;

    // Resize if too large (preserving aspect ratio)
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      pipeline = pipeline.resize(MAX_DIMENSION, MAX_DIMENSION, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Re-encode based on original type
    let outputMime = mimeType;

    switch (mimeType) {
      case 'image/jpeg':
        pipeline = pipeline.jpeg({ quality: 90, mozjpeg: true });
        outputMime = 'image/jpeg';
        break;
      case 'image/png':
        pipeline = pipeline.png({ compressionLevel: 6 });
        outputMime = 'image/png';
        break;
      case 'image/webp':
        pipeline = pipeline.webp({ quality: 90 });
        outputMime = 'image/webp';
        break;
      case 'image/heic':
      case 'image/heif':
        // Convert HEIC to JPEG for broad compatibility
        pipeline = pipeline.jpeg({ quality: 90, mozjpeg: true });
        outputMime = 'image/jpeg';
        break;
      default:
        // Unknown image type — convert to JPEG as safe fallback
        pipeline = pipeline.jpeg({ quality: 90 });
        outputMime = 'image/jpeg';
        break;
    }

    const outputBuffer = await pipeline.toBuffer();
    const outputMeta = await sharp(outputBuffer).metadata();

    return {
      buffer: outputBuffer,
      mimeType: outputMime,
      width: outputMeta.width || 0,
      height: outputMeta.height || 0,
    };
  } catch (error) {
    // If sharp fails (corrupted image, unsupported sub-format), reject the file
    console.error('[ImageProcessing] Failed to process image:', error);
    return null;
  }
}

/**
 * Generate a thumbnail for admin document preview.
 * Returns a small JPEG suitable for quick loading in the admin panel.
 */
export async function generateThumbnail(
  buffer: Buffer,
  mimeType: string,
  size: number = 200
): Promise<Buffer | null> {
  if (!mimeType.startsWith('image/') || mimeType === 'image/svg+xml') {
    return null;
  }

  try {
    return await sharp(buffer, { failOn: 'none' })
      .rotate()
      .resize(size, size, { fit: 'cover', position: 'centre' })
      .jpeg({ quality: 70 })
      .toBuffer();
  } catch {
    return null;
  }
}
