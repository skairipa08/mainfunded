'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { ChatWindow } from './ChatWindow';
import { useSmartTrigger } from './useSmartTrigger';
import type { TriggerType } from '@/types/ai-assistant';

/**
 * AiAssistantWidget — The floating chat bubble and its window.
 * Renders on every page; the smart-trigger hook watches for user
 * inactivity / exit / scroll to proactively open the chat.
 * Now uses the chat-engine API for proactive messages (knowledge-base aware).
 */
export function AiAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const [proactiveMsg, setProactiveMsg] = useState<string | null>(null);
  const [triggerEnabled, setTriggerEnabled] = useState(true);

  // Disable triggers if user already interacted or is on admin/student pages
  useEffect(() => {
    const path = window.location.pathname;
    const disabledPaths = ['/admin', '/student', '/onboarding', '/login', '/auth', '/ops'];
    if (disabledPaths.some((p) => path.startsWith(p))) {
      setTriggerEnabled(false);
    }
  }, []);

  const handleTrigger = useCallback(async (_type: TriggerType) => {
    if (isOpen) return; // already open
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
      setProactiveMsg('Kampanyaları incelediğinizi gördüm! 👀 Size uygun öğrenci bulayım mı?');
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

  return (
    <>
      {/* ── Chat Window ──────────────────────────────────────────── */}
      <ChatWindow
        isOpen={isOpen}
        onClose={handleClose}
        onMinimize={handleMinimize}
      />

      {/* ── Proactive Message Tooltip ────────────────────────────── */}
      {proactiveMsg && !isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-[9998] max-w-[280px] animate-in slide-in-from-bottom-2 fade-in duration-300">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-3 relative">
            <button
              onClick={handleDismissProactive}
              className="absolute -top-2 -right-2 w-5 h-5 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-3 h-3 text-gray-600" />
            </button>
            <p className="text-sm text-gray-700 mb-2">{proactiveMsg}</p>
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
          className="fixed bottom-4 right-4 sm:right-6 z-[9998] w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center group"
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
