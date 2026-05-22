import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { requireRole } from '@/lib/authz'
import { errorResponse, getStatusCode } from '@/lib/api-error'
import { adminMilestoneSchema } from '@/lib/validators/project'
import { calculateMilestoneRelease } from '@/lib/project-escrow'
import { sendMilestoneRejectionEmail } from '@/lib/email-service'
import crypto from 'crypto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireRole(['admin'])
    const body = await req.json()
    const { milestone_id, action, admin_note } = adminMilestoneSchema.parse(body)

    const db = await getDb()
    const now = new Date().toISOString()

    const milestone = await db.collection('milestones').findOne({
      milestone_id,
      project_id: params.id,
      status: 'UnlockRequested',
    })
    if (!milestone) {
      return NextResponse.json(
        { error: 'Milestone not found or not in UnlockRequested state' },
        { status: 404 }
      )
    }

    if (action === 'reject') {
      await db.collection('milestones').updateOne(
        { milestone_id },
        { $set: { status: 'EvidenceRequired', admin_note, updated_at: now } }
      )

      // Notify project owner of rejection
      const project = await db.collection('projects').findOne({ project_id: params.id })
      if (project && admin_note) {
        const owner = await db.collection('users').findOne({ _id: project.owner_id })
        if (owner?.email) {
          await sendMilestoneRejectionEmail({
            ownerEmail: owner.email,
            projectTitle: project.title,
            milestoneTitle: milestone.title,
            adminNote: admin_note,
          })
        }
      }

      return NextResponse.json({ success: true, action: 'rejected' })
    }

    // Approve: calculate payout amount
    const escrow = await db.collection('project_escrow').findOne({ project_id: params.id })
    if (!escrow) return NextResponse.json({ error: 'Escrow not found' }, { status: 404 })

    const payoutAmount = calculateMilestoneRelease(escrow.total_collected, milestone.percentage)

    // Two-step: Approved → Paid (soft-lock MVP: move to Paid immediately after queuing payout)
    await db.collection('milestones').updateOne(
      { milestone_id },
      { $set: { status: 'Approved', admin_note, approved_at: now, approved_by: admin.id, updated_at: now } }
    )

    // Now mark as Paid
    await db.collection('milestones').updateOne(
      { milestone_id },
      { $set: { status: 'Paid', updated_at: now } }
    )

    // Update escrow
    await db.collection('project_escrow').updateOne(
      { project_id: params.id },
      {
        $inc: { total_released: payoutAmount, total_collected: -payoutAmount },
        $set: { updated_at: now },
      }
    )

    // Record release transaction
    await db.collection('escrow_transactions').insertOne({
      tx_id: `tx_${crypto.randomBytes(8).toString('hex')}`,
      project_id: params.id,
      milestone_id,
      type: 'release',
      amount: payoutAmount,
      currency: 'TRY',
      status: 'pending_iyzico',
      created_at: now,
    })

    // Unlock next milestone if exists
    const nextMilestone = await db.collection('milestones').findOne({
      project_id: params.id,
      order: milestone.order + 1,
      status: 'Locked',
    })
    if (nextMilestone) {
      await db.collection('milestones').updateOne(
        { milestone_id: nextMilestone.milestone_id },
        { $set: { status: 'EvidenceRequired', updated_at: now } }
      )
    } else {
      // Check if all milestones are now Paid → complete the project
      const allMilestones = await db.collection('milestones')
        .find({ project_id: params.id })
        .toArray()
      const allPaid = allMilestones.every(
        (m: any) => m.milestone_id === milestone_id || m.status === 'Paid'
      )
      if (allPaid) {
        await db.collection('projects').updateOne(
          { project_id: params.id },
          { $set: { status: 'Completed', updated_at: now } }
        )
      }
    }

    return NextResponse.json({ success: true, action: 'approved', payout_amount: payoutAmount })
  } catch (error: any) {
    return NextResponse.json(errorResponse(error), { status: getStatusCode(error) })
  }
}
