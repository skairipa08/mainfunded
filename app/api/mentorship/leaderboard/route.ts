import { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/db';
import { successResponse, handleRouteError } from '@/lib/api-response';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

function getMonthWindow(date: Date): { start: Date; end: Date } {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const start = new Date(Date.UTC(year, month, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59));
  return { start, end };
}

export async function GET(request: NextRequest) {
  const rateLimitResponse = withRateLimit(request, RATE_LIMITS.api);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const db = await getDb();
    const { start, end } = getMonthWindow(new Date());

    const leaderboard = await db.collection('mentorship_sessions').aggregate([
      {
        $match: {
          status: 'completed',
          scheduled_start: {
            $gte: start,
            $lte: end,
          },
        },
      },
      {
        $group: {
          _id: '$mentor_user_id',
          total_minutes: { $sum: '$duration_minutes' },
          sessions_count: { $sum: 1 },
        },
      },
      {
        $sort: {
          total_minutes: -1,
        },
      },
      { $limit: 20 },
    ]).toArray();

    const mentorIds = leaderboard.map((item: any) => item._id).filter(Boolean);
    const mentorObjectIds = mentorIds
      .filter((id: string) => ObjectId.isValid(id))
      .map((id: string) => new ObjectId(id));

    const mentors = await db.collection('users').find(
      { _id: { $in: mentorObjectIds } },
      { projection: { _id: 1, name: 1, email: 1, image: 1 } },
    ).toArray();

    const mentorMap = new Map(mentors.map((mentor: any) => [mentor._id.toString(), mentor]));

    const ranked = leaderboard.map((item: any, index: number) => ({
      rank: index + 1,
      mentor_user_id: item._id,
      mentor_name: mentorMap.get(item._id)?.name || 'Anonim Mentor',
      mentor_avatar: mentorMap.get(item._id)?.image || null,
      total_hours: Math.round(((item.total_minutes || 0) / 60) * 10) / 10,
      sessions_count: item.sessions_count || 0,
    }));

    return successResponse({
      month: `${start.getUTCFullYear()}-${String(start.getUTCMonth() + 1).padStart(2, '0')}`,
      mentors: ranked,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
