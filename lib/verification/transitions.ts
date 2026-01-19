/**
 * Verification Status State Machine
 * 
 * Defines allowed status transitions and validates state changes.
 */

import { VerificationStatusType } from '@/types/verification';

// Allowed transitions: from status -> { allowed destinations, who can trigger }
export const ALLOWED_TRANSITIONS: Record<VerificationStatusType, {
    to: VerificationStatusType[];
    actor: ('USER' | 'ADMIN' | 'SYSTEM')[];
}> = {
    DRAFT: {
        to: ['PENDING_REVIEW', 'ABANDONED'],
        actor: ['USER', 'SYSTEM']
    },
    PENDING_REVIEW: {
        to: ['APPROVED', 'REJECTED', 'NEEDS_MORE_INFO', 'UNDER_INVESTIGATION'],
        actor: ['ADMIN']
    },
    APPROVED: {
        to: ['SUSPENDED', 'EXPIRED', 'REVOKED'],
        actor: ['ADMIN', 'SYSTEM']
    },
    REJECTED: {
        to: ['PENDING_REVIEW'],
        actor: ['USER']  // User reapplies after cooldown
    },
    NEEDS_MORE_INFO: {
        to: ['PENDING_REVIEW', 'ABANDONED'],
        actor: ['USER', 'SYSTEM']
    },
    UNDER_INVESTIGATION: {
        to: ['APPROVED', 'REJECTED', 'PERMANENTLY_BANNED'],
        actor: ['ADMIN']
    },
    SUSPENDED: {
        to: ['APPROVED', 'REVOKED'],
        actor: ['ADMIN']
    },
    EXPIRED: {
        to: ['PENDING_REVIEW'],
        actor: ['USER']  // User re-submits
    },
    REVOKED: {
        to: [],  // Terminal state
        actor: []
    },
    PERMANENTLY_BANNED: {
        to: [],  // Terminal state
        actor: []
    },
    ABANDONED: {
        to: ['DRAFT'],
        actor: ['USER']  // User returns to resume
    }
};

/**
 * Check if a status transition is allowed
 */
export function canTransition(
    from: VerificationStatusType,
    to: VerificationStatusType,
    actor: 'USER' | 'ADMIN' | 'SYSTEM'
): boolean {
    const allowed = ALLOWED_TRANSITIONS[from];
    if (!allowed) return false;

    return allowed.to.includes(to) && allowed.actor.includes(actor);
}

/**
 * Get all possible next statuses for a given status and actor
 */
export function getNextStatuses(
    from: VerificationStatusType,
    actor: 'USER' | 'ADMIN' | 'SYSTEM'
): VerificationStatusType[] {
    const allowed = ALLOWED_TRANSITIONS[from];
    if (!allowed || !allowed.actor.includes(actor)) return [];

    return allowed.to;
}

/**
 * Check if a status is terminal (no further transitions allowed)
 */
export function isTerminalStatus(status: VerificationStatusType): boolean {
    const allowed = ALLOWED_TRANSITIONS[status];
    return !allowed || allowed.to.length === 0;
}

/**
 * Get the status that allows the user to create/edit content
 */
export function isEditableStatus(status: VerificationStatusType): boolean {
    return status === 'DRAFT' || status === 'NEEDS_MORE_INFO';
}

/**
 * Check if user can submit from current status
 */
export function canSubmit(status: VerificationStatusType): boolean {
    return canTransition(status, 'PENDING_REVIEW', 'USER');
}

/**
 * Validate transition and return error message if invalid
 */
export function validateTransition(
    from: VerificationStatusType,
    to: VerificationStatusType,
    actor: 'USER' | 'ADMIN' | 'SYSTEM'
): { valid: boolean; error?: string } {
    if (from === to) {
        return { valid: false, error: 'Cannot transition to the same status' };
    }

    const allowed = ALLOWED_TRANSITIONS[from];
    if (!allowed) {
        return { valid: false, error: `Unknown status: ${from}` };
    }

    if (!allowed.to.includes(to)) {
        return {
            valid: false,
            error: `Cannot transition from ${from} to ${to}. Allowed: ${allowed.to.join(', ') || 'none'}`
        };
    }

    if (!allowed.actor.includes(actor)) {
        return {
            valid: false,
            error: `${actor} cannot perform transitions from ${from}`
        };
    }

    return { valid: true };
}

/**
 * Map admin action to target status
 */
export function actionToStatus(action: string): VerificationStatusType | null {
    const mapping: Record<string, VerificationStatusType> = {
        'APPROVE': 'APPROVED',
        'REJECT': 'REJECTED',
        'NEEDS_MORE_INFO': 'NEEDS_MORE_INFO',
        'SUSPEND': 'SUSPENDED',
        'INVESTIGATE': 'UNDER_INVESTIGATION',
        'REVOKE': 'REVOKED',
        'BAN': 'PERMANENTLY_BANNED',
        'LIFT_SUSPENSION': 'APPROVED',
    };

    return mapping[action] || null;
}
