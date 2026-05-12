import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDb } from '@/lib/db';
import { getSessionUser, requireUser } from '@/lib/authz';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { storage } from '@/lib/storage';
import { calculateFileHash, sanitizeFileName, validateFile } from '@/lib/verification/upload';
import {
  ExpenditureRecord,
  ExpenditureStatus,
  getCampaignFinancialSummary,
  isValidExpenditureCategory,
  withReceiptUrl,
} from '@/lib/expenditures';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function getUploadPath(campaignId: string, expenditureId: string, mimeType: string) {
  const ext = mimeType === 'application/pdf'
    ? 'pdf'
    : mimeType === 'image/png'
      ? 'png'
      : 'jpg';
  return `expenditures/${campaignId}/${expenditureId}/receipt.${ext}`;
}

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaign_id');
    const requestedStatus = searchParams.get('status');

    if (!campaignId) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'campaign_id is required' } },
        { status: 400 }
      );
    }

    const campaign = await db.collection('campaigns').findOne(
      { campaign_id: campaignId },
      { projection: { _id: 0, campaign_id: 1, owner_id: 1, title: 1 } }
    );

    if (!campaign) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Campaign not found' } },
        { status: 404 }
      );
    }

    const session = await getSessionUser();
    const isModerator = !!session && ['admin', 'ops'].includes((session as any).role);
    const isOwner = !!session && campaign.owner_id === session.id;
    const canSeeAll = isModerator || isOwner;

    let statusFilter: ExpenditureStatus = 'approved';
    if (canSeeAll && requestedStatus && ['pending', 'approved', 'rejected'].includes(requestedStatus)) {
      statusFilter = requestedStatus as ExpenditureStatus;
    }

    const expenditures = await db.collection<ExpenditureRecord>('expenditures')
      .find(
        {
          campaign_id: campaignId,
          status: statusFilter,
        },
        { projection: { _id: 0 } }
      )
      .sort({ created_at: -1 })
      .toArray();

    const summary = await getCampaignFinancialSummary(campaignId);
    const items = expenditures.map((item) => withReceiptUrl(item));

    return NextResponse.json({
      success: true,
      data: {
        campaign_id: campaignId,
        campaign_title: campaign.title,
        summary,
        expenditures: items,
      },
    });
  } catch (error: any) {
    console.error('[Expenditures API] GET error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const rateLimitResponse = withRateLimit(request, RATE_LIMITS.api);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const user = await requireUser();
    const db = await getDb();

    const formData = await request.formData();

    const campaignId = (formData.get('campaign_id') as string | null)?.trim();
    const category = (formData.get('category') as string | null)?.trim();
    const customCategory = (formData.get('custom_category') as string | null)?.trim() || undefined;
    const amountRaw = (formData.get('amount') as string | null)?.trim();
    const description = (formData.get('description') as string | null)?.trim();
    const file = formData.get('receipt') as File | null;

    if (!campaignId || !category || !amountRaw || !description || !file) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'campaign_id, category, amount, description and receipt are required' } },
        { status: 400 }
      );
    }

    if (!isValidExpenditureCategory(category)) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid category' } },
        { status: 400 }
      );
    }

    if (category === 'Diğer' && !customCategory) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'custom_category is required for Diğer category' } },
        { status: 400 }
      );
    }

    const amount = Number(amountRaw);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Amount must be a positive number' } },
        { status: 400 }
      );
    }

    const campaign = await db.collection('campaigns').findOne(
      { campaign_id: campaignId },
      { projection: { _id: 0, campaign_id: 1, owner_id: 1, title: 1 } }
    );

    if (!campaign) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Campaign not found' } },
        { status: 404 }
      );
    }

    const isModerator = ['admin', 'ops'].includes((user as any).role);
    const isOwner = campaign.owner_id === user.id;
    if (!isOwner && !isModerator) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Not authorized to add expenditures for this campaign' } },
        { status: 403 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const validation = validateFile(buffer, file.type, file.name);
    if (!validation.valid) {
      return NextResponse.json(
        { error: { code: validation.errorCode || 'VALIDATION_ERROR', message: validation.error || 'Invalid file' } },
        { status: 400 }
      );
    }

    const expenditureId = crypto.randomUUID();
    const storagePath = getUploadPath(campaignId, expenditureId, file.type);
    const upload = await storage.upload(buffer, storagePath, file.type);

    if (!upload.success) {
      return NextResponse.json(
        { error: { code: 'UPLOAD_ERROR', message: upload.error || 'Failed to upload receipt' } },
        { status: 500 }
      );
    }

    const now = new Date().toISOString();
    const expenditure: ExpenditureRecord = {
      expenditure_id: expenditureId,
      campaign_id: campaignId,
      category,
      custom_category: customCategory,
      amount,
      currency: 'TRY',
      description,
      receipt: {
        storage_path: storagePath,
        file_name: sanitizeFileName(file.name),
        mime_type: file.type,
        file_size_bytes: buffer.length,
        sha256_hash: calculateFileHash(buffer),
      },
      status: 'pending',
      created_by: user.id,
      created_by_name: user.name,
      created_by_role: (user as any).role || 'user',
      created_at: now,
      updated_at: now,
    };

    await db.collection('expenditures').insertOne(expenditure);

    return NextResponse.json(
      {
        success: true,
        data: withReceiptUrl(expenditure),
        message: 'Expenditure submitted for admin review',
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error?.message === 'Unauthorized') {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    console.error('[Expenditures API] POST error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
