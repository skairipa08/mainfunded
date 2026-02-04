import { NextRequest, NextResponse } from 'next/server';
import { mockStudents } from '@/lib/corporate/mock-data';

export const runtime = 'nodejs';

/**
 * GET /api/corporate/reports
 * Returns report data with filtering support
 * 
 * Query params:
 * - from: ISO date string (start date)
 * - to: ISO date string (end date)
 * - status: 'active' | 'graduated' | 'dropped'
 * - faculty: string
 * - country: string
 * - format: 'json' | 'csv' (default: json)
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const from = searchParams.get('from');
        const to = searchParams.get('to');
        const status = searchParams.get('status');
        const faculty = searchParams.get('faculty');
        const country = searchParams.get('country');
        const format = searchParams.get('format') || 'json';

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

        // Calculate summary
        const summary = {
            totalRecords: students.length,
            totalDonated: students.reduce((sum, s) => sum + s.total_donated, 0),
            totalGoal: students.reduce((sum, s) => sum + s.goal_amount, 0),
            activeCount: students.filter((s) => s.status === 'active').length,
            graduatedCount: students.filter((s) => s.status === 'graduated').length,
        };

        // Generate report data
        const reportData = students.map((s) => ({
            name: s.name,
            university: s.university,
            department: s.department,
            country: s.country,
            total_donated: s.total_donated,
            goal_amount: s.goal_amount,
            progress: Math.round((s.total_donated / s.goal_amount) * 100),
            status: s.status,
            target_year: s.target_year,
        }));

        if (format === 'csv') {
            // Return CSV format
            const headers = Object.keys(reportData[0] || {}).join(',');
            const rows = reportData.map((r) => Object.values(r).join(',')).join('\n');
            const csv = `${headers}\n${rows}`;

            return new NextResponse(csv, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="report-${new Date().toISOString().split('T')[0]}.csv"`,
                },
            });
        }

        return NextResponse.json({
            success: true,
            data: {
                records: reportData,
                summary,
                filters: {
                    from,
                    to,
                    status,
                    faculty,
                    country,
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
                error: 'Failed to generate report',
            },
            { status: 500 }
        );
    }
}
