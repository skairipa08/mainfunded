import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { requireUser } from '@/lib/authz'
import { errorResponse, getStatusCode } from '@/lib/api-error'
import { projectCreateSchema } from '@/lib/validators/project'
import { calculateRiskScore } from '@/lib/project-risk'
import { logger } from '@/lib/logger'
import crypto from 'crypto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(24, parseInt(searchParams.get('limit') || '12'))
    const skip = (page - 1) * limit

    const query: any = { status: 'Published' }

    const typeParam = searchParams.get('type')
    if (typeParam) query.type = { $in: typeParam.split(',') }

    const domainParam = searchParams.get('domain')
    if (domainParam) query.domain = { $in: domainParam.split(',') }

    const schoolLevel = searchParams.get('school_level')
    if (schoolLevel) query.school_level = schoolLevel

    const city = searchParams.get('city')
    if (city) query.city = city

    const budgetMin = searchParams.get('budget_min')
    const budgetMax = searchParams.get('budget_max')
    if (budgetMin || budgetMax) {
      query.target_budget = {}
      if (budgetMin) query.target_budget.$gte = parseFloat(budgetMin)
      if (budgetMax) query.target_budget.$lte = parseFloat(budgetMax)
    }

    const search = searchParams.get('search')
    if (search) query.$text = { $search: search }

    const db = await getDb()
    const [projects, total] = await Promise.all([
      db.collection('projects').find(query).sort({ published_at: -1 }).skip(skip).limit(limit).toArray(),
      db.collection('projects').countDocuments(query),
    ])

    return NextResponse.json({
      success: true,
      data: projects,
      pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
    })
  } catch (error: any) {
    logger.error('[Projects GET]', error)
    return NextResponse.json(errorResponse(error), { status: getStatusCode(error) })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser()
    const body = await request.json()

    const validation = projectCreateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', details: validation.error.errors } },
        { status: 400 }
      )
    }

    const data = validation.data
    const db = await getDb()

    const sessionUser = user as any
    const ownerType = sessionUser.account_type === 'institution' ? 'institution' : 'student'

    const project = {
      project_id: `proj_${crypto.randomBytes(8).toString('hex')}`,
      status: 'Draft',
      owner_id: user.id,
      owner_type: ownerType,
      risk_score: 0,
      ...data,
      // normalize optional empty strings
      advisor_email: data.advisor_email || undefined,
      video_url: data.video_url || undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    await db.collection('projects').insertOne(project)

    // Default milestones created at Draft stage; teams update title/description during wizard
    const milestones = [
      { order: 1, title: 'Aşama 1 — Hazırlık', percentage: 20, description: 'Başvuru sırasında düzenleyebilirsiniz.' },
      { order: 2, title: 'Aşama 2 — Geliştirme', percentage: 30, description: 'Başvuru sırasında düzenleyebilirsiniz.' },
      { order: 3, title: 'Aşama 3 — Teslim', percentage: 50, description: 'Başvuru sırasında düzenleyebilirsiniz.' },
    ].map(m => ({
      milestone_id: `ms_${crypto.randomBytes(6).toString('hex')}`,
      project_id: project.project_id,
      status: 'Locked',
      evidence_files: [],
      created_at: new Date().toISOString(),
      ...m,
    }))

    await db.collection('milestones').insertMany(milestones)

    logger.info(`[Projects POST] Created ${project.project_id} by ${user.id}`)

    return NextResponse.json({ success: true, data: project }, { status: 201 })
  } catch (error: any) {
    logger.error('[Projects POST]', error)
    return NextResponse.json(errorResponse(error), { status: getStatusCode(error) })
  }
}
