import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { requireUser } from '@/lib/authz'
import { errorResponse, getStatusCode } from '@/lib/api-error'
import { calculateRiskScore } from '@/lib/project-risk'
import { sendAdvisorApprovalEmail } from '@/lib/email-service'
import crypto from 'crypto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser()
    const db = await getDb()

    const project = await db.collection('projects').findOne({ project_id: params.id })
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (project.owner_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    if (project.status !== 'Draft') {
      return NextResponse.json({ error: 'Only Draft projects can be submitted' }, { status: 400 })
    }

    const members = await db.collection('project_members').find({ project_id: params.id }).toArray()

    const accountCreatedAt = await db.collection('users')
      .findOne({ _id: user.id }, { projection: { createdAt: 1 } })
    const accountAgeDays = accountCreatedAt?.createdAt
      ? Math.floor((Date.now() - new Date(accountCreatedAt.createdAt).getTime()) / 86400000)
      : 0

    const riskScore = calculateRiskScore(
      {
        files: project.files || [],
        budget_items: project.budget_items || [],
        members,
        timeline: project.timeline || [],
        video_url: project.video_url,
        account_age_days: accountAgeDays,
      },
      { advisor_approved: false, student_email_verified: false, school_doc_verified: false }
    )

    const advisorToken = project.advisor_email
      ? crypto.randomBytes(32).toString('hex')
      : undefined

    const now = new Date().toISOString()

    await db.collection('projects').updateOne(
      { project_id: params.id },
      { $set: {
          status: 'Pending',
          risk_score: riskScore,
          advisor_token: advisorToken,
          updated_at: now,
      }}
    )

    await db.collection('project_verification').insertOne({
      project_id: params.id,
      student_email_verified: false,
      school_doc_verified: false,
      advisor_approved: false,
      created_at: now,
    })

    if (project.advisor_email && advisorToken) {
      await sendAdvisorApprovalEmail({
        advisorEmail: project.advisor_email,
        advisorName: project.advisor_name || 'Danışman',
        projectTitle: project.title,
        projectId: params.id,
        token: advisorToken,
      })
    }

    return NextResponse.json({ success: true, data: { risk_score: riskScore } })
  } catch (error: any) {
    return NextResponse.json(errorResponse(error), { status: getStatusCode(error) })
  }
}
