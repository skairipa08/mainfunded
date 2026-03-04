"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area } from "recharts";
import { LucideLineChart, PieChart as PieChartIcon } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";

interface ImpactChartsProps {
    metrics: {
        social: {
            female_beneficiary_ratio: number;
        }
    };
}

export function ImpactCharts({ metrics }: ImpactChartsProps) {
    const { t } = useTranslation();
    const genderData = [
        { name: "Kadın Öğrenci", value: metrics.social.female_beneficiary_ratio },
        { name: "Erkek Öğrenci", value: 100 - metrics.social.female_beneficiary_ratio },
    ];

    // Modern vibrant gradient colors
    const COLORS = ["#3b82f6", "#e2e8f0"];

    // Mock data with a realistic growth curve for the Area chart
    const yearlyData = [
        { year: "2021", impactHours: 1200 },
        { year: "2022", impactHours: 4100 },
        { year: "2023", impactHours: 9800 },
        { year: "2024", impactHours: 19500 },
    ];

    const CustomTooltip = ({ active, payload, label }: any) => {
        const { t } = useTranslation();
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xl">
                    <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">{label}</p>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: payload[0].color || payload[0].fill }}></div>
                        <p className="text-slate-700 dark:text-slate-300">
                            <span className="font-bold">{Number(payload[0].value).toLocaleString()}</span>
                            <span className="text-sm ml-1 text-slate-500">{t('components.impactcharts.saat_e_itim_e_de_eri')}</span>
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="grid gap-6 md:grid-cols-2 mt-8">

            {/* Impact Growth Trend - Area Chart */}
            <Card className="shadow-lg border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <LucideLineChart className="w-5 h-5 text-indigo-500" />
                                {t('components.impactcharts.k_m_latif_etki_b_y_mesi')}</CardTitle>
                            <CardDescription className="mt-1">{t('components.impactcharts.y_llara_g_re_sa_lanan_e_itim_s')}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="h-[350px] p-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={yearlyData}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorImpact" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
                            <XAxis
                                dataKey="year"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'currentColor', fontSize: 12 }}
                                className="text-slate-500 dark:text-slate-400"
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'currentColor', fontSize: 12 }}
                                tickFormatter={(value) => `${value / 1000}k`}
                                className="text-slate-500 dark:text-slate-400"
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '5 5' }} />
                            <Area
                                type="monotone"
                                dataKey="impactHours"
                                stroke="#6366f1"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorImpact)"
                                activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5' }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Demographics - Custom Pie Chart */}
            <Card className="shadow-lg border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/20">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <PieChartIcon className="w-5 h-5 text-blue-500" />
                            {t('components.impactcharts.cinsiyet_e_itli_i_katk_s_sdg_5')}</CardTitle>
                        <CardDescription className="mt-1">{t('components.impactcharts.bursiyerlerinizin_demografik_d')}</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="h-[350px] flex items-center justify-center p-6">
                    <div className="w-full h-full relative">
                        {/* Center text overlay */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-4xl font-black text-slate-800 dark:text-slate-100">
                                %{metrics.social.female_beneficiary_ratio}
                            </span>
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">
                                KADIN
                            </span>
                        </div>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={genderData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={90}
                                    outerRadius={120}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {genderData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: any) => [`%${Number(value).toFixed(1)}`, "Oran"]}
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        backdropFilter: 'blur(8px)',
                                        color: '#0f172a'
                                    }}
                                    itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    formatter={(value) => <span className="text-slate-700 dark:text-slate-300 font-medium">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}
