// =======================================
// Student Verification Types
// =======================================

// Status enum for verification workflow
export const VERIFICATION_STATUSES = [
  'DRAFT',
  'PENDING_REVIEW',
  'APPROVED',
  'REJECTED',
  'NEEDS_MORE_INFO',
  'UNDER_INVESTIGATION',
  'SUSPENDED',
  'EXPIRED',
  'REVOKED',
  'PERMANENTLY_BANNED',
  'ABANDONED'
] as const;

export type VerificationStatusType = typeof VERIFICATION_STATUSES[number];

// Document types that can be uploaded
export const DOCUMENT_TYPES = [
  'STUDENT_ID',
  'ENROLLMENT_LETTER',
  'GOVERNMENT_ID',
  'SELFIE_WITH_ID',
  'TRANSCRIPT',
  'PROOF_OF_ADDRESS',
  'OTHER'
] as const;

export type DocumentType = typeof DOCUMENT_TYPES[number];

// Institution types
export const INSTITUTION_TYPES = ['university', 'college', 'vocational', 'high_school'] as const;
export type InstitutionType = typeof INSTITUTION_TYPES[number];

// Degree levels
export const DEGREE_LEVELS = ['bachelor', 'master', 'phd', 'associate', 'certificate'] as const;
export type DegreeLevel = typeof DEGREE_LEVELS[number];

// =======================================
// Verification Tiers
// =======================================

// Tier levels: 0 = email only, 1 = document, 2 = high trust, 3 = partner
export const VERIFICATION_TIERS = [0, 1, 2, 3] as const;
export type VerificationTier = typeof VERIFICATION_TIERS[number];

// Tier requirements configuration
export interface TierRequirements {
  tier: VerificationTier;
  name: string;
  nameKey: string; // i18n key
  description: string;
  descriptionKey: string; // i18n key
  required: string[];  // Required document/verification types
  optional: string[];  // Optional enhancements
  minCampaignTier: boolean; // Can create campaigns at this tier
}

// Badge info for donor-facing display
export interface TierBadgeInfo {
  tier: VerificationTier;
  label: string;
  labelKey: string;
  color: string;
  icon: string;
  checks: string[]; // What was verified
  checksKeys: string[]; // i18n keys for checks
}

// Risk flags for fraud detection
export const RISK_FLAGS = [
  'DOCUMENT_QUALITY_LOW',
  'DOCUMENT_METADATA_SUSPICIOUS',
  'DOCUMENT_TEMPLATE_MATCH',
  'FACE_MATCH_LOW_CONFIDENCE',
  'MULTIPLE_IDENTITIES_DETECTED',
  'IDENTITY_DATABASE_HIT',
  'VPN_PROXY_DETECTED',
  'DEVICE_BLOCKLIST_HIT',
  'VELOCITY_ANOMALY',
  'GEO_MISMATCH',
  'IMPOSSIBLE_TRAVEL',
  'DUPLICATE_ACCOUNT_SUSPECTED',
  'LINKED_ACCOUNT_FLAGGED',
  'PREVIOUS_REJECTION',
  'CAMPAIGN_CONTENT_FLAGGED',
  'HARDSHIP_STORY_SUSPICIOUS',
  'INSTITUTION_VERIFICATION_FAILED',
  'OFAC_SCREENING_HIT',
  'DUPLICATE_DOCUMENT'
] as const;

export type RiskFlag = typeof RISK_FLAGS[number];

// Event types for immutable audit ledger
export const EVENT_TYPES = [
  'CREATED',
  'UPDATED',
  'SUBMITTED',
  'DOCUMENT_UPLOADED',
  'DOCUMENT_DELETED',
  'APPROVED',
  'REJECTED',
  'NEEDS_MORE_INFO',
  'SUSPENDED',
  'REVOKED',
  'BANNED',
  'EXPIRED',
  'REACTIVATED',
  'ASSIGNED',
  'ESCALATED',
  'NOTE_ADDED',
  'FLAG_ADDED',
  'FLAG_REMOVED'
] as const;

export type EventType = typeof EVENT_TYPES[number];

// Reject reason codes
export const REJECT_REASONS = [
  'DOCUMENT_UNREADABLE',
  'DOCUMENT_EXPIRED',
  'DOCUMENT_MISMATCH',
  'INSTITUTION_UNVERIFIABLE',
  'ENROLLMENT_NOT_CONFIRMED',
  'IDENTITY_MISMATCH',
  'SUSPECTED_FRAUD',
  'DUPLICATE_ACCOUNT',
  'POLICY_VIOLATION',
  'AGE_REQUIREMENT',
  'OTHER'
] as const;

export type RejectReason = typeof REJECT_REASONS[number];

// =======================================
// Main Verification Document Interface
// =======================================

export interface Verification {
  verification_id: string;
  user_id: string;
  status: VerificationStatusType;
  status_changed_at: string;
  expires_at?: string;
  reapply_eligible_at?: string;

  // Tier info
  tier_requested: VerificationTier;
  tier_approved?: VerificationTier;

  // Institutional email verification (Tier 0)
  institution_email?: string;
  institution_email_domain?: string;
  institution_email_verified?: boolean;
  institution_email_verified_at?: string;
  institution_email_otp_hash?: string;
  institution_email_otp_expires_at?: string;

  // Partner attestation (Tier 3)
  partner_attestation_id?: string;
  partner_name?: string;
  partner_verified_at?: string;

  // Profile info
  first_name: string;
  last_name: string;
  date_of_birth: string;
  phone_hash: string;
  country: string;
  city?: string;

  // Education info
  institution_name: string;
  institution_country: string;
  institution_type: InstitutionType;
  student_id_hash: string;
  enrollment_year: number;
  expected_graduation: number;
  degree_program: string;
  degree_level: DegreeLevel;
  is_full_time: boolean;

  // Financial context (optional)
  monthly_income?: number;
  has_scholarship?: boolean;
  scholarship_amount?: number;
  financial_need_statement?: string;

  // Risk assessment
  risk_score: number;
  risk_flags: RiskFlag[];

  // Assignment
  assigned_to?: string;
  assigned_at?: string;

  // Timestamps
  submitted_at?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;

  // Optimistic concurrency
  __v: number;
}

// =======================================
// Verification Document (uploaded files)
// =======================================

export interface VerificationDoc {
  doc_id: string;
  verification_id: string;
  document_type: DocumentType;
  storage_path: string;
  file_name: string;
  mime_type: string;
  file_size_bytes: number;
  sha256_hash: string;
  is_verified: boolean;
  verified_by?: string;
  verified_at?: string;
  reject_reason?: string;
  uploaded_at: string;
}

// =======================================
// Verification Event (Immutable Ledger)
// =======================================

export interface VerificationEvent {
  event_id: string;
  verification_id: string;
  event_type: EventType;
  event_data: Record<string, any>;
  actor_type: 'USER' | 'ADMIN' | 'SYSTEM';
  actor_id?: string;
  actor_ip?: string;
  occurred_at: string;
}

// =======================================
// iyzico Event (Payment Idempotency)
// =======================================

export interface IyzicoEventRecord {
  event_id: string;
  event_type: string;
  received_at: string;
  processed_at?: string;
  processing_status: 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'FAILED';
  payload: Record<string, any>;
  error_message?: string;
  retry_count: number;
}

// =======================================
// Audit Log (Admin Actions)
// =======================================

export interface VerificationAuditLog {
  audit_id: string;
  timestamp: string;

  // Actor info
  actor_id: string;
  actor_email: string;
  actor_role: 'REVIEWER' | 'SENIOR_REVIEWER' | 'ADMIN' | 'SUPER_ADMIN';
  actor_ip: string;
  actor_user_agent: string;

  // Target info
  target_type: 'VERIFICATION' | 'USER' | 'CAMPAIGN' | 'PAYOUT';
  target_id: string;
  target_user_id: string;

  // Action details
  action: string;
  previous_status?: VerificationStatusType;
  new_status?: VerificationStatusType;

  action_details: {
    reason?: string;
    reason_code?: RejectReason;
    requested_documents?: DocumentType[];
    message?: string;
    escalate_to?: string;
    assigned_to?: string;
    suspend_until?: string;
    internal_notes?: string;
    risk_flags_reviewed?: RiskFlag[];
  };

  // Context
  session_id: string;
  request_id: string;
  duration_ms?: number;
}

// =======================================
// Internal Notes
// =======================================

export interface InternalNote {
  note_id: string;
  verification_id: string;
  author_id: string;
  author_email: string;
  created_at: string;
  updated_at?: string;

  note_type: 'OBSERVATION' | 'CONCERN' | 'INVESTIGATION' | 'RESOLUTION' | 'HANDOFF';
  visibility: 'ALL_ADMINS' | 'SENIOR_ONLY' | 'AUTHOR_ONLY';

  content: string;
  attachments?: string[];
  tags?: string[];
  linked_notes?: string[];
  is_resolved?: boolean;
}

// =======================================
// Create/Update DTOs
// =======================================

export interface CreateVerificationDTO {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  phone: string;  // Will be hashed
  country: string;
  city?: string;

  institution_name: string;
  institution_country: string;
  institution_type: InstitutionType;
  student_id: string;  // Will be hashed
  enrollment_year: number;
  expected_graduation: number;
  degree_program: string;
  degree_level: DegreeLevel;
  is_full_time: boolean;

  monthly_income?: number;
  has_scholarship?: boolean;
  scholarship_amount?: number;
  financial_need_statement?: string;
}

export interface UpdateVerificationDTO extends Partial<CreateVerificationDTO> { }

export interface AdminActionDTO {
  action: 'APPROVE' | 'REJECT' | 'NEEDS_MORE_INFO' | 'SUSPEND' | 'INVESTIGATE' | 'REVOKE' | 'BAN' | 'LIFT_SUSPENSION' | 'REASSIGN' | 'ESCALATE';
  reason?: string;
  reason_code?: RejectReason;
  requested_documents?: DocumentType[];
  message?: string;
  suspend_until?: string;
  new_assignee?: string;
  escalate_to?: string;
  internal_notes?: string;
}

// =======================================
// Queue/List Response Types
// =======================================

export interface VerificationQueueItem {
  verification_id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  institution_name: string;
  status: VerificationStatusType;
  risk_score: number;
  risk_flags: RiskFlag[];
  submitted_at?: string;
  assigned_to?: string;
  days_in_queue?: number;
}

export interface VerificationDetail extends Verification {
  documents: VerificationDoc[];
  events: VerificationEvent[];
  notes?: InternalNote[];
}
