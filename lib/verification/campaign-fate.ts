/**
 * Campaign Fate Handler
 * 
 * Handles campaign state changes when verification status changes.
 * Called after verification status transitions.
 */

import { getDb } from '@/lib/db';
import { VerificationStatusType } from '@/types/verification';

interface CampaignFateResult {
    campaignsAffected: number;
    payoutsAffected: number;
    action: 'paused' | 'cancelled' | 'resumed' | 'none';
}

/**
 * Handle campaign fate when verification status changes
 */
export async function handleVerificationStatusChange(
    userId: string,
    oldStatus: VerificationStatusType,
    newStatus: VerificationStatusType
): Promise<CampaignFateResult> {
    const db = await getDb();

    let result: CampaignFateResult = { campaignsAffected: 0, payoutsAffected: 0, action: 'none' };

    // SUSPENDED or EXPIRED: Pause campaigns and hold payouts
    if (['SUSPENDED', 'EXPIRED'].includes(newStatus)) {
        const campaignResult = await db.collection('campaigns').updateMany(
            { owner_id: userId, status: 'active' },
            {
                $set: {
                    status: 'suspended',
                    status_reason: `Verification ${newStatus.toLowerCase()}`,
                    updated_at: new Date().toISOString()
                }
            }
        );

        const payoutResult = await db.collection('payouts').updateMany(
            { user_id: userId, status: 'pending' },
            {
                $set: {
                    status: 'held',
                    hold_reason: `Verification ${newStatus.toLowerCase()}`
                }
            }
        );

        result = {
            campaignsAffected: campaignResult.modifiedCount,
            payoutsAffected: payoutResult.modifiedCount,
            action: 'paused'
        };

        console.log(`[CampaignFate] User ${userId} ${newStatus}: ${result.campaignsAffected} campaigns paused, ${result.payoutsAffected} payouts held`);
    }

    // REVOKED or PERMANENTLY_BANNED: Cancel all campaigns
    if (['REVOKED', 'PERMANENTLY_BANNED'].includes(newStatus)) {
        const campaignResult = await db.collection('campaigns').updateMany(
            { owner_id: userId, status: { $in: ['active', 'suspended'] } },
            {
                $set: {
                    status: 'cancelled',
                    status_reason: `Verification ${newStatus.toLowerCase()}`,
                    updated_at: new Date().toISOString()
                }
            }
        );

        // Mark payouts for refund review
        const payoutResult = await db.collection('payouts').updateMany(
            { user_id: userId, status: { $in: ['pending', 'held'] } },
            {
                $set: {
                    status: 'refund_review',
                    hold_reason: `Verification ${newStatus.toLowerCase()}`
                }
            }
        );

        result = {
            campaignsAffected: campaignResult.modifiedCount,
            payoutsAffected: payoutResult.modifiedCount,
            action: 'cancelled'
        };

        console.log(`[CampaignFate] User ${userId} ${newStatus}: ${result.campaignsAffected} campaigns cancelled, ${result.payoutsAffected} payouts for refund review`);
    }

    // APPROVED from SUSPENDED: Resume campaigns and payouts
    if (newStatus === 'APPROVED' && oldStatus === 'SUSPENDED') {
        const campaignResult = await db.collection('campaigns').updateMany(
            { owner_id: userId, status: 'suspended', status_reason: /verification/i },
            {
                $set: {
                    status: 'active',
                    status_reason: null,
                    updated_at: new Date().toISOString()
                }
            }
        );

        const payoutResult = await db.collection('payouts').updateMany(
            { user_id: userId, status: 'held', hold_reason: /verification/i },
            {
                $set: {
                    status: 'pending',
                    hold_reason: null
                }
            }
        );

        result = {
            campaignsAffected: campaignResult.modifiedCount,
            payoutsAffected: payoutResult.modifiedCount,
            action: 'resumed'
        };

        console.log(`[CampaignFate] User ${userId} reinstated: ${result.campaignsAffected} campaigns resumed, ${result.payoutsAffected} payouts released`);
    }

    return result;
}

/**
 * Check if user has any active campaigns before allowing revoke
 */
export async function getUserCampaignStats(userId: string): Promise<{
    activeCampaigns: number;
    totalRaised: number;
    pendingPayouts: number;
}> {
    const db = await getDb();

    const campaigns = await db.collection('campaigns')
        .find({ owner_id: userId, status: { $in: ['active', 'suspended'] } })
        .toArray();

    const payouts = await db.collection('payouts')
        .find({ user_id: userId, status: { $in: ['pending', 'held'] } })
        .toArray();

    return {
        activeCampaigns: campaigns.length,
        totalRaised: campaigns.reduce((sum, c) => sum + (c.raised_amount || 0), 0),
        pendingPayouts: payouts.reduce((sum, p) => sum + (p.amount || 0), 0)
    };
}
