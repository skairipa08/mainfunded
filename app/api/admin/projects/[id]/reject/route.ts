import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { requireRole } from '@/lib/authz'
import { errorResponse, getStatusCode } from '@/lib/api-error'
import { z } from 'zod'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireRole(['admin'])
    const body = await req.json()
    const { rejection_reason } = z.object({ rejection_reason: z.string().min(1) }).parse(body)

    const db = await getDb()
    const now = new Date().toISOString()

    await Promise.all([
      db.collection('projects').updateOne(
        { project_id: params.id },
        { $set: { status: 'Rejected', updated_at: now } }
      ),
      db.collection('project_verification').updateOne(
        { project_id: params.id },
        { $set: { admin_reviewed_at: now, admin_reviewed_by: admin.id, rejection_reason } }
      ),
    ])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(errorResponse(error), { status: getStatusCode(error) })
  }
}
