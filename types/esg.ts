export enum ESGStandard {
    GRI = "GRI",
    SASB = "SASB",
    SDG = "SDG", // UN Sustainable Development Goals (Very relevant for FundEd)
    CSRD = "CSRD"
}

export enum RecordStatus {
    DRAFT = "draft",
    PENDING_REVIEW = "pending_review",
    APPROVED = "approved",
    AUDITED = "audited"
}

// Repurposed to represent Institutional Donors tracking their impact through FundEd
export interface ESGImpactProfile {
    profile_id: string;
    user_id: string; // The institutional donor or corporate partner
    company_name: string;
    industry: string;
    focus_sdgs: number[]; // e.g., [1, 4, 5, 10] (No Poverty, Quality Ed, Gender Eq, Reduced Ineq)
    created_at: string;
    updated_at: string;
}

// Social Impact is fundamentally tied to FundEd's operations
export interface SocialImpactData {
    total_students_funded: number;
    total_funds_distributed: number;
    female_beneficiary_ratio: number;
    underprivileged_regions_supported: number;
    scholarship_hours_equivalent: number; // e.g., $1000 = ~X hours of education
}

// Environmental impact can be tracked via digital operations or specific green campaigns
export interface EnvironmentalData {
    carbon_offset_tco2e?: number; // E.g., remote education offset vs physical travel
    paperless_operations_saved_kg?: number;
}

export interface GovernanceData {
    transparent_donations_ratio: number; // % of donations fully verified and tracked
    kyc_verified_students_ratio: number;
}

export interface ESGRecord {
    record_id: string;
    profile_id: string; // Ties back to the corporate donor or overall platform impact
    period: string; // e.g., "2024", "2024-Q1"
    status: RecordStatus;

    social: SocialImpactData;
    environmental?: EnvironmentalData;
    governance?: GovernanceData;

    created_by: string; // user_id

    created_at: string;
    updated_at: string;
}
