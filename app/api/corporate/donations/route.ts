import { NextRequest, NextResponse } from 'next/server';
import { mockCampaigns, mockStudents } from '@/lib/corporate/mock-data';
import { requireUser } from '@/lib/authz';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export const runtime = 'nodejs';

/**
 * GET /api/corporate/donations
 * Returns donation history and campaigns
 */
export async function GET(request: NextRequest) {
    try {
        const rateLimitResponse = withRateLimit(request, RATE_LIMITS.api);
        if (rateLimitResponse) return rateLimitResponse;

        await requireUser();

        // Calculate total donations from all students
        const allDonations = mockStudents.flatMap((s) =>
            s.donation_history.map((d) => ({
                ...d,
                student_id: s.id,
                student_name: s.name,
            }))
        );

        // Sort by date descending
        allDonations.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        return NextResponse.json({
            success: true,
            data: {
                donations: allDonations,
                campaigns: mockCampaigns,
                summary: {
                    totalDonated: allDonations.reduce((sum, d) => sum + d.amount, 0),
                    totalDonations: allDonations.length,
                    activeCampaigns: mockCampaigns.filter((c) => c.status === 'active').length,
                },
            },
            meta: {
                timestamp: new Date().toISOString(),
                version: '1.0',
            },
        });
    } catch (error: any) {
        const message = error?.message || 'Failed to fetch donations';
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

/**
 * POST /api/corporate/donations
 * Create a new donation (batch support)
 */
export async function POST(request: NextRequest) {
    try {
        const rateLimitResponse = withRateLimit(request, RATE_LIMITS.api);
        if (rateLimitResponse) return rateLimitResponse;

        await requireUser();

        const body = await request.json();

        // Validate request body
        if (!body.items || !Array.isArray(body.items)) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid request: items array required',
                },
                { status: 400 }
            );
        }

        // In production, process payment and record donations
        const totalAmount = body.items.reduce(
            (sum: number, item: { amount: number }) => sum + item.amount,
            0
        );

        return NextResponse.json({
            success: true,
            data: {
                transaction_id: `txn_${Date.now()}`,
                items: body.items,
                total_amount: totalAmount,
                status: 'completed',
                created_at: new Date().toISOString(),
            },
            meta: {
                timestamp: new Date().toISOString(),
                version: '1.0',
            },
        });
    } catch (error: any) {
        const message = error?.message || 'Failed to process donation';
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
