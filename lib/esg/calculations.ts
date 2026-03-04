/**
 * ESG & Social Impact Calculation Engine for FundEd
 * Computes metrics aligned with UN SDGs (Sustainable Development Goals) and GRI/SASB Social factors.
 */

// Constants for impact estimation (These should be refined based on actual data)
const IMPACT_FACTORS = {
    // Approximate cost of 1 hour of university education in target regions (USD)
    usd_per_education_hour: 5.5,
    // Approximate carbon saved by remote/digital funding vs traditional physical processes (tCO2e per $1000)
    tco2e_saved_per_1k_usd_digital: 0.05,
    // Trees saved per 100 digital transactions (vs paper applications)
    trees_saved_per_100_tx: 0.5,
};

export interface CampaignData {
    target_amount: number;
    raised_amount: number;
    student_gender?: 'male' | 'female' | 'other';
    student_region?: string;
    is_verified: boolean;
}

/**
 * Calculates core Social Impact metrics based on a set of supported campaigns/donations
 */
export function calculateSocialImpact(
    donations_total_usd: number,
    supported_campaigns: CampaignData[]
) {
    const total_students_funded = supported_campaigns.length;

    // Calculate female beneficiary ratio (SDG 5: Gender Equality)
    const female_students = supported_campaigns.filter(c => c.student_gender === 'female').length;
    const female_beneficiary_ratio = total_students_funded > 0
        ? female_students / total_students_funded
        : 0;

    // Calculate under-privileged region coverage
    // Assume regions outside major cities or specific lists are underprivileged
    const non_null_regions = supported_campaigns.filter(c => c.student_region).length;

    const scholarship_hours_equivalent = Math.round(donations_total_usd / IMPACT_FACTORS.usd_per_education_hour);

    return {
        total_students_funded,
        total_funds_distributed: donations_total_usd,
        female_beneficiary_ratio: Number((female_beneficiary_ratio * 100).toFixed(2)),
        underprivileged_regions_supported: non_null_regions,
        scholarship_hours_equivalent
    };
}

/**
 * Calculates Environmental metrics derived from the platform's digital nature
 */
export function calculateDigitalEnvironmentalImpact(
    total_donations_usd: number,
    total_transactions: number
) {
    const carbon_offset_tco2e = (total_donations_usd / 1000) * IMPACT_FACTORS.tco2e_saved_per_1k_usd_digital;
    const trees_saved = (total_transactions / 100) * IMPACT_FACTORS.trees_saved_per_100_tx;
    const paper_saved_kg = trees_saved * 8.33; // 1 tree ~ 8.33k sheets of paper

    return {
        carbon_offset_tco2e: Number(carbon_offset_tco2e.toFixed(3)),
        paperless_operations_saved_kg: Number(paper_saved_kg.toFixed(2))
    };
}

/**
 * Calculates Governance metrics based on system transparency
 */
export function calculateGovernanceImpact(
    supported_campaigns: CampaignData[]
) {
    if (supported_campaigns.length === 0) return { transparent_donations_ratio: 0, kyc_verified_students_ratio: 0 };

    const verified_campaigns = supported_campaigns.filter(c => c.is_verified).length;
    const kyc_ratio = (verified_campaigns / supported_campaigns.length) * 100;

    return {
        transparent_donations_ratio: 100, // Assuming 100% digital trace on FundEd
        kyc_verified_students_ratio: Number(kyc_ratio.toFixed(2))
    };
}
