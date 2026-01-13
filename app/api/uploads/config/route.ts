import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/authz';
import crypto from 'crypto';
import { successResponse, handleRouteError } from '@/lib/api-response';

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

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    
    const config = getCloudinaryConfig();
    if (!config) {
      return handleRouteError(new Error('File uploads not configured'));
    }
    
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = `funded/${user.id}`;
    
    const params = {
      timestamp: timestamp,
      folder: folder,
      upload_preset: 'funded_uploads',
    };
    
    const signature = generateCloudinarySignature(params, config.api_secret);
    
    return successResponse({
      cloud_name: config.cloud_name,
      api_key: config.api_key,
      signature: signature,
      timestamp: timestamp,
      folder: folder,
      upload_url: `https://api.cloudinary.com/v1_1/${config.cloud_name}/auto/upload`,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
