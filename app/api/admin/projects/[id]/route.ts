import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { requireRole } from '@/lib/authz'
import { errorResponse, getStatusCode } from '@/lib/api-error'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(['admin'])
    const db = await getDb()

    const [project, members, milestones, verification, escrow] = await Promise.all([
      db.collection('projects').findOne({ project_id: params.id }),
      db.collection('project_members').find({ project_id: params.id }).toArray(),
      db.collection('milestones').find({ project_id: params.id }).sort({ order: 1 }).toArray(),
      db.collection('project_verification').findOne({ project_id: params.id }),
      db.collection('project_escrow').findOne({ project_id: params.id }),
    ])

    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({
      success: true,
      data: { ...project, members, milestones, verification, escrow },
    })
  } catch (error: any) {
    return NextResponse.json(errorResponse(error), { status: getStatusCode(error) })
  }
}
