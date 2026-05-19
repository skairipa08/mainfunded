import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { requireRole } from '@/lib/authz'
import { errorResponse, getStatusCode } from '@/lib/api-error'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await requireRole(['admin'])
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'Pending'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '20'))

    const db = await getDb()
    const [projects, total] = await Promise.all([
      db.collection('projects')
        .find({ status })
        .sort({ risk_score: 1, created_at: 1 }) // lowest risk score first = highest priority
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
      db.collection('projects').countDocuments({ status }),
    ])

    return NextResponse.json({
      success: true,
      data: projects,
      pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
    })
  } catch (error: any) {
    return NextResponse.json(errorResponse(error), { status: getStatusCode(error) })
  }
}
