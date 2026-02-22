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
        const type = searchParams.get('type');
        if (status && status !== 'all') {
            query.status = status;
        }
        if (type && type !== 'all') {
            query.type = type;
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
        // School-specific validation
        if (body.type === 'school') {
            if (!body.schoolName || body.schoolName.trim().length < 2) {
                return NextResponse.json({ success: false, error: 'Okul adı gerekli' }, { status: 400 });
            }
            if (!body.applicantRole) {
                return NextResponse.json({ success: false, error: 'Başvuran mercii gerekli' }, { status: 400 });
            }
            if (!body.projectTitle || body.projectTitle.trim().length < 2) {
                return NextResponse.json({ success: false, error: 'Proje başlığı gerekli' }, { status: 400 });
            }
        }
        // targetAmount is only required for student (campaign) applications
        if (body.type !== 'teacher' && body.type !== 'parent') {
            if (!body.targetAmount || body.targetAmount < 1) {
                return NextResponse.json({ success: false, error: 'Hedef miktar gerekli' }, { status: 400 });
            }
        }

        const application: Record<string, any> = {
            type: body.type || 'student',
            fullName: body.fullName,
            email: body.email,
            country: body.country,
            gender: body.gender || null,
            educationLevel: body.educationLevel || null,
            needSummary: body.needSummary,
            documents: body.documents || [],
            photos: body.photos || [],
            videos: body.videos || [],
            targetAmount: body.targetAmount || 0,
            goalAmount: body.targetAmount || body.goalAmount || 0,
            classYear: body.classYear || null,
            faculty: body.faculty || null,
            department: body.department || null,
            story: body.story || body.needSummary,
            campaignTitle: body.campaignTitle || null,
            status: 'Received',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Teacher-specific fields
        if (body.type === 'teacher') {
            application.schoolName = body.schoolName || null;
            application.schoolCity = body.schoolCity || null;
            application.classGrade = body.classGrade || null;
            application.subject = body.subject || null;
            application.studentCount = body.studentCount || null;
            application.phone = body.phone || null;
            application.photoCount = body.photoCount || 0;
        }

        // Parent-specific fields
        if (body.type === 'parent') {
            application.parentRelation = body.parentRelation || null;
            application.phone = body.phone || null;
            application.childName = body.childName || null;
            application.childDob = body.childDob || null;
            application.childGender = body.childGender || null;
            application.childSchool = body.childSchool || null;
            application.childSchoolCity = body.childSchoolCity || null;
            application.childGrade = body.childGrade || null;
            application.childStudentId = body.childStudentId || null;
            application.photoCount = body.photoCount || 0;
            application.hasVideo = body.hasVideo || false;
        }

        // School-specific fields
        if (body.type === 'school') {
            application.schoolName = body.schoolName || null;
            application.schoolCity = body.schoolCity || null;
            application.schoolDistrict = body.schoolDistrict || null;
            application.schoolAddress = body.schoolAddress || null;
            application.schoolType = body.schoolType || null;
            application.studentTotal = body.studentTotal || null;
            application.schoolWebsite = body.schoolWebsite || null;
            application.schoolPhone = body.schoolPhone || null;
            application.applicantRole = body.applicantRole || null;
            application.applicantTitle = body.applicantTitle || null;
            application.projectTitle = body.projectTitle || null;
            application.projectCategory = body.projectCategory || null;
            application.beneficiaryCount = body.beneficiaryCount || null;
            application.phone = body.phone || null;
            application.photoCount = body.photoCount || 0;
            application.hasVideo = body.hasVideo || false;
        }

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
