import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { requireUser } from '@/lib/authz'
import { errorResponse, getStatusCode } from '@/lib/api-error'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Params = { params: { id: string; milestoneId: string } }

export async function POST(_req: NextRequest, { params }: Params) {
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
    if (milestone.status !== 'EvidenceRequired') {
      return NextResponse.json(
        { error: 'Milestone must be in EvidenceRequired state to request unlock' },
        { status: 400 }
      )
    }
    if (!milestone.evidence_files?.length) {
      return NextResponse.json(
        { error: 'Upload evidence before requesting unlock' },
        { status: 400 }
      )
    }

    await db.collection('milestones').updateOne(
      { milestone_id: params.milestoneId },
      { $set: { status: 'UnlockRequested', updated_at: new Date().toISOString() } }
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(errorResponse(error), { status: getStatusCode(error) })
  }
}
