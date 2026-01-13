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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { public_id: string } }
) {
  try {
    const user = await requireUser();
    const publicId = decodeURIComponent(params.public_id);
    
    // Verify the file belongs to the user
    if (!publicId.includes(user.id) && user.role !== 'admin') {
      return NextResponse.json(
        { error: "Cannot delete files belonging to other users" },
        { status: 403 }
      );
    }
    
    const config = getCloudinaryConfig();
    if (!config) {
      return NextResponse.json(
        { error: "File uploads not configured" },
        { status: 503 }
      );
    }
    
    const timestamp = Math.floor(Date.now() / 1000);
    const cloudinaryParams = {
      timestamp: timestamp,
      public_id: publicId
    };
    const signature = generateCloudinarySignature(cloudinaryParams, config.api_secret);
    
    const formData = new FormData();
    formData.append('timestamp', timestamp.toString());
    formData.append('public_id', publicId);
    formData.append('signature', signature);
    formData.append('api_key', config.api_key);
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloud_name}/image/destroy`,
      {
        method: 'POST',
        body: formData
      }
    );
    
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to delete file" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "File deleted successfully"
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.message?.includes('authenticated') ? 401 : 500 }
    );
  }
}
