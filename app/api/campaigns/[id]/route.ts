import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireUser, requireAdmin } from '@/lib/authz';
import { errorResponse, getStatusCode } from '@/lib/api-error';
import { campaignUpdateSchema } from '@/lib/validators/campaign';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const db = await getDb();
    
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
    
    // Check if user can view (published or owner/admin)
    const session = await requireUser().catch(() => null);
    const isOwner = session && campaign.owner_id === session.id;
    const isAdmin = session?.role === 'admin';
    
    if (campaign.status !== 'published' && !isOwner && !isAdmin) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Campaign not found' } },
        { status: 404 }
      );
    }
    
    const ownerId = campaign.owner_id;
    
    // Fetch user and student profile (canonical IDs)
    const [user, studentProfile] = await Promise.all([
      db.collection('users').findOne(
        { _id: new ObjectId(ownerId) },
        { projection: { _id: 1, email: 1, name: 1, image: 1 } }
      ),
      db.collection('student_profiles').findOne(
        { user_id: ownerId },
        { projection: { _id: 0 } }
      ),
    ]);
    
    // Get donor wall (public donations)
    const donations = await db.collection('donations')
      .find(
        { campaign_id: id, status: 'paid' },
        { projection: { _id: 0, donor_name: 1, anonymous: 1, amount: 1, created_at: 1 } }
      )
      .sort({ created_at: -1 })
      .limit(50)
      .toArray();
    
    const donorWall = donations.map((d: any) => ({
      name: d.anonymous ? 'Anonymous' : (d.donor_name || 'Anonymous'),
      amount: d.amount,
      date: d.created_at,
      anonymous: d.anonymous || false,
    }));
    
    return NextResponse.json({
      success: true,
      data: {
        ...campaign,
        student: {
          user_id: ownerId,
          name: user?.name || 'Unknown',
          email: isOwner || isAdmin ? user?.email : undefined,
          picture: user?.image || null,
          country: studentProfile?.country || null,
          field_of_study: studentProfile?.fieldOfStudy || studentProfile?.field_of_study || null,
          university: studentProfile?.university || null,
          verification_status: studentProfile?.verificationStatus || studentProfile?.verification_status || null,
        },
        donors: donorWall,
      },
    });
  } catch (error: any) {
    console.error('Campaign GET error:', error);
    return NextResponse.json(
      errorResponse(error),
      { status: getStatusCode(error) }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const user = await requireUser();
    
    const db = await getDb();
    const body = await request.json();
    
    // Validate input
    const validation = campaignUpdateSchema.safeParse({ body, params: { id } });
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
        { error: { code: 'FORBIDDEN', message: 'Not authorized to update this campaign' } },
        { status: 403 }
      );
    }
    
    // Update fields
    const updateData: any = { ...validation.data.body };
    updateData.updated_at = new Date().toISOString();
    
    // Remove undefined fields
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });
    
    await db.collection('campaigns').updateOne(
      { campaign_id: id },
      { $set: updateData }
    );
    
    const updatedCampaign = await db.collection('campaigns').findOne(
      { campaign_id: id },
      { projection: { _id: 0 } }
    );
    
    return NextResponse.json({
      success: true,
      data: updatedCampaign,
      message: 'Campaign updated successfully',
    });
  } catch (error: any) {
    console.error('Campaign PATCH error:', error);
    return NextResponse.json(
      errorResponse(error),
      { status: getStatusCode(error) }
    );
  }
}
