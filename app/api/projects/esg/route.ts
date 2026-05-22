import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { requireUser } from '@/lib/authz'
import { errorResponse, getStatusCode } from '@/lib/api-error'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest) {
  try {
    const user = await requireUser()
    const db = await getDb()

    const donorTxs = await db.collection('escrow_transactions')
      .find({ donor_id: user.id, type: 'collect' })
      .toArray()

    const projectIds = [...new Set(donorTxs.map((t: any) => t.project_id))]
    const totalAmountDonated = donorTxs.reduce((sum: number, t: any) => sum + (t.amount || 0), 0)

    if (projectIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          total_projects_supported: 0,
          total_students_reached: 0,
          completed_projects_ratio: 0,
          active_projects: 0,
          domain_breakdown: [],
          total_amount_donated: 0,
        },
      })
    }

    const projects = await db.collection('projects')
      .find({ project_id: { $in: projectIds } })
      .toArray()

    const completedCount = projects.filter((p: any) => p.status === 'Completed').length
    const activeCount = projects.filter((p: any) => p.status === 'Published').length

    const memberCounts = await db.collection('project_members')
      .aggregate([
        { $match: { project_id: { $in: projectIds } } },
        { $count: 'total' },
      ])
      .toArray()

    const domainCounts: Record<string, number> = {}
    projects.forEach((p: any) => {
      (p.domain || []).forEach((d: string) => {
        domainCounts[d] = (domainCounts[d] || 0) + 1
      })
    })

    return NextResponse.json({
      success: true,
      data: {
        total_projects_supported: projectIds.length,
        total_students_reached: memberCounts[0]?.total || 0,
        completed_projects_ratio: projectIds.length > 0 ? completedCount / projectIds.length : 0,
        active_projects: activeCount,
        domain_breakdown: Object.entries(domainCounts).map(([domain, count]) => ({ domain, count })),
        total_amount_donated: totalAmountDonated,
      },
    })
  } catch (error: any) {
    return NextResponse.json(errorResponse(error), { status: getStatusCode(error) })
  }
}
