import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { auth } from '@/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/ops/applications - List all applications
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        const role = (session?.user as any)?.role;

        if (!session?.user || !['admin', 'ops'].includes(role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = await getDb();
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const query: any = {};
        if (status && status !== 'all') {
            query.status = status;
        }

        const applications = await db.collection('applications')
            .find(query)
            .sort({ createdAt: -1 })
            .limit(500)
            .toArray();

        return NextResponse.json({
            success: true,
            data: applications.map(app => ({
                ...app,
                id: app._id?.toString() || app.id,
                _id: undefined,
            })),
        });
    } catch (error: any) {
        console.error('Ops applications GET error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

// POST /api/ops/applications - Create new application (from /apply form)
export async function POST(request: NextRequest) {
    try {
        const db = await getDb();
        const body = await request.json();

        // Server-side validation
        if (!body.fullName || body.fullName.trim().length < 2) {
            return NextResponse.json({ success: false, error: 'Ad soyad gerekli' }, { status: 400 });
        }
        if (!body.needSummary || body.needSummary.trim().length < 100) {
            return NextResponse.json({
                success: false,
                error: 'Açıklama en az 100 karakter olmalı'
            }, { status: 400 });
        }
        if (!body.targetAmount || body.targetAmount < 1) {
            return NextResponse.json({ success: false, error: 'Hedef miktar gerekli' }, { status: 400 });
        }

        const application = {
            fullName: body.fullName,
            email: body.email,
            country: body.country,
            educationLevel: body.educationLevel,
            needSummary: body.needSummary,
            documents: body.documents || [],
            // New fields
            targetAmount: body.targetAmount || 0,
            goalAmount: body.targetAmount || body.goalAmount || 500, // alias for campaign creation
            classYear: body.classYear || null,
            faculty: body.faculty || null,
            department: body.department || null,
            story: body.story || body.needSummary,
            status: 'Received',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const result = await db.collection('applications').insertOne(application);

        return NextResponse.json({
            success: true,
            data: {
                ...application,
                id: result.insertedId.toString(),
            },
        }, { status: 201 });
    } catch (error: any) {
        console.error('Ops applications POST error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
