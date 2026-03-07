import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Toaster } from '@/components/ui/sonner';
import { AiAssistantLoader } from '@/components/ai-assistant/AiAssistantLoader';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { GoogleAnalytics } from '@next/third-parties/google';

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
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
  keywords: ['eğitim', 'bağış', 'kitle fonlama', 'öğrenci', 'fon', 'sosyal sorumluluk', 'burs', 'eğitimde fırsat eşitliği'],
  authors: [{ name: 'FundEd Ekibi' }],
  creator: 'FundEd',
  publisher: 'FundEd',
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;
  const messages = await getMessages();

  // Monitoring initialization is handled in lib/monitoring.ts with dynamic imports
  // No need to import here to avoid build errors if Sentry not installed

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <GoogleAnalytics gaId="G-NRN6MW6SDF" />
        <NextIntlClientProvider messages={messages}>
          <script
            dangerouslySetInnerHTML={{
              __html: `history.scrollRestoration = "manual"`,
            }}
          ></script>
          <ErrorBoundary>
            <Providers>
              {children}
              <Toaster />
              <AiAssistantLoader />
            </Providers>
          </ErrorBoundary>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
