import { NextRequest, NextResponse } from 'next/server';
import { mockStudents } from '@/lib/corporate/mock-data';

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
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch student details',
            },
            { status: 500 }
        );
    }
}
