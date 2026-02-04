'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { ToastNotifier } from '@/components/ToastNotifier';

function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);

  // Preview mode for demo - skip auth
  const isPreviewMode = searchParams.get('preview') === 'true';

  useEffect(() => {
    if (isPreviewMode) {
      setLoading(false);
      return;
    }

    if (status === 'loading') return;

    if (!session) {
      router.replace('/login');
      return;
    }

    if ((session.user as any)?.role !== 'admin') {
      router.replace('/unauthorized');
      return;
    }

    setLoading(false);
  }, [session, status, router, isPreviewMode]);

  if (loading || status === 'loading') {
    if (!isPreviewMode) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }
  }

  if (!isPreviewMode && (!session || (session.user as any)?.role !== 'admin')) {
    return null;
  }

  const user = isPreviewMode
    ? { name: 'Demo Admin', email: 'admin@demo.com', role: 'admin' }
    : session?.user as any;

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastNotifier />
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">FundEd Admin</h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">{user.name}</div>
              <div className="text-xs text-gray-500">{user.email}</div>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {user.role}
            </span>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)]">
          <nav className="p-4 space-y-1">
            <Link
              href="/admin"
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/students"
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
            >
              Students
            </Link>
            <Link
              href="/admin/verifications"
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
            >
              <span className="flex items-center">
                Verifications
                <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">Queue</span>
              </span>
            </Link>
            <Link
              href="/admin/campaigns"
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
            >
              Campaigns
            </Link>
            <Link
              href="/admin/analytics"
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
            >
              <span className="flex items-center">
                Analytics
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">New</span>
              </span>
            </Link>
            <div className="border-t border-gray-200 my-4"></div>
            <button
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                window.location.href = '/';
              }}
              className="w-full text-left flex items-center px-4 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50"
            >
              Logout
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <AdminLayoutContent>
        {children}
      </AdminLayoutContent>
    </Suspense>
  );
}
