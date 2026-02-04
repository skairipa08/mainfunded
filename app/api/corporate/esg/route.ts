import { NextRequest, NextResponse } from 'next/server';
import { mockESGMetrics, mockCountryDistribution, mockStudents } from '@/lib/corporate/mock-data';

export const runtime = 'nodejs';

/**
 * GET /api/corporate/esg
 * Returns ESG (Environmental, Social, Governance) metrics
 */
export async function GET(request: NextRequest) {
    try {
        // Calculate additional ESG metrics
        const genderDistribution = {
            female: mockESGMetrics.genderDistribution.female,
            male: mockESGMetrics.genderDistribution.male,
        };

        const facultyDistribution = mockStudents.reduce((acc, student) => {
            acc[student.faculty] = (acc[student.faculty] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // SDG (Sustainable Development Goals) alignment
        const sdgAlignment = [
            {
                goal: 1,
                name: 'No Poverty',
                impact: 'high',
                contribution: 'Direct financial support to students from low-income backgrounds',
            },
            {
                goal: 4,
                name: 'Quality Education',
                impact: 'high',
                contribution: 'Enabling access to higher education',
            },
            {
                goal: 5,
                name: 'Gender Equality',
                impact: 'medium',
                contribution: `${genderDistribution.female}% female students supported`,
            },
            {
                goal: 10,
                name: 'Reduced Inequalities',
                impact: 'high',
                contribution: 'Supporting students from underrepresented regions and backgrounds',
            },
        ];

        return NextResponse.json({
            success: true,
            data: {
                metrics: mockESGMetrics,
                genderDistribution,
                countryDistribution: mockCountryDistribution,
                facultyDistribution,
                sdgAlignment,
                reportPeriod: {
                    from: '2025-01-01',
                    to: new Date().toISOString().split('T')[0],
                },
            },
            meta: {
                timestamp: new Date().toISOString(),
                version: '1.0',
            },
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch ESG metrics',
            },
            { status: 500 }
        );
    }
}
