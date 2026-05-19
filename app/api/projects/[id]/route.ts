import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { requireUser } from '@/lib/authz'
import { errorResponse, getStatusCode } from '@/lib/api-error'
import { projectUpdateSchema } from '@/lib/validators/project'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Params = { params: { id: string } }

async function getProjectOrThrow(db: any, projectId: string) {
  const project = await db.collection('projects').findOne({ project_id: projectId })
  if (!project) {
    const err: any = new Error('Project not found')
    err.statusCode = 404
    throw err
  }
  return project
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const db = await getDb()
    const project = await getProjectOrThrow(db, params.id)

    const [members, milestones, escrow] = await Promise.all([
      db.collection('project_members').find({ project_id: params.id }).toArray(),
      db.collection('milestones').find({ project_id: params.id }).sort({ order: 1 }).toArray(),
      db.collection('project_escrow').findOne({ project_id: params.id }),
    ])

    return NextResponse.json({ success: true, data: { ...project, members, milestones, escrow } })
  } catch (error: any) {
    return NextResponse.json(errorResponse(error), { status: getStatusCode(error) })
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser()
    const db = await getDb()
    const project = await getProjectOrThrow(db, params.id)

    if (project.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (project.status !== 'Draft') {
      return NextResponse.json({ error: 'Only Draft projects can be updated' }, { status: 400 })
    }

    const body = await req.json()
    const validation = projectUpdateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', details: validation.error.errors } },
        { status: 400 }
      )
    }

    await db.collection('projects').updateOne(
      { project_id: params.id },
      { $set: { ...validation.data, updated_at: new Date().toISOString() } }
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(errorResponse(error), { status: getStatusCode(error) })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser()
    const db = await getDb()
    const project = await getProjectOrThrow(db, params.id)

    if (project.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (project.status !== 'Draft') {
      return NextResponse.json({ error: 'Only Draft projects can be deleted' }, { status: 400 })
    }

    await Promise.all([
      db.collection('projects').deleteOne({ project_id: params.id }),
      db.collection('milestones').deleteMany({ project_id: params.id }),
      db.collection('project_members').deleteMany({ project_id: params.id }),
    ])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(errorResponse(error), { status: getStatusCode(error) })
  }
}
