'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import LanguageSwitcher from '@/components/LanguageSwitcher';

/**
 * Client component that uses useSearchParams - must be wrapped in Suspense
 */
export default function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const errorParam = searchParams.get('error');

  // Redirect if already signed in
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.replace(callbackUrl);
    }
  }, [session, status, router, callbackUrl]);

  // Show error from URL params
  useEffect(() => {
    if (errorParam) {
      setError(getErrorMessage(errorParam, t));
    }
  }, [errorParam, t]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await signIn('google', { callbackUrl });
    } catch (err) {
      console.error('Sign in error:', err);
      setError(t('auth.errors.default'));
      setIsLoading(false);
    }
  };

  // Show loading while checking session
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin mx-auto text-blue-600 mb-4 border-4 border-blue-200 border-t-blue-600 rounded-full" />
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center py-12 px-4">
      {/* Language Switcher - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher variant="minimal" />
      </div>

      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <span className="text-2xl font-bold text-white">F</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('auth.login.title')}</h1>
            <p className="text-gray-600">{t('auth.login.subtitle')}</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <div className="h-5 w-5 animate-spin border-2 border-gray-300 border-t-blue-600 rounded-full" />
                {t('common.loading')}
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {t('auth.login.withGoogle')}
              </>
            )}
          </button>

          {/* Info */}
          <p className="mt-6 text-xs text-center text-gray-500">
            {t('footer.terms')} •{' '}
            <a href="/terms" className="text-blue-600 hover:underline">{t('footer.terms')}</a>
            {' '}&amp;{' '}
            <a href="/privacy" className="text-blue-600 hover:underline">{t('footer.privacy')}</a>
          </p>
        </div>

        {/* Help text */}
        <p className="mt-6 text-center text-sm text-gray-500">
          {t('auth.errors.tryAgain')}?{' '}
          <a href="mailto:support@funded.com" className="text-blue-600 hover:underline">
            {t('footer.contact')}
          </a>
        </p>
      </div>
    </div>
  );
}

function getErrorMessage(error: string, t: (key: string) => string): string {
  const errorMap: Record<string, string> = {
    OAuthSignin: t('auth.errors.oauthCallback'),
    OAuthCallback: t('auth.errors.oauthCallback'),
    OAuthCreateAccount: t('auth.errors.oauthCallback'),
    OAuthAccountNotLinked: t('auth.errors.oauthAccountNotLinked'),
    Callback: t('auth.errors.oauthCallback'),
    AccessDenied: t('auth.errors.accessDenied'),
    Configuration: t('auth.errors.configuration'),
    default: t('auth.errors.default'),
  };
  return errorMap[error] || errorMap.default;
}
