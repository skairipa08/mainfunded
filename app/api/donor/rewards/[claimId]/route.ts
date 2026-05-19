import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getDb } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: { claimId: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 })
  }

  const db = await getDb()
  const claim = await db.collection('reward_claims').findOne({ claim_id: params.claimId })

  if (!claim) {
    return NextResponse.json({ error: 'Ödül talebi bulunamadı' }, { status: 404 })
  }

  if (String(claim.donor_id) !== String(session.user.id)) {
    return NextResponse.json({ error: 'Bu ödüle erişim yetkiniz yok' }, { status: 403 })
  }

  const tier = await db.collection('reward_tiers').findOne({ tier_id: claim.tier_id })
  const campaign = tier
    ? await db.collection('campaigns').findOne({ campaign_id: tier.campaign_id })
    : null

  const { _id: _c, ...claimData } = claim
  const tierData = tier ? (({ _id: _t, ...rest }) => rest)(tier) : null
  const campaignData = campaign
    ? { campaign_id: campaign.campaign_id, title: campaign.title }
    : null

  return NextResponse.json({ claim: claimData, tier: tierData, campaign: campaignData })
}
