'use client';

import React from 'react';
import { Award, Lock } from 'lucide-react';
import { BadgeGrid, ProgressToBadge } from '@/components/BadgeDisplay';
import { BADGES } from '@/lib/gamification';
import MobileHeader from '@/components/MobileHeader';
import { useTranslation } from '@/lib/i18n/context';

export default function BadgesPage() {
    const { t } = useTranslation();
    // Demo mode - no badges earned yet
    const earnedBadgeIds: string[] = [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Mobile Header */}
            <MobileHeader transparent backHref="/" />

            {/* Hero */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-16 -mt-14 pt-20">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Award className="h-10 w-10" />
                        <h1 className="text-4xl font-bold">{t('pages.badges.title')}</h1>
                    </div>
                    <p className="text-purple-100 text-lg max-w-2xl mx-auto">
                        {t('pages.badges.subtitle')}
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Demo Notice */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-center gap-3">
                    <span className="text-amber-600 font-bold text-lg">⚠️</span>
                    <p className="text-amber-800 text-sm font-medium">{t('common.demoBadges')}</p>
                </div>

                {/* Progress Section */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('pages.badges.progress')}</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <ProgressToBadge badgeId="regular" currentValue={0} />
                        <ProgressToBadge badgeId="silver" currentValue={0} />
                        <ProgressToBadge badgeId="champion" currentValue={0} />
                    </div>
                </div>

                {/* All Badges */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('pages.badges.allBadges')}</h2>
                    <BadgeGrid earnedBadgeIds={earnedBadgeIds} showAll />
                </div>

                {/* Info */}
                <div className="mt-12 bg-white rounded-xl p-6 shadow-sm border">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Lock className="h-5 w-5 text-gray-400" />
                        {t('pages.badges.howToEarn')}
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                            <p className="font-medium text-gray-800 mb-2">{t('pages.badges.donationCount')}</p>
                            <ul className="space-y-1">
                                <li>• {t('pages.badges.firstStep')}: 1 {t('pages.badges.donation')}</li>
                                <li>• {t('pages.badges.regularSupporter')}: 5 {t('pages.badges.donations')}</li>
                                <li>• {t('pages.badges.perfectDonor')}: 10 {t('pages.badges.donations')}</li>
                                <li>• {t('pages.badges.legend')}: 25 {t('pages.badges.donations')}</li>
                            </ul>
                        </div>
                        <div>
                            <p className="font-medium text-gray-800 mb-2">{t('pages.badges.totalAmount')}</p>
                            <ul className="space-y-1">
                                <li>• {t('pages.common.bronze')}: $100</li>
                                <li>• {t('pages.common.silver')}: $500</li>
                                <li>• {t('pages.common.gold')}: $1,000</li>
                                <li>• {t('pages.common.platinum')}: $5,000</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
