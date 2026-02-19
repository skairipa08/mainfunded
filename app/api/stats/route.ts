import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/stats
 * Public platform statistics (no auth required).
 * Returns aggregated, non-sensitive numbers for the homepage.
 */
export async function GET() {
  try {
    const db = await getDb();

    const [verifiedStudents, campaignCount, donationAgg] = await Promise.all([
      db.collection('student_profiles').countDocuments({ verificationStatus: 'verified' }),
      db.collection('campaigns').countDocuments({ status: { $in: ['active', 'published', 'completed'] } }),
      db.collection('donations').aggregate([
        { $match: { status: 'paid' } },
        {
          $group: {
            _id: null,
            total_amount: { $sum: '$amount' },
            unique_donors: { $addToSet: '$donor_email' },
          },
        },
      ]).toArray(),
    ]);

    const agg = donationAgg[0];

    return NextResponse.json({
      success: true,
      data: {
        studentsHelped: verifiedStudents,
        totalRaised: agg?.total_amount ?? 0,
        campaigns: campaignCount,
        donors: agg?.unique_donors?.length ?? 0,
      },
    });
  } catch {
    // If DB is not connected, return zeros gracefully
    return NextResponse.json({
      success: true,
      data: {
        studentsHelped: 0,
        totalRaised: 0,
        campaigns: 0,
        donors: 0,
      },
    });
  }
}
