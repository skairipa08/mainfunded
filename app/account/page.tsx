'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useTranslation } from '@/lib/i18n';
import { User, Heart, Target, Calendar, Mail, Shield, TrendingUp } from 'lucide-react';

export default function AccountPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'overview' | 'donations' | 'campaigns'>('overview');

    // Redirect to login if not authenticated
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="h-12 w-12 animate-spin mx-auto text-blue-600 mb-4 border-4 border-blue-200 border-t-blue-600 rounded-full" />
                    <p className="text-gray-600">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    if (!session?.user) {
        return null;
    }

    const user = session.user;
    const isAdmin = (user as any)?.role === 'admin';

    // Mock data for demonstration
    const mockDonations = [
        { id: 1, campaignName: 'Medical School Fund', amount: 50, date: '2026-01-15', status: 'completed' },
        { id: 2, campaignName: 'Engineering Scholarship', amount: 100, date: '2026-01-10', status: 'completed' },
        { id: 3, campaignName: 'Art Student Support', amount: 25, date: '2026-01-05', status: 'completed' },
    ];

    const mockCampaigns = [
        { id: 1, title: 'My Education Fund', goal: 5000, raised: 1250, status: 'active', donors: 12 },
    ];

    const stats = {
        totalDonated: mockDonations.reduce((sum, d) => sum + d.amount, 0),
        donationCount: mockDonations.length,
        campaignCount: mockCampaigns.length,
        totalRaised: mockCampaigns.reduce((sum, c) => sum + c.raised, 0),
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow">
                {/* Profile Header */}
                <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-12">
                    <div className="max-w-5xl mx-auto px-4">
                        <div className="flex items-center space-x-6">
                            {user.image ? (
                                <img
                                    src={user.image}
                                    alt={user.name || 'User'}
                                    className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-4xl font-bold">
                                    {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                                </div>
                            )}
                            <div>
                                <h1 className="text-3xl font-bold">{user.name}</h1>
                                <p className="text-blue-200 flex items-center mt-1">
                                    <Mail className="h-4 w-4 mr-2" />
                                    {user.email}
                                </p>
                                {isAdmin && (
                                    <span className="inline-flex items-center mt-2 px-3 py-1 bg-purple-500 text-white text-sm rounded-full">
                                        <Shield className="h-4 w-4 mr-1" />
                                        Admin
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="max-w-5xl mx-auto px-4 -mt-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                            <Heart className="h-8 w-8 mx-auto mb-2 text-red-500" />
                            <div className="text-2xl font-bold text-gray-900">${stats.totalDonated}</div>
                            <div className="text-sm text-gray-500">{t('dashboard.totalDonated')}</div>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                            <Target className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                            <div className="text-2xl font-bold text-gray-900">{stats.donationCount}</div>
                            <div className="text-sm text-gray-500">{t('campaign.donors')}</div>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                            <Calendar className="h-8 w-8 mx-auto mb-2 text-green-500" />
                            <div className="text-2xl font-bold text-gray-900">{stats.campaignCount}</div>
                            <div className="text-sm text-gray-500">{t('nav.campaigns')}</div>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                            <div className="text-2xl font-bold text-gray-900">${stats.totalRaised}</div>
                            <div className="text-sm text-gray-500">{t('dashboard.totalRaised')}</div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="max-w-5xl mx-auto px-4 mt-8">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        {/* Tab Headers */}
                        <div className="flex border-b border-gray-200">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${activeTab === 'overview'
                                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {t('dashboard.title')}
                            </button>
                            <button
                                onClick={() => setActiveTab('donations')}
                                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${activeTab === 'donations'
                                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {t('dashboard.myDonations')}
                            </button>
                            <button
                                onClick={() => setActiveTab('campaigns')}
                                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${activeTab === 'campaigns'
                                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {t('dashboard.myCampaigns')}
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="p-6">
                            {activeTab === 'overview' && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold text-gray-900">{t('dashboard.welcome')}, {user.name?.split(' ')[0]}!</h3>
                                    <p className="text-gray-600">{t('home.hero.subtitle')}</p>

                                    <div className="grid md:grid-cols-2 gap-6 mt-6">
                                        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg p-6">
                                            <h4 className="font-semibold text-gray-900 mb-2">{t('dashboard.myDonations')}</h4>
                                            <p className="text-3xl font-bold text-red-600">${stats.totalDonated}</p>
                                            <p className="text-sm text-gray-500 mt-1">{stats.donationCount} {t('campaign.donors')}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
                                            <h4 className="font-semibold text-gray-900 mb-2">{t('dashboard.myCampaigns')}</h4>
                                            <p className="text-3xl font-bold text-blue-600">{stats.campaignCount}</p>
                                            <p className="text-sm text-gray-500 mt-1">${stats.totalRaised} {t('campaign.raised')}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'donations' && (
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('dashboard.myDonations')}</h3>
                                    {mockDonations.length === 0 ? (
                                        <p className="text-gray-500 text-center py-8">{t('common.none')}</p>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-gray-200">
                                                        <th className="text-left py-3 px-4 text-gray-600 font-medium">{t('nav.campaigns')}</th>
                                                        <th className="text-left py-3 px-4 text-gray-600 font-medium">{t('donation.amount')}</th>
                                                        <th className="text-left py-3 px-4 text-gray-600 font-medium">{t('campaign.createdAt')}</th>
                                                        <th className="text-left py-3 px-4 text-gray-600 font-medium">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {mockDonations.map((donation) => (
                                                        <tr key={donation.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                            <td className="py-3 px-4 font-medium text-gray-900">{donation.campaignName}</td>
                                                            <td className="py-3 px-4 text-green-600 font-medium">${donation.amount}</td>
                                                            <td className="py-3 px-4 text-gray-500">{donation.date}</td>
                                                            <td className="py-3 px-4">
                                                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                                                    {t('common.success')}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'campaigns' && (
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('dashboard.myCampaigns')}</h3>
                                    {mockCampaigns.length === 0 ? (
                                        <div className="text-center py-8">
                                            <p className="text-gray-500 mb-4">{t('common.none')}</p>
                                            <button
                                                onClick={() => router.push('/campaigns/new')}
                                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                {t('campaign.createCampaign')}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {mockCampaigns.map((campaign) => (
                                                <div key={campaign.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-semibold text-gray-900">{campaign.title}</h4>
                                                            <p className="text-sm text-gray-500 mt-1">
                                                                {campaign.donors} {t('campaign.donors')}
                                                            </p>
                                                        </div>
                                                        <span className={`px-3 py-1 rounded-full text-sm ${campaign.status === 'active'
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-gray-100 text-gray-700'
                                                            }`}>
                                                            {campaign.status}
                                                        </span>
                                                    </div>
                                                    <div className="mt-4">
                                                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                                                            <span>${campaign.raised} {t('campaign.raised')}</span>
                                                            <span>{t('campaign.goal')}: ${campaign.goal}</span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="bg-blue-600 h-2 rounded-full transition-all"
                                                                style={{ width: `${Math.min((campaign.raised / campaign.goal) * 100, 100)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
