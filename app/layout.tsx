import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { ErrorBoundary } from '@/components/ErrorBoundary';
// Monitoring is optional - only initialize if Sentry is configured
let initMonitoring: (() => void) | null = null;
try {
  // Dynamic import to avoid build errors if Sentry not installed
  const monitoring = require('@/lib/monitoring');
  initMonitoring = monitoring.initMonitoring;
} catch {
  // Sentry not available, monitoring disabled
}

const inter = Inter({ subsets: ['latin'] });

// Initialize monitoring if available
if (typeof window === 'undefined' && initMonitoring) {
  // Server-side initialization
  initMonitoring();
}

export const metadata: Metadata = {
  title: 'FundEd - Educational Crowdfunding',
  description: 'Support verified students in their educational journey',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Monitoring initialization is handled in lib/monitoring.ts with dynamic imports
  // No need to import here to avoid build errors if Sentry not installed

  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <Providers>{children}</Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
