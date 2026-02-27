'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { MessageCircle, X, Gift } from 'lucide-react';
import { ChatWindow } from './ChatWindow';
import { useSmartTrigger } from './useSmartTrigger';
import type { TriggerType } from '@/types/ai-assistant';

interface SpecialDayBanner {
  isSpecialDay: boolean;
  title: string;
  emoji: string;
  description: string;
  link: string;
  message: string;
}

/**
 * AiAssistantWidget — The floating chat bubble and its window.
 * Renders on every page; the smart-trigger hook watches for user
 * inactivity / exit / scroll to proactively open the chat.
 *
 * SPECIAL DAY FEATURE: On special days (45+ education/charity days),
 * the widget auto-shows a prominent banner to every visitor encouraging
 * donations — no idle wait required.
 */
export function AiAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const [proactiveMsg, setProactiveMsg] = useState<string | null>(null);
  const [specialDayBanner, setSpecialDayBanner] = useState<SpecialDayBanner | null>(null);
  const [triggerEnabled, setTriggerEnabled] = useState(true);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Disable triggers if user already interacted or is on admin/student pages
  useEffect(() => {
    const path = window.location.pathname;
    const disabledPaths = ['/admin', '/student', '/onboarding', '/login', '/auth', '/ops'];
    if (disabledPaths.some((p) => path.startsWith(p))) {
      setTriggerEnabled(false);
    }
  }, []);

  // ── SPECIAL DAY: Check immediately on mount ──────────────────
  useEffect(() => {
    // Check if banner was already dismissed today
    const dismissKey = `funded_special_day_dismissed_${new Date().toISOString().slice(0, 10)}`;
    if (typeof window !== 'undefined' && sessionStorage.getItem(dismissKey)) {
      setBannerDismissed(true);
      return;
    }

    const checkSpecialDay = async () => {
      try {
        const res = await fetch('/api/assistant/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'specialDayCheck' }),
        });
        const data = await res.json();
        if (data.specialDay?.isSpecialDay) {
          setSpecialDayBanner(data.specialDay);
          setShowPulse(true);
        }
      } catch {
        // Silent fail — not critical
      }
    };

    checkSpecialDay();
  }, []);

  const handleTrigger = useCallback(async (_type: TriggerType) => {
    if (isOpen) return; // already open

    // Sayfaya uygun proactive mesaj göster
    const path = window.location.pathname;
    let contextualMsg: string | null = null;

    if (path.includes('/calendar')) {
      contextualMsg = 'Bağış takviminizi mi inceliyorsunuz? 📅 Özel günlerde bağış yaparak daha büyük etki yaratabilirsiniz!';
    } else if (path.includes('/campaign')) {
      contextualMsg = 'Bu kampanyayı mı inceliyorsunuz? 💝 Size en uygun öğrenciyi bulmama izin verin!';
    } else if (path.includes('/browse') || path.includes('/campaigns')) {
      contextualMsg = 'Kampanyaları incelediğinizi gördüm! 👀 Size en uygun öğrenciyi bulmamı ister misiniz?';
    } else if (path.includes('/leaderboard')) {
      contextualMsg = 'Liderlik tablosunu inceliyorsunuz! 🏆 Siz de bağış yaparak sıralamaya girebilirsiniz!';
    } else if (path.includes('/badges')) {
      contextualMsg = 'Rozetleri mi inceliyorsunuz? 🏅 İlk bağışınızla "İlk Adım" rozetini kazanabilirsiniz!';
    } else if (path.includes('/how-it-works')) {
      contextualMsg = 'FundEd nasıl çalışır öğreniyorsunuz! 🎓 Sorunuz varsa bana sorabilirsiniz.';
    } else if (path === '/') {
      contextualMsg = 'FundEd\'e hoş geldiniz! 👋 Size nasıl yardımcı olabilirim?';
    }

    if (contextualMsg) {
      setProactiveMsg(contextualMsg);
      setShowPulse(true);
      return;
    }

    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'proactive' }),
      });
      const data = await res.json();
      if (data.messages?.[0]?.text) {
        setProactiveMsg(data.messages[0].text);
        setShowPulse(true);
      }
    } catch {
      // Fallback static message
      setProactiveMsg('Yardıma ihtiyacınız var mı? 💬 Size yardımcı olmak için buradayım!');
      setShowPulse(true);
    }
  }, [isOpen]);

  const { resetTrigger } = useSmartTrigger({
    idleTimeMs: 45000,
    enabled: triggerEnabled && !isOpen,
    onTrigger: handleTrigger,
  });

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setProactiveMsg(null);
    setShowPulse(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
    setProactiveMsg(null);
  };

  const handleMinimize = () => {
    setIsOpen(false);
    setIsMinimized(true);
  };

  const handleDismissProactive = () => {
    setProactiveMsg(null);
  };

  const handleDismissBanner = () => {
    setSpecialDayBanner(null);
    setBannerDismissed(true);
    // Remember dismissal for this session/day
    const dismissKey = `funded_special_day_dismissed_${new Date().toISOString().slice(0, 10)}`;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(dismissKey, '1');
    }
  };

  const handleBannerDonate = () => {
    if (specialDayBanner?.link) {
      window.location.href = specialDayBanner.link;
    } else {
      window.location.href = '/campaigns';
    }
  };

  const handleBannerChat = () => {
    setSpecialDayBanner(null);
    handleOpen();
  };

  // Determine whether to show the special day banner
  const showSpecialDayBanner = specialDayBanner && !bannerDismissed && !isOpen;
  // Only show normal proactive if there's no special day banner visible
  const showProactive = proactiveMsg && !isOpen && !showSpecialDayBanner;

  return (
    <>
      {/* ── Chat Window ──────────────────────────────────────────── */}
      <ChatWindow
        isOpen={isOpen}
        onClose={handleClose}
        onMinimize={handleMinimize}
      />

      {/* ── Special Day Banner (auto-shown, prominent) ───────────── */}
      {showSpecialDayBanner && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-[9999] max-w-[320px] animate-in slide-in-from-bottom-4 fade-in duration-500">
          <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-2xl border border-white/20 p-4 relative overflow-hidden">
            {/* Decorative background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent)] pointer-events-none" />

            {/* Close button */}
            <button
              onClick={handleDismissBanner}
              className="absolute top-2 right-2 w-6 h-6 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors z-10"
              aria-label="Kapat"
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>

            {/* Content */}
            <div className="relative z-10">
              {/* Emoji + Title */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{specialDayBanner.emoji}</span>
                <h3 className="text-white font-bold text-sm leading-tight">
                  {specialDayBanner.title}
                </h3>
              </div>

              {/* Description */}
              <p className="text-white/90 text-xs mb-3 leading-relaxed">
                {specialDayBanner.description}
              </p>

              {/* CTA Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleBannerDonate}
                  className="flex-1 py-2 bg-white text-indigo-700 font-bold text-xs rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Gift className="w-3.5 h-3.5" />
                  Bağış Yap
                </button>
                <button
                  onClick={handleBannerChat}
                  className="flex-1 py-2 bg-white/20 text-white font-semibold text-xs rounded-lg hover:bg-white/30 transition-colors flex items-center justify-center gap-1.5 border border-white/30"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Sohbet Et
                </button>
              </div>
            </div>
          </div>
          {/* Triangle pointer */}
          <div className="absolute -bottom-2 right-6 w-4 h-4 bg-purple-600 border-r border-b border-white/20 transform rotate-45" />
        </div>
      )}

      {/* ── Proactive Message Tooltip (normal / idle-based) ───────── */}
      {showProactive && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-[9998] max-w-[280px] animate-in slide-in-from-bottom-2 fade-in duration-300">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-3 relative">
            <button
              onClick={handleDismissProactive}
              className="absolute -top-2 -right-2 w-5 h-5 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-3 h-3 text-gray-600" />
            </button>
            <p className="text-sm text-gray-700 mb-2 whitespace-pre-line">{proactiveMsg}</p>
            <button
              onClick={handleOpen}
              className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              🎓 Öğrenci Bul
            </button>
          </div>
          {/* Triangle pointer */}
          <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-r border-b border-gray-200 transform rotate-45" />
        </div>
      )}

      {/* ── Floating Action Button ───────────────────────────────── */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className={`fixed bottom-4 right-4 sm:right-6 z-[9998] w-14 h-14 rounded-full text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center group ${showSpecialDayBanner
              ? 'bg-gradient-to-br from-blue-600 to-purple-600 animate-pulse'
              : 'bg-gradient-to-br from-blue-600 to-indigo-600'
            }`}
          aria-label="AI Asistan'ı aç"
        >
          {isMinimized ? (
            <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
          ) : (
            <>
              <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
              {/* Pulse animation */}
              {showPulse && (
                <span className="absolute -top-1 -right-1 w-4 h-4">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-white" />
                </span>
              )}
            </>
          )}
        </button>
      )}
    </>
  );
}
