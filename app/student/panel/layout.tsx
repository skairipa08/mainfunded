'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import StudentSidebar from '@/components/student/Sidebar';
import { Menu, ArrowLeft } from 'lucide-react';

export default function StudentPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!session) {
    router.replace('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-gray-900 text-white h-14 flex items-center justify-between px-4 md:hidden">
        <button
          onClick={() => router.push('/')}
          className="p-2 -ml-2 rounded-lg hover:bg-gray-800 transition-colors"
          aria-label="Ana Sayfa"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="font-semibold">FundEd Öğrenci Paneli</span>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 -mr-2 rounded-lg hover:bg-gray-800 transition-colors"
          aria-label="Menü"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Sidebar */}
      <StudentSidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content */}
      <div className="md:ml-64 min-h-screen transition-all duration-300 pt-14 md:pt-0">
        {children}
      </div>
    </div>
  );
}
