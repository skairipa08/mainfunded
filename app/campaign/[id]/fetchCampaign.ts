import { getDb } from '@/lib/db';
import { ObjectId } from 'mongodb';

export interface CampaignData {
    campaign_id: string;
    title: string;
    story: string;
    goal_amount: number;
    raised_amount: number;
    donor_count: number;
    cover_image?: string;
    status: string;
    created_at?: string;
    owner_id: string;
    isPublished?: boolean;
    createdFrom?: string;
    category?: string;
    studentPhotos?: string[];
    studentVideos?: string[];
    documentTypes?: string[];
    documentStatuses?: string[];
    tier_approved?: number;
    student: {
        user_id: string;
        name: string;
        picture?: string | null;
        country?: string | null;
        field_of_study?: string | null;
        university?: string | null;
        verification_status?: string | null;
        tier_approved?: number;
    };
    donors: {
        name: string;
        amount: number;
        date?: string;
        anonymous: boolean;
    }[];
}

/**
 * Fetch campaign data directly from MongoDB (server-side only).
 * Used by both generateMetadata and the page component.
 */
export async function fetchCampaignData(campaignId: string): Promise<CampaignData | null> {
    try {
        const db = await getDb();

        const campaign = await db.collection('campaigns').findOne(
            { campaign_id: campaignId }
        );

        if (!campaign || (campaign.status !== 'published' && campaign.status !== 'active')) {
            return null;
        }

        const ownerId = campaign.owner_id;

        // Fetch user, student profile, donations in parallel
        const [user, studentProfile, raisedAgg, donations] = await Promise.all([
            db.collection('users').findOne(
                { _id: new ObjectId(ownerId) },
                { projection: { _id: 1, name: 1, image: 1 } }
            ),
            db.collection('student_profiles').findOne(
                { user_id: ownerId },
                { projection: { _id: 0 } }
            ),
            db.collection('donations').aggregate([
                { $match: { campaign_id: campaignId, status: 'paid' } },
                {
                    $group: {
                        _id: null,
                        raised_amount: { $sum: { $ifNull: ['$amount', 0] } },
                        donor_count: { $sum: 1 },
                    },
                },
            ]).toArray(),
            db.collection('donations')
                .find(
                    { campaign_id: campaignId, status: 'paid' },
                    { projection: { _id: 0, donor_name: 1, anonymous: 1, amount: 1, created_at: 1 } }
                )
                .sort({ created_at: -1 })
                .limit(50)
                .toArray(),
        ]);

        const agg = raisedAgg[0];
        const donorWall = donations.map((d: any) => ({
            name: d.anonymous ? 'Anonymous' : (d.donor_name || 'Anonymous'),
            amount: d.amount,
            date: d.created_at,
            anonymous: d.anonymous || false,
        }));

        const result: CampaignData = {
            campaign_id: campaign.campaign_id || campaign._id.toString(),
            title: campaign.title || '',
            story: campaign.story || '',
            goal_amount: campaign.goal_amount || 0,
            raised_amount: agg?.raised_amount ?? 0,
            donor_count: agg?.donor_count ?? 0,
            cover_image: campaign.cover_image,
            status: campaign.status,
            created_at: campaign.created_at,
            owner_id: ownerId,
            isPublished: campaign.isPublished,
            createdFrom: campaign.createdFrom,
            category: campaign.category,
            studentPhotos: campaign.studentPhotos || [],
            studentVideos: campaign.studentVideos || [],
            documentTypes: campaign.documentTypes || [],
            documentStatuses: campaign.documentStatuses || [],
            tier_approved: campaign.tier_approved,
            student: {
                user_id: ownerId,
                name: user?.name || 'Unknown',
                picture: user?.image || null,
                country: studentProfile?.country || null,
                field_of_study: studentProfile?.fieldOfStudy || studentProfile?.field_of_study || null,
                university: studentProfile?.university || null,
                verification_status: studentProfile?.verificationStatus || studentProfile?.verification_status || null,
                tier_approved: studentProfile?.tier_approved,
            },
            donors: donorWall,
        };

        // Serialize to plain object (remove ObjectId instances)
        return JSON.parse(JSON.stringify(result));
    } catch {
        return null;
    }
}
