'use client';

import { SessionProvider } from 'next-auth/react';
import { I18nProvider } from '@/lib/i18n';
import { CurrencyProvider } from '@/lib/currency-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <I18nProvider>
        <CurrencyProvider>{children}</CurrencyProvider>
      </I18nProvider>
    </SessionProvider>
  );
}
