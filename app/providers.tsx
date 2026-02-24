'use client';

import { SessionProvider } from 'next-auth/react';
import { I18nProvider } from '@/lib/i18n';
import { CurrencyProvider } from '@/lib/currency-context';
import { NotificationProvider } from '@/lib/notification-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <I18nProvider>
        <CurrencyProvider>
          <NotificationProvider>{children}</NotificationProvider>
        </CurrencyProvider>
      </I18nProvider>
    </SessionProvider>
  );
}
