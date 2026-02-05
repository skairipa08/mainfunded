'use client';

import React from 'react';
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
} from 'lucide-react';
import CorporateHeader from '@/components/corporate/Header';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
} from 'recharts';
import { useTranslation } from '@/lib/i18n/context';

export default function ESGPage() {
    const { t } = useTranslation();

    const impactData = [
        { month: 'Oca', impact: 45 },
        { month: 'Sub', impact: 52 },
        { month: 'Mar', impact: 61 },
        { month: 'Nis', impact: 58 },
        { month: 'May', impact: 72 },
        { month: 'Haz', impact: 85 },
    ];

    const sdgData = [
        { name: 'SDG 4', value: 40, color: '#ef4444' },
        { name: 'SDG 10', value: 25, color: '#f97316' },
        { name: 'SDG 5', value: 20, color: '#eab308' },
        { name: 'SDG 1', value: 15, color: '#22c55e' },
    ];

    const esgScore = 87;

    return (
        <div className="min-h-screen">
            <CorporateHeader
                title={t('corporate.esg.title')}
                subtitle={t('corporate.esg.subtitle')}
            />

            <div className="p-6">
                {/* ESG Score Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 border border-green-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-green-100 p-3 rounded-xl">
                                <Leaf className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">{t('corporate.esg.environmental')}</h3>
                                <p className="text-sm text-gray-500">Environmental</p>
                            </div>
                        </div>
                        <div className="flex items-end gap-2 mb-2">
                            <span className="text-4xl font-bold text-green-600">92</span>
                            <span className="text-gray-500 mb-1">/100</span>
                        </div>
                        <Progress value={92} className="h-2 bg-green-100" />
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-blue-100 p-3 rounded-xl">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">{t('corporate.esg.social')}</h3>
                                <p className="text-sm text-gray-500">Social</p>
                            </div>
                        </div>
                        <div className="flex items-end gap-2 mb-2">
                            <span className="text-4xl font-bold text-blue-600">88</span>
                            <span className="text-gray-500 mb-1">/100</span>
                        </div>
                        <Progress value={88} className="h-2 bg-blue-100" />
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-6 border border-purple-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-purple-100 p-3 rounded-xl">
                                <Building2 className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">{t('corporate.esg.governance')}</h3>
                                <p className="text-sm text-gray-500">Governance</p>
                            </div>
                        </div>
                        <div className="flex items-end gap-2 mb-2">
                            <span className="text-4xl font-bold text-purple-600">81</span>
                            <span className="text-gray-500 mb-1">/100</span>
                        </div>
                        <Progress value={81} className="h-2 bg-purple-100" />
                    </div>
                </div>

                {/* Overall ESG Score */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900">{t('corporate.esg.overallScore')}</h3>
                            <p className="text-gray-500">{t('corporate.esg.basedOnActivities')}</p>
                        </div>
                        <Badge className="bg-green-100 text-green-700 text-lg px-4 py-2">
                            {t('corporate.esg.aPlus')}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="relative w-40 h-40">
                            <svg className="w-full h-full" viewBox="0 0 100 100">
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    fill="none"
                                    stroke="#e5e7eb"
                                    strokeWidth="10"
                                />
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    fill="none"
                                    stroke="url(#gradient)"
                                    strokeWidth="10"
                                    strokeDasharray={`${esgScore * 2.83} 283`}
                                    strokeLinecap="round"
                                    transform="rotate(-90 50 50)"
                                />
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#22c55e" />
                                        <stop offset="100%" stopColor="#3b82f6" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-4xl font-bold text-gray-900">{esgScore}</span>
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <Award className="h-5 w-5 text-yellow-500" />
                                    <span className="text-gray-600">{t('corporate.esg.top10')}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <TrendingUp className="h-5 w-5 text-green-500" />
                                    <span className="text-gray-600">{t('corporate.esg.percentIncrease')}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Globe className="h-5 w-5 text-blue-500" />
                                    <span className="text-gray-600">{t('corporate.esg.globalImpact')}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Heart className="h-5 w-5 text-red-500" />
                                    <span className="text-gray-600">{t('corporate.esg.socialContribution')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Impact Chart & SDG Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            {t('corporate.esg.impactTrend')}
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={impactData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Area
                                    type="monotone"
                                    dataKey="impact"
                                    stroke="#3b82f6"
                                    fill="url(#impactGradient)"
                                />
                                <defs>
                                    <linearGradient id="impactGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Target className="h-5 w-5" />
                            {t('corporate.esg.sdgContribution')}
                        </h3>
                        <div className="flex items-center gap-8">
                            <ResponsiveContainer width="50%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={sdgData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={80}
                                        dataKey="value"
                                    >
                                        {sdgData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-3">
                                {sdgData.map((sdg) => (
                                    <div key={sdg.name} className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: sdg.color }}
                                        />
                                        <span className="text-sm text-gray-600">
                                            {sdg.name}: {sdg.value}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Impact Metrics */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('corporate.esg.impactMetrics')}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600">0</div>
                            <p className="text-gray-500 text-sm">{t('corporate.esg.studentsSupported')}</p>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-600">0</div>
                            <p className="text-gray-500 text-sm">{t('corporate.esg.countriesReached')}</p>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-purple-600">$0</div>
                            <p className="text-gray-500 text-sm">{t('corporate.esg.totalDonations')}</p>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-orange-600">0</div>
                            <p className="text-gray-500 text-sm">{t('corporate.esg.livesChanged')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
