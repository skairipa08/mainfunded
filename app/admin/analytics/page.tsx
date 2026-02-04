'use client';

import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    Users,
    Eye,
    TrendingUp,
    MousePointer,
    Target,
    Clock,
    ArrowUp,
    ArrowDown,
    RefreshCw,
    Download,
    FlaskConical,
    Search,
    Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Mock analytics data
const mockAnalytics = {
    totalEvents: 15847,
    pageViews: 8432,
    uniqueSessions: 2341,
    conversionRate: 3.2,
    topPages: [
        { path: '/', views: 3245 },
        { path: '/browse', views: 2156 },
        { path: '/campaigns/1', views: 987 },
        { path: '/donate', views: 654 },
        { path: '/login', views: 432 },
    ],
    eventBreakdown: {
        page_view: 8432,
        campaign_view: 2341,
        donation_started: 456,
        donation_completed: 128,
        search: 890,
        button_click: 3600,
    },
    trafficSources: [
        { source: 'Direct', percentage: 35 },
        { source: 'Google', percentage: 28 },
        { source: 'Social Media', percentage: 22 },
        { source: 'Referral', percentage: 15 },
    ],
    hourlyData: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        views: Math.floor(Math.random() * 500) + 100,
        conversions: Math.floor(Math.random() * 20),
    })),
};

const mockExperiments = [
    {
        id: 'donation_button_color',
        name: 'Bağış Butonu Rengi',
        status: 'active',
        variants: [
            { id: 'green', name: 'Yeşil', impressions: 1245, conversions: 42, rate: 3.37 },
            { id: 'blue', name: 'Mavi', impressions: 1189, conversions: 35, rate: 2.94 },
        ],
        winner: 'green',
        significance: 0.85,
    },
    {
        id: 'hero_cta_text',
        name: 'Ana Sayfa CTA Metni',
        status: 'active',
        variants: [
            { id: 'bagis_yap', name: 'Bağış Yap', impressions: 845, conversions: 28, rate: 3.31 },
            { id: 'destek_ol', name: 'Destek Ol', impressions: 823, conversions: 31, rate: 3.77 },
            { id: 'simdi_bagis', name: 'Şimdi Bağış Yap', impressions: 798, conversions: 25, rate: 3.13 },
        ],
        winner: null,
        significance: 0.45,
    },
];

export default function AnalyticsPage() {
    const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
    const [lastUpdate, setLastUpdate] = useState(new Date());

    const refresh = () => {
        setLastUpdate(new Date());
    };

    const StatCard = ({
        icon: Icon,
        label,
        value,
        change,
        color = 'blue'
    }: {
        icon: React.ElementType;
        label: string;
        value: string | number;
        change?: number;
        color?: string;
    }) => (
        <div className="bg-white rounded-xl p-6 border shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${color}-100`}>
                    <Icon className={`h-6 w-6 text-${color}-600`} />
                </div>
                {change !== undefined && (
                    <div className={`flex items-center gap-1 text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {change >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                        {Math.abs(change)}%
                    </div>
                )}
            </div>
            <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
            <p className="text-sm text-gray-500">{label}</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <BarChart3 className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Analytics Dashboard</h1>
                                <p className="text-sm text-gray-500">
                                    Son güncelleme: {lastUpdate.toLocaleTimeString('tr-TR')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                {(['24h', '7d', '30d'] as const).map(range => (
                                    <button
                                        key={range}
                                        onClick={() => setTimeRange(range)}
                                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${timeRange === range
                                                ? 'bg-white text-gray-900 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        {range}
                                    </button>
                                ))}
                            </div>
                            <Button variant="outline" size="sm" onClick={refresh}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Yenile
                            </Button>
                            <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Dışa Aktar
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard icon={Eye} label="Sayfa Görüntüleme" value={mockAnalytics.pageViews} change={12} />
                    <StatCard icon={Users} label="Benzersiz Oturum" value={mockAnalytics.uniqueSessions} change={8} color="green" />
                    <StatCard icon={Target} label="Dönüşüm Oranı" value={`%${mockAnalytics.conversionRate}`} change={-2} color="purple" />
                    <StatCard icon={MousePointer} label="Toplam Olay" value={mockAnalytics.totalEvents} change={15} color="orange" />
                </div>

                <div className="grid lg:grid-cols-3 gap-8 mb-8">
                    {/* Top Pages */}
                    <div className="bg-white rounded-xl p-6 border shadow-sm lg:col-span-2">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Activity className="h-5 w-5 text-blue-600" />
                            En Çok Görüntülenen Sayfalar
                        </h2>
                        <div className="space-y-3">
                            {mockAnalytics.topPages.map((page, i) => (
                                <div key={page.path} className="flex items-center gap-4">
                                    <span className="text-sm font-medium text-gray-400 w-6">#{i + 1}</span>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <code className="text-sm text-gray-900">{page.path}</code>
                                            <span className="text-sm font-medium text-gray-600">{page.views.toLocaleString()}</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 rounded-full"
                                                style={{ width: `${(page.views / mockAnalytics.topPages[0].views) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Traffic Sources */}
                    <div className="bg-white rounded-xl p-6 border shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                            Trafik Kaynakları
                        </h2>
                        <div className="space-y-4">
                            {mockAnalytics.trafficSources.map((source, i) => {
                                const colors = ['blue', 'green', 'purple', 'orange'];
                                return (
                                    <div key={source.source}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm text-gray-700">{source.source}</span>
                                            <span className="text-sm font-medium text-gray-900">{source.percentage}%</span>
                                        </div>
                                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full bg-${colors[i]}-500 rounded-full`}
                                                style={{ width: `${source.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Event Breakdown */}
                <div className="bg-white rounded-xl p-6 border shadow-sm mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <MousePointer className="h-5 w-5 text-purple-600" />
                        Olay Dağılımı
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {Object.entries(mockAnalytics.eventBreakdown).map(([event, count]) => (
                            <div key={event} className="p-4 bg-gray-50 rounded-lg text-center">
                                <p className="text-2xl font-bold text-gray-900">{count.toLocaleString()}</p>
                                <p className="text-xs text-gray-500 mt-1">{event.replace(/_/g, ' ')}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* A/B Tests */}
                <div className="bg-white rounded-xl p-6 border shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <FlaskConical className="h-5 w-5 text-orange-600" />
                            A/B Testleri
                        </h2>
                        <Badge className="bg-green-100 text-green-700">
                            {mockExperiments.filter(e => e.status === 'active').length} Aktif Test
                        </Badge>
                    </div>
                    <div className="space-y-6">
                        {mockExperiments.map(experiment => (
                            <div key={experiment.id} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{experiment.name}</h3>
                                        <p className="text-sm text-gray-500">ID: {experiment.id}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">
                                            Güvenilirlik: %{Math.round(experiment.significance * 100)}
                                        </Badge>
                                        <Badge className={experiment.winner ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                                            {experiment.winner ? `Kazanan: ${experiment.variants.find(v => v.id === experiment.winner)?.name}` : 'Devam Ediyor'}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-3 gap-4">
                                    {experiment.variants.map(variant => (
                                        <div
                                            key={variant.id}
                                            className={`p-3 rounded-lg border ${experiment.winner === variant.id
                                                    ? 'border-green-500 bg-green-50'
                                                    : 'border-gray-200'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium text-gray-900">{variant.name}</span>
                                                <span className="text-lg font-bold text-blue-600">%{variant.rate.toFixed(2)}</span>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {variant.impressions.toLocaleString()} görüntülenme · {variant.conversions} dönüşüm
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
