'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import type { TriggerType } from '@/types/ai-assistant';

interface SmartTriggerOptions {
  /** Idle time in ms before trigger fires (default: 45000 = 45s) */
  idleTimeMs?: number;
  /** Whether triggers are enabled */
  enabled?: boolean;
  /** Callback when a trigger fires */
  onTrigger: (type: TriggerType) => void;
}

/**
 * Smart trigger hook — detects donor inactivity, scroll depth,
 * exit intent, and returning visitors to proactively open the assistant.
 */
export function useSmartTrigger({
  idleTimeMs = 45000,
  enabled = true,
  onTrigger,
}: SmartTriggerOptions) {
  const [hasFired, setHasFired] = useState(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollCountRef = useRef(0);
  const lastScrollYRef = useRef(0);
  const campaignViewsRef = useRef(0);

  const fireTrigger = useCallback(
    (type: TriggerType) => {
      if (hasFired || !enabled) return;
      setHasFired(true);
      onTrigger(type);
    },
    [hasFired, enabled, onTrigger]
  );

  // ── 1. Idle detection ───────────────────────────────────────────
  useEffect(() => {
    if (!enabled || hasFired) return;

    const resetIdle = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        // Only trigger on campaign-related pages
        const path = window.location.pathname;
        if (
          path.includes('/campaign') ||
          path.includes('/browse') ||
          path === '/'
        ) {
          fireTrigger('idle');
        }
      }, idleTimeMs);
    };

    const events = ['mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach((e) => window.addEventListener(e, resetIdle, { passive: true }));
    resetIdle(); // start initially

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetIdle));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [enabled, hasFired, idleTimeMs, fireTrigger]);

  // ── 2. Scroll-based trigger ─────────────────────────────────────
  useEffect(() => {
    if (!enabled || hasFired) return;

    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = Math.abs(currentY - lastScrollYRef.current);
      lastScrollYRef.current = currentY;

      // Significant scroll (more than 300px at a time)
      if (delta > 300) {
        scrollCountRef.current += 1;
      }

      // After 5 significant scrolls without a donation, trigger
      if (scrollCountRef.current >= 5) {
        const path = window.location.pathname;
        if (path.includes('/campaign') || path.includes('/browse')) {
          fireTrigger('scroll');
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [enabled, hasFired, fireTrigger]);

  // ── 3. Exit intent detection (desktop only) ─────────────────────
  useEffect(() => {
    if (!enabled || hasFired) return;

    const handleMouseOut = (e: MouseEvent) => {
      // Mouse left the viewport from the top
      if (e.clientY <= 0 && e.relatedTarget === null) {
        fireTrigger('exit');
      }
    };

    document.addEventListener('mouseout', handleMouseOut);
    return () => document.removeEventListener('mouseout', handleMouseOut);
  }, [enabled, hasFired, fireTrigger]);

  // ── 4. Returning visitor detection ──────────────────────────────
  useEffect(() => {
    if (!enabled || hasFired) return;

    try {
      const key = 'funded_visitor';
      const lastVisit = localStorage.getItem(key);
      const now = Date.now();

      if (lastVisit) {
        const elapsed = now - parseInt(lastVisit, 10);
        // If returning after more than 1 hour but less than 30 days
        if (elapsed > 3600_000 && elapsed < 2_592_000_000) {
          // Check if they haven't donated
          const hasDonated = localStorage.getItem('funded_has_donated');
          if (!hasDonated) {
            // Delay to not overwhelm on page load
            setTimeout(() => fireTrigger('return'), 5000);
          }
        }
      }

      localStorage.setItem(key, now.toString());
    } catch {
      // localStorage might not be available (SSR, privacy mode)
    }
  }, [enabled, hasFired, fireTrigger]);

  return {
    /** Reset trigger so it can fire again (e.g. after dismissal) */
    resetTrigger: () => {
      setHasFired(false);
      scrollCountRef.current = 0;
    },
    /** Whether a trigger has already fired */
    hasFired,
  };
}
