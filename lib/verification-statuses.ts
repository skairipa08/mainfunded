/**
 * Centralized verification status definitions.
 * Shared across CampaignCard, CampaignDetailClient, Dashboard, etc.
 */
export const verificationStatuses = {
  pending: {
    label: 'Pending Verification',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    icon: 'Clock',
  },
  verified: {
    label: 'Verified Student',
    color: 'bg-green-100 text-green-800 border-green-300',
    icon: 'CheckCircle2',
  },
  rejected: {
    label: 'Verification Rejected',
    color: 'bg-red-100 text-red-800 border-red-300',
    icon: 'XCircle',
  },
};
