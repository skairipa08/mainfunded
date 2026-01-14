import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Unable to complete sign in
        </h1>
        <p className="text-gray-600 mb-6">
          There was an issue while trying to sign you in. This may be due to a temporary
          configuration issue or an unavailable authentication service.
        </p>
        <p className="text-gray-600 mb-6">
          Please try again. If the problem persists, contact the site administrator and
          include the approximate time of the failure so we can inspect server logs.
        </p>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Try signing in again
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Return to home
          </Link>
        </div>
      </div>
    </div>
  );
}

