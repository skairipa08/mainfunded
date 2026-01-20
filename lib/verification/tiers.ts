/**
 * Verification Tier Configuration
 * 
 * Defines tier requirements, validation logic, and badge information
 * for the tiered student verification system.
 */

import {
    VerificationTier,
    TierRequirements,
    TierBadgeInfo,
    DocumentType,
    VerificationDoc
} from '@/types/verification';

// =======================================
// Tier Configuration
// =======================================

export const TIER_CONFIG: TierRequirements[] = [
    {
        tier: 0,
        name: 'Email Verified',
        nameKey: 'verification.tiers.tier0.name',
        description: 'Verified through institutional email domain',
        descriptionKey: 'verification.tiers.tier0.description',
        required: ['institutional_email'],
        optional: [],
        minCampaignTier: false // Cannot create campaigns at Tier 0
    },
    {
        tier: 1,
        name: 'Document Verified',
        nameKey: 'verification.tiers.tier1.name',
        description: 'Verified with enrollment certificate or student status document',
        descriptionKey: 'verification.tiers.tier1.description',
        required: ['ENROLLMENT_LETTER'],
        optional: ['STUDENT_ID'],
        minCampaignTier: true // MVP default - can create campaigns
    },
    {
        tier: 2,
        name: 'High Trust',
        nameKey: 'verification.tiers.tier2.name',
        description: 'Enhanced verification with QR/barcode or school portal screenshot',
        descriptionKey: 'verification.tiers.tier2.description',
        required: ['ENROLLMENT_LETTER', 'school_portal_screenshot'],
        optional: ['SELFIE_WITH_ID', 'qr_verification'],
        minCampaignTier: true
    },
    {
        tier: 3,
        name: 'Partner Verified',
        nameKey: 'verification.tiers.tier3.name',
        description: 'Verified through official university/partner attestation',
        descriptionKey: 'verification.tiers.tier3.description',
        required: ['partner_attestation'],
        optional: [],
        minCampaignTier: true
    }
];

// =======================================
// Tier Badge Configuration
// =======================================

export const TIER_BADGE_CONFIG: Record<VerificationTier, TierBadgeInfo> = {
    0: {
        tier: 0,
        label: 'Email Verified',
        labelKey: 'verification.badges.tier0',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: 'mail',
        checks: ['Institutional email'],
        checksKeys: ['verification.checks.email']
    },
    1: {
        tier: 1,
        label: 'Verified Student',
        labelKey: 'verification.badges.tier1',
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        icon: 'shield-check',
        checks: ['Enrollment document'],
        checksKeys: ['verification.checks.enrollment']
    },
    2: {
        tier: 2,
        label: 'Verified Student: High Trust',
        labelKey: 'verification.badges.tier2',
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: 'verified',
        checks: ['Enrollment document', 'School portal verified'],
        checksKeys: ['verification.checks.enrollment', 'verification.checks.portal']
    },
    3: {
        tier: 3,
        label: 'Partner Verified',
        labelKey: 'verification.badges.tier3',
        color: 'bg-amber-100 text-amber-800 border-amber-200',
        icon: 'building',
        checks: ['University attestation'],
        checksKeys: ['verification.checks.partner']
    }
};

// =======================================
// Minimum Tier for Campaign Creation
// =======================================

export const MIN_CAMPAIGN_TIER: VerificationTier = 1;

// =======================================
// Known Educational Email Domains
// =======================================

export const EDUCATIONAL_DOMAINS = [
    // Turkey
    '.edu.tr',
    // USA
    '.edu',
    // UK
    '.ac.uk',
    // Germany
    '.uni-',
    '.tu-',
    '.fh-',
    // France
    '.univ-',
    '.edu.fr',
    // Generic patterns
    'university.',
    'college.',
    'school.'
];

// =======================================
// Helper Functions
// =======================================

/**
 * Get tier configuration by tier number
 */
export function getTierConfig(tier: VerificationTier): TierRequirements {
    return TIER_CONFIG.find(t => t.tier === tier) || TIER_CONFIG[0];
}

/**
 * Get tier badge info for donor display
 */
export function getTierBadgeInfo(tier: VerificationTier): TierBadgeInfo {
    return TIER_BADGE_CONFIG[tier];
}

/**
 * Check if email domain appears to be educational
 */
export function isEducationalEmail(email: string): boolean {
    const domain = email.toLowerCase().split('@')[1] || '';
    return EDUCATIONAL_DOMAINS.some(pattern => domain.includes(pattern));
}

/**
 * Extract domain from email
 */
export function getEmailDomain(email: string): string {
    return email.toLowerCase().split('@')[1] || '';
}

/**
 * Check if user has required documents for a tier
 */
export function hasRequiredDocuments(
    tier: VerificationTier,
    documents: VerificationDoc[],
    emailVerified: boolean = false
): { eligible: boolean; missing: string[] } {
    const config = getTierConfig(tier);
    const missing: string[] = [];

    for (const required of config.required) {
        if (required === 'institutional_email') {
            if (!emailVerified) {
                missing.push('institutional_email');
            }
        } else if (required === 'partner_attestation') {
            // Partner attestation is handled separately (admin marks)
            // For now, return not eligible if no partner attestation
            missing.push('partner_attestation');
        } else {
            // Check document types
            const hasDoc = documents.some(
                doc => doc.document_type === required || required.includes(doc.document_type)
            );
            if (!hasDoc) {
                missing.push(required);
            }
        }
    }

    return {
        eligible: missing.length === 0,
        missing
    };
}

/**
 * Check if user can request a specific tier
 */
export function canRequestTier(
    tier: VerificationTier,
    documents: VerificationDoc[],
    emailVerified: boolean = false,
    partnerVerified: boolean = false
): boolean {
    if (tier === 3 && !partnerVerified) {
        return false; // Tier 3 requires partner verification
    }

    if (tier === 0) {
        return emailVerified;
    }

    const { eligible } = hasRequiredDocuments(tier, documents, emailVerified);
    return eligible;
}

/**
 * Get highest eligible tier based on documents and verification status
 */
export function getHighestEligibleTier(
    documents: VerificationDoc[],
    emailVerified: boolean = false,
    partnerVerified: boolean = false
): VerificationTier {
    // Check from highest to lowest
    if (partnerVerified) return 3;
    if (canRequestTier(2, documents, emailVerified)) return 2;
    if (canRequestTier(1, documents, emailVerified)) return 1;
    if (emailVerified) return 0;
    return 0; // Default to 0 (needs verification)
}

/**
 * Check if user can create campaigns with their current tier
 */
export function canCreateCampaign(approvedTier: VerificationTier | undefined): boolean {
    if (approvedTier === undefined) return false;
    return approvedTier >= MIN_CAMPAIGN_TIER;
}

/**
 * Get verification checks performed for a tier (for badge display)
 */
export function getVerificationChecks(
    tier: VerificationTier,
    emailVerified: boolean = false,
    documents: VerificationDoc[] = []
): string[] {
    const checks: string[] = [];

    if (emailVerified) {
        checks.push('email');
    }

    // Add document type checks
    const docTypes = new Set(documents.map(d => d.document_type));

    if (docTypes.has('ENROLLMENT_LETTER')) {
        checks.push('enrollment_doc');
    }
    if (docTypes.has('STUDENT_ID')) {
        checks.push('student_id');
    }
    if (docTypes.has('SELFIE_WITH_ID')) {
        checks.push('selfie_match');
    }
    if (docTypes.has('TRANSCRIPT')) {
        checks.push('transcript');
    }

    // Tier-specific checks
    if (tier >= 2) {
        checks.push('school_portal');
    }
    if (tier === 3) {
        checks.push('partner_attestation');
    }

    return checks;
}
