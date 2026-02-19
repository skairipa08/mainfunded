import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <p className="text-8xl font-extrabold text-blue-600 mb-4">404</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sayfa Bulunamadı</h1>
        <p className="text-gray-500 mb-8">
          Aradığınız kampanya taşınmış, kaldırılmış veya hiç var olmamış olabilir.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/campaigns"
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Kampanyalara Git
          </Link>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Ana Sayfa
          </Link>
        </div>
      </div>
    </div>
  );
}
