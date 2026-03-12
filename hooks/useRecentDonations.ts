'use client';

/**
 * useRecentDonations
 *
 * Manages:
 *  - Initial fetch of recent donations (polling fallback every 10 s)
 *  - SSE connection for real-time new-donation events
 *  - Notification queue: max 1 toast per second (rate-limit)
 *  - Auto-reconnect on SSE error (exponential back-off, max 30 s)
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { RecentDonation } from '@/lib/donation-privacy';

export interface DonationNotification extends RecentDonation {
  id: string; // unique key for React lists / toast deduplication
}

interface UseRecentDonationsOptions {
  campaignId: string;
  /** Max donations to keep in list (default 10) */
  listLimit?: number;
  /** Enable SSE live stream (default true) */
  enableStream?: boolean;
  /** On new donation callback — called AFTER rate-limit gate */
  onNewDonation?: (donation: DonationNotification) => void;
}

interface UseRecentDonationsReturn {
  donations: RecentDonation[];
  loading: boolean;
  error: string | null;
}

const RATE_LIMIT_MS = 1000; // min gap between onNewDonation calls
const MAX_BACKOFF_MS = 30_000;
const POLL_INTERVAL_MS = 10_000;

export function useRecentDonations({
  campaignId,
  listLimit = 10,
  enableStream = true,
  onNewDonation,
}: UseRecentDonationsOptions): UseRecentDonationsReturn {
  const [donations, setDonations] = useState<RecentDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** Rate-limit gate — timestamp of last dispatched notification */
  const lastNotifiedAt = useRef<number>(0);
  /** Queue of pending notifications awaiting dispatch */
  const notifQueue = useRef<DonationNotification[]>([]);
  const drainTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Drain one item from the queue, respecting the rate limit */
  const drainQueue = useCallback(() => {
    if (notifQueue.current.length === 0) return;

    const now = Date.now();
    const elapsed = now - lastNotifiedAt.current;
    const wait = Math.max(0, RATE_LIMIT_MS - elapsed);

    drainTimer.current = setTimeout(() => {
      const next = notifQueue.current.shift();
      if (next) {
        lastNotifiedAt.current = Date.now();
        onNewDonation?.(next);
      }
      if (notifQueue.current.length > 0) {
        drainQueue();
      }
    }, wait);
  }, [onNewDonation]);

  /** Enqueue a new donation event */
  const enqueue = useCallback(
    (donation: DonationNotification) => {
      notifQueue.current.push(donation);
      if (!drainTimer.current || notifQueue.current.length === 1) {
        drainQueue();
      }
    },
    [drainQueue]
  );

  // ─── Initial fetch ───────────────────────────────────────────────
  const fetchRecent = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/donations/recent?campaign_id=${encodeURIComponent(campaignId)}&limit=${listLimit}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success) {
        setDonations(json.data ?? []);
        setError(null);
      }
    } catch (err: any) {
      setError(err.message ?? 'Fetch failed');
    } finally {
      setLoading(false);
    }
  }, [campaignId, listLimit]);

  useEffect(() => {
    fetchRecent();
  }, [fetchRecent]);

  // ─── Polling fallback (10 s) ─────────────────────────────────────
  useEffect(() => {
    if (!campaignId) return;
    const id = setInterval(fetchRecent, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [campaignId, fetchRecent]);

  // ─── SSE live stream ─────────────────────────────────────────────
  useEffect(() => {
    if (!enableStream || !campaignId) return;

    let es: EventSource | null = null;
    let backoff = 2000;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let unmounted = false;

    const connect = () => {
      if (unmounted) return;
      es = new EventSource(
        `/api/donations/stream?campaign_id=${encodeURIComponent(campaignId)}`
      );

      es.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'new_donation' && msg.payload) {
            const donation: DonationNotification = {
              ...msg.payload,
              id: `${msg.payload.createdAt}-${Math.random()}`,
            };

            // Prepend to list (latest first), keep within limit
            setDonations((prev) => {
              const isDuplicate = prev.some(
                (d) =>
                  d.displayName === donation.displayName &&
                  d.amount === donation.amount &&
                  Math.abs(
                    new Date(d.createdAt).getTime() -
                      new Date(donation.createdAt).getTime()
                  ) < 3000
              );
              if (isDuplicate) return prev;
              return [donation, ...prev].slice(0, listLimit);
            });

            enqueue(donation);

            // Reset backoff on successful message
            backoff = 2000;
          }
        } catch {
          // malformed JSON — ignore
        }
      };

      es.onerror = () => {
        es?.close();
        if (unmounted) return;
        reconnectTimer = setTimeout(() => {
          backoff = Math.min(backoff * 2, MAX_BACKOFF_MS);
          connect();
        }, backoff);
      };
    };

    connect();

    return () => {
      unmounted = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (drainTimer.current) clearTimeout(drainTimer.current);
      notifQueue.current = [];
      es?.close();
    };
  }, [campaignId, enableStream, enqueue, listLimit]);

  return { donations, loading, error };
}
