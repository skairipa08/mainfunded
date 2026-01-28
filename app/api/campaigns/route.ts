import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireVerifiedStudent } from '@/lib/authz';
import { errorResponse, getStatusCode } from '@/lib/api-error';
import { campaignCreateSchema } from '@/lib/validators/campaign';
import crypto from 'crypto';
import { ObjectId } from 'mongodb';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const category = searchParams.get('category');
  const country = searchParams.get('country');
  const field_of_study = searchParams.get('field_of_study');
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(50, parseInt(searchParams.get('limit') || '12'));

  // Helper to standardise the response for campaigns
  const returnCampaigns = (data: any[], total: number, headers: HeadersInit = {}) => {
    return NextResponse.json({
      success: true,
      data: data,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit) || 0,
      },
    }, { headers });
  };

  try {
    const db = await getDb();

    // Build query - only show published campaigns
    const query: any = { status: 'published' };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (country && country !== 'all') {
      // Need to join with student profiles for country filter if not on campaign doc
      // For now, assuming campaign has copied country or we filter after join
      // But preserving existing logic which puts country on campaign schema in POST
      query.country = country;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { story: { $regex: search, $options: 'i' } },
      ];
    }

    // Get campaigns with pagination
    const skip = (page - 1) * limit;
    let campaigns: any[] = [];
    let total = 0;

    campaigns = await db.collection('campaigns')
      .find(query, { projection: { _id: 0 } })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    total = await db.collection('campaigns').countDocuments(query);

    // Debug: log how many campaigns were found
    console.log(`[Campaigns GET] Found ${campaigns.length} campaigns, total=${total}`);

    // Collect unique owner IDs (canonical NextAuth user.id)
    const ownerIds = [...new Set(campaigns.map((c: any) => c.owner_id).filter(Boolean))];

    // If no campaigns found, return empty early
    if (campaigns.length === 0) {
      return returnCampaigns([], 0);
    }

    // Fetch users and student profiles in batch (avoid N+1)
    let users: any[] = [];
    let studentProfiles: any[] = [];

    if (ownerIds.length > 0) {
      [users, studentProfiles] = await Promise.all([
        db.collection('users').find(
          {
            _id: {
              $in: ownerIds
                .map((id: string) => {
                  try {
                    return new ObjectId(id);
                  } catch {
                    return null;
                  }
                })
                .filter((id): id is ObjectId => id !== null),
            }
          },
          { projection: { _id: 1, email: 1, name: 1, image: 1 } }
        ).toArray(),
        db.collection('student_profiles').find(
          { user_id: { $in: ownerIds } },
          { projection: { _id: 0, user_id: 1, country: 1, fieldOfStudy: 1, field_of_study: 1, university: 1, verificationStatus: 1, verification_status: 1 } }
        ).toArray(),
      ]);
    }

    console.log(`[Campaigns GET] Found ${users.length} users, ${studentProfiles.length} profiles for ${ownerIds.length} owner IDs`);

    // Build maps for O(1) lookup
    // Handle both ObjectId and string ID matching
    const userMap = new Map(users.map((u: any) => [u._id.toString(), u]));
    const profileMap = new Map(studentProfiles.map((p: any) => [p.user_id, p]));

    // Filter by country/field_of_study if specified (if not caught by DB query)
    let filteredCampaigns = campaigns;
    if (country || field_of_study) {
      filteredCampaigns = campaigns.filter((campaign: any) => {
        const profile = profileMap.get(campaign.owner_id);
        if (!profile) return false; // Enforce profile existence

        const profileCountry = profile.country;
        const profileField = profile.fieldOfStudy || profile.field_of_study;

        if (country && country !== 'all' && profileCountry !== country) return false;
        if (field_of_study && field_of_study !== 'all' && profileField !== field_of_study) return false;
        return true;
      });
    }

    // Enrich campaigns with student data
    const enrichedCampaigns = filteredCampaigns.map((campaign: any) => {
      const ownerId = campaign.owner_id;
      const user = userMap.get(ownerId);
      const profile = profileMap.get(ownerId);

      return {
        ...campaign,
        student: {
          name: user?.name || 'Unknown',
          picture: user?.image || null,
          country: profile?.country || null,
          field_of_study: profile?.fieldOfStudy || profile?.field_of_study || null,
          university: profile?.university || null,
          verification_status: profile?.verificationStatus || profile?.verification_status || null,
        },
      };
    });

    return returnCampaigns(enrichedCampaigns, total);

  } catch (error: any) {
    console.error('[Campaigns GET] Error:', {
      message: error.message,
      name: error.name,
      code: error.code,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });

    // Determine error reason code (DEV only - no secrets)
    let reasonCode = 'UNKNOWN';
    let hint = '';

    if (error.message?.includes('MONGO_URL') || error.message?.includes('Mongo URI')) {
      reasonCode = 'MISSING_ENV';
      hint = 'MONGO_URL is not set in .env.local';
    } else if (error.message?.includes('ENOTFOUND') || error.message?.includes('getaddrinfo')) {
      reasonCode = 'DNS_FAIL';
      hint = 'Could not resolve MongoDB host. Check your connection string.';
    } else if (error.message?.includes('ETIMEDOUT') || error.message?.includes('timed out')) {
      reasonCode = 'TIMEOUT';
      hint = 'Connection timed out. Check if IP is whitelisted in Atlas Network Access.';
    } else if (error.message?.includes('Authentication failed') || error.code === 18) {
      reasonCode = 'AUTH_FAIL';
      hint = 'MongoDB authentication failed. Check username/password.';
    } else if (error.message?.includes('not allowed') || error.message?.includes('IP')) {
      reasonCode = 'IP_NOT_ALLOWED';
      hint = 'Your IP is not whitelisted in MongoDB Atlas. Add it in Security > Network Access.';
    } else if (error.name === 'MongoServerSelectionError') {
      reasonCode = 'CONNECT_FAIL';
      hint = 'Could not connect to MongoDB server. Check Atlas Network Access (IP whitelist).';
    }

    // DEV: include reason code and hint; PROD: generic message only
    const isDev = process.env.NODE_ENV === 'development';

    return NextResponse.json({
      success: false,
      error: 'Database unavailable',
      ...(isDev && {
        reason: reasonCode,
        hint: hint,
        errorName: error.name,
      }),
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require verified student
    const user = await requireVerifiedStudent();

    const db = await getDb();
    const body = await request.json();

    // Validate input
    const validation = campaignCreateSchema.safeParse({ body });
    if (!validation.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: validation.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const data = validation.data.body;

    // Get student profile for default values
    const studentProfile = await db.collection('student_profiles').findOne(
      { user_id: user.id },
      { projection: { _id: 0, country: 1, fieldOfStudy: 1, field_of_study: 1 } }
    );

    // Create campaign with canonical owner_id
    const campaign = {
      campaign_id: `campaign_${crypto.randomBytes(6).toString('hex')}`,
      owner_id: user.id, // Canonical NextAuth user.id
      title: data.title,
      story: data.story,
      category: data.category,
      goal_amount: data.goal_amount,
      raised_amount: 0,
      donor_count: 0,
      status: 'draft', // Start as draft, publish separately
      country: data.country || (studentProfile as any)?.country,
      field_of_study: data.field_of_study || (studentProfile as any)?.fieldOfStudy || (studentProfile as any)?.field_of_study,
      cover_image: data.cover_image,
      timeline: data.timeline,
      impact_log: data.impact_log,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await db.collection('campaigns').insertOne(campaign);

    return NextResponse.json({
      success: true,
      data: campaign,
      message: 'Campaign created successfully',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Campaigns POST error:', error);

    // Handle specific errors
    if (error.message === 'STUDENT_PROFILE_NOT_FOUND') {
      return NextResponse.json(
        {
          error: {
            code: 'STUDENT_PROFILE_NOT_FOUND',
            message: 'Student profile not found. Please create a student profile first.',
          },
        },
        { status: 400 }
      );
    }

    if (error.message?.startsWith('STUDENT_NOT_VERIFIED')) {
      return NextResponse.json(
        {
          error: {
            code: 'STUDENT_NOT_VERIFIED',
            message: `Only verified students can create campaigns. Current status: ${error.message.split(':')[1]?.trim() || 'pending'}`,
          },
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      errorResponse(error),
      { status: getStatusCode(error) }
    );
  }
}
