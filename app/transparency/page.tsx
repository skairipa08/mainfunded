'use client';

import React from 'react';
import { Shield, PieChart, FileCheck, Users, DollarSign } from 'lucide-react';
import { TransparencyCard, VerificationBadge } from '@/components/TransparencyCard';
import MobileHeader from '@/components/MobileHeader';
import { useTranslation } from '@/lib/i18n/context';

export default function TransparencyPage() {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
            {/* Mobile Header */}
            <MobileHeader transparent backHref="/" />

            {/* Hero */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white py-16 -mt-14 pt-20">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Shield className="h-10 w-10" />
                        <h1 className="text-4xl font-bold">Seffaflik</h1>
                    </div>
                    <p className="text-green-100 text-lg max-w-2xl mx-auto">
                        Her bagis, dogrulanmis ogrencilere ulasir ve her harcama raporlanir
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Stats */}
                {/* Demo Notice */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-center gap-3">
                    <span className="text-amber-600 font-bold text-lg">⚠️</span>
                    <p className="text-amber-800 text-sm font-medium">{t('common.demoTransparency')}</p>
                </div>

                <div className="grid md:grid-cols-4 gap-6 mb-12">
                    <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
                        <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <p className="text-3xl font-bold text-gray-900">$0</p>
                        <p className="text-gray-600">Toplam Bagis</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
                        <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-3xl font-bold text-gray-900">0</p>
                        <p className="text-gray-600">Desteklenen Ogrenci</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
                        <FileCheck className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <p className="text-3xl font-bold text-gray-900">0%</p>
                        <p className="text-gray-600">Dogrulama Orani</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
                        <PieChart className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                        <p className="text-3xl font-bold text-gray-900">0%</p>
                        <p className="text-gray-600">Ogrenciye Ulasan</p>
                    </div>
                </div>

                {/* Verification Badges */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Dogrulama Sistemi</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm border">
                            <VerificationBadge status="verified" size="lg" className="mb-3" />
                            <p className="text-sm text-gray-600">
                                Kimlik ve ogrencilik durumu tam dogrulandi
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm border">
                            <VerificationBadge status="student_verified" size="lg" className="mb-3" />
                            <p className="text-sm text-gray-600">
                                Ogrenci belgesi incelendi ve onaylandi
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm border">
                            <VerificationBadge status="institution_verified" size="lg" className="mb-3" />
                            <p className="text-sm text-gray-600">
                                Universite tarafindan teyit edildi
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm border">
                            <VerificationBadge status="document_verified" size="lg" className="mb-3" />
                            <p className="text-sm text-gray-600">
                                Belgeleri manuel olarak incelendi
                            </p>
                        </div>
                    </div>
                </div>

                {/* Example Breakdown */}
                <div className="max-w-xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Ornek Harcama Dokumu</h2>
                    <TransparencyCard
                        studentName="Ornek Ogrenci"
                        totalRaised={0}
                        goalAmount={0}
                        lastUpdated="2026-01-15"
                        verificationStatus="verified"
                        documents={[
                            { name: 'Ogrenci Belgesi', url: '#' },
                            { name: 'Transkript', url: '#' },
                        ]}
                    />
                </div>
            </div>
        </div>
    );
}
