'use client';

import { useTranslation } from "@/lib/i18n/context";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();
  return (
    <html lang="tr">
      <body className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
        <div className="text-center max-w-md px-4">
          <p className="text-6xl font-extrabold text-red-500 mb-4">{t('app.global_error.hata')}</p>
          <h1 className="text-xl font-bold text-gray-900 mb-2">{t('app.global_error.kritik_bir_hata_olu_tu')}</h1>
          <p className="text-gray-500 mb-6">
            {t('app.global_error.uygulama_beklenmeyen_bir_sorun')}</p>
          <button
            onClick={reset}
            className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            {t('app.global_error.sayfay_yenile')}</button>
        </div>
      </body>
    </html>
  );
}
