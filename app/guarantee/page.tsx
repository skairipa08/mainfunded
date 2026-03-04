'use client';

import React from 'react';
import { Shield } from 'lucide-react';
import { CharityGuarantee, TrustBadge } from '@/components/CharityGuarantee';
import MobileHeader from '@/components/MobileHeader';
import { useTranslation } from "@/lib/i18n/context";

export default function GuaranteePage() {
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
                        <h1 className="text-4xl font-bold">{t('app.page.ba_g_vencesi')}</h1>
                    </div>
                    <p className="text-green-100 text-lg max-w-2xl mx-auto">
                        {t('app.page.ba_n_z_n_do_ru_yere_ula_aca_nd')}</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <CharityGuarantee />

                    {/* FAQ Section */}
                    <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border">
                        <h3 className="font-semibold text-gray-900 mb-4">{t('app.page.sikca_sorulan_sorular')}</h3>
                        <div className="space-y-4">
                            <details className="group">
                                <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                    {t('app.page.ba_m_nereye_gidiyor')}</summary>
                                <p className="mt-2 text-sm text-gray-600 pl-4">
                                    {t('app.page.ba_n_z_100_do_rudan_se_ti_iniz')}</p>
                            </details>
                            <details className="group">
                                <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                    {t('app.page.renci_do_rulama_s_reci_nas_l_i')}</summary>
                                <p className="mt-2 text-sm text-gray-600 pl-4">
                                    {t('app.page.t_m_renciler_kimlik_belgesi_re')}</p>
                            </details>
                            <details className="group">
                                <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                    {t('app.page.ade_ne_zaman_yap_l_r')}</summary>
                                <p className="mt-2 text-sm text-gray-600 pl-4">
                                    {t('app.page.renci_do_rulanamazsa_veya_kamp')}</p>
                            </details>
                        </div>
                    </div>

                    {/* Trust Badge Demo */}
                    <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border">
                        <h3 className="font-semibold text-gray-900 mb-4">{t('app.page.guven_rozetleri')}</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            {t('app.page.bu_rozetleri_t_m_kampanya_ve_d')}</p>
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
