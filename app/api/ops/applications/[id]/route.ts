import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { auth } from '@/auth';
import { ObjectId } from 'mongodb';
import crypto from 'crypto';
import { sendEmail } from '@/lib/email';
import { logger } from '@/lib/logger';

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

// PUT /api/ops/applications/[id] - Update application status OR individual document verification
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

        // ---------- DOCUMENT TYPE UPDATE (set type label for a document) ----------
        if (body.documentTypeUpdate) {
            const { documentIndex, documentType } = body.documentTypeUpdate;
            const validTypes = ['id', 'school_email', 'transcript'];
            if (documentIndex === undefined || !validTypes.includes(documentType)) {
                return NextResponse.json({ success: false, error: 'Invalid document type data' }, { status: 400 });
            }

            const docs = application.documents || [];
            if (documentIndex < 0 || documentIndex >= docs.length) {
                return NextResponse.json({ success: false, error: 'Document index out of range' }, { status: 400 });
            }

            const existingTypes: string[] = application.documentTypes || docs.map(() => '');
            existingTypes[documentIndex] = documentType;

            await db.collection('applications').updateOne(query, {
                $set: {
                    documentTypes: existingTypes,
                    updatedAt: new Date().toISOString(),
                },
            });

            // Sync to campaign
            const applicationId = application._id?.toString() || application.id;
            const campaignId = `campaign_app_${applicationId}`;
            await db.collection('campaigns').updateOne(
                { campaign_id: campaignId },
                { $set: { documentTypes: existingTypes, updated_at: new Date().toISOString() } }
            );

            const updated = await db.collection('applications').findOne(query);
            return NextResponse.json({
                success: true,
                data: { ...updated, id: updated?._id?.toString() || updated?.id, _id: undefined },
                message: `Document ${documentIndex} type set to ${documentType}`,
            });
        }

        // ---------- DOCUMENT VERIFICATION (per-document approve/reject) ----------
        if (body.documentVerification) {
            const { documentIndex, documentStatus, documentType } = body.documentVerification;
            if (documentIndex === undefined || !['approved', 'rejected'].includes(documentStatus)) {
                return NextResponse.json({ success: false, error: 'Invalid document verification data' }, { status: 400 });
            }

            const docs = application.documents || [];
            if (documentIndex < 0 || documentIndex >= docs.length) {
                return NextResponse.json({ success: false, error: 'Document index out of range' }, { status: 400 });
            }

            // Build the documentStatuses array (preserve existing ones)
            const existingStatuses: string[] = application.documentStatuses || docs.map(() => 'pending');
            existingStatuses[documentIndex] = documentStatus;

            // Also store/update the documentType if provided
            const existingTypes: string[] = application.documentTypes || docs.map(() => '');
            if (documentType) {
                existingTypes[documentIndex] = documentType;
            }

            await db.collection('applications').updateOne(query, {
                $set: {
                    documentStatuses: existingStatuses,
                    documentTypes: existingTypes,
                    updatedAt: new Date().toISOString(),
                },
            });

            // Also sync to campaign if it exists
            const applicationId = application._id?.toString() || application.id;
            const campaignId = `campaign_app_${applicationId}`;
            await db.collection('campaigns').updateOne(
                { campaign_id: campaignId },
                { $set: { documentStatuses: existingStatuses, documentTypes: existingTypes, updated_at: new Date().toISOString() } }
            );

            // If a document is rejected, email the applicant
            if (documentStatus === 'rejected') {
                const docName = docs[documentIndex] || `Belge #${documentIndex + 1}`;
                const displayName = typeof docName === 'string' && docName.startsWith('http')
                    ? `Belge #${documentIndex + 1}`
                    : docName;

                sendEmail({
                    to: application.email,
                    subject: 'FundEd – Belgeniz Reddedildi',
                    html: `
                        <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:24px">
                            <h2 style="color:#1e293b">Merhaba ${application.fullName},</h2>
                            <p style="color:#334155;line-height:1.7">
                                Başvurunuzdaki <strong>${displayName}</strong> adlı belge inceleme sonucunda
                                <span style="color:#dc2626;font-weight:600">reddedilmiştir</span>.
                            </p>
                            <p style="color:#334155;line-height:1.7">
                                Lütfen doğru belgeyi tekrar yükleyin veya detaylı bilgi için
                                <a href="mailto:support@fund-ed.com" style="color:#2563eb">support@fund-ed.com</a>
                                adresinden bize ulaşın.
                            </p>
                            <p style="color:#334155;line-height:1.7">
                                FundEd Ekibi
                            </p>
                        </div>
                    `,
                }).catch(() => { });
            }

            const updated = await db.collection('applications').findOne(query);
            return NextResponse.json({
                success: true,
                data: { ...updated, id: updated?._id?.toString() || updated?.id, _id: undefined },
                message: `Document ${documentIndex} marked as ${documentStatus}`,
            });
        }

        // ---------- APPLICATION STATUS UPDATE ----------
        const { status } = body;

        if (!status) {
            return NextResponse.json({
                success: false,
                error: 'Status is required'
            }, { status: 400 });
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
                title: application.campaignTitle || `Support ${application.fullName}'s Education`,
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
                studentPhotos: application.photos || [],
                studentVideos: application.videos || [],
                cover_image: (application.photos && application.photos.length > 0) ? application.photos[0] : null,
                funding_type: 'ONE_TIME',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                // Student info for display
                studentName: application.fullName,
                studentEmail: application.email,
                // Document verification statuses
                documents: application.documents || [],
                documentStatuses: application.documentStatuses || (application.documents || []).map(() => 'pending'),
                documentTypes: application.documentTypes || (application.documents || []).map(() => ''),
            };

            // Upsert: update if exists, insert if not (idempotent)
            await db.collection('campaigns').updateOne(
                { campaign_id: campaignId },
                { $set: campaignData },
                { upsert: true }
            );

            logger.info(`[Ops] Created/updated campaign ${campaignId} from application ${applicationId}`);
        }

        // ---------- REJECTION: unpublish campaign + notify donors ----------
        if (status === 'Rejected') {
            const applicationId = application._id?.toString() || application.id;
            const campaignId = `campaign_app_${applicationId}`;

            // Find the existing campaign (if any)
            const existingCampaign = await db.collection('campaigns').findOne({ campaign_id: campaignId });

            if (existingCampaign && existingCampaign.isPublished) {
                // Unpublish the campaign
                await db.collection('campaigns').updateOne(
                    { campaign_id: campaignId },
                    {
                        $set: {
                            status: 'rejected',
                            isPublished: false,
                            unpublishedAt: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        },
                    }
                );
                logger.info(`[Ops] Unpublished campaign ${campaignId} due to rejection`);

                // Find donors who donated to this campaign
                const donations = await db.collection('donations')
                    .find({ campaign_id: campaignId })
                    .toArray();

                // Collect unique donor emails
                const donorEmails = new Set<string>();
                for (const donation of donations) {
                    if (donation.donor_email) {
                        donorEmails.add(donation.donor_email);
                    }
                }

                // Send notification email to each donor (fire-and-forget)
                const studentName = application.fullName || 'Öğrenci';
                for (const email of donorEmails) {
                    sendEmail({
                        to: email,
                        subject: `FundEd – Destek Olduğunuz Kampanya Hakkında Bilgilendirme`,
                        html: `
                            <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:24px">
                                <h2 style="color:#1e293b">Değerli Bağışçımız,</h2>
                                <p style="color:#334155;line-height:1.7">
                                    Daha önce destek olduğunuz <strong>${studentName}</strong> adlı öğrencinin kampanyası,
                                    doğrulama sürecimiz sonucunda platformdan kaldırılmıştır.
                                </p>
                                <p style="color:#334155;line-height:1.7">
                                    Bağışınızla ilgili detaylı bilgi ve iade süreçleri için lütfen
                                    <a href="mailto:support@fund-ed.com" style="color:#2563eb">support@fund-ed.com</a>
                                    adresinden bizimle iletişime geçin.
                                </p>
                                <p style="color:#334155;line-height:1.7">
                                    Güveniniz için teşekkür ederiz.<br/>
                                    <strong>FundEd Ekibi</strong>
                                </p>
                            </div>
                        `,
                    }).catch(() => { /* email failure should not block response */ });
                }

                logger.info(`[Ops] Notified ${donorEmails.size} donor(s) about campaign removal`);
            }

            // Always send rejection email to the applicant
            sendEmail({
                to: application.email,
                subject: 'FundEd – Başvurunuz Hakkında Bilgilendirme',
                html: `
                    <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:24px">
                        <h2 style="color:#1e293b">Merhaba ${application.fullName || 'Değerli Başvurucu'},</h2>
                        <p style="color:#334155;line-height:1.7">
                            FundEd platformuna yapmış olduğunuz başvuru inceleme sonucunda
                            <span style="color:#dc2626;font-weight:600">reddedilmiştir</span>.
                        </p>
                        <p style="color:#334155;line-height:1.7">
                            Ret gerekçesi veya yeniden başvuru süreci hakkında bilgi almak için
                            <a href="mailto:support@fund-ed.com" style="color:#2563eb">support@fund-ed.com</a>
                            adresinden bizimle iletişime geçebilirsiniz.
                        </p>
                        <p style="color:#334155;line-height:1.7">
                            İlginiz için teşekkür ederiz.<br/>
                            <strong>FundEd Ekibi</strong>
                        </p>
                    </div>
                `,
            }).catch(() => { });
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
