import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  return { cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret };
}

function generateCloudinarySignature(params: Record<string, any>, apiSecret: string): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  return crypto.createHash('sha1').update(sortedParams + apiSecret).digest('hex');
}

export const runtime = 'nodejs';

/**
 * POST /api/applications/upload
 * Public endpoint for application file uploads (documents & photos).
 * Accepts multipart/form-data with `file` and optional `type` (document|photo).
 * Returns the Cloudinary URL on success, or a local data-URL fallback
 * when Cloudinary is not configured.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileType = (formData.get('type') as string) || 'document';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Dosya gerekli' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedDoc = ['application/pdf', 'image/jpeg', 'image/png'];
    const allowedPhoto = ['image/jpeg', 'image/png', 'image/webp'];
    const allowedVideo = ['video/mp4', 'video/quicktime', 'video/webm'];

    let allowed: string[];
    if (fileType === 'photo') {
      allowed = allowedPhoto;
    } else if (fileType === 'video') {
      allowed = allowedVideo;
    } else {
      allowed = allowedDoc;
    }

    if (!allowed.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error:
            fileType === 'photo'
              ? 'Sadece JPEG, PNG veya WebP formatı kabul edilir.'
              : fileType === 'video'
                ? 'Sadece MP4, QuickTime veya WebM video formatları kabul edilir.'
                : 'Sadece PDF, JPEG veya PNG formatı kabul edilir.',
        },
        { status: 400 }
      );
    }

    // Validate file size
    const maxSize =
      fileType === 'photo'
        ? 5 * 1024 * 1024
        : fileType === 'video'
          ? 50 * 1024 * 1024
          : 10 * 1024 * 1024;
    const arrayBuffer = await file.arrayBuffer();
    const content = Buffer.from(arrayBuffer);

    if (content.length > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: `Dosya boyutu çok büyük. Maksimum ${fileType === 'photo' ? '5' : '10'} MB.`,
        },
        { status: 400 }
      );
    }

    // Try Cloudinary upload
    const config = getCloudinaryConfig();

    if (config) {
      const timestamp = Math.floor(Date.now() / 1000);
      const folder =
        fileType === 'photo'
          ? 'applications/photos'
          : fileType === 'video'
            ? 'applications/videos'
            : 'applications/documents';
      const publicId = `funded/${folder}/${crypto.randomBytes(8).toString('hex')}`;

      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const resourceType = isImage ? 'image' : isVideo ? 'video' : 'auto';

      const params: Record<string, any> = {
        timestamp,
        public_id: publicId,
      };
      // Only add resource_type to signature for auto uploads
      if (resourceType === 'auto') {
        params.resource_type = 'auto';
      }

      const signature = generateCloudinarySignature(params, config.api_secret);

      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('timestamp', timestamp.toString());
      uploadFormData.append('public_id', publicId);
      uploadFormData.append('signature', signature);
      uploadFormData.append('api_key', config.api_key);

      const uploadEndpoint =
        resourceType === 'image'
          ? `https://api.cloudinary.com/v1_1/${config.cloud_name}/image/upload`
          : resourceType === 'video'
            ? `https://api.cloudinary.com/v1_1/${config.cloud_name}/video/upload`
            : `https://api.cloudinary.com/v1_1/${config.cloud_name}/auto/upload`;

      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) {
        console.error('Cloudinary upload failed:', await response.text());
        return NextResponse.json(
          { success: false, error: 'Dosya yüklenirken bir hata oluştu.' },
          { status: 500 }
        );
      }

      const result = await response.json();

      return NextResponse.json({
        success: true,
        data: {
          url: result.secure_url,
          public_id: result.public_id,
          original_filename: file.name,
          format: result.format,
          size: content.length,
          type: fileType,
        },
      });
    }

    // Fallback: Cloudinary not configured — store as base64 data URL
    const base64 = content.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    return NextResponse.json({
      success: true,
      data: {
        url: dataUrl,
        public_id: null,
        original_filename: file.name,
        format: file.type.split('/')[1],
        size: content.length,
        type: fileType,
      },
    });
  } catch (error: any) {
    console.error('Application upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Dosya yüklenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
