import { NextRequest, NextResponse } from 'next/server'
import { getCampaignRewardTiers } from '@/lib/services/rewardService'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tiers = await getCampaignRewardTiers(params.id)
    return NextResponse.json({ tiers })
  } catch {
    return NextResponse.json({ tiers: [] })
  }
}
