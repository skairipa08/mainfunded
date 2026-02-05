'use client';

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useTranslation } from '@/lib/i18n';
import { User, Heart, Target, Calendar, Mail, Shield, TrendingUp, BadgeCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VerificationStatus {
    verification_id: string;
    status: string;
    tier_requested?: number;
    tier_approved?: number;
}

function AccountPageContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'overview' | 'donations' | 'campaigns'>('overview');
    const [verification, setVerification] = useState<VerificationStatus | null>(null);
    const [verificationLoading, setVerificationLoading] = useState(true);

    // Preview mode for demo
    const isPreviewMode = searchParams.get('preview') === 'true';
    const previewTier = parseInt(searchParams.get('tier') || '1');

    // Redirect to login if not authenticated (skip in preview mode)
    useEffect(() => {
        if (!isPreviewMode && status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router, isPreviewMode]);

    // Fetch verification status (or use mock data in preview mode)
    useEffect(() => {
        if (isPreviewMode) {
            // Mock verification for demo
            setVerification({
                verification_id: 'demo-123',
                status: 'APPROVED',
                tier_requested: previewTier,
                tier_approved: previewTier,
            });
            setVerificationLoading(false);
            return;
        }

        if (session?.user) {
            fetch('/api/verification')
                .then(res => res.json())
                .then(data => {
                    if (data.verification) {
                        setVerification(data.verification);
                    }
                })
                .catch(console.error)
                .finally(() => setVerificationLoading(false));
        }
    }, [session, isPreviewMode, previewTier]);

    if (status === 'loading' && !isPreviewMode) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="h-12 w-12 animate-spin mx-auto text-blue-600 mb-4 border-4 border-blue-200 border-t-blue-600 rounded-full" />
                    <p className="text-gray-600">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    if (!isPreviewMode && !session?.user) {
        return null;
    }

    // Mock user for preview mode
    const user = isPreviewMode
        ? { name: 'Demo User', email: 'demo@university.edu', image: null as string | null }
        : session?.user;

    if (!user) return null;

    const isAdmin = !isPreviewMode && (session?.user as any)?.role === 'admin';

    // Get tier info for display
    const getTierBadge = () => {
        if (!verification || verification.status !== 'APPROVED') return null;

        const tier = verification.tier_approved ?? verification.tier_requested ?? 0;

        const tierConfig: Record<number, { label: string; color: string; bgColor: string }> = {
            0: { label: 'Email Verified', color: 'text-blue-700', bgColor: 'bg-blue-100' },
            1: { label: 'Tier 1 - Verified', color: 'text-orange-700', bgColor: 'bg-orange-100' },
            2: { label: 'Tier 2 - High Trust', color: 'text-green-700', bgColor: 'bg-green-100' },
            3: { label: 'Tier 3 - Partner', color: 'text-purple-700', bgColor: 'bg-purple-100' },
        };

        return tierConfig[tier] || tierConfig[0];
    };

    const tierBadge = getTierBadge();

    // Demo data - values are zero until real data is available
    const mockDonations: { id: number; campaignName: string; amount: number; date: string; status: string }[] = [];

    const mockCampaigns: { id: number; title: string; goal: number; raised: number; status: string; donors: number }[] = [];

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
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-6">
                                {user.image ? (
                                    <div className="relative w-24 h-24">
                                        <Image
                                            src={user.image}
                                            alt={user.name || 'User'}
                                            fill
                                            className="rounded-full border-4 border-white shadow-lg object-cover"
                                        />
                                    </div>
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
                                    <div className="flex items-center gap-2 mt-2">
                                        {isAdmin && (
                                            <span className="inline-flex items-center px-3 py-1 bg-purple-500 text-white text-sm rounded-full">
                                                <Shield className="h-4 w-4 mr-1" />
                                                Admin
                                            </span>
                                        )}
                                        {/* Verification Tier Badge */}
                                        {tierBadge ? (
                                            <span className={`inline-flex items-center px-3 py-1 ${tierBadge.bgColor} ${tierBadge.color} text-sm rounded-full font-medium`}>
                                                <BadgeCheck className="h-4 w-4 mr-1" />
                                                {tierBadge.label}
                                            </span>
                                        ) : verification?.status === 'PENDING_REVIEW' ? (
                                            <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full font-medium">
                                                <BadgeCheck className="h-4 w-4 mr-1" />
                                                {t('verification.statusLabels.pending_review') || 'Pending Review'}
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                            </div>

                            {/* Verification Button */}
                            <div className="hidden md:block">
                                {verification?.status === 'APPROVED' ? (
                                    <Button
                                        variant="outline"
                                        onClick={() => router.push(`/verify/status?id=${verification.verification_id}`)}
                                        className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                                    >
                                        <BadgeCheck className="h-4 w-4 mr-2" />
                                        {t('verification.viewStatus') || 'View Verification'}
                                    </Button>
                                ) : verification?.status === 'PENDING_REVIEW' ? (
                                    <Button
                                        variant="outline"
                                        onClick={() => router.push(`/verify/status?id=${verification.verification_id}`)}
                                        className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                                    >
                                        <BadgeCheck className="h-4 w-4 mr-2" />
                                        {t('verification.checkStatus') || 'Check Status'}
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => router.push('/verify')}
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
                                    >
                                        <BadgeCheck className="h-4 w-4 mr-2" />
                                        {t('verification.getVerified') || 'Get Verified'}
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
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

export default function AccountPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="h-12 w-12 animate-spin mx-auto text-blue-600 mb-4 border-4 border-blue-200 border-t-blue-600 rounded-full" />
                <p className="text-gray-600">Loading...</p>
            </div>
        </div>}>
            <AccountPageContent />
        </Suspense>
    );
}
