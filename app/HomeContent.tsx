'use client';

import { useRouter } from 'next/navigation';
import { Heart, Shield, TrendingUp, Users, Globe, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CampaignCard from '@/components/CampaignCard';
import HomeSearchBar from './HomeSearchBar';
import { useTranslation } from '@/lib/i18n';

interface PlatformStats {
    studentsHelped: number;
    totalRaised: number;
    campaigns: number;
    donors: number;
}

interface HomeContentProps {
    featuredCampaigns: any[];
    platformStats: PlatformStats;
    isDemoMode: boolean;
}

export default function HomeContent({ featuredCampaigns, platformStats, isDemoMode }: HomeContentProps) {
    const router = useRouter();
    const { t } = useTranslation();

    const stats = [
        { labelKey: 'home.stats.studentsHelped', value: platformStats.studentsHelped.toString(), icon: Users },
        { labelKey: 'home.stats.totalRaised', value: `$${platformStats.totalRaised.toLocaleString()}`, icon: TrendingUp },
        { labelKey: 'home.stats.campaigns', value: platformStats.campaigns.toString(), icon: Globe },
        { labelKey: 'home.stats.donors', value: platformStats.donors.toString(), icon: CheckCircle },
    ];

    return (
        <>
            {/* Demo Banner */}
            {isDemoMode && (
                <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
                    <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
                        <span className="text-amber-600 font-bold">⚠️</span>
                        <p className="text-amber-800 text-sm font-medium text-center">{t('common.demoBanner')}</p>
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6">
                        {t('home.hero.title')}
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 text-blue-100">
                        {t('home.hero.subtitle')}
                    </p>
                    <HomeSearchBar />
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <div key={index} className="text-center">
                                    <Icon className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                                    <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                                    <div className="text-gray-600 mt-2">{t(stat.labelKey)}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Featured Campaigns */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">{t('home.featured.title')}</h2>
                        <Button variant="outline" onClick={() => router.push('/browse')}>
                            {t('home.featured.viewAll')} <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>

                    {featuredCampaigns.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-600 mb-4">{t('home.featured.viewAll')}</p>
                            <Button variant="outline" onClick={() => router.push('/browse')}>
                                {t('campaign.browseCampaigns')}
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {featuredCampaigns.map((campaign: any) => (
                                <CampaignCard key={campaign.campaign_id} campaign={campaign} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
                        {t('home.howItWorks.title')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mx-auto mb-4">
                                <span className="text-2xl font-bold text-blue-600">1</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">{t('home.howItWorks.step1Title')}</h3>
                            <p className="text-gray-600">{t('home.howItWorks.step1Desc')}</p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mx-auto mb-4">
                                <span className="text-2xl font-bold text-blue-600">2</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">{t('home.howItWorks.step2Title')}</h3>
                            <p className="text-gray-600">{t('home.howItWorks.step2Desc')}</p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mx-auto mb-4">
                                <span className="text-2xl font-bold text-blue-600">3</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">{t('home.howItWorks.step3Title')}</h3>
                            <p className="text-gray-600">{t('home.howItWorks.step3Desc')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
                        {t('home.cta.title')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <Shield className="h-16 w-16 mx-auto mb-4 text-green-600" />
                            <h3 className="text-xl font-semibold mb-2">{t('campaign.verified')}</h3>
                            <p className="text-gray-600">{t('home.howItWorks.step1Desc')}</p>
                        </div>
                        <div className="text-center">
                            <Heart className="h-16 w-16 mx-auto mb-4 text-red-600" />
                            <h3 className="text-xl font-semibold mb-2">{t('donation.title')}</h3>
                            <p className="text-gray-600">{t('home.howItWorks.step2Desc')}</p>
                        </div>
                        <div className="text-center">
                            <TrendingUp className="h-16 w-16 mx-auto mb-4 text-blue-600" />
                            <h3 className="text-xl font-semibold mb-2">{t('dashboard.recentActivity')}</h3>
                            <p className="text-gray-600">{t('home.howItWorks.step3Desc')}</p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
