'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useSession } from 'next-auth/react';
import type { Notification, NotificationType } from '@/types/notifications';

// ═══════════════════════════════════════════════════════
// Notification Context — global notification state
// ═══════════════════════════════════════════════════════

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isOpen: boolean;
  isLoading: boolean;
}

type NotificationAction =
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'MARK_ALL_READ' }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'TOGGLE_PANEL' }
  | { type: 'CLOSE_PANEL' }
  | { type: 'SET_LOADING'; payload: boolean };

interface NotificationContextType extends NotificationState {
  addNotification: (params: {
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    metadata?: Record<string, unknown>;
  }) => Notification;
  markAsRead: (id: string) => void;
  markAllRead: () => void;
  removeNotification: (id: string) => void;
  togglePanel: () => void;
  closePanel: () => void;
  refetch: () => Promise<void>;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isOpen: false,
  isLoading: false,
};

function notificationReducer(
  state: NotificationState,
  action: NotificationAction
): NotificationState {
  switch (action.type) {
    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload,
        unreadCount: action.payload.filter((n) => !n.read).length,
        isLoading: false,
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };
    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    case 'MARK_ALL_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      };
    case 'REMOVE_NOTIFICATION': {
      const removed = state.notifications.find((n) => n.id === action.payload);
      return {
        ...state,
        notifications: state.notifications.filter((n) => n.id !== action.payload),
        unreadCount:
          removed && !removed.read
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount,
      };
    }
    case 'TOGGLE_PANEL':
      return { ...state, isOpen: !state.isOpen };
    case 'CLOSE_PANEL':
      return { ...state, isOpen: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch notifications on mount / auth change
  const fetchNotifications = useCallback(async () => {
    if (!session?.user) return;
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        dispatch({
          type: 'SET_NOTIFICATIONS',
          payload: data.notifications ?? [],
        });
      }
    } catch (err) {
      console.warn('[Notifications] Failed to fetch:', err);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [session?.user]);

  useEffect(() => {
    if (mounted && session?.user) {
      fetchNotifications();
    }
  }, [mounted, session?.user, fetchNotifications]);

  // Poll for new notifications every 60 seconds
  useEffect(() => {
    if (!session?.user) return;
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
  }, [session?.user, fetchNotifications]);

  const addNotification = useCallback(
    (params: {
      type: NotificationType;
      title: string;
      message: string;
      link?: string;
      metadata?: Record<string, unknown>;
    }) => {
      const notification: Notification = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
        userId: (session?.user as any)?.id ?? 'anonymous',
        timestamp: new Date().toISOString(),
        read: false,
        ...params,
      };
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification });

      // Persist to server (fire & forget)
      fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notification),
      }).catch(() => {});

      return notification;
    },
    [session?.user]
  );

  const markAsRead = useCallback((id: string) => {
    dispatch({ type: 'MARK_AS_READ', payload: id });
    fetch(`/api/notifications/${id}/read`, { method: 'PATCH' }).catch(() => {});
  }, []);

  const markAllRead = useCallback(() => {
    dispatch({ type: 'MARK_ALL_READ' });
    fetch('/api/notifications/read-all', { method: 'PATCH' }).catch(() => {});
  }, []);

  const removeNotification = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
    fetch(`/api/notifications/${id}`, { method: 'DELETE' }).catch(() => {});
  }, []);

  const togglePanel = useCallback(() => {
    dispatch({ type: 'TOGGLE_PANEL' });
  }, []);

  const closePanel = useCallback(() => {
    dispatch({ type: 'CLOSE_PANEL' });
  }, []);

  const value: NotificationContextType = {
    ...state,
    addNotification,
    markAsRead,
    markAllRead,
    removeNotification,
    togglePanel,
    closePanel,
    refetch: fetchNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider'
    );
  }
  return context;
}
