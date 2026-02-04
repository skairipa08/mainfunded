'use client';

import React from 'react';
import { Shield } from 'lucide-react';
import { CharityGuarantee, TrustBadge } from '@/components/CharityGuarantee';
import MobileHeader from '@/components/MobileHeader';

export default function GuaranteePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
            {/* Mobile Header */}
            <MobileHeader transparent backHref="/" />

            {/* Hero */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white py-16 -mt-14 pt-20">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Shield className="h-10 w-10" />
                        <h1 className="text-4xl font-bold">Bagis Guvencesi</h1>
                    </div>
                    <p className="text-green-100 text-lg max-w-2xl mx-auto">
                        Bagisinizin dogru yere ulasacagindan %100 emin olun
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <CharityGuarantee />

                    {/* FAQ Section */}
                    <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border">
                        <h3 className="font-semibold text-gray-900 mb-4">Sikca Sorulan Sorular</h3>
                        <div className="space-y-4">
                            <details className="group">
                                <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                    Bagisim nereye gidiyor?
                                </summary>
                                <p className="mt-2 text-sm text-gray-600 pl-4">
                                    Bagisiniz %100 dogrudan sectiginiz ogrenciye ulasir. Platform isletme giderleri
                                    bagislarinizdan kesilmez, ayri kurumsal sponsorluklarla karsilanir.
                                </p>
                            </details>
                            <details className="group">
                                <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                    Ogrenci dogrulama sureci nasil isler?
                                </summary>
                                <p className="mt-2 text-sm text-gray-600 pl-4">
                                    Tum ogrenciler kimlik belgesi, ogrenci belgesi ve transkript ile dogrulanir.
                                    Ayrica universitelerle dogrudan iletisim kurarak bilgileri teyit ederiz.
                                </p>
                            </details>
                            <details className="group">
                                <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                    Iade ne zaman yapilir?
                                </summary>
                                <p className="mt-2 text-sm text-gray-600 pl-4">
                                    Ogrenci dogrulanamazsa veya kampanya iptal edilirse, bagisiniz 5-7 is gunu
                                    icinde otomatik olarak iade edilir.
                                </p>
                            </details>
                        </div>
                    </div>

                    {/* Trust Badge Demo */}
                    <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border">
                        <h3 className="font-semibold text-gray-900 mb-4">Guven Rozetleri</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Bu rozetleri tum kampanya ve odeme sayfalarinda gorebilirsiniz:
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <TrustBadge />
                            <CharityGuarantee variant="compact" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
