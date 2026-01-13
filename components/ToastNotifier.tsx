'use client';

import { useEffect, useState } from 'react';
import { getToasts, subscribe, removeToast } from '@/lib/toast';

export function ToastNotifier() {
  const [toasts, setToasts] = useState(getToasts());

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      setToasts(getToasts());
    });
    return unsubscribe;
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-md shadow-lg border ${
            toast.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : toast.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
