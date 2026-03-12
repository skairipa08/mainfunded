import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/authz';
import prisma from '@/lib/prisma'; // force TS re-evaluation
import { z } from 'zod';

const followSchema = z.object({
    studentId: z.string().min(1),
    action: z.enum(['follow', 'unfollow', 'toggle']),
});

export async function POST(request: NextRequest) {
    try {
        const user = await requireUser();

        // Only donors or logged-in users can follow
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const parsed = followSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid payload', details: parsed.error.format() }, { status: 400 });
        }

        const { studentId, action } = parsed.data;

        // Check if student exists
        const student = await prisma.studentProfile.findUnique({
            where: { id: studentId }
        });

        if (!student) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        // Check if current follow exists
        const existingFollow = await prisma.donorStudentFollow.findUnique({
            where: {
                donorId_studentId: {
                    donorId: user.id,
                    studentId: studentId
                }
            }
        });

        let isFollowing = !!existingFollow;

        if (action === 'follow' || (action === 'toggle' && !isFollowing)) {
            if (!isFollowing) {
                await prisma.donorStudentFollow.create({
                    data: {
                        donorId: user.id,
                        studentId,
                    }
                });
                isFollowing = true;
            }
        } else if (action === 'unfollow' || (action === 'toggle' && isFollowing)) {
            if (isFollowing) {
                await prisma.donorStudentFollow.delete({
                    where: {
                        donorId_studentId: {
                            donorId: user.id,
                            studentId
                        }
                    }
                });
                isFollowing = false;
            }
        }

        return NextResponse.json({
            success: true,
            isFollowing,
        });

    } catch (error: any) {
        console.error('[Donor Follow API] Error:', error);
        return NextResponse.json(
            { error: 'Failed to update follow status', message: error.message },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const user = await requireUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const studentId = searchParams.get('studentId');

        if (studentId) {
            // Check single student follow status
            const existingFollow = await prisma.donorStudentFollow.findUnique({
                where: {
                    donorId_studentId: {
                        donorId: user.id,
                        studentId: studentId
                    }
                }
            });
            return NextResponse.json({ isFollowing: !!existingFollow });
        }

        // Get all followed students
        const follows = await prisma.donorStudentFollow.findMany({
            where: { donorId: user.id },
            include: {
                student: {
                    select: {
                        userId: true,
                        photoUrl: true,
                        schoolName: true,
                        grade: true,
                        major: true,
                    }
                }
            }
        });

        return NextResponse.json({ follows });

    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to retrieve follow status', message: error.message },
            { status: 500 }
        );
    }
}
