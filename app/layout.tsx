import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const inter = Inter({ subsets: ['latin'] });

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
