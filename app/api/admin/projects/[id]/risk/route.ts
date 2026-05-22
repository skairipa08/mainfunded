import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { requireRole } from '@/lib/authz'
import { errorResponse, getStatusCode } from '@/lib/api-error'
import { calculateRiskScore, getRiskLevel } from '@/lib/project-risk'
import { ObjectId } from 'mongodb'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(['admin'])
    const db = await getDb()

    const [project, verification, members] = await Promise.all([
      db.collection('projects').findOne({ project_id: params.id }),
      db.collection('project_verification').findOne({ project_id: params.id }),
      db.collection('project_members').find({ project_id: params.id }).toArray(),
    ])

    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    let userObjId: ObjectId | null = null
    try { userObjId = new ObjectId(project.owner_id) } catch { /* non-ObjectId id */ }
    const accountCreated = userObjId
      ? await db.collection('users').findOne({ _id: userObjId }, { projection: { createdAt: 1 } })
      : null
    const accountAgeDays = accountCreated?.createdAt
      ? Math.floor((Date.now() - new Date(accountCreated.createdAt).getTime()) / 86400000)
      : 0

    const score = calculateRiskScore(
      {
        files: project.files || [],
        budget_items: project.budget_items || [],
        members,
        timeline: project.timeline || [],
        video_url: project.video_url,
        account_age_days: accountAgeDays,
      },
      {
        advisor_approved: verification?.advisor_approved || false,
        student_email_verified: verification?.student_email_verified || false,
        school_doc_verified: verification?.school_doc_verified || false,
      }
    )

    return NextResponse.json({
      success: true,
      data: {
        score,
        level: getRiskLevel(score),
        breakdown: {
          advisor_approved: verification?.advisor_approved || false,
          student_email_verified: verification?.student_email_verified || false,
          school_doc_verified: verification?.school_doc_verified || false,
          has_files: (project.files?.length || 0) >= 1,
          has_detailed_budget: (project.budget_items?.length || 0) >= 3,
          has_multiple_members: members.length > 1,
          has_timeline: (project.timeline?.length || 0) >= 3,
          has_video: !!project.video_url,
          account_age_days: accountAgeDays,
        },
      },
    })
  } catch (error: any) {
    return NextResponse.json(errorResponse(error), { status: getStatusCode(error) })
  }
}
