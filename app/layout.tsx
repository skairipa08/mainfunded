import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://fund-ed.com'),
  title: {
    default: 'FundEd - Eğitim Kitle Fonlama Platformu',
    template: '%s | FundEd',
  },
  description: 'Doğrulanmış öğrencilere bağış yaparak eğitim hayallerini gerçeğe dönüştürün. FundEd, güvenli ve şeffaf bir kitle fonlama platformudur.',
  openGraph: {
    siteName: 'FundEd',
    locale: 'tr_TR',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'FundEd' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
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
        <script
          dangerouslySetInnerHTML={{
            __html: `history.scrollRestoration = "manual"`,
          }}
        />
        <ErrorBoundary>
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
