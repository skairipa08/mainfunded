export type ProjectType =
  | 'club' | 'team' | 'research' | 'competition' | 'social' | 'event' | 'conference'

export type ProjectStatus =
  | 'Draft' | 'Pending' | 'Verified' | 'Rejected' | 'Published' | 'Suspended' | 'Completed'

export type OwnerType = 'student' | 'institution'

export type SchoolLevel = 'high_school' | 'university'

export type MilestoneStatus =
  | 'Locked'           // previous milestone not done
  | 'EvidenceRequired' // system: funding threshold hit, team can upload
  | 'UnlockRequested'  // team: evidence uploaded, awaiting admin
  | 'Approved'         // admin approved, payout triggered
  | 'Paid'             // Iyzico payout confirmed

export type MemberRole = 'leader' | 'member' | 'advisor'

export type EscrowTxType = 'collect' | 'release' | 'refund'

export interface BudgetItem {
  name: string
  amount: number
  category: string
}

export interface TimelineItem {
  week: number
  task: string
}

export interface Project {
  _id?: string
  project_id: string
  title: string
  description: string
  type: ProjectType
  status: ProjectStatus
  owner_id: string        // NextAuth user.id
  owner_type: OwnerType
  school_name: string
  school_email: string
  school_level: SchoolLevel
  club_name?: string
  domain: string[]
  city?: string
  advisor_name?: string
  advisor_email?: string
  advisor_token?: string
  advisor_approved_at?: string
  target_budget: number
  budget_items: BudgetItem[]
  expected_outputs: string[]
  timeline: TimelineItem[]
  files: string[]
  video_url?: string
  risk_score: number
  created_at: string
  updated_at: string
  published_at?: string
}

export interface ProjectMember {
  _id?: string
  member_id: string
  project_id: string
  user_id?: string
  name: string
  email: string
  role: MemberRole
  verified_at?: string
  created_at: string
}

export interface Milestone {
  _id?: string
  milestone_id: string
  project_id: string
  order: number
  title: string
  description: string
  percentage: number
  status: MilestoneStatus
  evidence_files: string[]
  evidence_note?: string
  admin_note?: string
  approved_at?: string
  approved_by?: string
  created_at: string
}

export interface ProjectEscrow {
  _id?: string
  project_id: string
  total_collected: number
  total_released: number
  pending_release: number
  iyzico_escrow_ref?: string
  created_at: string
  updated_at: string
}

export interface EscrowTransaction {
  _id?: string
  tx_id: string
  project_id: string      // denormalized for fast donor-level queries
  donor_id?: string       // present on collect transactions
  milestone_id?: string   // present on release transactions
  original_tx_id?: string // present on refund transactions
  type: EscrowTxType
  amount: number
  currency: string
  iyzico_payment_id?: string
  status: string
  created_at: string
}

export interface ProjectVerification {
  _id?: string
  project_id: string
  student_email_verified: boolean
  school_doc_verified: boolean
  advisor_approved: boolean
  admin_reviewed_at?: string
  admin_reviewed_by?: string
  rejection_reason?: string
  created_at: string
}

export interface SponsorProjectFollow {
  _id?: string
  donor_id: string
  project_id: string
  followed_at: string
}

export interface ProjectFilters {
  type?: ProjectType[]
  domain?: string[]
  school_level?: SchoolLevel
  city?: string
  budget_min?: number
  budget_max?: number
  status?: 'Published' | 'Completed'
  has_advisor?: boolean
  search?: string
  page?: number
  limit?: number
}

export interface ESGMetrics {
  total_projects_supported: number
  total_students_reached: number
  completed_projects_ratio: number
  active_projects: number
  domain_breakdown: { domain: string; count: number }[]
  total_amount_donated: number
}
