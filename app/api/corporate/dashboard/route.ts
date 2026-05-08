import { NextRequest, NextResponse } from 'next/server';
import { requireApprovedCompanyOwner } from '@/lib/authz';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { findRuleByCompany } from '@/lib/corporate/matching-rule-repo';
import {
    getCategoryDistribution,
    getDashboardStats,
    getTrend,
} from '@/lib/corporate/dashboard-data';

export const runtime = 'nodejs';

/**
 * GET /api/corporate/dashboard
 * Returns real dashboard stats + trend + category distribution for the authenticated company.
 * `facultyDistribution` is keyed by raw category — frontend resolves labels via i18n.
 */
export async function GET(request: NextRequest) {
    try {
        const rateLimitResponse = withRateLimit(request, RATE_LIMITS.api);
        if (rateLimitResponse) return rateLimitResponse;

        const { company } = await requireApprovedCompanyOwner();
        const rule = await findRuleByCompany(company.id);

        const [stats, donationTrend, facultyDistribution] = await Promise.all([
            getDashboardStats(company.id, rule),
            getTrend(company.id, 12),
            getCategoryDistribution(company.id),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                stats,
                donationTrend,
                facultyDistribution,
            },
            meta: {
                timestamp: new Date().toISOString(),
                version: '3.0',
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
