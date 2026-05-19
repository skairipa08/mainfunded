import { NextRequest, NextResponse } from 'next/server';
import { mockStudents } from '@/lib/corporate/mock-data';
import { requireUser } from '@/lib/authz';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export const runtime = 'nodejs';

/**
 * GET /api/corporate/students
 * Returns list of supported students with optional filtering
 * 
 * Query params:
 * - status: 'active' | 'graduated' | 'dropped'
 * - faculty: string
 * - country: string
 */
export async function GET(request: NextRequest) {
    try {
        const rateLimitResponse = withRateLimit(request, RATE_LIMITS.api);
        if (rateLimitResponse) return rateLimitResponse;

        await requireUser();

        const searchParams = request.nextUrl.searchParams;
        const status = searchParams.get('status');
        const faculty = searchParams.get('faculty');
        const country = searchParams.get('country');

        let students = [...mockStudents];

        // Apply filters
        if (status) {
            students = students.filter((s) => s.status === status);
        }
        if (faculty) {
            students = students.filter((s) => s.faculty === faculty);
        }
        if (country) {
            students = students.filter((s) => s.country === country);
        }

        return NextResponse.json({
            success: true,
            data: {
                students,
                total: students.length,
                faculties: [...new Set(mockStudents.map((s) => s.faculty))],
                countries: [...new Set(mockStudents.map((s) => s.country))],
            },
            meta: {
                timestamp: new Date().toISOString(),
                version: '1.0',
            },
        });
    } catch (error: any) {
        const message = error?.message || 'Failed to fetch students';
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
