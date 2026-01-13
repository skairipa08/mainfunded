import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/authz';
import { errorResponse, getStatusCode } from '@/lib/api-error';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = withRateLimit(request, RATE_LIMITS.admin);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    await requireAdmin();
    
    const db = await getDb();
    
    const totalUsers = await db.collection('users').countDocuments({});
    const totalAdmins = await db.collection('users').countDocuments({ role: 'admin' });
    
    // Student profiles (only from student_profiles collection)
    const pendingVerifications = await db.collection('student_profiles').countDocuments({ verificationStatus: 'pending' });
    const verifiedStudents = await db.collection('student_profiles').countDocuments({ verificationStatus: 'verified' });
    const rejectedStudents = await db.collection('student_profiles').countDocuments({ verificationStatus: 'rejected' });
    
    const totalCampaigns = await db.collection('campaigns').countDocuments({});
    const publishedCampaigns = await db.collection('campaigns').countDocuments({ status: 'published' });
    const completedCampaigns = await db.collection('campaigns').countDocuments({ status: 'completed' });
    
    const donationStats = await db.collection('donations').aggregate([
      { $match: { status: 'paid' } },
      {
        $group: {
          _id: null,
          total_amount: { $sum: '$amount' },
          total_count: { $sum: 1 },
        },
      },
    ]).toArray();
    
    const stats = donationStats[0] || { total_amount: 0, total_count: 0 };
    
    return NextResponse.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          admins: totalAdmins,
        },
        verifications: {
          pending: pendingVerifications,
          verified: verifiedStudents,
          rejected: rejectedStudents,
        },
        campaigns: {
          total: totalCampaigns,
          published: publishedCampaigns,
          completed: completedCampaigns,
        },
        donations: {
          total_amount: stats.total_amount,
          total_count: stats.total_count,
        },
      },
    });
  } catch (error: any) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      errorResponse(error),
      { status: getStatusCode(error) }
    );
  }
}
