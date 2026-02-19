export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/authz';
import { errorResponse, getStatusCode } from '@/lib/api-error';
import { campaignStatusSchema } from '@/lib/validators/admin';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { logAudit } from '@/lib/audit';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Rate limiting
  const rateLimitResponse = withRateLimit(request, RATE_LIMITS.admin);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const admin = await requireAdmin();

    const { id } = params;
    const db = await getDb();
    const body = await request.json();

    // Validate input
    const validation = campaignStatusSchema.safeParse({ body, params: { id } });
    if (!validation.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: validation.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const { status, reason } = validation.data.body;

    const campaign = await db.collection('campaigns').findOne(
      { campaign_id: id },
      { projection: { _id: 0 } }
    );

    if (!campaign) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Campaign not found' } },
        { status: 404 }
      );
    }

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (reason) {
      updateData.status_reason = reason;
    }

    await db.collection('campaigns').updateOne(
      { campaign_id: id },
      { $set: updateData }
    );

    // Audit log
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    await logAudit(db, {
      actor_user_id: admin.id,
      actor_email: admin.email,
      action: 'campaign.status_changed',
      target_type: 'campaign',
      target_id: id,
      target_details: { previous_status: campaign.status, new_status: status, reason: reason ?? '' },
      ip_address: ip,
      severity: 'info',
    });

    const updatedCampaign = await db.collection('campaigns').findOne(
      { campaign_id: id },
      { projection: { _id: 0 } }
    );

    return NextResponse.json({
      success: true,
      data: updatedCampaign,
      message: `Campaign status updated to ${status}`,
    });
  } catch (error: any) {
    console.error('Campaign status update error:', error);
    return NextResponse.json(
      errorResponse(error),
      { status: getStatusCode(error) }
    );
  }
}
