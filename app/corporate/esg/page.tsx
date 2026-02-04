'use client';

import React from 'react';
import {
    Leaf,
    Users,
    Globe,
    GraduationCap,
    TrendingUp,
    Download,
    FileText,
    CheckCircle,
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import CorporateHeader from '@/components/corporate/Header';
import StatCard from '@/components/corporate/StatCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { mockESGMetrics, mockCountryDistribution } from '@/lib/corporate/mock-data';

const GENDER_COLORS = ['#EC4899', '#3B82F6'];
const REGION_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function ESGPage() {
    const genderData = [
        { name: 'Kadin', value: mockESGMetrics.genderDistribution.female },
        { name: 'Erkek', value: mockESGMetrics.genderDistribution.male },
    ];

    const ethnicData = [
        { name: 'Az Temsil Edilen', value: mockESGMetrics.ethnicDiversity.underrepresented },
        { name: 'Cogunluk', value: mockESGMetrics.ethnicDiversity.majority },
    ];

    const exportPDF = () => {
        // Create a simple HTML-based printable report
        const reportWindow = window.open('', '_blank');
        if (reportWindow) {
            reportWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>ESG Raporu - FundEd</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                        h1 { color: #059669; border-bottom: 2px solid #059669; padding-bottom: 10px; }
                        h2 { color: #374151; margin-top: 30px; }
                        .stat { display: inline-block; margin: 10px 20px 10px 0; padding: 20px; background: #F0FDF4; border-radius: 8px; }
                        .stat-value { font-size: 24px; font-weight: bold; color: #059669; }
                        .stat-label { font-size: 12px; color: #6B7280; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #E5E7EB; }
                        th { background: #F3F4F6; font-weight: 600; }
                        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB; text-align: center; color: #9CA3AF; font-size: 12px; }
                        @media print { body { padding: 20px; } }
                    </style>
                </head>
                <body>
                    <h1>🌱 ESG Performans Raporu</h1>
                    <p>Rapor Donemi: Ocak 2026 - Subat 2026</p>
                    
                    <h2>Etki Ozeti</h2>
                    <div class="stat"><div class="stat-value">${mockESGMetrics.totalImpact.studentsHelped}</div><div class="stat-label">Desteklenen Ogrenci</div></div>
                    <div class="stat"><div class="stat-value">${mockESGMetrics.totalImpact.graduations}</div><div class="stat-label">Mezun Sayisi</div></div>
                    <div class="stat"><div class="stat-value">%${mockESGMetrics.totalImpact.employmentRate}</div><div class="stat-label">Istihdam Orani</div></div>
                    <div class="stat"><div class="stat-value">${mockESGMetrics.universityDiversity}</div><div class="stat-label">Universite Cesitliligi</div></div>
                    
                    <h2>Cinsiyet Dagilimi</h2>
                    <table>
                        <tr><th>Cinsiyet</th><th>Oran</th></tr>
                        <tr><td>Kadin</td><td>%${mockESGMetrics.genderDistribution.female}</td></tr>
                        <tr><td>Erkek</td><td>%${mockESGMetrics.genderDistribution.male}</td></tr>
                    </table>
                    
                    <h2>Bolgesel Etki</h2>
                    <table>
                        <tr><th>Metrik</th><th>Oran</th></tr>
                        <tr><td>Gelismekte Olan Ulkelerdeki Ogrenciler</td><td>%${mockESGMetrics.regionalImpact.developingCountries}</td></tr>
                        <tr><td>Kirsal Bolge Ogrencileri</td><td>%${mockESGMetrics.regionalImpact.ruralAreas}</td></tr>
                    </table>
                    
                    <h2>BM SDG Uyumu</h2>
                    <table>
                        <tr><th>Hedef</th><th>Etki Seviyesi</th></tr>
                        <tr><td>SDG 1 - Yoksulluga Son</td><td>🟢 Yuksek</td></tr>
                        <tr><td>SDG 4 - Nitelikli Egitim</td><td>🟢 Yuksek</td></tr>
                        <tr><td>SDG 5 - Cinsiyet Esitligi</td><td>🔵 Orta</td></tr>
                        <tr><td>SDG 10 - Esitsizliklerin Azaltilmasi</td><td>🟢 Yuksek</td></tr>
                    </table>
                    
                    <div class="footer">
                        <p>Bu rapor FundEd platformu tarafindan otomatik olusturulmustur.</p>
                        <p>Olusturma Tarihi: ${new Date().toLocaleDateString('tr-TR')}</p>
                    </div>
                </body>
                </html>
            `);
            reportWindow.document.close();
            reportWindow.print();
        }
    };

    return (
        <div className="min-h-screen">
            <CorporateHeader
                title="ESG Raporu"
                subtitle="Kurumsal Sosyal Sorumluluk ve ESG metrikleri"
            />

            <div className="p-6">
                {/* Header with Export */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6 border border-green-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-green-100 p-3 rounded-lg">
                                <Leaf className="h-8 w-8 text-green-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">ESG Performans Raporu</h2>
                                <p className="text-gray-600">Ocak 2026 - Subat 2026</p>
                            </div>
                        </div>
                        <Button onClick={exportPDF} className="gap-2 bg-green-600 hover:bg-green-700">
                            <Download className="h-4 w-4" />
                            PDF Indir
                        </Button>
                    </div>
                </div>

                {/* Impact Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Desteklenen Ogrenci"
                        value={mockESGMetrics.totalImpact.studentsHelped}
                        icon={Users}
                    />
                    <StatCard
                        title="Mezun Sayisi"
                        value={mockESGMetrics.totalImpact.graduations}
                        icon={GraduationCap}
                    />
                    <StatCard
                        title="Istihdam Orani"
                        value={`%${mockESGMetrics.totalImpact.employmentRate}`}
                        icon={TrendingUp}
                    />
                    <StatCard
                        title="Universite Cesitliligi"
                        value={mockESGMetrics.universityDiversity}
                        subtitle="farkli universite"
                        icon={Globe}
                    />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Gender Distribution */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Cinsiyet Dagilimi
                        </h3>
                        <div className="h-64 flex items-center">
                            <ResponsiveContainer width="50%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={genderData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {genderData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={GENDER_COLORS[index]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [`%${value}`, '']} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex-1 space-y-4">
                                {genderData.map((item, index) => (
                                    <div key={item.name} className="flex items-center gap-3">
                                        <div
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: GENDER_COLORS[index] }}
                                        />
                                        <span className="text-gray-600 flex-1">{item.name}</span>
                                        <span className="font-bold text-gray-900">%{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="mt-4 p-4 bg-pink-50 rounded-lg">
                            <div className="flex items-center gap-2 text-pink-700">
                                <CheckCircle className="h-5 w-5" />
                                <span className="font-medium">Cinsiyet esitligi hedefinde</span>
                            </div>
                        </div>
                    </div>

                    {/* Regional Impact */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Bolgesel Etki
                        </h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={mockCountryDistribution} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                    <XAxis type="number" stroke="#9CA3AF" />
                                    <YAxis type="category" dataKey="name" stroke="#9CA3AF" width={80} />
                                    <Tooltip formatter={(value) => [`%${value}`, 'Oran']} />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                        {mockCountryDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={REGION_COLORS[index]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Regional Inequality */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">
                            Bolgesel Esitsizlik Azaltimi
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600">Gelismekte Olan Ulkelerdeki Ogrenciler</span>
                                    <span className="font-bold text-gray-900">
                                        %{mockESGMetrics.regionalImpact.developingCountries}
                                    </span>
                                </div>
                                <Progress value={mockESGMetrics.regionalImpact.developingCountries} className="h-3" />
                            </div>
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600">Kirsal Bolge Ogrencileri</span>
                                    <span className="font-bold text-gray-900">
                                        %{mockESGMetrics.regionalImpact.ruralAreas}
                                    </span>
                                </div>
                                <Progress value={mockESGMetrics.regionalImpact.ruralAreas} className="h-3" />
                            </div>
                        </div>
                    </div>

                    {/* Ethnic Diversity */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">
                            Etnik Cesitlilik
                        </h3>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={ethnicData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={70}
                                        paddingAngle={2}
                                        dataKey="value"
                                        label={({ name, value }) => `${name}: %${value}`}
                                    >
                                        <Cell fill="#8B5CF6" />
                                        <Cell fill="#E5E7EB" />
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                            <div className="flex items-center gap-2 text-purple-700">
                                <CheckCircle className="h-5 w-5" />
                                <span className="font-medium">Az temsil edilen gruplara %{mockESGMetrics.ethnicDiversity.underrepresented} destek</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SDG Alignment */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        BM Surdurulebilir Kalkinma Hedefleri (SDG) Uyumu
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-green-50 p-4 rounded-lg text-center border border-green-200">
                            <div className="text-3xl mb-2">1️⃣</div>
                            <p className="font-medium text-green-800">Yoksulluga Son</p>
                            <Badge className="mt-2 bg-green-100 text-green-700 border border-green-300">Etki: Yuksek</Badge>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg text-center border border-green-200">
                            <div className="text-3xl mb-2">4️⃣</div>
                            <p className="font-medium text-green-800">Nitelikli Egitim</p>
                            <Badge className="mt-2 bg-green-100 text-green-700 border border-green-300">Etki: Yuksek</Badge>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-200">
                            <div className="text-3xl mb-2">5️⃣</div>
                            <p className="font-medium text-blue-800">Cinsiyet Esitligi</p>
                            <Badge className="mt-2 bg-blue-100 text-blue-700 border border-blue-300">Etki: Orta</Badge>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg text-center border border-green-200">
                            <div className="text-3xl mb-2">🔟</div>
                            <p className="font-medium text-green-800">Esitsizliklerin Azaltilmasi</p>
                            <Badge className="mt-2 bg-green-100 text-green-700 border border-green-300">Etki: Yuksek</Badge>
                        </div>
                    </div>

                    {/* Color Legend */}
                    <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className="text-sm text-gray-600">Yuksek Etki</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span className="text-sm text-gray-600">Orta Etki</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span className="text-sm text-gray-600">Dusuk Etki</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
