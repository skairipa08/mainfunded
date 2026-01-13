import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/authz';
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
  const sortedParams = Object.keys(params).sort().map(key => `${key}=${params[key]}`).join('&');
  const signature = crypto.createHash('sha1').update(sortedParams + apiSecret).digest('hex');
  return signature;
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    
    const config = getCloudinaryConfig();
    if (!config) {
      return NextResponse.json(
        { error: { code: 'SERVICE_UNAVAILABLE', message: 'File upload service is not available at this time' } },
        { status: 503 }
      );
    }
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'general';
    
    if (!file) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'File is required' } },
        { status: 400 }
      );
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.' } },
        { status: 400 }
      );
    }
    
    // Read file content
    const arrayBuffer = await file.arrayBuffer();
    const content = Buffer.from(arrayBuffer);
    
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (content.length > maxSize) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'File is too large. Maximum file size is 10MB.' } },
        { status: 400 }
      );
    }
    
    const timestamp = Math.floor(Date.now() / 1000);
    const publicId = `funded/${folder}/${user.id}_${crypto.randomBytes(4).toString('hex')}`;
    
    const params = {
      timestamp: timestamp,
      public_id: publicId
    };
    const signature = generateCloudinarySignature(params, config.api_secret);
    
    // Upload to Cloudinary
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('timestamp', timestamp.toString());
    uploadFormData.append('public_id', publicId);
    uploadFormData.append('signature', signature);
    uploadFormData.append('api_key', config.api_key);
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloud_name}/image/upload`,
      {
        method: 'POST',
        body: uploadFormData
      }
    );
    
    if (!response.ok) {
      return NextResponse.json(
        { error: { code: 'UPLOAD_ERROR', message: 'Failed to upload image. Please try again.' } },
        { status: 500 }
      );
    }
    
    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format
      }
    });
  } catch (error: any) {
    if (error.message?.includes('authenticated') || error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An error occurred while processing your request' } },
      { status: 500 }
    );
  }
}
