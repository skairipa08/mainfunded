import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { requireUser } from '@/lib/authz'
import { errorResponse, getStatusCode } from '@/lib/api-error'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest) {
  try {
    const user = await requireUser()
    const db = await getDb()

    const projects = await db.collection('projects')
      .find({ owner_id: user.id })
      .sort({ created_at: -1 })
      .toArray()

    return NextResponse.json({ success: true, data: projects })
  } catch (error: any) {
    return NextResponse.json(errorResponse(error), { status: getStatusCode(error) })
  }
}
