import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { requireUser } from '@/lib/authz'
import { errorResponse, getStatusCode } from '@/lib/api-error'
import { z } from 'zod'
import crypto from 'crypto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const donateSchema = z.object({
  amount: z.number().positive().min(10),
  currency: z.string().default('TRY'),
  iyzico_payment_id: z.string().min(1),
})

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser()
    const body = await req.json()

    const validation = donateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', details: validation.error.errors } },
        { status: 400 }
      )
    }

    const { amount, currency, iyzico_payment_id } = validation.data
    const db = await getDb()

    const project = await db.collection('projects').findOne({ project_id: params.id })
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (project.status !== 'Published') {
      return NextResponse.json({ error: 'Project is not accepting donations' }, { status: 400 })
    }

    await db.collection('project_escrow').updateOne(
      { project_id: params.id },
      {
        $inc: { total_collected: amount },
        $set: { updated_at: new Date().toISOString() },
        $setOnInsert: {
          project_id: params.id,
          total_released: 0,
          pending_release: 0,
          created_at: new Date().toISOString(),
        },
      },
      { upsert: true }
    )

    await db.collection('escrow_transactions').insertOne({
      tx_id: `tx_${crypto.randomBytes(8).toString('hex')}`,
      project_id: params.id,
      donor_id: user.id,
      type: 'collect',
      amount,
      currency,
      iyzico_payment_id,
      status: 'completed',
      created_at: new Date().toISOString(),
    })

    // Spec §6: Only Milestone 1 is triggered automatically by the donation threshold.
    // Milestones 2 and 3 are unlocked via admin approval chain.
    const escrow = await db.collection('project_escrow').findOne({ project_id: params.id })
    const firstMilestone = await db.collection('milestones').findOne({
      project_id: params.id,
      order: 1,
      status: 'Locked',
    })

    if (firstMilestone && escrow && escrow.total_collected >= project.target_budget * 0.20) {
      await db.collection('milestones').updateOne(
        { milestone_id: firstMilestone.milestone_id },
        { $set: { status: 'EvidenceRequired', updated_at: new Date().toISOString() } }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(errorResponse(error), { status: getStatusCode(error) })
  }
}
