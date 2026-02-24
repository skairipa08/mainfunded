'use client';

import React from 'react';
import {
    Shield,
    Check,
    Heart,
    FileCheck,
    AlertCircle,
    HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CharityGuaranteeProps {
    className?: string;
    variant?: 'full' | 'compact';
}

const guaranteePoints = [
    {
        icon: Shield,
        title: '100% Bağış Güvencesi',
        description: 'Bağışınız doğrudan öğrenciye ulaşmazsa, tam iade yapılır.',
    },
    {
        icon: FileCheck,
        title: 'Doğrulama Süreci',
        description: 'Tüm öğrenciler kimlik ve öğrencilik belgesi ile doğrulanır.',
    },
    {
        icon: Heart,
        title: 'Şeffaf Raporlama',
        description: 'Her çeyrek, bağışınızın nasıl kullanıldığını görürsünüz.',
    },
];

export function CharityGuarantee({ className, variant = 'full' }: CharityGuaranteeProps) {
    if (variant === 'compact') {
        return (
            <div className={cn('bg-green-50 rounded-xl p-4 border border-green-200', className)}>
                <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                        <Shield className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                        <p className="font-medium text-green-800">FundEd Güvencesi</p>
                        <p className="text-sm text-green-600">Bağışınız %100 güvenli ve şeffaf</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={cn('bg-white rounded-xl shadow-sm border overflow-hidden', className)}>
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white p-6 text-center">
                <Shield className="h-12 w-12 mx-auto mb-3" />
                <h2 className="text-2xl font-bold mb-2">FundEd Bağış Güvencesi</h2>
                <p className="text-green-100">
                    Bağışınızın doğru yere ulaşacağından %100 emin olun
                </p>
            </div>

            {/* Guarantee Points */}
            <div className="p-6 space-y-4">
                {guaranteePoints.map((point, index) => (
                    <div key={index} className="flex items-start gap-4">
                        <div className="bg-green-100 p-2 rounded-lg">
                            <point.icon className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900">{point.title}</h4>
                            <p className="text-sm text-gray-600">{point.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Process */}
            <div className="bg-gray-50 p-6 border-t">
                <h4 className="font-semibold text-gray-900 mb-4">Nasil Calisir?</h4>
                <div className="flex items-center justify-between">
                    {[
                        { step: 1, label: 'Bağış Yap' },
                        { step: 2, label: 'Doğrulama' },
                        { step: 3, label: 'Öğrenciye Ulasim' },
                        { step: 4, label: 'Rapor Al' },
                    ].map((item, index) => (
                        <React.Fragment key={item.step}>
                            <div className="text-center">
                                <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-2">
                                    {item.step}
                                </div>
                                <p className="text-xs text-gray-600">{item.label}</p>
                            </div>
                            {index < 3 && (
                                <div className="flex-1 h-0.5 bg-green-200 mx-2" />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Refund Policy */}
            <div className="p-6 border-t">
                <div className="flex items-start gap-3 bg-blue-50 rounded-lg p-4">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                        <h4 className="font-medium text-blue-900">İade Politikası</h4>
                        <p className="text-sm text-blue-700 mt-1">
                            Bağış yaptığınız öğrenci doğrulanamazsa veya kampanya iptal edilirse,
                            bağışınızın %100&apos;ü 5-7 iş günü içinde iade edilir.
                        </p>
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="p-6 pt-0">
                <Button variant="outline" className="w-full gap-2">
                    <HelpCircle className="h-4 w-4" />
                    Detaylı Bilgi Al
                </Button>
            </div>
        </div>
    );
}

// Trust Badge for inline use
export function TrustBadge({ className }: { className?: string }) {
    return (
        <div className={cn('inline-flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full border border-green-200', className)}>
            <Shield className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">FundEd Güvenli</span>
            <Check className="h-4 w-4 text-green-600" />
        </div>
    );
}
