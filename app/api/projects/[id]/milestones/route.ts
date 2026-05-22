import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { errorResponse, getStatusCode } from '@/lib/api-error'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = await getDb()
    const milestones = await db.collection('milestones')
      .find({ project_id: params.id })
      .sort({ order: 1 })
      .toArray()
    return NextResponse.json({ success: true, data: milestones })
  } catch (error: any) {
    return NextResponse.json(errorResponse(error), { status: getStatusCode(error) })
  }
}
