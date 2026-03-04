import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/authz';
import { getDb } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { calculateSocialImpact, calculateDigitalEnvironmentalImpact, calculateGovernanceImpact, CampaignData } from '@/lib/esg/calculations';
import { ESGRecord, RecordStatus } from '@/types/esg';

export const dynamic = 'force-dynamic';

/**
 * GET /api/esg/metrics - Calculate and return the core FundEd Social Impact metrics for the logged-in Institutional User
 */
export async function GET(request: NextRequest) {
    const rateLimitResponse = withRateLimit(request, RATE_LIMITS.api);
    if (rateLimitResponse) return rateLimitResponse;

    try {
        const user = await getSessionUser();
        if (!user) {
            return NextResponse.json(
                { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
                { status: 401 }
            );
        }

        // In a real scenario, we'd ensure 'user' has Institutional/Corporate role
        // if (user.role !== 'institution' && user.role !== 'admin') {
        //   return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Requires institution account' } }, { status: 403 });
        // }

        const db = await getDb();

        // 1. Fetch all donations made by this user (or company)
        const donations = await db.collection('donations').find({ donor_id: user.id, payment_status: 'paid' }).toArray();
        const total_donations_usd = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
        const total_transactions = donations.length;

        // 2. Fetch the corresponding campaigns to analyze impact demographics
        const campaignIds = [...new Set(donations.map(d => d.campaign_id))];
        const campaigns = await db.collection('campaigns').find({
            campaign_id: { $in: campaignIds }
        }).toArray();

        // Map DB documents to CampaignData expected by calculation engine
        const supported_campaigns: CampaignData[] = campaigns.map(c => ({
            target_amount: c.target_amount,
            raised_amount: c.raised_amount,
            student_gender: c.student_gender || 'unknown', // Assumes student_gender might be joined or stored per campaign
            student_region: c.student_region || 'unknown', // Same for region
            is_verified: c.is_verified || true // If it's a campaign on FundEd, it implies verification
        }));

        // 3. Compute Metrics via Engine
        const socialMetrics = calculateSocialImpact(total_donations_usd, supported_campaigns);
        const envMetrics = calculateDigitalEnvironmentalImpact(total_donations_usd, total_transactions);
        const govMetrics = calculateGovernanceImpact(supported_campaigns);

        // Attempt to load or create their public Impact Profile
        let profile = await db.collection('esg_impact_profiles').findOne({ user_id: user.id });

        // Simulate generation of periods based on data
        const currentPeriod = new Date().getFullYear().toString();

        const recordPayload: ESGRecord = {
            record_id: `esg_rec_${new ObjectId().toHexString()}`,
            profile_id: profile ? String(profile._id) : `esg_prof_${user.id}`,
            period: currentPeriod,
            status: RecordStatus.APPROVED,
            social: socialMetrics,
            environmental: envMetrics,
            governance: govMetrics,
            created_by: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        return NextResponse.json({
            success: true,
            data: {
                metrics: recordPayload,
                summary: `Your donations have fully/partially supported ${socialMetrics.total_students_funded} students. Thanks to digital execution, ${envMetrics.paperless_operations_saved_kg} kg of paper has been saved.`
            }
        });

    } catch (error: any) {
        console.error('ESG Metrics GET error:', error);
        return NextResponse.json(
            { error: { code: 'INTERNAL_ERROR', message: 'Failed to calculate ESG & Impact metrics.' } },
            { status: 500 }
        );
    }
}
