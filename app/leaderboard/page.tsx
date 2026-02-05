'use client';

import React, { useState } from 'react';
import {
    Trophy,
    Building2,
    User,
    Crown,
    Medal,
    Award,
    Eye,
    EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { BADGES, mockLeaderboard, type LeaderboardEntry } from '@/lib/gamification';
import MobileHeader from '@/components/MobileHeader';
import { useTranslation } from '@/lib/i18n/context';

type FilterType = 'all' | 'corporate' | 'individual';

export default function LeaderboardPage() {
    const { t } = useTranslation();
    const [filter, setFilter] = useState<FilterType>('all');

    const filteredLeaderboard = mockLeaderboard.filter(
        (entry) => filter === 'all' || entry.type === filter
    );

    // Sort by points descending and reassign ranks within filter
    const sortedLeaderboard = [...filteredLeaderboard]
        .sort((a, b) => b.points - a.points)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));

    const corporateTotal = mockLeaderboard
        .filter((e) => e.type === 'corporate')
        .reduce((sum, e) => sum + e.totalDonated, 0);

    const individualTotal = mockLeaderboard
        .filter((e) => e.type === 'individual')
        .reduce((sum, e) => sum + e.totalDonated, 0);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Crown className="h-5 w-5 text-yellow-500" />;
            case 2:
                return <Medal className="h-5 w-5 text-gray-400" />;
            case 3:
                return <Award className="h-5 w-5 text-amber-600" />;
            default:
                return <span className="text-gray-500 font-medium">#{rank}</span>;
        }
    };

    const getBadgeById = (badgeId: string) => {
        return BADGES.find((b) => b.id === badgeId);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Mobile Header */}
            <MobileHeader transparent backHref="/" />

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16 -mt-14 pt-20">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Trophy className="h-10 w-10" />
                        <h1 className="text-4xl font-bold">{t('pages.leaderboard.title')}</h1>
                    </div>
                    <p className="text-blue-100 text-lg mb-8">
                        {t('pages.leaderboard.subtitle')}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <Building2 className="h-8 w-8 mx-auto mb-2 text-blue-200" />
                            <p className="text-3xl font-bold">{formatCurrency(corporateTotal)}</p>
                            <p className="text-blue-200">{t('pages.leaderboard.corporateDonations')}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <User className="h-8 w-8 mx-auto mb-2 text-blue-200" />
                            <p className="text-3xl font-bold">{formatCurrency(individualTotal)}</p>
                            <p className="text-blue-200">{t('pages.leaderboard.individualDonations')}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <Trophy className="h-8 w-8 mx-auto mb-2 text-blue-200" />
                            <p className="text-3xl font-bold">{mockLeaderboard.length}</p>
                            <p className="text-blue-200">{t('pages.leaderboard.activeDonors')}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Demo Notice */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-center gap-3">
                    <span className="text-amber-600 font-bold text-lg">⚠️</span>
                    <p className="text-amber-800 text-sm font-medium">{t('common.demoLeaderboard')}</p>
                </div>

                {/* Filter Tabs */}
                <div className="flex justify-center gap-2 mb-8">
                    <Button
                        variant={filter === 'all' ? 'default' : 'outline'}
                        onClick={() => setFilter('all')}
                        className="gap-2"
                    >
                        <Trophy className="h-4 w-4" />
                        {t('pages.leaderboard.all')}
                    </Button>
                    <Button
                        variant={filter === 'corporate' ? 'default' : 'outline'}
                        onClick={() => setFilter('corporate')}
                        className="gap-2"
                    >
                        <Building2 className="h-4 w-4" />
                        {t('pages.leaderboard.corporate')}
                    </Button>
                    <Button
                        variant={filter === 'individual' ? 'default' : 'outline'}
                        onClick={() => setFilter('individual')}
                        className="gap-2"
                    >
                        <User className="h-4 w-4" />
                        {t('pages.leaderboard.individual')}
                    </Button>
                </div>

                {/* Leaderboard */}
                <div className="max-w-3xl mx-auto space-y-4">
                    {sortedLeaderboard.map((entry, index) => (
                        <div
                            key={entry.id}
                            className={cn(
                                'bg-white rounded-xl p-4 shadow-sm border transition-all hover:shadow-md',
                                index === 0 && 'border-yellow-300 bg-gradient-to-r from-yellow-50 to-amber-50',
                                index === 1 && 'border-gray-300',
                                index === 2 && 'border-amber-200'
                            )}
                        >
                            <div className="flex items-center gap-4">
                                {/* Rank */}
                                <div className="w-12 h-12 flex items-center justify-center">
                                    {getRankIcon(entry.rank)}
                                </div>

                                {/* Avatar */}
                                <div
                                    className={cn(
                                        'w-12 h-12 rounded-full flex items-center justify-center',
                                        entry.type === 'corporate'
                                            ? 'bg-blue-100 text-blue-600'
                                            : 'bg-purple-100 text-purple-600'
                                    )}
                                >
                                    {entry.type === 'corporate' ? (
                                        <Building2 className="h-6 w-6" />
                                    ) : (
                                        <User className="h-6 w-6" />
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-gray-900 truncate">
                                            {entry.displayName}
                                        </h3>
                                        {entry.isAnonymous && (
                                            <span title="Anonymous">
                                                <EyeOff className="h-4 w-4 text-gray-400" />
                                            </span>
                                        )}
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                'text-xs',
                                                entry.type === 'corporate'
                                                    ? 'border-blue-200 text-blue-600'
                                                    : 'border-purple-200 text-purple-600'
                                            )}
                                        >
                                            {entry.type === 'corporate' ? t('pages.leaderboard.corporate') : t('pages.leaderboard.individual')}
                                        </Badge>
                                    </div>

                                    {/* Badges */}
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {entry.badges.slice(0, 4).map((badgeId) => {
                                            const badge = getBadgeById(badgeId);
                                            if (!badge) return null;
                                            return (
                                                <span
                                                    key={badgeId}
                                                    className={cn(
                                                        'text-xs px-2 py-0.5 rounded-full',
                                                        badge.color
                                                    )}
                                                    title={badge.description}
                                                >
                                                    {badge.icon} {badge.name}
                                                </span>
                                            );
                                        })}
                                        {entry.badges.length > 4 && (
                                            <span className="text-xs text-gray-500">
                                                +{entry.badges.length - 4}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="text-right">
                                    <p className="text-lg font-bold text-gray-900">
                                        {formatCurrency(entry.totalDonated)}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {entry.studentCount} {t('pages.leaderboard.students')} • {entry.points.toLocaleString()} {t('pages.leaderboard.points')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Anonymous Notice */}
                <div className="max-w-3xl mx-auto mt-8 p-4 bg-gray-100 rounded-xl text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-600">
                        <EyeOff className="h-5 w-5" />
                        <span>{t('pages.leaderboard.anonymousNotice')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
