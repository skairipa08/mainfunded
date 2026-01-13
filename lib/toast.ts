// Lightweight toast notification system
// Simple in-memory toast management for admin panel

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

let toasts: Toast[] = [];
let listeners: (() => void)[] = [];

export function showToast(message: string, type: ToastType = 'info') {
  const id = Math.random().toString(36).substring(7);
  toasts.push({ id, message, type });
  listeners.forEach(listener => listener());
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    removeToast(id);
  }, 5000);
}

export function removeToast(id: string) {
  toasts = toasts.filter(t => t.id !== id);
  listeners.forEach(listener => listener());
}

export function getToasts(): Toast[] {
  return [...toasts];
}

export function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
}
