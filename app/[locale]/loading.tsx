'use client';
import { useTranslation } from "@/lib/i18n/context";

export default function Loading() {
    const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <div className="relative mx-auto h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-blue-200" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin" />
        </div>
        <p className="text-gray-500 animate-pulse">{t('app.loading.y_kleniyor')}</p>
      </div>
    </div>
  );
}
