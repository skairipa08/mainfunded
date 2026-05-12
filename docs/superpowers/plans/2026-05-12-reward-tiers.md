# Reward Tiers Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a complete tiered reward system where campaign donors are automatically assigned the highest eligible digital reward tier after payment confirmation, with beautiful animated UI and full delivery via Resend email.

**Architecture:** MongoDB collections `reward_tiers` and `reward_claims` accessed via `lib/db.ts`. Reward matching and claim creation run inside the existing iyzico callback's `processSuccessfulPayment` as a fire-and-forget operation (never blocks payment). Frontend uses rich Tailwind CSS animations/gradients on RewardCards (campaign page) and RewardTierEditor (campaign creation).

**Tech Stack:** MongoDB (lib/db.ts), Next.js 14 App Router, NextAuth v5, Resend (already installed v6.9.3), Tailwind CSS, TypeScript.

---

## Chunk 1: Foundation — Types + DB

### Task 1: TypeScript reward types

**Files:**
- Create: `types/rewards.ts`

- [ ] Write `types/rewards.ts` with the following content:

```ts
export type DeliveryType =
  | 'thank_you_email'
  | 'handwritten_scan'
  | 'digital_certificate'
  | 'impact_report'
  | 'scholarship_certificate'

export type ClaimStatus = 'pending' | 'processing' | 'delivered' | 'failed'

export interface RewardTier {
  _id?: string
  tier_id: string
  campaign_id: string
  sort_order: number
  min_amount_tl: number
  title: string
  description: string
  delivery_type: DeliveryType
  stock_limit: number | null
  stock_claimed: number
  estimated_delivery: string | null
  is_active: boolean
  created_at: string
}

export interface RewardClaim {
  _id?: string
  claim_id: string
  tier_id: string
  donation_id: string
  donor_id: string
  status: ClaimStatus
  delivery_email: string
  delivery_payload: Record<string, unknown> | null
  delivered_at: string | null
  created_at: string
}

export interface RewardTierFormData {
  min_amount_tl: number
  title: string
  description: string
  delivery_type: DeliveryType
  stock_limit: number | null
  estimated_delivery: string | null
}

export const DELIVERY_LABELS: Record<DeliveryType, string> = {
  thank_you_email: 'Teşekkür e-postası',
  handwritten_scan: 'El yazısı taraması (PDF)',
  digital_certificate: 'Dijital sertifika',
  impact_report: 'Etki raporu + fotoğraf seti',
  scholarship_certificate: 'Burs sertifikası (imzalı PDF)',
}

export const DELIVERY_ICONS: Record<DeliveryType, string> = {
  thank_you_email: '✉️',
  handwritten_scan: '✍️',
  digital_certificate: '🏆',
  impact_report: '📊',
  scholarship_certificate: '🎓',
}
```

### Task 2: MongoDB indexes for reward collections

**Files:**
- Modify: `lib/db.ts`

- [ ] In `createIndexes()`, append reward collection indexes after existing indexes:

```ts
// Reward tiers
await db.collection('reward_tiers').createIndex({ campaign_id: 1, sort_order: 1 });
await db.collection('reward_tiers').createIndex('tier_id', { unique: true });

// Reward claims
await db.collection('reward_claims').createIndex('claim_id', { unique: true });
await db.collection('reward_claims').createIndex({ donation_id: 1 }, { unique: true });
await db.collection('reward_claims').createIndex('donor_id');
await db.collection('reward_claims').createIndex('status');
```

---

## Chunk 2: Service Layer

### Task 3: Reward service

**Files:**
- Create: `lib/services/rewardService.ts`

- [ ] Implement `getCampaignRewardTiers(campaignId)` — returns active tiers sorted by min_amount_tl ascending
- [ ] Implement `upsertRewardTiers(campaignId, tiers)` — deletes existing tiers and inserts up to 5, validates uniqueness and max count
- [ ] Implement `matchRewardTier(campaignId, amountTl)` — returns highest eligible tier with stock remaining (sort DESC, limit 1)
- [ ] Implement `createRewardClaim(params)` — inserts claim and increments stock_claimed atomically using MongoDB `$inc` with `findOneAndUpdate` for stock check

Full implementation:

```ts
'use server'

import { getDb } from '@/lib/db'
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
  if (tiers.length > 5) return { success: false, error: 'En fazla 5 ödül kademesi eklenebilir' }
  const amounts = tiers.map((t) => t.min_amount_tl)
  if (new Set(amounts).size !== amounts.length) return { success: false, error: 'Minimum tutarlar benzersiz olmalıdır' }

  const db = await getDb()
  await db.collection('reward_tiers').deleteMany({ campaign_id: campaignId })

  if (tiers.length === 0) return { success: true }

  const sorted = [...tiers].sort((a, b) => a.min_amount_tl - b.min_amount_tl)
  const docs = sorted.map((t, i) => ({
    tier_id: `tier_${crypto.randomBytes(8).toString('hex')}`,
    campaign_id: campaignId,
    sort_order: i,
    min_amount_tl: t.min_amount_tl,
    title: t.title,
    description: t.description,
    delivery_type: t.delivery_type,
    stock_limit: t.stock_limit,
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
      min_amount_tl: { $lte: amountTl },
      $or: [{ stock_limit: null }, { $expr: { $lt: ['$stock_claimed', '$stock_limit'] } }],
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
  try {
    const db = await getDb()

    // Atomic stock increment — fails if stock exhausted
    const updated = await db.collection('reward_tiers').findOneAndUpdate(
      {
        tier_id: params.tierId,
        is_active: true,
        $or: [{ stock_limit: null }, { $expr: { $lt: ['$stock_claimed', '$stock_limit'] } }],
      },
      { $inc: { stock_claimed: 1 } },
      { returnDocument: 'after' }
    )

    if (!updated) return { success: false, error: 'Ödül kademesi dolmuş veya bulunamadı' }

    const claimId = `claim_${crypto.randomBytes(8).toString('hex')}`
    await db.collection('reward_claims').insertOne({
      claim_id: claimId,
      tier_id: params.tierId,
      donation_id: params.donationId,
      donor_id: params.donorId,
      status: 'pending',
      delivery_email: params.deliveryEmail,
      delivery_payload: null,
      delivered_at: null,
      created_at: new Date().toISOString(),
    })

    return { success: true, claimId }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
```

### Task 4: Delivery engine

**Files:**
- Create: `lib/services/deliveryEngine.ts`

- [ ] Implement `dispatchDelivery(params)` with switch on deliveryType
- [ ] Implement `sendThankYouEmail(params)` using Resend with full HTML template (dark header, donor greeting, reward box, CTA button, transaction table, footer)
- [ ] Implement `generateAndSendCertificate(params)` as placeholder logging + sendThankYouEmail
- [ ] After delivery, update reward_claims status to 'delivered'

Key HTML design principles:
- Dark header (`#1a1a2e`) with FundEd wordmark in white
- Gradient reward box (`linear-gradient(135deg, #667eea 0%, #764ba2 100%)`) 
- Bold donor name greeting
- CTA button with gold gradient
- Clean metadata table with alternating rows
- Footer with support email

---

## Chunk 3: API Integration

### Task 5: iyzico callback reward assignment

**Files:**
- Modify: `app/api/iyzico/callback/route.ts`

- [ ] Import `matchRewardTier`, `createRewardClaim` from `@/lib/services/rewardService`
- [ ] Import `dispatchDelivery` from `@/lib/services/deliveryEngine`
- [ ] At the end of `processSuccessfulPayment`, after corporate matching trigger, add reward assignment block:

```ts
// Reward tier assignment — fire and forget, never blocks payment
try {
  const baseAmount = Math.floor(Number(transaction.base_amount ?? transaction.amount))
  const matchedTier = await matchRewardTier(transaction.campaign_id, baseAmount)
  if (matchedTier && transaction.donor_email) {
    const claimResult = await createRewardClaim({
      tierId: matchedTier.tier_id,
      donationId: donation.donation_id,
      donorId: String(donation.donor_id ?? 'anonymous'),
      deliveryEmail: transaction.donor_email,
      campaignTitle: campaign?.title || 'Kampanya',
      donorFirstName: (transaction.donor_name || 'Bağışçı').split(' ')[0],
      rewardTitle: matchedTier.title,
      rewardDescription: matchedTier.description,
      deliveryType: matchedTier.delivery_type,
      amountTl: baseAmount,
      transactionId: paymentId,
    })
    if (claimResult.success && claimResult.claimId) {
      dispatchDelivery({
        claimId: claimResult.claimId,
        donorEmail: transaction.donor_email,
        donorFirstName: (transaction.donor_name || 'Bağışçı').split(' ')[0],
        campaignTitle: campaign?.title || 'Kampanya',
        rewardTitle: matchedTier.title,
        rewardDescription: matchedTier.description,
        deliveryType: matchedTier.delivery_type,
        amountTl: baseAmount,
        transactionId: paymentId,
        donationDate: new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' }),
      }).catch((err) => logger.error('[reward.delivery.unhandled]', String(err)))
    }
  }
} catch (rewardErr: any) {
  logger.error('[reward.assignment.unhandled]', String(rewardErr))
}
```

### Task 6: Donor rewards lookup API

**Files:**
- Create: `app/api/donor/rewards/[claimId]/route.ts`

- [ ] GET handler: fetch claim by claim_id, join tier (lookup reward_tiers by tier_id), join campaign (lookup campaigns by campaign_id)
- [ ] Validate session — return 401 if not authenticated
- [ ] Validate ownership — return 403 if claim.donor_id !== session.user.id
- [ ] Return claim + tier + campaign data as JSON

---

## Chunk 4: UI Components

### Task 7: RewardTierEditor (campaign creation)

**Files:**
- Create: `components/campaigns/RewardTierEditor.tsx`

Rich UI requirements:
- `'use client'`
- Props: `value: RewardTierFormData[]`, `onChange: (tiers: RewardTierFormData[]) => void`
- Up to 5 animated cards with `border-l-4 border-l-blue-500`
- Each card: tier number badge, all fields, "Kaldır" button
- CSS `transition-all duration-300` on card enter/exit
- "Kademe ekle" button disabled at 5 tiers, gradient styling
- "FundEd otomatik gönderir" badge under delivery_type select
- "X / 5" counter in header
- Sort by min_amount_tl on every change
- Inline validation for uniqueness and > 0

### Task 8: RewardCards (campaign page)

**Files:**
- Create: `components/campaigns/RewardCards.tsx`

Rich UI requirements:
- `'use client'`
- Props: `tiers: RewardTier[]`, `selectedTierId: string | null`, `onSelect: (tierId: string, minAmount: number) => void`
- Responsive `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Each card: gradient header with min_amount, bold title, description, delivery label with icon
- Hover: `hover:scale-[1.02] hover:shadow-xl transition-all duration-300`
- Selected: `ring-2 ring-blue-500 shadow-blue-100`
- Stock warning: amber when ≤5 remaining
- "Doldu" badge on sold-out cards (disabled)
- "En çok seçilen" badge on most popular (highest stock_claimed/stock_limit ratio)
- Gradient CTA button per card

### Task 9: Donor rewards page

**Files:**
- Create: `app/[locale]/donor/rewards/[claimId]/page.tsx`

Rich UI requirements:
- Server component using `auth()` from next-auth
- Full-page gradient background (`from-slate-900 via-purple-900 to-slate-900`)
- Large animated reward tier card with glass morphism (`backdrop-blur-sm bg-white/10`)
- Status badge with color coding and pulse animation on 'pending'
- Campaign and donor info prominently displayed
- Transaction metadata table
- Download button if pdf_url in delivery_payload
- "E-posta gönderildi" confirmation for thank_you_email

---

## Chunk 5: Campaign Form Integration + Final Checks

### Task 10: Wire RewardTierEditor into campaign creation form

**Files:**
- Modify: `app/[locale]/campaigns/new/form-wrapper.tsx`

- [ ] Import `RewardTierEditor` and `RewardTierFormData`
- [ ] Add `rewardTiers: RewardTierFormData[]` state (default `[]`)
- [ ] Add `RewardTierEditor` section below impact_log field, above submit button
- [ ] After successful campaign creation (`result.data.campaign_id`), call `upsertRewardTiers(campaign_id, rewardTiers)` if tiers.length > 0
- [ ] Import and call `upsertRewardTiers` from `@/lib/services/rewardService`

### Task 11: TypeScript check

- [ ] Run `npx tsc --noEmit`
- [ ] Fix all TypeScript errors found
