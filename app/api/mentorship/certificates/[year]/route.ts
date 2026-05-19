import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireUser } from '@/lib/authz';
import { errorResponse, handleRouteError } from '@/lib/api-response';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { generateMentorCertificatePdf } from '@/lib/mentorship/certificate';

function startOfYear(year: number): Date {
  return new Date(Date.UTC(year, 0, 1, 0, 0, 0));
}

function endOfYear(year: number): Date {
  return new Date(Date.UTC(year, 11, 31, 23, 59, 59));
}

export async function GET(
  request: NextRequest,
  { params }: { params: { year: string } },
) {
  const rateLimitResponse = withRateLimit(request, RATE_LIMITS.api);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const user = await requireUser();
    const year = Number(params.year);
    if (!Number.isInteger(year) || year < 2020 || year > 2100) {
      return errorResponse({ code: 'INVALID_YEAR', message: 'Invalid certificate year' }, 400);
    }

    const db = await getDb();

    const sessions = await db.collection('mentorship_sessions')
      .find({
        mentor_user_id: user.id,
        status: 'completed',
        scheduled_start: {
          $gte: startOfYear(year),
          $lte: endOfYear(year),
        },
      })
      .toArray();

    const totalMinutes = sessions.reduce((sum, item: any) => sum + (item.duration_minutes || 0), 0);
    if (totalMinutes <= 0) {
      return errorResponse({ code: 'NO_ACTIVITY', message: 'No completed mentorship hours for this year' }, 404);
    }

    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
    const pdfBytes = generateMentorCertificatePdf({
      mentorName: user.name,
      year,
      totalHours,
      issueDate: new Date(),
    });

    await db.collection('mentor_certificates').updateOne(
      { mentor_user_id: user.id, year },
      {
        $set: {
          mentor_user_id: user.id,
          year,
          total_hours: totalHours,
          generated_at: new Date(),
        },
      },
      { upsert: true },
    );

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="funded-mentor-certificate-${year}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
