'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import CorporateSidebar from '@/components/corporate/Sidebar';
import { CorporateAuthProvider } from '@/lib/corporate/auth';
import CorporateAuthGate from '@/components/corporate/AuthGate';
import { Menu, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Pages that don't require auth (login/register page)
const publicPaths = ['/corporate/auth'];

export default function CorporateLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const isPublicPage = publicPaths.some(path => pathname?.startsWith(path));

    // For public pages (login/register), render without sidebar
    if (isPublicPage) {
        return (
            <CorporateAuthProvider>
                {children}
            </CorporateAuthProvider>
        );
    }

    // For protected pages, wrap with auth gate + sidebar layout
    return (
        <CorporateAuthProvider>
            <CorporateAuthGate>
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
                        <span className="font-semibold">FundEd Kurumsal</span>
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="p-2 -mr-2 rounded-lg hover:bg-gray-800 transition-colors"
                            aria-label="Menu"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Sidebar */}
                    <CorporateSidebar
                        mobileOpen={mobileMenuOpen}
                        onMobileClose={() => setMobileMenuOpen(false)}
                    />

                    {/* Main Content */}
                    <div className="md:ml-64 min-h-screen transition-all duration-300 pt-14 md:pt-0">
                        {children}
                    </div>
                </div>
            </CorporateAuthGate>
        </CorporateAuthProvider>
    );
}
