import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdminOrOps } from '@/lib/authz';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { notifyDonorsForApprovedExpenditure } from '@/lib/expenditure-notifications';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Params {
  params: {
    id: string;
  };
}

export async function POST(request: NextRequest, { params }: Params) {
  const rateLimitResponse = withRateLimit(request, RATE_LIMITS.adminAction);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const reviewer = await requireAdminOrOps();
    const db = await getDb();

    const expenditureId = params.id;
    if (!expenditureId) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Expenditure ID is required' } },
        { status: 400 }
      );
    }

    const body = await request.json();
    const action = String(body?.action || '').toLowerCase();
    const note = typeof body?.note === 'string' ? body.note.trim() : undefined;

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'action must be approve or reject' } },
        { status: 400 }
      );
    }

    const existing = await db.collection('expenditures').findOne(
      { expenditure_id: expenditureId },
      { projection: { _id: 0 } }
    );

    if (!existing) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Expenditure not found' } },
        { status: 404 }
      );
    }

    if (existing.status !== 'pending') {
      return NextResponse.json(
        { error: { code: 'INVALID_STATE', message: 'Only pending expenditures can be reviewed' } },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();
    const nextStatus = action === 'approve' ? 'approved' : 'rejected';

    await db.collection('expenditures').updateOne(
      { expenditure_id: expenditureId },
      {
        $set: {
          status: nextStatus,
          approved_by: reviewer.id,
          approved_by_name: reviewer.name,
          review_note: note,
          reviewed_at: now,
          published_at: nextStatus === 'approved' ? now : null,
          updated_at: now,
        },
      }
    );

    const updated = await db.collection('expenditures').findOne(
      { expenditure_id: expenditureId },
      { projection: { _id: 0 } }
    );

    if (nextStatus === 'approved' && updated) {
      const campaign = await db.collection('campaigns').findOne(
        { campaign_id: updated.campaign_id },
        { projection: { _id: 0, campaign_id: 1, title: 1 } }
      );

      if (campaign) {
        await notifyDonorsForApprovedExpenditure({
          campaignId: campaign.campaign_id,
          campaignTitle: campaign.title || campaign.campaign_id,
          expenditure: updated,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Expenditure ${nextStatus}`,
    });
  } catch (error: any) {
    if (error?.message === 'Unauthorized') {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 });
    }
    if (error?.statusCode === 403 || error?.message === 'Insufficient permissions') {
      return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } }, { status: 403 });
    }

    console.error('[Admin Expenditure Action API] POST error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
