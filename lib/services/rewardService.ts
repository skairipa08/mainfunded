'use server'

import { getDb, getClient } from '@/lib/db'
import { auth } from '@/auth'
import crypto from 'crypto'
import type { RewardTier, RewardTierFormData, DeliveryType } from '@/types/rewards'

export async function getCampaignRewardTiers(campaignId: string): Promise<RewardTier[]> {
  const db = await getDb()
  const tiers = await db
    .collection('reward_tiers')
    .find({ campaign_id: campaignId, is_active: true })
    .sort({ min_amount_tl: 1 })
    .toArray()
  return tiers.map(({ _id, ...t }) => t) as RewardTier[]
}

export async function upsertRewardTiers(
  campaignId: string,
  tiers: RewardTierFormData[]
): Promise<{ success: boolean; error?: string }> {
  // Authorization: must be campaign owner
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'Oturum açmanız gerekiyor' }

  const db = await getDb()
  const campaign = await db
    .collection('campaigns')
    .findOne({ campaign_id: campaignId }, { projection: { owner_id: 1 } })
  if (!campaign) return { success: false, error: 'Kampanya bulunamadı' }
  if (String(campaign.owner_id) !== String(session.user.id)) {
    return { success: false, error: 'Bu kampanyaya erişim yetkiniz yok' }
  }

  if (tiers.length > 5) return { success: false, error: 'En fazla 5 ödül kademesi eklenebilir' }

  // Enforce integer amounts (avoids mismatch with Math.floor in iyzico callback)
  const amounts = tiers.map((t) => Math.floor(t.min_amount_tl))
  if (new Set(amounts).size !== amounts.length) {
    return { success: false, error: 'Minimum tutarlar benzersiz olmalıdır' }
  }

  // Full server-side validation
  const invalidTier = tiers.find(
    (t) =>
      !t.title?.trim() ||
      !t.description?.trim() ||
      t.title.length > 120 ||
      t.description.length > 1000 ||
      !t.min_amount_tl || t.min_amount_tl <= 0 ||
      (t.stock_limit !== null && t.stock_limit < 1)
  )
  if (invalidTier) return { success: false, error: 'Geçersiz ödül kademesi verisi' }

  await db.collection('reward_tiers').deleteMany({ campaign_id: campaignId })

  if (tiers.length === 0) return { success: true }

  const sorted = [...tiers].sort((a, b) => a.min_amount_tl - b.min_amount_tl)
  const docs = sorted.map((t, i) => ({
    tier_id: `tier_${crypto.randomBytes(8).toString('hex')}`,
    campaign_id: campaignId,
    sort_order: i,
    min_amount_tl: Math.floor(t.min_amount_tl),
    title: t.title.trim(),
    description: t.description.trim(),
    delivery_type: t.delivery_type,
    stock_limit: t.stock_limit ?? null,
    stock_claimed: 0,
    estimated_delivery: t.estimated_delivery ?? null,
    is_active: true,
    created_at: new Date().toISOString(),
  }))

  await db.collection('reward_tiers').insertMany(docs)
  return { success: true }
}

export async function matchRewardTier(
  campaignId: string,
  amountTl: number
): Promise<RewardTier | null> {
  const db = await getDb()
  const tier = await db.collection('reward_tiers').findOne(
    {
      campaign_id: campaignId,
      is_active: true,
      min_amount_tl: { $lte: Math.floor(amountTl) },
      $or: [
        { stock_limit: null },
        { $expr: { $lt: ['$stock_claimed', '$stock_limit'] } },
      ],
    },
    { sort: { min_amount_tl: -1 } }
  )

  if (!tier) return null
  const { _id, ...rest } = tier
  return rest as RewardTier
}

export async function createRewardClaim(params: {
  tierId: string
  donationId: string
  donorId: string
  deliveryEmail: string
  campaignTitle: string
  donorFirstName: string
  rewardTitle: string
  rewardDescription: string
  deliveryType: DeliveryType
  amountTl: number
  transactionId: string
}): Promise<{ success: boolean; claimId?: string; error?: string }> {
  const mongoClient = await getClient()
  const db = mongoClient.db(process.env.DB_NAME || 'funded_db')
  const mongoSession = mongoClient.startSession()

  try {
    let claimId: string | undefined

    await mongoSession.withTransaction(async () => {
      // Atomic stock check + increment inside transaction
      const updated = await db.collection('reward_tiers').findOneAndUpdate(
        {
          tier_id: params.tierId,
          is_active: true,
          $or: [
            { stock_limit: null },
            { $expr: { $lt: ['$stock_claimed', '$stock_limit'] } },
          ],
        },
        { $inc: { stock_claimed: 1 } },
        { returnDocument: 'after', session: mongoSession }
      )

      if (!updated) {
        throw new Error('stock_exhausted')
      }

      claimId = `claim_${crypto.randomBytes(8).toString('hex')}`
      await db.collection('reward_claims').insertOne(
        {
          claim_id: claimId,
          tier_id: params.tierId,
          donation_id: params.donationId,
          donor_id: params.donorId,
          status: 'pending',
          delivery_email: params.deliveryEmail,
          delivery_payload: null,
          delivered_at: null,
          created_at: new Date().toISOString(),
        },
        { session: mongoSession }
      )
    })

    return { success: true, claimId }
  } catch (err: any) {
    const isExhausted = err.message === 'stock_exhausted'
    return {
      success: false,
      error: isExhausted ? 'Ödül kademesi dolmuş veya bulunamadı' : err.message,
    }
  } finally {
    await mongoSession.endSession()
  }
}
