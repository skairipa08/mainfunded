/**
 * Evergreen Campaign State Machine
 *
 * Allowed transitions:
 *
 *  draft      → published | cancelled
 *  published  → paused | completed | evergreen | cancelled
 *  paused     → published | cancelled
 *  completed  → (terminal)
 *  evergreen  → archived
 *  archived   → (terminal)
 *  cancelled  → (terminal)
 */

export type CampaignStatus =
  | 'draft'
  | 'published'
  | 'paused'
  | 'completed'
  | 'evergreen'
  | 'archived'
  | 'cancelled';

/** Valid transitions map */
const TRANSITIONS: Record<CampaignStatus, CampaignStatus[]> = {
  draft:     ['published', 'cancelled'],
  published: ['paused', 'completed', 'evergreen', 'cancelled'],
  paused:    ['published', 'cancelled'],
  completed: [],
  evergreen: ['archived'],
  archived:  [],
  cancelled: [],
};

/** Returns true if the transition is allowed */
export function canTransition(from: CampaignStatus, to: CampaignStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Validates and returns the next status.
 * Throws if the transition is not allowed.
 */
export function transition(from: CampaignStatus, to: CampaignStatus): CampaignStatus {
  if (!canTransition(from, to)) {
    throw new Error(
      `Invalid campaign status transition: "${from}" → "${to}". ` +
        `Allowed: ${TRANSITIONS[from].join(', ') || 'none (terminal state)'}`
    );
  }
  return to;
}

/** Whether the campaign is still accepting donations */
export function isAcceptingDonations(status: CampaignStatus): boolean {
  return status === 'published' || status === 'evergreen';
}

/** Whether to show the "goal exceeded" banner */
export function isGoalExceeded(raisedAmount: number, goalAmount: number): boolean {
  return raisedAmount > goalAmount;
}

/**
 * Determine the next status when a campaign's deadline passes.
 * If evergreen_enabled is true → "evergreen", otherwise → "completed".
 */
export function resolveExpiredStatus(evergreenEnabled: boolean): CampaignStatus {
  return evergreenEnabled ? 'evergreen' : 'completed';
}

/** Human-readable status labels (Turkish) */
export const STATUS_LABELS: Record<CampaignStatus, string> = {
  draft:     'Taslak',
  published: 'Yayında',
  paused:    'Duraklatıldı',
  completed: 'Tamamlandı',
  evergreen: 'Devam Eden Destek',
  archived:  'Arşivlendi',
  cancelled: 'İptal Edildi',
};
