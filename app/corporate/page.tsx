'use client';

import React from 'react';
import Link from 'next/link';
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
    BarChart,
    Bar,
} from 'recharts';
import {
    DollarSign,
    Users,
    TrendingUp,
    Target,
    GraduationCap,
    ArrowRight,
} from 'lucide-react';
import CorporateHeader from '@/components/corporate/Header';
import StatCard from '@/components/corporate/StatCard';
import { Button } from '@/components/ui/button';
import {
    mockDashboardStats,
    mockDonationTrend,
    mockFacultyDistribution,
    mockStudents,
    mockCampaigns,
} from '@/lib/corporate/mock-data';
import { useTranslation } from '@/lib/i18n/context';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function CorporateDashboard() {
    const { t } = useTranslation();
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(value);
    };

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
                        value={formatCurrency(mockDashboardStats.totalDonations.allTime)}
                        subtitle={`${t('corporate.thisMonth')}: ${formatCurrency(mockDashboardStats.totalDonations.thisMonth)}`}
                        icon={DollarSign}
                        trend={{ value: 12, positive: true }}
                    />
                    <StatCard
                        title={t('corporate.supportedStudents')}
                        value={mockDashboardStats.studentsSupported}
                        subtitle={`${mockDashboardStats.graduatedStudents} ${t('corporate.graduated')}`}
                        icon={Users}
                        trend={{ value: 8, positive: true }}
                    />
                    <StatCard
                        title={t('corporate.averageDonation')}
                        value={formatCurrency(mockDashboardStats.averageDonation)}
                        icon={TrendingUp}
                    />
                    <StatCard
                        title={t('corporate.activeCampaigns')}
                        value={mockDashboardStats.activeCampaigns}
                        icon={Target}
                    />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Donation Trend Chart */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            {t('corporate.donationTrend')} (2025)
                        </h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={mockDonationTrend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                    <XAxis dataKey="month" stroke="#9CA3AF" />
                                    <YAxis stroke="#9CA3AF" tickFormatter={(v) => `$${v / 1000}k`} />
                                    <Tooltip
                                        formatter={(value) => [formatCurrency(Number(value)), 'Bagis']}
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
                        </div>
                    </div>

                    {/* Faculty Distribution */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            {t('corporate.facultyDistribution')}
                        </h3>
                        <div className="h-80 flex items-center">
                            <ResponsiveContainer width="50%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={mockFacultyDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {mockFacultyDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex-1 space-y-3">
                                {mockFacultyDistribution.map((item, index) => (
                                    <div key={item.name} className="flex items-center gap-3">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                        />
                                        <span className="text-sm text-gray-600 flex-1">{item.name}</span>
                                        <span className="text-sm font-medium text-gray-900">{item.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Students & Active Campaigns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Students */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {t('corporate.recentStudents')}
                            </h3>
                            <Link href="/corporate/students">
                                <Button variant="ghost" size="sm">
                                    {t('corporate.viewAll')} <ArrowRight className="ml-1 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {mockStudents.slice(0, 4).map((student) => (
                                <div key={student.id} className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                        <GraduationCap className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">{student.name}</p>
                                        <p className="text-sm text-gray-500 truncate">
                                            {student.university} - {student.department}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-gray-900">
                                            {formatCurrency(student.total_donated)}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            / {formatCurrency(student.goal_amount)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Active Campaigns */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {t('corporate.activeCampaigns')}
                            </h3>
                            <Link href="/corporate/campaigns">
                                <Button variant="ghost" size="sm">
                                    {t('corporate.viewAll')} <ArrowRight className="ml-1 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {mockCampaigns
                                .filter((c) => c.status === 'active')
                                .slice(0, 3)
                                .map((campaign) => (
                                    <div key={campaign.id} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium text-gray-900">{campaign.title}</p>
                                            <span className="text-sm text-gray-500">
                                                {campaign.student_count} {t('corporate.students')}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all"
                                                style={{
                                                    width: `${(campaign.raised_amount / campaign.goal_amount) * 100}%`,
                                                }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-500">
                                            <span>{formatCurrency(campaign.raised_amount)}</span>
                                            <span>{formatCurrency(campaign.goal_amount)}</span>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
