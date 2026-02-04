import { NextRequest, NextResponse } from 'next/server';
import { mockDashboardStats, mockDonationTrend, mockFacultyDistribution } from '@/lib/corporate/mock-data';

export const runtime = 'nodejs';

/**
 * GET /api/corporate/dashboard
 * Returns dashboard statistics and chart data
 */
export async function GET(request: NextRequest) {
    try {
        // In production, validate JWT token here
        const authHeader = request.headers.get('authorization');

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
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch dashboard data',
            },
            { status: 500 }
        );
    }
}
