export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireUser } from '@/lib/authz';
import prisma from '@/lib/prisma';
import { handleRouteError, successResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
    try {
        const user = await requireUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = await getDb();

        // Aggregation: Find unique campaigns successfully supported by user and sum total amount
        const donationsPipeline = [
            {
                $match: {
                    donor_id: user.id,
                    payment_status: { $in: ['paid', 'completed'] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$amount' },
                    uniqueCampaigns: { $addToSet: '$campaign_id' }
                }
            }
        ];

        const [donationMetrics] = await db.collection('donations').aggregate(donationsPipeline).toArray();

        if (!donationMetrics || !donationMetrics.uniqueCampaigns || donationMetrics.uniqueCampaigns.length === 0) {
            return successResponse({
                totalAmount: 0,
                totalStudentsSupported: 0,
                totalGraduated: 0
            });
        }

        const campaignIds = donationMetrics.uniqueCampaigns;

        // Get owner_ids (student users) from those campaigns
        const campaigns = await db.collection('campaigns').find(
            { campaign_id: { $in: campaignIds }, owner_id: { $ne: null } },
            { projection: { owner_id: 1, _id: 0 } }
        ).toArray();

        const uniqueStudentUserIds = [...new Set(campaigns.map(c => c.owner_id))];

        if (uniqueStudentUserIds.length === 0) {
            return successResponse({
                totalAmount: donationMetrics.totalAmount || 0,
                totalStudentsSupported: 0,
                totalGraduated: 0
            });
        }

        // Connect user_id to student_profiles via prisma to check achievements
        const studentProfiles = await prisma.studentProfile.findMany({
            where: { userId: { in: uniqueStudentUserIds } },
            include: {
                achievements: {
                    where: { type: 'GRADUATED' }
                }
            }
        });

        const totalStudentsSupported = studentProfiles.length;
        const totalGraduated = studentProfiles.filter(p => p.achievements && p.achievements.length > 0).length;

        return successResponse({
            totalAmount: donationMetrics.totalAmount || 0,
            totalStudentsSupported,
            totalGraduated
        });

    } catch (error: any) {
        console.error('[Impact Metrics API API] Error:', error);
        return handleRouteError(error);
    }
}
