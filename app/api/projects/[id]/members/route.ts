import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { requireUser } from '@/lib/authz'
import { errorResponse, getStatusCode } from '@/lib/api-error'
import { z } from 'zod'
import crypto from 'crypto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const addMemberSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['leader', 'member', 'advisor']),
})

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = await getDb()
    const members = await db.collection('project_members')
      .find({ project_id: params.id })
      .toArray()
    return NextResponse.json({ success: true, data: members })
  } catch (error: any) {
    return NextResponse.json(errorResponse(error), { status: getStatusCode(error) })
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser()
    const db = await getDb()

    const project = await db.collection('projects').findOne({ project_id: params.id })
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (project.owner_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await req.json()
    const validation = addMemberSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', details: validation.error.errors } },
        { status: 400 }
      )
    }

    const member = {
      member_id: `mem_${crypto.randomBytes(6).toString('hex')}`,
      project_id: params.id,
      ...validation.data,
      created_at: new Date().toISOString(),
    }

    await db.collection('project_members').insertOne(member)
    return NextResponse.json({ success: true, data: member }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(errorResponse(error), { status: getStatusCode(error) })
  }
}
