import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HomeContent from './HomeContent';
import { getDb } from '@/lib/db';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

async function getHomepageData() {
  try {
    const db = await getDb();

    const [campaigns, verifiedStudents, campaignCount, donationAgg] = await Promise.all([
      // Fetch 3 featured campaigns
      db.collection('campaigns')
        .find({ status: { $in: ['active', 'published'] } })
        .sort({ created_at: -1 })
        .limit(3)
        .toArray(),

      // Stats: verified students count
      db.collection('student_profiles').countDocuments({ verificationStatus: 'verified' }),

      // Stats: campaign count
      db.collection('campaigns').countDocuments({ status: { $in: ['active', 'published', 'completed'] } }),

      // Stats: donation aggregate
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

    // Enrich campaigns with student data (same as API route)
    const ownerIds = [...new Set(campaigns.map((c) => c.owner_id).filter(Boolean))];
    let users: any[] = [];
    let studentProfiles: any[] = [];

    if (ownerIds.length > 0) {
      const objectIds = ownerIds.map((id) => {
        try { return new ObjectId(id); } catch { return id; }
      });

      [users, studentProfiles] = await Promise.all([
        db.collection('users').find({ _id: { $in: objectIds } }).toArray(),
        db.collection('student_profiles').find({ userId: { $in: ownerIds } }).toArray(),
      ]);
    }

    const userMap = new Map(users.map((u) => [u._id.toString(), u]));
    const profileMap = new Map(studentProfiles.map((p) => [p.userId, p]));

    const enrichedCampaigns = campaigns.map((c) => {
      const user = userMap.get(c.owner_id);
      const profile = profileMap.get(c.owner_id);
      return {
        ...c,
        _id: c._id.toString(),
        campaign_id: c.campaign_id || c._id.toString(),
        student: {
          name: user?.name || profile?.fullName || 'Student',
          university: profile?.university,
          field_of_study: profile?.fieldOfStudy,
          country: profile?.country,
          verification_status: profile?.verificationStatus || 'pending',
          tier_approved: profile?.tier_approved,
        },
      };
    });

    const agg = donationAgg[0];

    return {
      featuredCampaigns: JSON.parse(JSON.stringify(enrichedCampaigns)),
      platformStats: {
        studentsHelped: verifiedStudents,
        totalRaised: agg?.total_amount ?? 0,
        campaigns: campaignCount,
        donors: agg?.unique_donors?.length ?? 0,
      },
    };
  } catch {
    return {
      featuredCampaigns: [],
      platformStats: {
        studentsHelped: 0,
        totalRaised: 0,
        campaigns: 0,
        donors: 0,
      },
    };
  }
}

export default async function Home() {
  const { featuredCampaigns, platformStats } = await getHomepageData();
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <HomeContent
          featuredCampaigns={featuredCampaigns}
          platformStats={platformStats}
          isDemoMode={isDemoMode}
        />
      </main>
      <Footer />
    </div>
  );
}
