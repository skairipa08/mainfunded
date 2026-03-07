'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from "@/lib/i18n/context";
import {
    Leaf,
    Users,
    Building2,
    TrendingUp,
    Award,
    Globe,
    Heart,
    Target,
    BarChart3,
    GraduationCap,
    BookOpen,
    ShieldCheck,
    TreePine,
    Banknote,
    MapPin,
    Download,
    ArrowUpRight,
    Sparkles,
    ChevronDown,
    ChevronUp,
    CalendarDays,
    Receipt,
    FileCheck,
    Scale,
    Stamp,
    Info,
} from 'lucide-react';
import CorporateHeader from '@/components/corporate/Header';
import StatCard from '@/components/corporate/StatCard';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    RadialBarChart,
    RadialBar,
    Legend,
} from 'recharts';
import { useCurrency } from '@/lib/currency-context';

export default function ESGPage() {
    const { t } = useTranslation();
    const { formatAmount } = useCurrency();
    const [donationsExpanded, setDonationsExpanded] = useState(false);

    // Company tax info
    const companyTaxInfo = {
        companyName: 'ABC Teknoloji A.Ş.',
        vkn: '1234567890',
        taxOffice: 'Büyük Mükellefler VD',
        address: 'Levent Mah. Büyükdere Cad. No:123 Beşiktaş/İstanbul',
    };

    // Mock individual donation records with receipt references
    const donationRecords = [
        { id: 'DON-2026-001', date: '2026-02-28', studentName: 'Ayşe Yılmaz', campaign: 'Mühendislik Bursu', amount: 5000, status: 'completed', makbuzNo: 'MKB-2026-0284' },
        { id: 'DON-2026-002', date: '2026-02-15', studentName: 'Mehmet Kaya', campaign: 'Tıp Fakültesi Desteği', amount: 7500, status: 'completed', makbuzNo: 'MKB-2026-0215' },
        { id: 'DON-2026-003', date: '2026-01-22', studentName: 'Zeynep Demir', campaign: 'Bilgisayar Bilimi Bursu', amount: 3000, status: 'completed', makbuzNo: 'MKB-2026-0122' },
        { id: 'DON-2026-004', date: '2026-01-10', studentName: 'Ali Çelik', campaign: 'Hukuk Fakültesi Fonu', amount: 4500, status: 'completed', makbuzNo: 'MKB-2026-0110' },
        { id: 'DON-2025-048', date: '2025-12-18', studentName: 'Fatma Öztürk', campaign: 'Eğitim Fakültesi Desteği', amount: 6000, status: 'completed', makbuzNo: 'MKB-2025-1218' },
        { id: 'DON-2025-047', date: '2025-12-05', studentName: 'Hasan Arslan', campaign: 'İşletme Bursu', amount: 3500, status: 'completed', makbuzNo: 'MKB-2025-1205' },
        { id: 'DON-2025-046', date: '2025-11-20', studentName: 'Elif Şahin', campaign: 'Mimarlık Desteği', amount: 5500, status: 'completed', makbuzNo: 'MKB-2025-1120' },
        { id: 'DON-2025-045', date: '2025-11-08', studentName: 'Emre Koç', campaign: 'Fen Bilimleri Bursu', amount: 4000, status: 'completed', makbuzNo: 'MKB-2025-1108' },
    ];

    // -------------------------------------------------------------------
    // Data – In production these would come from /api/esg/metrics
    // -------------------------------------------------------------------
    const impactData = [
        { month: 'Oca', impact: 45, students: 12 },
        { month: 'Şub', impact: 52, students: 15 },
        { month: 'Mar', impact: 61, students: 19 },
        { month: 'Nis', impact: 58, students: 22 },
        { month: 'May', impact: 72, students: 28 },
        { month: 'Haz', impact: 85, students: 35 },
        { month: 'Tem', impact: 92, students: 41 },
        { month: 'Ağu', impact: 88, students: 44 },
    ];

    const sdgData = [
        { name: 'SDG 4 – Nitelikli Eğitim', value: 40, color: '#ef4444' },
        { name: 'SDG 10 – Eşitsizlik Azaltma', value: 25, color: '#f97316' },
        { name: 'SDG 5 – Cinsiyet Eşitliği', value: 20, color: '#eab308' },
        { name: 'SDG 1 – Yoksulluğa Son', value: 15, color: '#22c55e' },
    ];

    const genderData = [
        { name: 'Kadın', value: 58, color: '#ec4899' },
        { name: 'Erkek', value: 36, color: '#3b82f6' },
        { name: 'Diğer', value: 4, color: '#a855f7' },
        { name: 'Belirtilmemiş', value: 2, color: '#94a3b8' },
    ];

    const regionData = [
        { region: 'Güneydoğu Anadolu', students: 18 },
        { region: 'Doğu Anadolu', students: 14 },
        { region: 'İç Anadolu', students: 12 },
        { region: 'Karadeniz', students: 9 },
        { region: 'Akdeniz', students: 7 },
    ];

    const esgScore = 87;
    const envScore = 92;
    const socScore = 88;
    const govScore = 81;

    const totalStudents = 44;
    const totalDonation = 125000;
    const educationHours = 22727;
    const countriesReached = 3;

    return (
        <div className="min-h-screen bg-gray-50">
            <CorporateHeader
                title={t('corporate.esg.title')}
                subtitle={t('corporate.esg.subtitle')}
            />

            <div className="p-4 md:p-6 space-y-6">
                {/* ============================================================ */}
                {/* SECTION 1: ESG Skorları (E / S / G)                          */}
                {/* ============================================================ */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Environmental */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-green-100 p-3 rounded-xl">
                                <Leaf className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">{t('corporate.esg.environmental')}</h3>
                                <p className="text-sm text-gray-500">{t('app.page.dijital_operasyon_etkisi')}</p>
                            </div>
                        </div>
                        <div className="flex items-end gap-2 mb-3">
                            <span className="text-4xl font-bold text-green-600">{envScore}</span>
                            <span className="text-gray-500 mb-1">/100</span>
                        </div>
                        <Progress value={envScore} className="h-2 bg-green-100" />
                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <div className="bg-white/60 rounded-lg p-3">
                                <p className="text-xs text-gray-500">{t('app.page.ka_t_tasarrufu')}</p>
                                <p className="text-lg font-bold text-gray-900">{t('app.page.24_5_kg')}</p>
                            </div>
                            <div className="bg-white/60 rounded-lg p-3">
                                <p className="text-xs text-gray-500">{t('app.page.co_ofseti')}</p>
                                <p className="text-lg font-bold text-gray-900">{t('app.page.6_25_tco_e')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Social */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-blue-100 p-3 rounded-xl">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">{t('corporate.esg.social')}</h3>
                                <p className="text-sm text-gray-500">{t('app.page.toplumsal_katk')}</p>
                            </div>
                        </div>
                        <div className="flex items-end gap-2 mb-3">
                            <span className="text-4xl font-bold text-blue-600">{socScore}</span>
                            <span className="text-gray-500 mb-1">/100</span>
                        </div>
                        <Progress value={socScore} className="h-2 bg-blue-100" />
                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <div className="bg-white/60 rounded-lg p-3">
                                <p className="text-xs text-gray-500">{t('app.page.kad_n_faydalan_c')}</p>
                                <p className="text-lg font-bold text-gray-900">%58</p>
                            </div>
                            <div className="bg-white/60 rounded-lg p-3">
                                <p className="text-xs text-gray-500">{t('app.page.e_itim_saati')}</p>
                                <p className="text-lg font-bold text-gray-900">22.7k</p>
                            </div>
                        </div>
                    </div>

                    {/* Governance */}
                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-purple-100 p-3 rounded-xl">
                                <Building2 className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">{t('corporate.esg.governance')}</h3>
                                <p className="text-sm text-gray-500">{t('app.page.effafl_k_denetim')}</p>
                            </div>
                        </div>
                        <div className="flex items-end gap-2 mb-3">
                            <span className="text-4xl font-bold text-purple-600">{govScore}</span>
                            <span className="text-gray-500 mb-1">/100</span>
                        </div>
                        <Progress value={govScore} className="h-2 bg-purple-100" />
                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <div className="bg-white/60 rounded-lg p-3">
                                <p className="text-xs text-gray-500">{t('app.page.zlenebilirlik')}</p>
                                <p className="text-lg font-bold text-gray-900">%100</p>
                            </div>
                            <div className="bg-white/60 rounded-lg p-3">
                                <p className="text-xs text-gray-500">{t('app.page.kyc_oran')}</p>
                                <p className="text-lg font-bold text-gray-900">%94</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ============================================================ */}
                {/* SECTION 2: Genel ESG Puanı + Badges                          */}
                {/* ============================================================ */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900">{t('corporate.esg.overallScore')}</h3>
                            <p className="text-gray-500 text-sm">{t('corporate.esg.basedOnActivities')}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-3 md:mt-0">
                            <Badge className="bg-green-100 text-green-700 text-base px-4 py-1.5 font-semibold">
                                {t('app.page.a_derece')}</Badge>
                            <Badge className="bg-blue-100 text-blue-700 text-sm px-3 py-1">
                                {t('app.page.gri_uyumlu')}</Badge>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* Circular Gauge */}
                        <div className="relative w-44 h-44 flex-shrink-0">
                            <svg className="w-full h-full" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                                <circle
                                    cx="50" cy="50" r="45" fill="none"
                                    stroke="url(#esg-gradient)" strokeWidth="8"
                                    strokeDasharray={`${esgScore * 2.83} 283`}
                                    strokeLinecap="round"
                                    transform="rotate(-90 50 50)"
                                />
                                <defs>
                                    <linearGradient id="esg-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#22c55e" />
                                        <stop offset="50%" stopColor="#3b82f6" />
                                        <stop offset="100%" stopColor="#8b5cf6" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-bold text-gray-900">{esgScore}</span>
                                <span className="text-xs text-gray-500 font-medium">/ 100</span>
                            </div>
                        </div>
                        {/* Highlights Grid */}
                        <div className="flex-1 grid grid-cols-2 gap-4 w-full">
                            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                                <Award className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                                <div>
                                    <p className="font-medium text-gray-900 text-sm">{t('app.page.sekt_r_s_ralamas')}</p>
                                    <p className="text-gray-500 text-xs">{t('app.page.lk_10_i_inde')}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                                <TrendingUp className="h-5 w-5 text-green-500 flex-shrink-0" />
                                <div>
                                    <p className="font-medium text-gray-900 text-sm">{t('app.page.y_ll_k_art')}</p>
                                    <p className="text-gray-500 text-xs">{t('app.page.ge_en_y_la_g_re_15')}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                                <Globe className="h-5 w-5 text-blue-500 flex-shrink-0" />
                                <div>
                                    <p className="font-medium text-gray-900 text-sm">{t('app.page.global_eri_im')}</p>
                                    <p className="text-gray-500 text-xs">{countriesReached} {t('app.page.lkede_etki')}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                                <Heart className="h-5 w-5 text-red-500 flex-shrink-0" />
                                <div>
                                    <p className="font-medium text-gray-900 text-sm">{t('app.page.toplumsal_katk')}</p>
                                    <p className="text-gray-500 text-xs">{totalStudents} {t('app.page.hayata_dokunuldu')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ============================================================ */}
                {/* SECTION 3: Önemli Rakamlar (KPI Stat Cards)                  */}
                {/* ============================================================ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title={t('app.page.desteklenen_renci')}
                        value={totalStudents}
                        subtitle="12 ilden bursiyerler"
                        icon={GraduationCap}
                        trend={{ value: 18, positive: true }}
                    />
                    <StatCard
                        title={t('app.page.toplam_ba')}
                        value={formatAmount(totalDonation)}
                        subtitle="Doğrulanmış katkılar"
                        icon={Banknote}
                        trend={{ value: 12, positive: true }}
                    />
                    <StatCard
                        title={t('app.page.e_itim_saati_e_de_eri')}
                        value={educationHours.toLocaleString('tr-TR')}
                        subtitle="Akademik saat karşılığı"
                        icon={BookOpen}
                    />
                    <StatCard
                        title={t('app.page.ula_lan_b_lge')}
                        value={countriesReached}
                        subtitle="Farklı coğrafya"
                        icon={MapPin}
                    />
                </div>

                {/* ============================================================ */}
                {/* SECTION 4: Grafikler – Etki Trendi + SDG Dağılımı            */}
                {/* ============================================================ */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Impact Trend – Area Chart */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-blue-500" />
                                {t('app.page.ayl_k_etki_trendi')}</h3>
                            <Badge variant="outline" className="text-xs">2026</Badge>
                        </div>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={impactData}>
                                    <defs>
                                        <linearGradient id="impactGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                                    <YAxis stroke="#94a3b8" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '13px' }}
                                        formatter={(v: any, name: any) => {
                                            const label = name === 'impact' ? 'Etki Puanı' : 'Öğrenci';
                                            return [v, label];
                                        }}
                                    />
                                    <Area type="monotone" dataKey="impact" stroke="#3b82f6" strokeWidth={2.5} fill="url(#impactGrad)" />
                                    <Area type="monotone" dataKey="students" stroke="#10b981" strokeWidth={2} fill="none" strokeDasharray="5 5" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex items-center gap-6 mt-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-blue-500 rounded inline-block"></span> {t('app.page.etki_puan')}</span>
                            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-emerald-500 rounded inline-block border-dashed"></span> {t('app.page.renci_say_s')}</span>
                        </div>
                    </div>

                    {/* SDG Distribution – Pie + Legend */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Target className="h-5 w-5 text-orange-500" />
                            {t('app.page.bm_s_rd_r_lebilir_kalk_nma_ama')}</h3>
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="w-52 h-52 flex-shrink-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={sdgData}
                                            cx="50%" cy="50%"
                                            innerRadius={50} outerRadius={85}
                                            paddingAngle={3}
                                            dataKey="value"
                                            strokeWidth={0}
                                        >
                                            {sdgData.map((entry, i) => (
                                                <Cell key={`cell-${i}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(v: any) => [`%${v}`, 'Katkı']} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex-1 space-y-3 w-full">
                                {sdgData.map((sdg) => (
                                    <div key={sdg.name} className="flex items-center gap-3">
                                        <div
                                            className="w-4 h-4 rounded flex-shrink-0"
                                            style={{ backgroundColor: sdg.color }}
                                        />
                                        <span className="text-sm text-gray-700 flex-1">{sdg.name}</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 bg-gray-100 rounded-full h-1.5">
                                                <div
                                                    className="h-1.5 rounded-full"
                                                    style={{ width: `${sdg.value}%`, backgroundColor: sdg.color }}
                                                />
                                            </div>
                                            <span className="text-sm font-semibold text-gray-900 w-8 text-right">%{sdg.value}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ============================================================ */}
                {/* SECTION 5: Cinsiyet Dağılımı + Bölgesel Erişim               */}
                {/* ============================================================ */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Gender Pie */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                            <Users className="h-5 w-5 text-pink-500" />
                            {t('app.page.cinsiyet_e_itli_i_analizi_sdg_')}</h3>
                        <p className="text-sm text-gray-500 mb-4">{t('app.page.desteklenen_rencilerin_cinsiye')}</p>
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="w-48 h-48 flex-shrink-0 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={genderData}
                                            cx="50%" cy="50%"
                                            innerRadius={55} outerRadius={75}
                                            paddingAngle={4}
                                            dataKey="value"
                                            strokeWidth={0}
                                        >
                                            {genderData.map((entry, i) => (
                                                <Cell key={`g-${i}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(v: any) => [`%${v}`, 'Oran']} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-2xl font-bold text-gray-900">%58</span>
                                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">{t('app.page.kad_n')}</span>
                                </div>
                            </div>
                            <div className="flex-1 space-y-2.5 w-full">
                                {genderData.map((g) => (
                                    <div key={g.name} className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: g.color }} />
                                        <span className="text-sm text-gray-600 flex-1">{g.name}</span>
                                        <span className="text-sm font-semibold text-gray-900">%{g.value}</span>
                                    </div>
                                ))}
                                <div className="mt-3 bg-pink-50 rounded-lg p-3 border border-pink-100">
                                    <p className="text-xs text-pink-700 flex items-center gap-1.5">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        {t('app.page.kad_n_faydalan_c_oran_n_z_sekt')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Regional Impact – Bar Chart */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-indigo-500" />
                            {t('app.page.b_lgesel_eri_im_sdg_10')}</h3>
                        <p className="text-sm text-gray-500 mb-4">{t('app.page.dezavantajl_b_lgelere_sa_lanan')}</p>
                        <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={regionData} layout="vertical" margin={{ left: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                    <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                                    <YAxis dataKey="region" type="category" stroke="#94a3b8" fontSize={11} width={130} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '13px' }}
                                        formatter={(v: any) => [`${v} öğrenci`, 'Destek']}
                                    />
                                    <Bar dataKey="students" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={18} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* ============================================================ */}
                {/* SECTION 6: Etki Metrikleri Detay Paneli                      */}
                {/* ============================================================ */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-green-600" />
                            {t('app.page.do_rulanm_etki_metrikleri')}</h3>
                        <Button variant="outline" size="sm" className="gap-1.5 text-gray-600 text-xs">
                            <Download className="h-3.5 w-3.5" /> {t('app.page.csv_ndir')}</Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center p-5 bg-blue-50 rounded-xl border border-blue-100">
                            <GraduationCap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                            <div className="text-3xl font-bold text-blue-600">{totalStudents}</div>
                            <p className="text-gray-600 text-sm mt-1">{t('app.page.desteklenen_renci')}</p>
                        </div>
                        <div className="text-center p-5 bg-green-50 rounded-xl border border-green-100">
                            <TreePine className="h-8 w-8 text-green-600 mx-auto mb-2" />
                            <div className="text-3xl font-bold text-green-600">{countriesReached}</div>
                            <p className="text-gray-600 text-sm mt-1">{t('app.page.ula_lan_lke')}</p>
                        </div>
                        <div className="text-center p-5 bg-purple-50 rounded-xl border border-purple-100">
                            <Banknote className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                            <div className="text-3xl font-bold text-purple-600">{formatAmount(totalDonation)}</div>
                            <p className="text-gray-600 text-sm mt-1">{t('app.page.toplam_ba')}</p>
                        </div>
                        <div className="text-center p-5 bg-orange-50 rounded-xl border border-orange-100">
                            <Heart className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                            <div className="text-3xl font-bold text-orange-600">{totalStudents}</div>
                            <p className="text-gray-600 text-sm mt-1">{t('app.page.de_i_en_hayat')}</p>
                        </div>
                    </div>
                </div>

                {/* ============================================================ */}
                {/* SECTION 6.5: Bağış Detayları (Genişletilebilir)               */}
                {/* ============================================================ */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <button
                        onClick={() => setDonationsExpanded(!donationsExpanded)}
                        className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-indigo-50 p-2.5 rounded-lg">
                                <Receipt className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-lg font-semibold text-gray-900">{t('app.page.ba_detaylar_makbuz_bilgileri')}</h3>
                                <p className="text-sm text-gray-500">{donationRecords.length} {t('app.page.adet_bireysel_ba_kayd_makbuz_r')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge className="bg-green-100 text-green-700">{formatAmount(totalDonation)}</Badge>
                            {donationsExpanded ? (
                                <ChevronUp className="h-5 w-5 text-gray-400" />
                            ) : (
                                <ChevronDown className="h-5 w-5 text-gray-400" />
                            )}
                        </div>
                    </button>

                    {donationsExpanded && (
                        <div className="border-t border-gray-100">
                            {/* Table Header */}
                            <div className="grid grid-cols-12 gap-3 px-6 py-3 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <div className="col-span-1">{t('app.page.tarih')}</div>
                                <div className="col-span-2">{t('app.page.makbuz_no')}</div>
                                <div className="col-span-2">{t('app.page.renci')}</div>
                                <div className="col-span-3">{t('app.page.kampanya')}</div>
                                <div className="col-span-2 text-right">{t('app.page.tutar')}</div>
                                <div className="col-span-2 text-center">{t('app.page.durum')}</div>
                            </div>
                            {/* Donation Rows */}
                            {donationRecords.map((donation, index) => (
                                <div
                                    key={donation.id}
                                    className={`grid grid-cols-12 gap-3 px-6 py-4 items-center text-sm ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                                        } hover:bg-blue-50/50 transition-colors`}
                                >
                                    <div className="col-span-1 flex items-center gap-1.5 text-gray-600 text-xs">
                                        <CalendarDays className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                        {new Date(donation.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}
                                    </div>
                                    <div className="col-span-2">
                                        <span className="font-mono text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2 py-1 rounded inline-flex items-center gap-1">
                                            <Stamp className="h-3 w-3" />
                                            {donation.makbuzNo}
                                        </span>
                                    </div>
                                    <div className="col-span-2 font-medium text-gray-900 text-sm">{donation.studentName}</div>
                                    <div className="col-span-3 text-gray-600 text-sm">{donation.campaign}</div>
                                    <div className="col-span-2 text-right font-semibold text-gray-900">{formatAmount(donation.amount)}</div>
                                    <div className="col-span-2 text-center">
                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                            {t('app.page.onayl')}</span>
                                    </div>
                                </div>
                            ))}
                            {/* Summary Footer */}
                            <div className="grid grid-cols-12 gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
                                <div className="col-span-8 text-sm font-semibold text-gray-700">{t('app.page.toplam')}{donationRecords.length} {t('app.page.ba')}</div>
                                <div className="col-span-2 text-right text-sm font-bold text-gray-900">{formatAmount(totalDonation)}</div>
                                <div className="col-span-2"></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ============================================================ */}
                {/* SECTION 6.75: Vergi Uyumu & Yasal Bilgilendirme              */}
                {/* ============================================================ */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-amber-50 p-2.5 rounded-lg">
                            <Scale className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">{t('app.page.vergi_uyumu_yasal_bilgilendirm')}</h3>
                            <p className="text-sm text-gray-500">{t('app.page.kvk_madde_10_gvk_madde_89_kaps')}</p>
                        </div>
                    </div>

                    {/* Company Tax Info */}
                    <div className="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-100">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <FileCheck className="h-4 w-4 text-gray-500" />
                            {t('app.page.ba_kurum_bilgileri')}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-500">{t('app.page.kurum_unvan')}</p>
                                <p className="text-sm font-semibold text-gray-900">{companyTaxInfo.companyName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">{t('app.page.vergi_kimlik_numaras_vkn')}</p>
                                <p className="text-sm font-mono font-semibold text-gray-900">{companyTaxInfo.vkn}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">{t('app.page.vergi_dairesi')}</p>
                                <p className="text-sm font-semibold text-gray-900">{companyTaxInfo.taxOffice}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">{t('app.page.adres')}</p>
                                <p className="text-sm text-gray-900">{companyTaxInfo.address}</p>
                            </div>
                        </div>
                    </div>

                    {/* Legal Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="border border-green-200 bg-green-50 rounded-xl p-4">
                            <h4 className="text-sm font-semibold text-green-800 mb-2">{t('app.page.tamam_ndirilebilir_100')}</h4>
                            <ul className="text-xs text-green-700 space-y-1.5">
                                <li>{t('app.page.devlet_niversitelerine_yap_lan')}</li>
                                <li>{t('app.page.genel_zel_b_t_eli_idarelere_ok')}</li>
                                <li>{t('app.page.cumhurba_kan_nca_vergi_muafiye')}</li>
                            </ul>
                            <p className="text-xs text-green-600 mt-2 italic">{t('app.page.kvk_madde_10_1_c_d_e')}</p>
                        </div>
                        <div className="border border-blue-200 bg-blue-50 rounded-xl p-4">
                            <h4 className="text-sm font-semibold text-blue-800 mb-2">{t('app.page.s_n_rl_ndirim_kazanc_n_5_apos_')}</h4>
                            <ul className="text-xs text-blue-700 space-y-1.5">
                                <li>{t('app.page.kamu_yarar_na_al_an_dernek_ve_')}</li>
                                <li>{t('app.page.vergi_muafiyeti_olmayan_vak_fl')}</li>
                                <li>{t('app.page.di_er_sosyal_sorumluluk_katk_l')}</li>
                            </ul>
                            <p className="text-xs text-blue-600 mt-2 italic">{t('app.page.kvk_madde_10_1_c')}</p>
                        </div>
                    </div>

                    {/* FundEd's Position & Requirements */}
                    <div className="border border-amber-200 bg-amber-50 rounded-xl p-4 mb-5">
                        <div className="flex gap-3">
                            <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-semibold text-amber-800 mb-1">{t('app.page.funded_zerinden_yap_lan_ba_lar')}</h4>
                                <p className="text-xs text-amber-700 leading-relaxed">
                                    {t('app.page.funded_zerinden_yap_lan_ba_lar')}<strong> {t('app.page.kamu_yarar_na_al_an_dernek_vey')}</strong> {t('app.page.arac_l_yla_ger_ekle_tirilmesi_')}<strong>{t('app.page.ba_makbuzu')}</strong> {t('app.page.d_zenlenmesi_gerekmektedir_her')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Conditions Checklist */}
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">{t('app.page.ndirim_in_gerekli_artlar')}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                            {[
                                'Bağış makbuzu veya fatura düzenlenmeli',
                                'Nakdi bağışlar bankadan yapılmalı',
                                'Beyannamede ayrıca gösterilmeli',
                                'Kurum kazancı bulunmalı (zarar varsa uygulanmaz)',
                                'İndirilemeyen kısım sonraki yıla devretmez',
                                'Fiilen ödendiği dönemde indirilir',
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-2">
                                    <div className="w-5 h-5 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-[10px] font-bold text-gray-500">{i + 1}</span>
                                    </div>
                                    <p className="text-xs text-gray-600">{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ============================================================ */}
                {/* SECTION 7: Rapor İndirme CTA                                 */}
                {/* ============================================================ */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <Award className="h-6 w-6 text-yellow-400" />
                            {t('app.page.resmi_esg_sertifikan_z_ndirin')}</h3>
                        <p className="text-gray-300 mt-2 max-w-xl text-sm">
                            {t('app.page.do_rulanm_ba_lar_n_z_ve_sosyal')}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <Button className="bg-white text-gray-900 hover:bg-gray-100 gap-2 font-semibold">
                            <Download className="h-4 w-4" /> {t('app.page.esg_raporu_pdf')}</Button>
                        <Button variant="outline" className="border-gray-500 text-gray-200 hover:bg-gray-700 gap-2">
                            <Stamp className="h-4 w-4" /> {t('app.page.makbuz_zeti')}</Button>
                    </div>
                </div>

                {/* Legal Disclaimer */}
                <p className="text-[11px] text-gray-400 text-center leading-relaxed max-w-3xl mx-auto">
                    {t('app.page.bu_rapor_bilgilendirme_ama_l_d')}{new Date().getFullYear()} {t('app.page.funded_t_m_haklar_sakl_d_r')}</p>
            </div>
        </div>
    );
}
