import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { auth } from '@/auth';
import { ObjectId } from 'mongodb';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Helper to generate URL-safe slug
function generateSlug(name: string): string {
    const base = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    const shortId = crypto.randomBytes(4).toString('hex');
    return `${base}-${shortId}`;
}

// GET /api/ops/applications/[id] - Get single application
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        const role = (session?.user as any)?.role;

        if (!session?.user || !['admin', 'ops'].includes(role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = await getDb();
        const { id } = params;

        let application = null;

        // Try ObjectId first, then string id
        try {
            application = await db.collection('applications').findOne({ _id: new ObjectId(id) });
        } catch {
            application = await db.collection('applications').findOne({ id });
        }

        if (!application) {
            return NextResponse.json({
                success: false,
                error: 'Application not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: {
                ...application,
                id: application._id?.toString() || application.id,
                _id: undefined,
            },
        });
    } catch (error: any) {
        console.error('Ops application GET error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

// PUT /api/ops/applications/[id] - Update application status
// When status becomes 'Approved', create campaign in campaigns collection
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        const role = (session?.user as any)?.role;

        if (!session?.user || !['admin', 'ops'].includes(role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = await getDb();
        const { id } = params;
        const body = await request.json();
        const { status } = body;

        if (!status) {
            return NextResponse.json({
                success: false,
                error: 'Status is required'
            }, { status: 400 });
        }

        // Find application
        let application = null;
        let query: any = {};

        try {
            query = { _id: new ObjectId(id) };
            application = await db.collection('applications').findOne(query);
        } catch {
            query = { id };
            application = await db.collection('applications').findOne(query);
        }

        if (!application) {
            return NextResponse.json({
                success: false,
                error: 'Application not found'
            }, { status: 404 });
        }

        // Update application status
        await db.collection('applications').updateOne(
            query,
            {
                $set: {
                    status,
                    updatedAt: new Date().toISOString(),
                }
            }
        );

        // If approved, create/upsert campaign in campaigns collection
        if (status === 'Approved') {
            const applicationId = application._id?.toString() || application.id;
            const slug = generateSlug(application.fullName || 'campaign');
            const campaignId = `campaign_app_${applicationId}`;

            const campaignData = {
                campaign_id: campaignId,
                sourceApplicationId: applicationId,
                createdFrom: 'application',
                owner_id: application.userId || null, // May not have user yet
                title: `Support ${application.fullName}'s Education`,
                story: application.story || application.needSummary || 'Help support this student\'s educational journey.',
                category: 'education',
                country: application.country || 'Unknown',
                field_of_study: application.educationLevel || 'General',
                goal_amount: application.goalAmount || 500,
                raised_amount: 0,
                donor_count: 0,
                status: 'published', // Canonical status for public listing
                isPublished: true,
                publishedAt: new Date().toISOString(),
                studentPhotos: [],
                cover_image: null,
                funding_type: 'ONE_TIME',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                // Student info for display
                studentName: application.fullName,
                studentEmail: application.email,
            };

            // Upsert: update if exists, insert if not (idempotent)
            await db.collection('campaigns').updateOne(
                { campaign_id: campaignId },
                { $set: campaignData },
                { upsert: true }
            );

            console.log(`[Ops] Created/updated campaign ${campaignId} from application ${applicationId}`);
        }

        // Return updated application
        const updated = await db.collection('applications').findOne(query);

        return NextResponse.json({
            success: true,
            data: {
                ...updated,
                id: updated?._id?.toString() || updated?.id,
                _id: undefined,
            },
            message: status === 'Approved'
                ? 'Application approved and campaign created'
                : `Application status updated to ${status}`,
        });
    } catch (error: any) {
        console.error('Ops application PUT error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
