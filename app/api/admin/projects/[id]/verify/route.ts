import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { requireRole } from '@/lib/authz'
import { errorResponse, getStatusCode } from '@/lib/api-error'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireRole(['admin'])
    const db = await getDb()

    const project = await db.collection('projects').findOne({ project_id: params.id })
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (project.status !== 'Pending') {
      return NextResponse.json({ error: 'Project must be Pending to verify' }, { status: 400 })
    }

    if (project.owner_type === 'student' && project.advisor_email && !project.advisor_approved_at) {
      return NextResponse.json(
        { error: 'Advisor approval required before verification for student-owned projects' },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()
    await Promise.all([
      db.collection('projects').updateOne(
        { project_id: params.id },
        { $set: { status: 'Published', published_at: now, updated_at: now } }
      ),
      db.collection('project_verification').updateOne(
        { project_id: params.id },
        { $set: { admin_reviewed_at: now, admin_reviewed_by: admin.id, school_doc_verified: true } }
      ),
    ])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(errorResponse(error), { status: getStatusCode(error) })
  }
}
