import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = new URL(req.url).searchParams.get('token')
    if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 })

    const db = await getDb()
    const project = await db.collection('projects').findOne({
      project_id: params.id,
      advisor_token: token,
    })

    if (!project) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 404 })
    if (project.advisor_approved_at) {
      return NextResponse.json({ success: true, message: 'Already approved' })
    }

    const now = new Date().toISOString()
    await Promise.all([
      db.collection('projects').updateOne(
        { project_id: params.id },
        { $set: { advisor_approved_at: now, advisor_token: null, updated_at: now } }
      ),
      db.collection('project_verification').updateOne(
        { project_id: params.id },
        { $set: { advisor_approved: true } }
      ),
    ])

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    return NextResponse.redirect(new URL(`/projects/${params.id}?advisor_approved=1`, baseUrl))
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
