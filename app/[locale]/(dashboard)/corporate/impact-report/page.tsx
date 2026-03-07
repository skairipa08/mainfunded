"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { ImpactMetricsCards } from "@/components/esg/ImpactMetricsCards";
import { ImpactCharts } from "@/components/esg/ImpactCharts";
import { Button } from "@/components/ui/button";
import { Download, Share2, ShieldCheck, Target, Globe } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n/context";

export default function CorporateImpactDashboard() {
    const { t } = useTranslation();
    const { data: session, status } = useSession();
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (status === "unauthenticated") {
            redirect("/login");
        }

        if (status === "authenticated") {
            fetchMetrics();
        }
    }, [status]);

    const fetchMetrics = async () => {
        try {
            const res = await fetch("/api/esg/metrics");
            const data = await res.json();

            if (data.success) {
                setMetrics(data.data.metrics);
            } else {
                setError(data.error?.message || "Failed to load impact metrics");
            }
        } catch (err) {
            setError("An error occurred while fetching your impact data.");
        } finally {
            setLoading(false);
        }
    };

    if (loading || status === "loading") {
        return (
            <div className="space-y-6 pt-6">
                <Skeleton className="h-12 w-1/3" />
                <div className="grid gap-4 md:grid-cols-4">
                    <Skeleton className="h-[140px] rounded-xl" />
                    <Skeleton className="h-[140px] rounded-xl" />
                    <Skeleton className="h-[140px] rounded-xl" />
                    <Skeleton className="h-[140px] rounded-xl" />
                </div>
                <div className="grid gap-6 md:grid-cols-2 mt-6">
                    <Skeleton className="h-[350px] rounded-xl" />
                    <Skeleton className="h-[350px] rounded-xl" />
                </div>
            </div>
        );
    }

    if (error || !metrics) {
        return (
            <Card className="mt-8 border-red-200 bg-red-50/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-red-700">{t('app.page.unable_to_load_impact_report')}</CardTitle>
                    <CardDescription className="text-red-600 font-medium">{error}</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <div className="space-y-10 pt-8 pb-32">

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                <div className="space-y-2 relative">
                    {/* Subtle background glow */}
                    <div className="absolute -left-10 -top-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-xl text-blue-600 dark:text-blue-400">
                            <Globe className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            {t('app.page.kurumsal_sosyal_etki_esg_rapor')}</h1>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 max-w-2xl text-lg font-medium">
                        {new Date().getFullYear()} {t('app.page.y_l_na_ait_funded_operasyonlar')}<span className="font-semibold text-slate-700 dark:text-slate-200 ml-1 inline-flex items-center gap-1">
                            {t('app.page.do_rulanm')}<ShieldCheck className="w-4 h-4 text-emerald-500" />
                        </span> {t('app.page.etki_detaylar')}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Button variant="outline" className="gap-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border-slate-200 dark:border-slate-800">
                        <Share2 className="h-4 w-4 text-slate-500" />
                        <span className="font-medium text-slate-700 dark:text-slate-300">{t('app.page.a_k_link_payla')}</span>
                    </Button>
                    <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 transition-all">
                        <Download className="h-4 w-4" />
                        <span className="font-semibold">{t('app.page.resmi_sertifikay_ndir')}</span>
                    </Button>
                </div>
            </div>

            {/* Sub-header Context / SDG Alignment */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800/50 dark:to-slate-900/50 border border-slate-200 dark:border-slate-800">
                <Target className="w-8 h-8 text-indigo-500 shrink-0" />
                <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{t('app.page.sdg_odakl_yat_r_m')}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        {t('app.page.bu_rapordaki_metrikler_do_ruda')}<strong>{t('app.page.ama_4_nitelikli_e_itim')}</strong>, <strong>{t('app.page.ama_5_toplumsal_cinsiyet_e_itl')}</strong>{t('app.page.ve')}<strong>{t('app.page.ama_10_e_itsizliklerin_azalt_l')}</strong> {t('app.page.hedeflerine_olan_katk_n_z_yans')}</p>
                </div>
            </div>

            {/* KPI Cards */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    {t('app.page.bir_bak_ta_etkiniz')}</h2>
                <ImpactMetricsCards metrics={metrics} />
            </section>

            {/* Detailed Charts */}
            <section className="space-y-4 pt-6">
                <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                    {t('app.page.derinlemesine_analiz_demografi')}</h2>
                <ImpactCharts metrics={metrics} />
            </section>

        </div>
    );
}
