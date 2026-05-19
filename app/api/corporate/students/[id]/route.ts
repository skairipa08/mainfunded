import { NextRequest, NextResponse } from 'next/server';
import { mockStudents } from '@/lib/corporate/mock-data';
import { requireUser } from '@/lib/authz';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export const runtime = 'nodejs';

/**
 * GET /api/corporate/students/[id]
 * Returns detailed information about a specific student
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const rateLimitResponse = withRateLimit(request, RATE_LIMITS.api);
        if (rateLimitResponse) return rateLimitResponse;

        await requireUser();

        const student = mockStudents.find((s) => s.id === params.id);

        if (!student) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Student not found',
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: student,
            meta: {
                timestamp: new Date().toISOString(),
                version: '1.0',
            },
        });
    } catch (error: any) {
        const message = error?.message || 'Failed to fetch student details';
        const status = message === 'Unauthorized' ? 401 : 500;
        return NextResponse.json(
            {
                success: false,
                error: message,
            },
            { status }
        );
    }
}
