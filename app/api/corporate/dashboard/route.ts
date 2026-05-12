import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export const runtime = 'nodejs';

/**
 * Demo data for when backend services (NextAuth/Prisma/MongoDB) are unavailable.
 * The corporate panel uses localStorage-based auth, so this endpoint
 * returns demo data when the server-side session is not available.
 */
function getDemoData() {
    const now = new Date();
    const months: string[] = [];
    for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }

    return {
        stats: {
            totalMatchedAllTime: 245_800,
            affectedStudents: 42,
            approvedTxCount: 38,
            pendingTxCount: 3,
            rejectedTxCount: 1,
            currentPeriodSpent: 18_500,
            monthlyBudget: 50_000,
            budgetUsedPct: 0.37,
        },
        donationTrend: months.map((m, i) => ({
            periodKey: m,
            matched: Math.round(8000 + Math.random() * 15000 + i * 800),
        })),
        facultyDistribution: [
            { name: 'tuition', value: 35 },
            { name: 'books', value: 25 },
            { name: 'laptop', value: 20 },
            { name: 'housing', value: 12 },
            { name: 'emergency', value: 8 },
        ],
    };
}

/**
 * GET /api/corporate/dashboard
 * Returns dashboard stats + trend + category distribution.
 * Falls back to demo data when backend services are unavailable.
 */
export async function GET(request: NextRequest) {
    try {
        const rateLimitResponse = withRateLimit(request, RATE_LIMITS.api);
        if (rateLimitResponse) return rateLimitResponse;
    } catch {
        // rate-limit check failed, continue anyway
    }

    // Try loading real data from backend
    try {
        const { requireApprovedCompanyOwner } = await import('@/lib/authz');
        const { findRuleByCompany } = await import('@/lib/corporate/matching-rule-repo');
        const { getDashboardStats, getTrend, getCategoryDistribution } = await import('@/lib/corporate/dashboard-data');

        const { company } = await requireApprovedCompanyOwner();
        const rule = await findRuleByCompany(company.id);

        const [stats, donationTrend, facultyDistribution] = await Promise.all([
            getDashboardStats(company.id, rule),
            getTrend(company.id, 12),
            getCategoryDistribution(company.id),
        ]);

        return NextResponse.json({
            success: true,
            data: { stats, donationTrend, facultyDistribution },
            meta: { timestamp: new Date().toISOString(), version: '3.0' },
        });
    } catch (error: any) {
        console.warn('[Corporate Dashboard] Backend unavailable, serving demo data:', error?.message);

        // Fallback: serve demo data so the localStorage-based corporate panel works
        return NextResponse.json({
            success: true,
            data: getDemoData(),
            meta: { timestamp: new Date().toISOString(), version: '3.0-demo' },
        });
    }
}
