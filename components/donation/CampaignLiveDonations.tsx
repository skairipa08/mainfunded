'use client';

/**
 * CampaignLiveDonations
 *
 * Lazy-loadable orchestrator that ties together:
 *  - useRecentDonations (SSE + polling)
 *  - DonationToastManager (bottom-left toast stack)
 *  - RecentSupporters (inline list inside campaign page)
 *
 * Import via React.lazy / next/dynamic to avoid impacting initial page load:
 *
 *   const CampaignLiveDonations = dynamic(
 *     () => import('@/components/donation/CampaignLiveDonations'),
 *     { ssr: false }
 *   );
 */

import { useCallback, useState } from 'react';
import { useRecentDonations } from '@/hooks/useRecentDonations';
import { DonationToastManager } from './DonationToastManager';
import { RecentSupporters } from './RecentSupporters';
import type { DonationNotification } from '@/hooks/useRecentDonations';

interface CampaignLiveDonationsProps {
  campaignId: string;
  /** If false, hides the "Son Destekler" inline list (default: true) */
  showList?: boolean;
  /** If false, disables toast pop-ups (default: true) */
  showToasts?: boolean;
  /** Max items in the list (default 5) */
  listLimit?: number;
  className?: string;
}

export default function CampaignLiveDonations({
  campaignId,
  showList = true,
  showToasts = true,
  listLimit = 5,
  className,
}: CampaignLiveDonationsProps) {
  /** Active toasts currently visible on screen */
  const [activeToasts, setActiveToasts] = useState<DonationNotification[]>([]);

  const handleNewDonation = useCallback((donation: DonationNotification) => {
    if (!showToasts) return;
    setActiveToasts((prev) =>
      // Prepend; cap at 3 so UI never crowds
      [donation, ...prev].slice(0, 3)
    );
  }, [showToasts]);

  const handleDismiss = useCallback((id: string) => {
    setActiveToasts((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const { donations, loading } = useRecentDonations({
    campaignId,
    listLimit: Math.max(listLimit, 10), // fetch more than we display for real-time freshness
    enableStream: true,
    onNewDonation: handleNewDonation,
  });

  return (
    <>
      {/* Inline "Son Destekler" section */}
      {showList && (
        <RecentSupporters
          donations={donations}
          loading={loading}
          limit={listLimit}
          className={className}
        />
      )}

      {/* Fixed toast overlay — rendered via portal semantics */}
      {showToasts && (
        <DonationToastManager
          notifications={activeToasts}
          onDismiss={handleDismiss}
        />
      )}
    </>
  );
}
