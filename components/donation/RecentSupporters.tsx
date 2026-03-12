'use client';

/**
 * RecentSupporters
 *
 * Shows the last N donations as an animated list (Son Destekler / Recent Supporters).
 * New items appear with a slide-down animation powered by framer-motion.
 *
 * Usage:
 *   <RecentSupporters donations={donations} loading={loading} />
 */

import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Loader2, Users } from 'lucide-react';
import { formatDonationAmount } from '@/lib/donation-privacy';
import type { RecentDonation } from '@/lib/donation-privacy';

interface RecentSupportersProps {
  donations: RecentDonation[];
  loading?: boolean;
  /** How many items to show at once (default 5) */
  limit?: number;
  className?: string;
}

export function RecentSupporters({
  donations,
  loading = false,
  limit = 5,
  className = '',
}: RecentSupportersProps) {
  const visible = donations.slice(0, limit);

  return (
    <div className={`bg-white border border-gray-100 rounded-2xl p-5 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-4 h-4 text-blue-600" />
        <h3 className="text-sm font-semibold text-gray-800 tracking-wide uppercase">
          Son Destekler
        </h3>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-6">
          <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!loading && visible.length === 0 && (
        <div className="flex flex-col items-center py-6 text-gray-400 gap-2">
          <Heart className="w-8 h-8 opacity-40" />
          <p className="text-sm">Henüz bağış yapılmadı.</p>
          <p className="text-xs">İlk destekçi sen ol! 💙</p>
        </div>
      )}

      {/* Donation list */}
      {!loading && visible.length > 0 && (
        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {visible.map((donation, index) => (
              <DonationRow key={`${donation.displayName}-${String(donation.createdAt)}-${index}`} donation={donation} />
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}

// ─── Single row ──────────────────────────────────────────────────────────────

function DonationRow({ donation }: { donation: RecentDonation }) {
  const { displayName, amount, currency, anonymous, createdAt } = donation;
  const formattedAmount = formatDonationAmount(amount, currency);
  const timeAgo = getTimeAgo(new Date(createdAt));

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="flex items-center gap-3"
    >
      {/* Avatar */}
      <div className="shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-base">
        {anonymous ? '🤍' : displayName.charAt(0).toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
        <p className="text-xs text-gray-400">{timeAgo}</p>
      </div>

      {/* Amount badge */}
      <span className="shrink-0 text-sm font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
        {formattedAmount}
      </span>
    </motion.li>
  );
}

// ─── Helper ──────────────────────────────────────────────────────────────────

function getTimeAgo(date: Date): string {
  if (isNaN(date.getTime())) return '';
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return 'az önce';
  if (diffMin < 60) return `${diffMin} dk önce`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} sa önce`;

  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} gün önce`;
}
