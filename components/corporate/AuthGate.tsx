'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCorporateAuth } from '@/lib/corporate/auth';
import { Building2 } from 'lucide-react';

interface AuthGateProps {
    children: React.ReactNode;
}

export default function CorporateAuthGate({ children }: AuthGateProps) {
    const { isAuthenticated, isLoading } = useCorporateAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace('/corporate/auth/login');
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center bg-gray-900 p-4 rounded-2xl mb-4 shadow-lg">
                        <Building2 className="h-8 w-8 text-white animate-pulse" />
                    </div>
                    <div className="h-8 w-8 animate-spin mx-auto border-4 border-gray-200 border-t-blue-600 rounded-full mb-3" />
                    <p className="text-gray-500 text-sm">Kurumsal panel yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin mx-auto border-4 border-gray-200 border-t-blue-600 rounded-full mb-3" />
                    <p className="text-gray-500 text-sm">Yönlendiriliyor...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
