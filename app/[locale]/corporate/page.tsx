'use client';

import React from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import {
    DollarSign,
    Users,
    TrendingUp,
    Target,
    ArrowRight,
} from 'lucide-react';
import CorporateHeader from '@/components/corporate/Header';
import StatCard from '@/components/corporate/StatCard';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/context';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type DashboardResponse = {
    success: boolean;
    data?: {
        stats: {
            totalMatchedAllTime: number;
            affectedStudents: number;
            approvedTxCount: number;
            pendingTxCount: number;
            rejectedTxCount: number;
            currentPeriodSpent: number;
            monthlyBudget: number;
            budgetUsedPct: number;
        };
        donationTrend: Array<{ periodKey: string; matched: number }>;
        facultyDistribution: Array<{ name: string; value: number }>;
    };
    error?: string;
};

export default function CorporateDashboard() {
    const { t } = useTranslation();
    const { data, error, isLoading } = useSWR<DashboardResponse>(
        '/api/corporate/dashboard',
        fetcher
    );

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0,
        }).format(value);

    if (isLoading) {
        return (
            <div className="min-h-screen p-6">
                <CorporateHeader
                    title={t('corporate.dashboard')}
                    subtitle={t('corporate.welcomeMessage')}
                />
                <p className="p-6 text-gray-600">Loading...</p>
            </div>
        );
    }

    if (error || !data?.success || !data.data) {
        return (
            <div className="min-h-screen p-6">
                <CorporateHeader
                    title={t('corporate.dashboard')}
                    subtitle={t('corporate.welcomeMessage')}
                />
                <div className="p-6">
                    <p className="text-red-600">
                        {data?.error ?? 'Dashboard verileri yüklenemedi.'}
                    </p>
                </div>
            </div>
        );
    }

    const { stats, donationTrend, facultyDistribution } = data.data;
    const trendData = donationTrend.map((p) => ({
        month: p.periodKey,
        amount: p.matched,
    }));

    return (
        <div className="min-h-screen">
            <CorporateHeader
                title={t('corporate.dashboard')}
                subtitle={t('corporate.welcomeMessage')}
            />

            <div className="p-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title={t('corporate.totalDonations')}
                        value={formatCurrency(stats.totalMatchedAllTime)}
                        subtitle={`${t('corporate.thisMonth')}: ${formatCurrency(stats.currentPeriodSpent)}`}
                        icon={DollarSign}
                    />
                    <StatCard
                        title={t('corporate.supportedStudents')}
                        value={stats.affectedStudents}
                        subtitle={`${stats.approvedTxCount} işlem onaylandı`}
                        icon={Users}
                    />
                    <StatCard
                        title="Bekleyen Onay"
                        value={stats.pendingTxCount}
                        subtitle={`${stats.rejectedTxCount} reddedilen`}
                        icon={TrendingUp}
                    />
                    <StatCard
                        title="Bütçe Kullanımı"
                        value={`${Math.round(stats.budgetUsedPct * 100)}%`}
                        subtitle={`${formatCurrency(stats.currentPeriodSpent)} / ${formatCurrency(stats.monthlyBudget)}`}
                        icon={Target}
                    />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Donation Trend Chart */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            {t('corporate.donationTrend')}
                        </h3>
                        <div className="h-80">
                            {trendData.every((p) => p.amount === 0) ? (
                                <div className="flex h-full items-center justify-center text-gray-500">
                                    Henüz onaylanmış eşleştirme yok.
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={trendData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                        <XAxis dataKey="month" stroke="#9CA3AF" />
                                        <YAxis
                                            stroke="#9CA3AF"
                                            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                                        />
                                        <Tooltip
                                            formatter={(value) => [
                                                formatCurrency(Number(value)),
                                                'Eşleştirilen',
                                            ]}
                                            contentStyle={{
                                                backgroundColor: '#fff',
                                                border: '1px solid #E5E7EB',
                                                borderRadius: '8px',
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="amount"
                                            stroke="#3B82F6"
                                            strokeWidth={3}
                                            dot={{ fill: '#3B82F6', strokeWidth: 2 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* Faculty Distribution (Phase 3 status: still mock — Student-profile join deferred) */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            {t('corporate.facultyDistribution')}
                        </h3>
                        <div className="h-80 flex items-center">
                            <ResponsiveContainer width="50%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={facultyDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {facultyDistribution.map((_, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex-1 space-y-3">
                                {facultyDistribution.map((item, index) => (
                                    <div key={item.name} className="flex items-center gap-3">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                        />
                                        <span className="text-sm text-gray-600 flex-1">{item.name}</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {item.value}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick links */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Eşleştirme İşlemleri
                            </h3>
                            <Link href="/corporate/transactions">
                                <Button variant="ghost" size="sm">
                                    Tümü <ArrowRight className="ml-1 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                        <p className="text-gray-600">
                            {stats.pendingTxCount} bekleyen, {stats.approvedTxCount} onaylanan,{' '}
                            {stats.rejectedTxCount} reddedilen işlem.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                ESG Yıllık Raporu
                            </h3>
                            <a
                                href={`/api/corporate/esg/report?year=${new Date().getFullYear()}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Button variant="ghost" size="sm">
                                    PDF İndir <ArrowRight className="ml-1 h-4 w-4" />
                                </Button>
                            </a>
                        </div>
                        <p className="text-gray-600">
                            Onaylı eşleştirmelerinizden otomatik üretilen yıllık raporu PDF olarak
                            indirin.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
