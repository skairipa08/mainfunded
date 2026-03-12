'use client';

/**
 * DonationToastManager
 *
 * Renders animated "az önce bağış yapıldı" toasts in the bottom-left corner.
 * Each toast auto-dismisses after 4 s.
 * Uses framer-motion for slide-in / slide-out animation.
 *
 * Usage:
 *   <DonationToastManager notifications={activeNotifications} onDismiss={handleDismiss} />
 */

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, X } from 'lucide-react';
import { formatDonationAmount } from '@/lib/donation-privacy';
import type { DonationNotification } from '@/hooks/useRecentDonations';

interface DonationToastManagerProps {
  /** Stack of active toast notifications (newest first) */
  notifications: DonationNotification[];
  /** Called when the user dismisses or the toast auto-expires */
  onDismiss: (id: string) => void;
  /** Auto-dismiss duration in ms (default 4000) */
  autoDismissMs?: number;
}

const AUTO_DISMISS_MS = 4000;

export function DonationToastManager({
  notifications,
  onDismiss,
  autoDismissMs = AUTO_DISMISS_MS,
}: DonationToastManagerProps) {
  return (
    /**
     * Portal-like fixed container pinned to bottom-left.
     * z-[9999] sits above modals in the FundEd stack.
     */
    <div
      aria-live="polite"
      aria-label="Bağış bildirimleri"
      className="fixed bottom-4 left-4 z-[9999] flex flex-col-reverse gap-2 w-80 max-w-[calc(100vw-2rem)] pointer-events-none"
    >
      <AnimatePresence initial={false}>
        {/* Show at most 3 toasts at once to avoid clutter */}
        {notifications.slice(0, 3).map((notif) => (
          <DonationToast
            key={notif.id}
            notification={notif}
            onDismiss={onDismiss}
            autoDismissMs={autoDismissMs}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── Individual Toast ────────────────────────────────────────────────────────

interface DonationToastProps {
  notification: DonationNotification;
  onDismiss: (id: string) => void;
  autoDismissMs: number;
}

function DonationToast({ notification, onDismiss, autoDismissMs }: DonationToastProps) {
  const { id, displayName, amount, currency } = notification;

  // Auto-dismiss
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), autoDismissMs);
    return () => clearTimeout(timer);
  }, [id, autoDismissMs, onDismiss]);

  const formattedAmount = formatDonationAmount(amount, currency);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -64, scale: 0.92 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -64, scale: 0.92, transition: { duration: 0.25 } }}
      transition={{ type: 'spring', stiffness: 340, damping: 28 }}
      role="status"
      className="pointer-events-auto flex items-start gap-3 bg-white border border-gray-100 shadow-lg rounded-2xl p-3.5 w-full"
    >
      {/* Icon */}
      <div className="shrink-0 flex items-center justify-center w-9 h-9 bg-blue-50 rounded-full">
        <Heart className="w-4 h-4 text-blue-600 fill-blue-100" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 leading-tight truncate">
          {displayName}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          az önce{' '}
          <span className="font-semibold text-blue-600">{formattedAmount}</span>{' '}
          bağış yaptı 🎉
        </p>
      </div>

      {/* Dismiss button */}
      <button
        onClick={() => onDismiss(id)}
        aria-label="Bildirimi kapat"
        className="shrink-0 text-gray-300 hover:text-gray-500 transition-colors mt-0.5"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Auto-dismiss progress bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 bg-blue-400 rounded-b-2xl"
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: autoDismissMs / 1000, ease: 'linear' }}
      />
    </motion.div>
  );
}
