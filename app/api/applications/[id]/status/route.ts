import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ObjectId } from 'mongodb';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/applications/[id]/status - Public endpoint for application status
// No auth required - student can check their own application status with just the ID
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const db = await getDb();
        const { id } = params;

        if (!id) {
            return NextResponse.json({
                success: false,
                error: 'Application ID is required'
            }, { status: 400 });
        }

        let application = null;

        // Try ObjectId first, then string id
        try {
            application = await db.collection('applications').findOne(
                { _id: new ObjectId(id) },
                {
                    projection: {
                        _id: 1,
                        fullName: 1,
                        email: 1,
                        country: 1,
                        educationLevel: 1,
                        needSummary: 1,
                        // New fields
                        targetAmount: 1,
                        classYear: 1,
                        faculty: 1,
                        department: 1,
                        goalAmount: 1,
                        story: 1,

                        status: 1,
                        createdAt: 1,
                        updatedAt: 1,
                    }
                }
            );
        } catch {
            // Invalid ObjectId format, try as string id field
            application = await db.collection('applications').findOne(
                { id },
                {
                    projection: {
                        _id: 1,
                        id: 1,
                        fullName: 1,
                        email: 1,
                        country: 1,
                        educationLevel: 1,
                        needSummary: 1,
                        // New fields
                        targetAmount: 1,
                        classYear: 1,
                        faculty: 1,
                        department: 1,
                        goalAmount: 1,
                        story: 1,

                        status: 1,
                        createdAt: 1,
                        updatedAt: 1,
                    }
                }
            );
        }

        if (!application) {
            return NextResponse.json({
                success: false,
                error: 'Application not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: {
                ...application,
                id: application._id?.toString() || application.id,
                _id: undefined,
            },
        });
    } catch (error: any) {
        console.error('Application status GET error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
