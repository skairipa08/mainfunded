export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireUser } from '@/lib/authz';
import { successResponse, handleRouteError } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const user = await requireUser();
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;

    // Filters
    const search = searchParams.get('search') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';
    const amountMin = parseFloat(searchParams.get('amountMin') || '0');
    const amountMax = parseFloat(searchParams.get('amountMax') || '0');
    const status = searchParams.get('status') || '';

    // Build query
    const query: any = { donor_id: user.id };

    if (status && status !== 'all') {
      query.payment_status = status;
    } else {
      query.payment_status = { $in: ['paid', 'completed'] };
    }

    if (dateFrom || dateTo) {
      query.created_at = {};
      if (dateFrom) query.created_at.$gte = dateFrom;
      if (dateTo) query.created_at.$lte = dateTo + 'T23:59:59.999Z';
    }

    if (amountMin > 0) {
      query.amount = { ...query.amount, $gte: amountMin };
    }
    if (amountMax > 0) {
      query.amount = { ...query.amount, $lte: amountMax };
    }

    // Get total count for pagination
    const totalCount = await db.collection('donations').countDocuments(query);

    // Get paginated donations
    const donations = await db.collection('donations')
      .find(query, { projection: { _id: 0 } })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Enrich with campaign data
    const campaignIds = [...new Set(donations.map(d => d.campaign_id))];
    const campaigns = await db.collection('campaigns')
      .find(
        { campaign_id: { $in: campaignIds } },
        { projection: { _id: 0, campaign_id: 1, title: 1, category: 1, status: 1, owner_id: 1 } }
      )
      .toArray();
    const campaignMap = new Map(campaigns.map(c => [c.campaign_id, c]));

    // Enrich with student profile data
    const ownerIds = [...new Set(campaigns.map(c => c.owner_id).filter(Boolean))];
    const studentProfiles = ownerIds.length > 0
      ? await db.collection('student_profiles')
        .find(
          { user_id: { $in: ownerIds } },
          { projection: { _id: 0, user_id: 1, university: 1, department: 1, fieldOfStudy: 1, field_of_study: 1 } }
        )
        .toArray()
      : [];
    const studentMap = new Map(studentProfiles.map(s => [s.user_id, s]));

    // Also get student user names
    const { ObjectId } = await import('mongodb');
    const studentUsers = ownerIds.length > 0
      ? await db.collection('users')
        .find(
          { _id: { $in: ownerIds.map(id => { try { return new ObjectId(id); } catch { return id; } }) } },
          { projection: { name: 1, image: 1 } }
        )
        .toArray()
      : [];
    const userMap = new Map(studentUsers.map(u => [u._id.toString(), u]));

    // Enrich donations
    let enriched = donations.map(donation => {
      const campaign = campaignMap.get(donation.campaign_id);
      const studentProfile = campaign ? studentMap.get(campaign.owner_id) : null;
      const studentUser = campaign ? userMap.get(campaign.owner_id) : null;

      return {
        ...donation,
        campaign: campaign ? {
          campaign_id: campaign.campaign_id,
          title: campaign.title,
          category: campaign.category,
          status: campaign.status,
        } : null,
        student: studentUser ? {
          name: studentUser.name,
          image: studentUser.image,
          university: studentProfile?.university || '',
          department: studentProfile?.department || studentProfile?.fieldOfStudy || studentProfile?.field_of_study || '',
        } : null,
      };
    });

    // Apply search filter (on enriched data)
    if (search) {
      const searchLower = search.toLowerCase();
      enriched = enriched.filter(d =>
        d.campaign?.title?.toLowerCase().includes(searchLower) ||
        d.student?.name?.toLowerCase().includes(searchLower)
      );
    }

    // Compute summary stats for this user (all matching donations, not just current page)
    const summaryPipeline = [
      { $match: { donor_id: user.id, payment_status: { $in: ['paid', 'completed'] } } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalDonations: { $sum: 1 },
          uniqueCampaigns: { $addToSet: '$campaign_id' },
          lastDonationDate: { $max: '$created_at' },
        }
      }
    ];

    const summaryResult = await db.collection('donations').aggregate(summaryPipeline).toArray();
    const summary = summaryResult[0] || { totalAmount: 0, totalDonations: 0, uniqueCampaigns: [], lastDonationDate: null };

    return successResponse({
      donations: enriched,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      summary: {
        totalAmount: summary.totalAmount || 0,
        totalDonations: summary.totalDonations || 0,
        supportedStudents: summary.uniqueCampaigns?.length || 0,
        lastDonationDate: summary.lastDonationDate || null,
      }
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
