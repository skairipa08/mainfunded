'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="tr">
      <body className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
        <div className="text-center max-w-md px-4">
          <p className="text-6xl font-extrabold text-red-500 mb-4">Hata</p>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Kritik bir hata oluştu</h1>
          <p className="text-gray-500 mb-6">
            Uygulama beklenmeyen bir sorunla karşılaştı.
          </p>
          <button
            onClick={reset}
            className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Sayfayı Yenile
          </button>
        </div>
      </body>
    </html>
  );
}
