import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireUser } from '@/lib/authz';
import { errorResponse, getStatusCode } from '@/lib/api-error';
import { sendEmail, renderCampaignPublishedEmail } from '@/lib/email';
import { ObjectId } from 'mongodb';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const user = await requireUser();
    
    const db = await getDb();
    
    // Get campaign
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
    
    // Check ownership (or admin) - use canonical owner_id
    const isOwner = campaign.owner_id === user.id;
    const isAdmin = user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Not authorized to publish this campaign' } },
        { status: 403 }
      );
    }
    
    // Publish campaign
    await db.collection('campaigns').updateOne(
      { campaign_id: id },
      {
        $set: {
          status: 'published',
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      }
    );
    
    const updatedCampaign = await db.collection('campaigns').findOne(
      { campaign_id: id },
      { projection: { _id: 0 } }
    );
    
    // Send email notification (non-blocking)
    try {
      const owner = await db.collection('users').findOne(
        { _id: new ObjectId(user.id) },
        { projection: { email: 1, name: 1 } }
      );
      
      if (owner?.email && updatedCampaign) {
        await sendEmail({
          to: owner.email,
          subject: 'Your Campaign is Now Live',
          html: renderCampaignPublishedEmail({
            studentName: owner.name || 'Student',
            studentEmail: owner.email,
            campaignTitle: updatedCampaign.title || 'Campaign',
            campaignId: id,
          }),
        });
      }
    } catch {
      // Ignore email errors
    }
    
    return NextResponse.json({
      success: true,
      data: updatedCampaign,
      message: 'Campaign published successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      errorResponse(error),
      { status: getStatusCode(error) }
    );
  }
}
