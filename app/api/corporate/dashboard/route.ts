import { NextRequest, NextResponse } from 'next/server';
import { mockDashboardStats, mockDonationTrend, mockFacultyDistribution } from '@/lib/corporate/mock-data';
import { requireUser } from '@/lib/authz';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export const runtime = 'nodejs';

/**
 * GET /api/corporate/dashboard
 * Returns dashboard statistics and chart data
 */
export async function GET(request: NextRequest) {
    try {
        const rateLimitResponse = withRateLimit(request, RATE_LIMITS.api);
        if (rateLimitResponse) return rateLimitResponse;

        await requireUser();

        // Return mock data for demo
        const data = {
            stats: mockDashboardStats,
            donationTrend: mockDonationTrend,
            facultyDistribution: mockFacultyDistribution,
        };

        return NextResponse.json({
            success: true,
            data,
            meta: {
                timestamp: new Date().toISOString(),
                version: '1.0',
            },
        });
    } catch (error: any) {
        const message = error?.message || 'Failed to fetch dashboard data';
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
