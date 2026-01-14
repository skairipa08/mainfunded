import { Suspense } from 'react';
import BrowsePageContent from './page-wrapper';

export const dynamic = 'force-dynamic';

export default function BrowsePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4 border-4 border-blue-200 border-t-blue-600 rounded-full" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <BrowsePageContent />
    </Suspense>
  );
}
