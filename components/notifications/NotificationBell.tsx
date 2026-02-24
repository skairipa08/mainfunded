'use client';

import React, { useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/lib/notification-context';
import { cn } from '@/lib/utils';
import NotificationPanel from './NotificationPanel';

export default function NotificationBell() {
  const { unreadCount, isOpen, togglePanel, closePanel } = useNotifications();
  const containerRef = useRef<HTMLDivElement>(null);

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        closePanel();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, closePanel]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={togglePanel}
        className={cn(
          'relative p-2 rounded-lg transition-colors',
          isOpen
            ? 'bg-blue-50 text-blue-600'
            : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
        )}
        aria-label={`Bildirimler${unreadCount > 0 ? ` (${unreadCount} okunmamış)` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white shadow-sm animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && <NotificationPanel />}
    </div>
  );
}
