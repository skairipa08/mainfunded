'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Error Boundary]', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Bir şeyler ters gitti</h1>
        <p className="text-gray-500 mb-6">
          Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Yeniden Dene
        </button>
        <p className="text-xs text-gray-400 mt-6">
          Sorun devam ederse{' '}
          <a href="mailto:support@fund-ed.com" className="text-blue-600 hover:underline">
            support@fund-ed.com
          </a>
          &apos;a yazabilirsiniz.
        </p>
      </div>
    </div>
  );
}
