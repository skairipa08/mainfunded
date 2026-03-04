"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, Leaf, Award, TrendingUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/context";

interface ImpactMetricsProps {
    metrics: {
        social: {
            total_students_funded: number;
            total_funds_distributed: number;
            female_beneficiary_ratio: number;
            underprivileged_regions_supported: number;
            scholarship_hours_equivalent: number;
        };
        environmental: {
            carbon_offset_tco2e: number;
            paperless_operations_saved_kg: number;
        };
        governance: {
            transparent_donations_ratio: number;
            kyc_verified_students_ratio: number;
        };
    };
}

export function ImpactMetricsCards({ metrics }: ImpactMetricsProps) {
    const { t } = useTranslation();
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

            {/* Metric 1: Social Impact */}
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                <Card className="relative bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-white/20 dark:border-slate-800/50 shadow-xl overflow-hidden h-full rounded-xl">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Users className="w-24 h-24 text-blue-500 drop-shadow-2xl" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 z-10 relative">
                        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            {t('components.impactmetricscards.sosyal_etki_sdg_1_10')}</CardTitle>
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                    </CardHeader>
                    <CardContent className="z-10 relative">
                        <div className="flex items-baseline gap-2">
                            <div className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                {metrics.social.total_students_funded.toLocaleString()}
                            </div>
                            <span className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> +12%
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 font-medium">
                            {t('components.impactmetricscards.desteklenen_renci_say_s')}</p>
                        <div className="mt-4 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-800">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            <span><strong className="text-slate-900 dark:text-white">%{metrics.social.female_beneficiary_ratio}</strong> {t('components.impactmetricscards.kad_n_faydalan_c_oran_sdg_5')}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Metric 2: Educational Impact */}
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                <Card className="relative bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-white/20 dark:border-slate-800/50 shadow-xl overflow-hidden h-full rounded-xl">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <GraduationCap className="w-24 h-24 text-emerald-500 drop-shadow-2xl" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 z-10 relative">
                        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            {t('components.impactmetricscards.e_itim_g_c_sdg_4')}</CardTitle>
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                            <GraduationCap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </CardHeader>
                    <CardContent className="z-10 relative">
                        <div className="flex items-baseline gap-2">
                            <div className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                {metrics.social.scholarship_hours_equivalent.toLocaleString()}
                            </div>
                            <span className="text-lg font-medium text-slate-500 dark:text-slate-400">{t('components.impactmetricscards.saat')}</span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 font-medium">
                            {t('components.impactmetricscards.niversite_e_itimi_e_de_eri')}</p>
                        <div className="mt-4 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-800">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span>{t('components.impactmetricscards.do_rudan_nitelikli_e_itime_d_n')}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Metric 3: Digital Environmental Impact */}
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-lime-500 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                <Card className="relative bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-white/20 dark:border-slate-800/50 shadow-xl overflow-hidden h-full rounded-xl">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Leaf className="w-24 h-24 text-green-500 drop-shadow-2xl" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 z-10 relative">
                        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            {t('components.impactmetricscards.evre_dostu_sdg_13')}</CardTitle>
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <Leaf className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                    </CardHeader>
                    <CardContent className="z-10 relative">
                        <div className="flex items-baseline gap-2">
                            <div className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                {metrics.environmental.paperless_operations_saved_kg}
                            </div>
                            <span className="text-lg font-medium text-slate-500 dark:text-slate-400">kg</span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 font-medium">
                            {t('components.impactmetricscards.ka_t_tasarrufu_dijital_operasy')}</p>
                        <div className="mt-4 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-800">
                            <span className="font-mono bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded">+{metrics.environmental.carbon_offset_tco2e}</span>
                            <span>{t('components.impactmetricscards.tco2e_karbon_ofseti')}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Metric 4: Governance */}
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                <Card className="relative bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-white/20 dark:border-slate-800/50 shadow-xl overflow-hidden h-full rounded-xl">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Award className="w-24 h-24 text-purple-500 drop-shadow-2xl" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 z-10 relative">
                        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            {t('components.impactmetricscards.y_neti_im_sdg_16')}</CardTitle>
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                    </CardHeader>
                    <CardContent className="z-10 relative">
                        <div className="flex items-baseline gap-2">
                            <div className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                %{metrics.governance.transparent_donations_ratio}
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 font-medium">
                            {t('components.impactmetricscards.u_tan_uca_effaf_lem')}</p>
                        <div className="mt-4 flex flex-col gap-2">
                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                                <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full w-full"></div>
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 flex justify-between">
                                <span>{t('components.impactmetricscards.veri_b_t_nl_onayl')}</span>
                                <span>100%</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}
