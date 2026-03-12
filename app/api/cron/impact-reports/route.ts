export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import prisma from '@/lib/prisma'; // force TS re-evaluation
import { sendImpactReportEmail } from '@/lib/email-service';
import { getTranslations } from 'next-intl/server';
import { MongoClient, ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const testMode = searchParams.get('test') === 'true';

        const db = await getDb();

        // Find all successful donations that happened roughly X years ago (anniversary)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const oneYearAgoStart = new Date(today);
        oneYearAgoStart.setFullYear(oneYearAgoStart.getFullYear() - 1);

        const oneYearAgoEnd = new Date(oneYearAgoStart);
        oneYearAgoEnd.setDate(oneYearAgoEnd.getDate() + 1);

        const matchSpec: any = {
            payment_status: { $in: ['paid', 'completed'] },
            created_at: {
                $gte: oneYearAgoStart,
                $lt: oneYearAgoEnd
            }
        };

        if (testMode) {
            delete matchSpec.created_at; // For testing, just pull latest successful donations
        }

        console.log('[Cron] Searching for anniversary donations with spec:', matchSpec);

        const anniversaryDonations = await db.collection('donations')
            .find(matchSpec)
            .limit(testMode ? 5 : 1000)
            .toArray();

        console.log(`[Cron] Found ${anniversaryDonations.length} anniversary donations.`);

        const results = [];

        for (const donation of anniversaryDonations) {
            try {
                if (!donation.donor_id || !donation.campaign_id) continue;

                // Get Donor User Info
                const donorUser = await db.collection('users').findOne({
                    _id: new ObjectId(donation.donor_id)
                });
                if (!donorUser || !donorUser.email) continue;

                // Get Campaign connected to a student
                const campaign = await db.collection('campaigns').findOne({ campaign_id: donation.campaign_id });
                if (!campaign || !campaign.owner_id) continue;

                // Get Student Profile
                const studentProfile = await prisma.studentProfile.findUnique({
                    where: { userId: campaign.owner_id },
                    include: {
                        achievements: {
                            orderBy: { date: 'desc' },
                            take: 3
                        }
                    }
                });

                if (!studentProfile) continue;

                // Get Student User Info for name
                const studentUser = await db.collection('users').findOne({
                    _id: new ObjectId(campaign.owner_id)
                });

                const donorLang = donorUser.preferred_language || 'en';

                // Emulate getting translations for donor's language
                const t = await getTranslations({ locale: donorLang });

                const newAchievements = studentProfile.achievements.map((a: any) => t(`common.${a.type}`) || a.title);

                // Generate OG Image URL
                const ogUrl = new URL(`/api/og/impact`, process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL || 'http://localhost:3000');
                ogUrl.searchParams.set('studentName', encodeURIComponent(studentUser?.name || 'Student'));
                ogUrl.searchParams.set('years', '1');
                ogUrl.searchParams.set('lang', donorLang);

                const emailResult = await sendImpactReportEmail({
                    to: donorUser.email,
                    donorName: donorUser.name || 'Donor',
                    studentName: studentUser?.name || 'Student',
                    studentPhotoUrl: studentProfile.photoUrl || `${process.env.NEXT_PUBLIC_APP_URL}/placeholder.jpg`,
                    yearsSupported: 1,
                    newAchievements: newAchievements,
                    gpaChange: studentProfile.gpa ? `+0.2` : undefined, // Example mock if GPA exists
                    followUrl: `${process.env.NEXT_PUBLIC_APP_URL}/students/${studentProfile.id}`,
                    impactCardUrl: ogUrl.toString(),
                    campaignUrl: `${process.env.NEXT_PUBLIC_APP_URL}/campaign/${campaign.campaign_id}`,
                    t: (key: string, vars?: any) => t(key as any, vars)
                });

                results.push({
                    donor: donorUser.email,
                    student: studentUser?.name,
                    success: emailResult.success
                });

            } catch (err: any) {
                console.error('[Cron] Failed to process donation:', donation._id, err);
                results.push({
                    donationId: donation._id,
                    success: false,
                    error: err.message
                });
            }
        }

        return NextResponse.json({
            message: 'Impact reports processed',
            tested: testMode,
            processed: results.length,
            details: results
        });

    } catch (error: any) {
        console.error('[Impact Report Cron] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
