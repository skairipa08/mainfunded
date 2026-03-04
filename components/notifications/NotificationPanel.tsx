'use client';

import React from 'react';
import Link from 'next/link';
import { Bell, Check, Trash2, Calendar } from 'lucide-react';
import { useNotifications } from '@/lib/notification-context';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Notification, NotificationType } from '@/types/notifications';
import { useTranslation } from "@/lib/i18n/context";

function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case 'donation':
      return '💰';
    case 'campaign':
      return '📢';
    case 'milestone':
      return '🎯';
    case 'thank_you':
      return '🙏';
    case 'reminder':
      return '⏰';
    case 'impact':
      return '🌟';
    case 'calendar':
      return '📅';
    case 'badge':
      return '🏅';
    case 'streak':
      return '🔥';
    case 'system':
      return '🔔';
    default:
      return '🔔';
  }
}

function getNotificationColor(type: NotificationType): string {
  switch (type) {
    case 'donation':
    case 'thank_you':
      return 'bg-green-50 border-green-200';
    case 'campaign':
      return 'bg-blue-50 border-blue-200';
    case 'milestone':
    case 'streak':
      return 'bg-amber-50 border-amber-200';
    case 'reminder':
      return 'bg-red-50 border-red-200';
    case 'impact':
    case 'badge':
      return 'bg-purple-50 border-purple-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
}

function timeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Az önce';
  if (diffMins < 60) return `${diffMins} dk önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  if (diffDays < 7) return `${diffDays} gün önce`;
  return then.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
  });
}

function NotificationItem({ notification }: { notification: Notification }) {
    const { t } = useTranslation();
  const { markAsRead, removeNotification } = useNotifications();
  const icon = getNotificationIcon(notification.type);
  const colorClass = getNotificationColor(notification.type);

  const content = (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer group border-b border-gray-50 last:border-0',
        !notification.read ? 'bg-blue-50/60 hover:bg-blue-50' : 'hover:bg-gray-50'
      )}
      onClick={() => {
        if (!notification.read) markAsRead(notification.id);
      }}
    >
      {/* Unread indicator */}
      <div className="flex-shrink-0 mt-1">
        {!notification.read && (
          <div className="w-2 h-2 rounded-full bg-blue-500" />
        )}
        {notification.read && <div className="w-2 h-2" />}
      </div>

      {/* Icon */}
      <div
        className={cn(
          'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg border',
          colorClass
        )}
      >
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm leading-tight',
            !notification.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
          )}
        >
          {notification.title}
        </p>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
          {notification.message}
        </p>
        <span className="text-[11px] text-gray-400 mt-1 block">
          {timeAgo(notification.timestamp)}
        </span>
      </div>

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          removeNotification(notification.id);
        }}
        className="flex-shrink-0 p-1 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
        aria-label="Bildirimi sil"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );

  if (notification.link) {
    return (
      <Link href={notification.link} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

export default function NotificationPanel() {
    const { t } = useTranslation();
  const { notifications, unreadCount, markAllRead, isLoading } =
    useNotifications();

  return (
    <div className="absolute right-0 top-full mt-2 w-[380px] max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-gray-500" />
          <h3 className="font-semibold text-gray-900 text-sm">{t('components.notificationpanel.bildirimler')}</h3>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-semibold">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded-md hover:bg-blue-50 transition-colors"
            >
              <Check className="h-3 w-3" />
              {t('components.notificationpanel.t_m_n_oku')}</button>
          )}
        </div>
      </div>

      {/* Notification List */}
      <div className="max-h-[400px] overflow-y-auto">
        {isLoading ? (
          <div className="px-4 py-8 text-center">
            <div className="w-6 h-6 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto" />
            <p className="text-sm text-gray-400 mt-2">{t('components.notificationpanel.y_kleniyor')}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <Bell className="h-6 w-6 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">
              {t('components.notificationpanel.hen_z_bildiriminiz_yok')}</p>
            <p className="text-xs text-gray-400 mt-1">
              {t('components.notificationpanel.ba_yapt_n_zda_burada_g_ncellem')}</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
            />
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-t border-gray-100 px-4 py-2.5 bg-gray-50/50 flex items-center justify-between">
          <Link
            href="/calendar"
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 font-medium transition-colors"
          >
            <Calendar className="h-3.5 w-3.5" />
            {t('components.notificationpanel.ba_takvimi')}</Link>
          <Link
            href="/account"
            className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            {t('components.notificationpanel.t_m_bildirimleri_g_r')}</Link>
        </div>
      )}
    </div>
  );
}
