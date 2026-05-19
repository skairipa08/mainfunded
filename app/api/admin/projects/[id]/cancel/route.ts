import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { requireRole } from '@/lib/authz'
import { errorResponse, getStatusCode } from '@/lib/api-error'
import { calculateRefundPerDonor } from '@/lib/project-escrow'
import crypto from 'crypto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(['admin'])
    const db = await getDb()
    const now = new Date().toISOString()

    const escrow = await db.collection('project_escrow').findOne({ project_id: params.id })

    let refundsQueued = false
    if (escrow && escrow.total_collected > 0) {
      const collectTxs = await db.collection('escrow_transactions')
        .find({ project_id: params.id, type: 'collect' })
        .toArray()

      const refundTxs = collectTxs.map((tx: any) => ({
        tx_id: `tx_${crypto.randomBytes(8).toString('hex')}`,
        project_id: params.id,
        type: 'refund',
        donor_id: tx.donor_id,
        original_tx_id: tx.tx_id,
        amount: calculateRefundPerDonor(tx.amount, escrow.total_collected, escrow.total_released),
        currency: tx.currency || 'TRY',
        status: 'pending_iyzico',
        created_at: now,
      }))

      if (refundTxs.length > 0) {
        await db.collection('escrow_transactions').insertMany(refundTxs)
        refundsQueued = true
      }
    }

    await db.collection('projects').updateOne(
      { project_id: params.id },
      { $set: { status: 'Rejected', updated_at: now } }
    )

    return NextResponse.json({ success: true, refunds_queued: refundsQueued })
  } catch (error: any) {
    return NextResponse.json(errorResponse(error), { status: getStatusCode(error) })
  }
}
