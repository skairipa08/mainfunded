export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireUser } from '@/lib/authz';
import { successResponse, errorResponse, handleRouteError } from '@/lib/api-response';
import crypto from 'crypto';

// GET: Fetch all updates by the current student
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const user = await requireUser();

    const updates = await db
      .collection('student_updates')
      .find(
        { owner_id: user.id },
        { projection: { _id: 0 } },
      )
      .sort({ created_at: -1 })
      .limit(50)
      .toArray();

    // Enrich with campaign titles
    const campaignIds = [...new Set(updates.map((u: any) => u.campaign_id))];
    const campaigns = campaignIds.length > 0
      ? await db
          .collection('campaigns')
          .find(
            { campaign_id: { $in: campaignIds } },
            { projection: { _id: 0, campaign_id: 1, title: 1 } },
          )
          .toArray()
      : [];

    const campaignMap = new Map(campaigns.map((c: any) => [c.campaign_id, c.title]));

    const enriched = updates.map((u: any) => ({
      ...u,
      campaign_title: campaignMap.get(u.campaign_id) || '',
    }));

    return successResponse(enriched);
  } catch (error) {
    return handleRouteError(error);
  }
}

// POST: Create a new student update
export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const user = await requireUser();
    const body = await request.json();

    const { campaign_id, content, photos } = body;

    if (!campaign_id) {
      return errorResponse(
        { code: 'VALIDATION_ERROR', message: 'Kampanya seçimi gereklidir' },
        400,
      );
    }

    if (!content?.trim() && (!photos || photos.length === 0)) {
      return errorResponse(
        { code: 'VALIDATION_ERROR', message: 'Metin veya fotoğraf gereklidir' },
        400,
      );
    }

    if (content && content.trim().length > 2000) {
      return errorResponse(
        { code: 'VALIDATION_ERROR', message: 'Metin 2000 karakteri geçemez' },
        400,
      );
    }

    if (photos && photos.length > 5) {
      return errorResponse(
        { code: 'VALIDATION_ERROR', message: 'En fazla 5 fotoğraf eklenebilir' },
        400,
      );
    }

    // Verify the campaign belongs to this student
    const campaign = await db.collection('campaigns').findOne(
      { campaign_id, owner_id: user.id },
      { projection: { campaign_id: 1, title: 1, status: 1 } },
    );

    if (!campaign) {
      return errorResponse(
        { code: 'FORBIDDEN', message: 'Bu kampanya size ait değil' },
        403,
      );
    }

    const updateDoc = {
      update_id: `upd_${crypto.randomBytes(8).toString('hex')}`,
      campaign_id,
      owner_id: user.id,
      content: content?.trim() || '',
      photos: photos || [],
      visibility: 'donors_only', // Only donors of this campaign can see
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await db.collection('student_updates').insertOne(updateDoc);

    return successResponse(
      { update_id: updateDoc.update_id },
      'Güncelleme başarıyla paylaşıldı',
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
