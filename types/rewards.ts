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
