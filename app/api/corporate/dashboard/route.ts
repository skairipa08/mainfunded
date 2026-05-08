import { NextRequest, NextResponse } from 'next/server';
import { mockFacultyDistribution } from '@/lib/corporate/mock-data';
import { requireApprovedCompanyOwner } from '@/lib/authz';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { findRuleByCompany } from '@/lib/corporate/matching-rule-repo';
import { getDashboardStats, getTrend } from '@/lib/corporate/dashboard-data';

export const runtime = 'nodejs';

/**
 * GET /api/corporate/dashboard
 * Returns real dashboard stats + trend for the authenticated company.
 * facultyDistribution remains mock until a Student-profile join is wired (deferred).
 */
export async function GET(request: NextRequest) {
    try {
        const rateLimitResponse = withRateLimit(request, RATE_LIMITS.api);
        if (rateLimitResponse) return rateLimitResponse;

        const { company } = await requireApprovedCompanyOwner();
        const rule = await findRuleByCompany(company.id);

        const [stats, donationTrend] = await Promise.all([
            getDashboardStats(company.id, rule),
            getTrend(company.id, 12),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                stats,
                donationTrend,
                facultyDistribution: mockFacultyDistribution, // deferred
            },
            meta: {
                timestamp: new Date().toISOString(),
                version: '2.0',
            },
        });
    } catch (error: any) {
        const message = error?.message || 'Failed to fetch dashboard data';
        const status = error?.statusCode || (message === 'Unauthorized' ? 401 : 500);
        return NextResponse.json(
            {
                success: false,
                error: message,
            },
            { status }
        );
    }
}
