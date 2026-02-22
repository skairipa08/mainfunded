// User Types
export enum UserRole {
  STUDENT = "student",
  DONOR = "donor",
  INSTITUTION = "institution",
  ADMIN = "admin",
}

export enum VerificationStatus {
  PENDING = "pending",
  VERIFIED = "verified",
  REJECTED = "rejected",
}

export interface VerificationDocument {
  type: string;
  url?: string;
  verified: boolean;
}

export interface User {
  user_id: string;
  email: string;
  name: string;
  picture?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface StudentProfile {
  profile_id: string;
  user_id: string;
  country: string;
  field_of_study: string;
  university: string;
  verification_status: VerificationStatus;
  verification_documents: VerificationDocument[];
  created_at: string;
  updated_at: string;
  verified_at?: string;
  rejection_reason?: string;
}

// Campaign Types
export enum CampaignCategory {
  TUITION = "tuition",
  BOOKS = "books",
  LAPTOP = "laptop",
  HOUSING = "housing",
  TRAVEL = "travel",
  EMERGENCY = "emergency",
}

export enum CampaignStatus {
  ACTIVE = "active",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  SUSPENDED = "suspended",
}

export interface Campaign {
  campaign_id: string;
  student_id: string;
  title: string;
  story: string;
  category: CampaignCategory;
  target_amount: number;
  raised_amount: number;
  donor_count: number;
  timeline: string;
  impact_log?: string;
  status: CampaignStatus;
  created_at: string;
  updated_at: string;
  status_reason?: string;
}

export interface CampaignCreate {
  title: string;
  story: string;
  category: CampaignCategory;
  target_amount: number;
  timeline: string;
  impact_log?: string;
}

export interface CampaignUpdate {
  title?: string;
  story?: string;
  category?: CampaignCategory;
  target_amount?: number;
  timeline?: string;
  impact_log?: string;
  status?: CampaignStatus;
}

// Donation Types
export enum PaymentStatus {
  INITIATED = "initiated",
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed",
  EXPIRED = "expired",
  REFUNDED = "refunded",
}

export interface Donation {
  donation_id: string;
  campaign_id: string;
  donor_id?: string;
  donor_name: string;
  donor_email?: string;
  amount: number;
  anonymous: boolean;
  iyzico_token?: string;
  iyzico_payment_id?: string;
  payment_status: PaymentStatus;
  created_at: string;
  refund_amount?: number;
  refunded_at?: string;
}

export interface PaymentTransaction {
  transaction_id: string;
  session_id: string;
  campaign_id: string;
  donor_id?: string;
  donor_name: string;
  donor_email?: string;
  amount: number;
  currency: string;
  anonymous: boolean;
  payment_status: PaymentStatus;
  metadata?: Record<string, any>;
  idempotency_key?: string;
  checkout_url?: string;
  created_at: string;
  updated_at: string;
}

// Session Types
export interface UserSession {
  session_id: string;
  user_id: string;
  session_token: string;
  expires_at: string;
  created_at: string;
}

// MVP/Demo Types for Student Applications (simpler than StudentProfile)
export type ApplicationStatus = 'Received' | 'Under Review' | 'Approved' | 'Rejected';

export interface StudentApplication {
  id: string;
  fullName: string;
  email: string;
  country: string;
  educationLevel: string;
  needSummary: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
}

// MVP/Demo Types for Donations (simpler than full Donation)
export interface SimpleDonation {
  id: string;
  amount: number;
  target: 'Support a verified student' | 'General education fund';
  donorName?: string;
  donorEmail?: string;
  status: 'Completed';
  createdAt: string;
}

// Payout Method Types
export type PayoutMethodType = 'iyzico' | 'paypal' | 'wise' | 'papara';

export interface PayoutMethod {
  type: PayoutMethodType;
  iyzicoSubMerchantKey?: string;
  iyzicoSubMerchantStatus?: 'pending' | 'active' | 'restricted';
  paypalEmail?: string;
  wiseEmail?: string;
  wiseCurrency?: 'USD' | 'EUR' | 'GBP';
  paparaAccountNumber?: string;
  paparaPhoneNumber?: string;
  isVerified: boolean;
  addedAt: string;
  lastPayoutAt?: string;
  isDefault?: boolean;
}

export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Payout {
  payout_id: string;
  user_id: string;
  amount: number;
  method_type: PayoutMethodType;
  status: PayoutStatus;
  reference_code?: string;
  notes?: string;
  created_at: string;
  completed_at?: string;
}

export interface StudentBalance {
  user_id: string;
  totalEarned: number;
  totalWithdrawn: number;
  available: number;
  pending: number;
  lastUpdated: string;
}