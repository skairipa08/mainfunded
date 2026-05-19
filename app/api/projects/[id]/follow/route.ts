import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { requireUser } from '@/lib/authz'
import { errorResponse, getStatusCode } from '@/lib/api-error'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser()
    const db = await getDb()

    const existing = await db.collection('sponsor_project_follows').findOne({
      donor_id: user.id,
      project_id: params.id,
    })

    if (existing) {
      await db.collection('sponsor_project_follows').deleteOne({ _id: existing._id })
      return NextResponse.json({ success: true, following: false })
    }

    await db.collection('sponsor_project_follows').insertOne({
      donor_id: user.id,
      project_id: params.id,
      followed_at: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, following: true })
  } catch (error: any) {
    return NextResponse.json(errorResponse(error), { status: getStatusCode(error) })
  }
}
