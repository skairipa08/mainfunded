/**
 * Risk Score Calculation
 * 
 * MVP anti-fraud implementation for computing risk scores
 * based on user behavior and verification signals.
 */

import { Verification, RiskFlag, VerificationTier } from '@/types/verification';
import { getDb } from '@/lib/db';

// =======================================
// Risk Signal Types
// =======================================

export interface RiskSignal {
    type: RiskFlag | string;
    score: number;       // Points to add to risk score (higher = riskier)
    weight: number;      // Multiplier for this signal type
    description: string;
    detectedAt: string;
}

export interface RiskAssessment {
    score: number;                    // 0-100 scale
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    signals: RiskSignal[];
    requiresHigherTier: boolean;      // If true, require Tier 2+ for campaigns
    requiresManualReview: boolean;    // If true, flag for admin attention
    recommendation: string;
}

// =======================================
// Risk Thresholds
// =======================================

export const RISK_THRESHOLDS = {
    LOW: 20,           // 0-20: Low risk
    MEDIUM: 40,        // 21-40: Medium risk
    HIGH: 70,          // 41-70: High risk
    CRITICAL: 100      // 71+: Critical risk
};

// Require Tier 2 if risk score exceeds this
export const TIER_UPGRADE_THRESHOLD = 50;

// Flag for manual review if risk score exceeds this
export const MANUAL_REVIEW_THRESHOLD = 40;

// =======================================
// Signal Weights
// =======================================

const SIGNAL_WEIGHTS: Record<string, { base: number; weight: number }> = {
    // Account signals
    'VERY_NEW_ACCOUNT': { base: 15, weight: 1.0 },
    'HIGH_FUNDRAISING_NEW_ACCOUNT': { base: 25, weight: 1.5 },
    'MULTIPLE_CAMPAIGNS_SHORT_TIME': { base: 20, weight: 1.2 },

    // Identity signals
    'DUPLICATE_ACCOUNT_SUSPECTED': { base: 40, weight: 2.0 },
    'MULTIPLE_IDENTITIES_DETECTED': { base: 50, weight: 2.0 },
    'LINKED_ACCOUNT_FLAGGED': { base: 35, weight: 1.5 },
    'PREVIOUS_REJECTION': { base: 25, weight: 1.3 },

    // Document signals
    'DOCUMENT_QUALITY_LOW': { base: 15, weight: 1.0 },
    'DOCUMENT_METADATA_SUSPICIOUS': { base: 20, weight: 1.2 },
    'DOCUMENT_TEMPLATE_MATCH': { base: 35, weight: 1.5 },
    'DUPLICATE_DOCUMENT': { base: 45, weight: 2.0 },

    // Location/Device signals
    'VPN_PROXY_DETECTED': { base: 10, weight: 0.8 },
    'DEVICE_BLOCKLIST_HIT': { base: 50, weight: 2.0 },
    'GEO_MISMATCH': { base: 15, weight: 1.0 },
    'IMPOSSIBLE_TRAVEL': { base: 30, weight: 1.5 },

    // Verification signals
    'INSTITUTION_VERIFICATION_FAILED': { base: 30, weight: 1.5 },
    'FACE_MATCH_LOW_CONFIDENCE': { base: 20, weight: 1.2 },
    'IDENTITY_DATABASE_HIT': { base: 50, weight: 2.0 },
    'OFAC_SCREENING_HIT': { base: 80, weight: 3.0 },

    // Content signals
    'CAMPAIGN_CONTENT_FLAGGED': { base: 20, weight: 1.2 },
    'HARDSHIP_STORY_SUSPICIOUS': { base: 15, weight: 1.0 },

    // Velocity signals
    'VELOCITY_ANOMALY': { base: 25, weight: 1.3 },
    'SAME_PAYOUT_TARGET': { base: 35, weight: 1.5 }
};

// =======================================
// Risk Score Computation
// =======================================

/**
 * Compute risk score for a verification
 */
export async function computeRiskScore(
    userId: string,
    verification: Partial<Verification>,
    additionalContext?: {
        ipAddress?: string;
        userAgent?: string;
        deviceFingerprint?: string;
    }
): Promise<RiskAssessment> {
    const signals: RiskSignal[] = [];
    const now = new Date().toISOString();

    try {
        const db = await getDb();

        // Check 1: Account age
        const user = await db.collection('users').findOne({ email: { $exists: true } }); // MVP: simplified query
        if (user?.createdAt) {
            const accountAgeDays = daysBetween(new Date(user.createdAt), new Date());
            if (accountAgeDays < 7) {
                signals.push({
                    type: 'VERY_NEW_ACCOUNT',
                    score: SIGNAL_WEIGHTS['VERY_NEW_ACCOUNT'].base,
                    weight: SIGNAL_WEIGHTS['VERY_NEW_ACCOUNT'].weight,
                    description: `Account is only ${accountAgeDays} days old`,
                    detectedAt: now
                });
            }
        }

        // Check 2: Previous rejections
        const previousRejections = await db.collection('verifications').countDocuments({
            user_id: userId,
            status: 'REJECTED'
        });
        if (previousRejections > 0) {
            signals.push({
                type: 'PREVIOUS_REJECTION',
                score: SIGNAL_WEIGHTS['PREVIOUS_REJECTION'].base * previousRejections,
                weight: SIGNAL_WEIGHTS['PREVIOUS_REJECTION'].weight,
                description: `${previousRejections} previous rejection(s)`,
                detectedAt: now
            });
        }

        // Check 3: Multiple accounts same device fingerprint
        if (additionalContext?.deviceFingerprint) {
            const sameDeviceCount = await db.collection('verification_events').countDocuments({
                'event_data.device_fingerprint': additionalContext.deviceFingerprint,
                user_id: { $ne: userId }
            });
            if (sameDeviceCount > 0) {
                signals.push({
                    type: 'DUPLICATE_ACCOUNT_SUSPECTED',
                    score: SIGNAL_WEIGHTS['DUPLICATE_ACCOUNT_SUSPECTED'].base,
                    weight: SIGNAL_WEIGHTS['DUPLICATE_ACCOUNT_SUSPECTED'].weight,
                    description: `Device fingerprint linked to ${sameDeviceCount} other account(s)`,
                    detectedAt: now
                });
            }
        }

        // Check 4: Linked accounts with flags
        const linkedFlagged = await db.collection('verifications').findOne({
            user_id: { $ne: userId },
            'risk_flags': { $in: ['DUPLICATE_ACCOUNT_SUSPECTED', 'PERMANENTLY_BANNED'] },
            $or: [
                { institution_email_domain: verification.institution_email_domain },
                { phone_hash: verification.phone_hash }
            ]
        });
        if (linkedFlagged) {
            signals.push({
                type: 'LINKED_ACCOUNT_FLAGGED',
                score: SIGNAL_WEIGHTS['LINKED_ACCOUNT_FLAGGED'].base,
                weight: SIGNAL_WEIGHTS['LINKED_ACCOUNT_FLAGGED'].weight,
                description: 'Linked to a flagged account',
                detectedAt: now
            });
        }

        // Check 5: Document hash duplicates
        const docHashes = await db.collection('verification_documents').find({
            verification_id: verification.verification_id
        }).toArray();

        for (const doc of docHashes) {
            const duplicateDoc = await db.collection('verification_documents').findOne({
                sha256_hash: doc.sha256_hash,
                verification_id: { $ne: verification.verification_id }
            });
            if (duplicateDoc) {
                signals.push({
                    type: 'DUPLICATE_DOCUMENT',
                    score: SIGNAL_WEIGHTS['DUPLICATE_DOCUMENT'].base,
                    weight: SIGNAL_WEIGHTS['DUPLICATE_DOCUMENT'].weight,
                    description: `Document hash matches another verification`,
                    detectedAt: now
                });
                break; // Only count once
            }
        }

        // Check 6: Multiple campaigns to same payout target
        const campaignPayouts = await db.collection('campaigns').find({
            'payout_account_hash': { $exists: true }
        }).toArray();

        const payoutCounts: Record<string, number> = {};
        for (const c of campaignPayouts) {
            const hash = c.payout_account_hash;
            payoutCounts[hash] = (payoutCounts[hash] || 0) + 1;
            if (payoutCounts[hash] > 2) {
                signals.push({
                    type: 'SAME_PAYOUT_TARGET',
                    score: SIGNAL_WEIGHTS['SAME_PAYOUT_TARGET'].base,
                    weight: SIGNAL_WEIGHTS['SAME_PAYOUT_TARGET'].weight,
                    description: 'Multiple campaigns to same payout account',
                    detectedAt: now
                });
                break;
            }
        }

    } catch (error) {
        console.error('Error computing risk score:', error);
        // Return baseline assessment if DB check fails
    }

    // Add any existing risk flags from the verification
    if (verification.risk_flags) {
        for (const flag of verification.risk_flags) {
            if (SIGNAL_WEIGHTS[flag] && !signals.find(s => s.type === flag)) {
                signals.push({
                    type: flag,
                    score: SIGNAL_WEIGHTS[flag].base,
                    weight: SIGNAL_WEIGHTS[flag].weight,
                    description: `Flagged: ${flag.replace(/_/g, ' ').toLowerCase()}`,
                    detectedAt: now
                });
            }
        }
    }

    // Calculate total score
    const totalScore = Math.min(
        100,
        signals.reduce((sum, s) => sum + (s.score * s.weight), 0)
    );

    // Determine risk level
    let level: RiskAssessment['level'];
    if (totalScore <= RISK_THRESHOLDS.LOW) {
        level = 'LOW';
    } else if (totalScore <= RISK_THRESHOLDS.MEDIUM) {
        level = 'MEDIUM';
    } else if (totalScore <= RISK_THRESHOLDS.HIGH) {
        level = 'HIGH';
    } else {
        level = 'CRITICAL';
    }

    // Determine recommendations
    const requiresHigherTier = totalScore >= TIER_UPGRADE_THRESHOLD;
    const requiresManualReview = totalScore >= MANUAL_REVIEW_THRESHOLD;

    let recommendation: string;
    if (level === 'CRITICAL') {
        recommendation = 'Reject or escalate for investigation';
    } else if (level === 'HIGH') {
        recommendation = 'Require Tier 2 verification before campaign creation';
    } else if (level === 'MEDIUM') {
        recommendation = 'Review carefully before approval';
    } else {
        recommendation = 'Standard processing';
    }

    return {
        score: Math.round(totalScore),
        level,
        signals,
        requiresHigherTier,
        requiresManualReview,
        recommendation
    };
}

/**
 * Quick risk check for real-time validation
 */
export function quickRiskCheck(flags: RiskFlag[]): {
    shouldBlock: boolean;
    reason?: string;
} {
    const criticalFlags: RiskFlag[] = [
        'OFAC_SCREENING_HIT',
        'DEVICE_BLOCKLIST_HIT',
        'IDENTITY_DATABASE_HIT'
    ];

    for (const flag of flags) {
        if (criticalFlags.includes(flag)) {
            return {
                shouldBlock: true,
                reason: `Critical risk flag: ${flag}`
            };
        }
    }

    return { shouldBlock: false };
}

/**
 * Helper: days between two dates
 */
function daysBetween(date1: Date, date2: Date): number {
    const diff = Math.abs(date2.getTime() - date1.getTime());
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Get risk level color for UI
 */
export function getRiskLevelColor(level: RiskAssessment['level']): string {
    switch (level) {
        case 'LOW': return 'text-green-600 bg-green-100';
        case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
        case 'HIGH': return 'text-orange-600 bg-orange-100';
        case 'CRITICAL': return 'text-red-600 bg-red-100';
    }
}

/**
 * Format risk score for display
 */
export function formatRiskScore(score: number): string {
    if (score <= 20) return 'Low Risk';
    if (score <= 40) return 'Medium Risk';
    if (score <= 70) return 'High Risk';
    return 'Critical Risk';
}
