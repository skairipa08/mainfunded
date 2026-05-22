import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { requireUser } from '@/lib/authz'
import { errorResponse, getStatusCode } from '@/lib/api-error'
import { milestoneEvidenceSchema } from '@/lib/validators/project'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Params = { params: { id: string; milestoneId: string } }

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser()
    const db = await getDb()

    const project = await db.collection('projects').findOne({ project_id: params.id })
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (project.owner_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const milestone = await db.collection('milestones').findOne({
      milestone_id: params.milestoneId,
      project_id: params.id,
    })
    if (!milestone) return NextResponse.json({ error: 'Milestone not found' }, { status: 404 })
    if (!['EvidenceRequired', 'UnlockRequested'].includes(milestone.status)) {
      return NextResponse.json({ error: 'Milestone is not accepting evidence' }, { status: 400 })
    }

    const body = await req.json()
    const validation = milestoneEvidenceSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', details: validation.error.errors } },
        { status: 400 }
      )
    }

    await db.collection('milestones').updateOne(
      { milestone_id: params.milestoneId },
      { $set: {
          evidence_files: validation.data.evidence_files,
          evidence_note: validation.data.evidence_note,
          updated_at: new Date().toISOString(),
      }}
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(errorResponse(error), { status: getStatusCode(error) })
  }
}
