'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

/**
 * Error codes from NextAuth and their user-friendly messages
 */
const ERROR_MESSAGES: Record<string, { title: string; description: string; action?: string }> = {
  Configuration: {
    title: 'Server Configuration Error',
    description: 'There is a problem with the server configuration. Please contact the administrator.',
    action: 'Check that all required environment variables are set (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, AUTH_SECRET, etc.)'
  },
  AccessDenied: {
    title: 'Access Denied',
    description: 'You do not have permission to access this resource.',
  },
  Verification: {
    title: 'Email Verification Required',
    description: 'Please verify your email address before signing in.',
  },
  OAuthSignin: {
    title: 'OAuth Sign In Error',
    description: 'There was a problem starting the sign in process. Please try again.',
  },
  OAuthCallback: {
    title: 'OAuth Callback Error',
    description: 'There was a problem completing the sign in. This may happen if you cancelled the sign in or if there was a network issue.',
  },
  OAuthCreateAccount: {
    title: 'Account Creation Failed',
    description: 'Could not create an account with this OAuth provider. Please try again or contact support.',
  },
  EmailCreateAccount: {
    title: 'Email Account Error',
    description: 'Could not create an account with this email address.',
  },
  Callback: {
    title: 'Callback Error',
    description: 'There was an error during the authentication callback.',
  },
  OAuthAccountNotLinked: {
    title: 'Account Not Linked',
    description: 'This email is already associated with another account. Please sign in with the original provider you used to create your account.',
  },
  EmailSignin: {
    title: 'Email Sign In Error',
    description: 'Could not send the sign in email. Please try again.',
  },
  CredentialsSignin: {
    title: 'Sign In Failed',
    description: 'The credentials you provided are incorrect. Please check your email and password.',
  },
  SessionRequired: {
    title: 'Session Required',
    description: 'Please sign in to access this page.',
  },
  Default: {
    title: 'Authentication Error',
    description: 'An unexpected error occurred during authentication. Please try again.',
  }
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get('error') || 'Default';

  const errorInfo = ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-blue-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            {errorInfo.title}
          </h1>
          <p className="text-gray-600 text-center mb-6">
            {errorInfo.description}
          </p>

          {/* Debug info in development */}
          {process.env.NODE_ENV === 'development' && errorInfo.action && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Development hint:</strong> {errorInfo.action}
              </p>
            </div>
          )}

          {/* Error Code for debugging */}
          {errorCode !== 'Default' && (
            <div className="bg-gray-50 rounded-md p-3 mb-6">
              <p className="text-xs text-gray-500 text-center">
                Error code: <code className="bg-gray-200 px-1 rounded">{errorCode}</code>
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/login"
              className="flex-1 inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Try Again
            </Link>
            <Link
              href="/"
              className="flex-1 inline-flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Go to Home
            </Link>
          </div>

          {/* Help link */}
          <p className="text-xs text-gray-400 text-center mt-6">
            If the problem persists, please{' '}
            <a href="mailto:support@funded.com" className="text-blue-600 hover:underline">
              contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4 border-4 border-blue-200 border-t-blue-600 rounded-full" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}
