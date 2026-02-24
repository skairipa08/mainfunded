'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
    Trophy,
    Building2,
    User,
    Crown,
    Medal,
    Award,
    EyeOff,
    TrendingUp,
    Heart,
    GraduationCap,
    Sparkles,
    Star,
    ChevronDown,
    Users,
    Zap,
    Target,
    Gift,
    ArrowRight,
    Search,
    ArrowUp,
    MapPin,
    ChevronUp,
    Flame,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { BADGES, mockLeaderboard, type LeaderboardEntry } from '@/lib/gamification';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useTranslation } from '@/lib/i18n/context';
import { useCurrency } from '@/lib/currency-context';

type FilterType = 'all' | 'corporate' | 'individual';
type TimeRange = 'allTime' | 'thisMonth';

// Simulated "this month" data (subset with reduced amounts)
function getMonthlyData(entries: LeaderboardEntry[]): LeaderboardEntry[] {
    return entries.map(e => ({
        ...e,
        totalDonated: Math.round(e.totalDonated * 0.12),
        points: Math.round(e.points * 0.15),
    }));
}

// Mock activity feed
interface ActivityItem {
    id: string;
    donorName: string;
    type: 'donation' | 'badge' | 'milestone';
    description: string;
    amount?: number;
    badgeEmoji?: string;
    timeAgo: string;
}

// ⚠️ DEMO — Tüm isimler ve veriler kurgusaldır, gerçek kişileri temsil etmez.
const mockActivity: ActivityItem[] = [
    { id: 'a1', donorName: 'A*** B***', type: 'donation', description: '3 öğrenciye bağış yaptı', amount: 4500, timeAgo: '2 saat önce' },
    { id: 'a2', donorName: 'X Şirketi', type: 'milestone', description: '200.000₺ hedefine ulaştı!', timeAgo: '5 saat önce' },
    { id: 'a3', donorName: 'C*** D***', type: 'badge', description: 'Cömert Bağışçı rozetini kazandı', badgeEmoji: '💎', timeAgo: '1 gün önce' },
    { id: 'a4', donorName: 'Y Vakfı', type: 'donation', description: '12 yeni öğrenciyi desteklemeye başladı', amount: 24000, timeAgo: '1 gün önce' },
    { id: 'a5', donorName: 'E*** F***', type: 'badge', description: 'Mentor rozetini kazandı', badgeEmoji: '📚', timeAgo: '2 gün önce' },
    { id: 'a6', donorName: 'Gizli Destekçi', type: 'donation', description: '2 öğrenciye anonim bağış yaptı', amount: 3200, timeAgo: '3 gün önce' },
];

function getLevelInfo(points: number): { level: number; name: string; color: string; progress: number; pointsToNext: number } {
    const levels = [
        { min: 0, name: 'Yeni Başlayan', color: 'from-gray-400 to-gray-500' },
        { min: 500, name: 'Destekçi', color: 'from-green-400 to-green-600' },
        { min: 2000, name: 'Kahraman', color: 'from-blue-400 to-blue-600' },
        { min: 5000, name: 'Şampiyon', color: 'from-purple-400 to-purple-600' },
        { min: 10000, name: 'Efsane', color: 'from-amber-400 to-amber-600' },
        { min: 25000, name: 'Patron', color: 'from-rose-400 to-rose-600' },
    ];
    let current = levels[0];
    let next = levels[1];
    for (let i = levels.length - 1; i >= 0; i--) {
        if (points >= levels[i].min) {
            current = levels[i];
            next = levels[i + 1] || levels[i];
            break;
        }
    }
    const levelIndex = levels.indexOf(current);
    const range = next.min - current.min || 1;
    const progress = Math.min(((points - current.min) / range) * 100, 100);
    const pointsToNext = Math.max(next.min - points, 0);
    return { level: levelIndex + 1, name: current.name, color: current.color, progress, pointsToNext };
}

export default function LeaderboardPage() {
    const { t } = useTranslation();
    const { formatAmount } = useCurrency();
    const { data: session } = useSession();
    const [filter, setFilter] = useState<FilterType>('all');
    const [timeRange, setTimeRange] = useState<TimeRange>('allTime');
    const [showCount, setShowCount] = useState(10);
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const tableRef = useRef<HTMLDivElement>(null);
    const myRankRef = useRef<HTMLDivElement>(null);

    // Simulate current user's rank (in real app, would come from API)
    const currentUserName = session?.user?.name || null;
    const simulatedUserRank = 587;
    const simulatedUserEntry: LeaderboardEntry = {
        id: 'current-user',
        name: currentUserName || 'Siz',
        type: 'individual',
        isAnonymous: false,
        displayName: currentUserName ? `${currentUserName.split(' ')[0]} ${currentUserName.split(' ').pop()?.charAt(0) || ''}.` : 'Siz',
        totalDonated: 1250,
        studentCount: 1,
        badges: ['supporter'],
        rank: simulatedUserRank,
        points: 420,
    };

    const baseData = timeRange === 'thisMonth' ? getMonthlyData(mockLeaderboard) : mockLeaderboard;

    const sortedLeaderboard = useMemo(() => {
        let filtered = [...baseData]
            .filter(entry => filter === 'all' || entry.type === filter)
            .sort((a, b) => b.points - a.points)
            .map((entry, index) => ({ ...entry, rank: index + 1 }));

        if (searchQuery.trim()) {
            filtered = filtered.filter(entry =>
                entry.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                entry.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return filtered;
    }, [baseData, filter, searchQuery]);

    const visibleEntries = sortedLeaderboard.slice(0, showCount);
    const hasMore = showCount < sortedLeaderboard.length;

    const totalDonated = baseData.reduce((sum, e) => sum + e.totalDonated, 0);
    const totalStudents = baseData.reduce((sum, e) => sum + e.studentCount, 0);
    const corporateCount = baseData.filter(e => e.type === 'corporate').length;
    const individualCount = baseData.filter(e => e.type === 'individual').length;

    const topDonor = sortedLeaderboard[0];

    const getBadgeById = (badgeId: string) => BADGES.find(b => b.id === badgeId);

    // Scroll to top handler
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 600);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getRankDisplay = (rank: number, size: 'sm' | 'md' = 'md') => {
        const dims = size === 'sm' ? 'w-8 h-8' : 'w-11 h-11';
        const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
        const numSize = size === 'sm' ? 'w-4 h-4 text-[8px]' : 'w-5 h-5 text-[10px]';

        if (rank === 1) return (
            <div className="relative">
                <div className={cn(dims, 'rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-200/50 ring-2 ring-amber-300/50')}>
                    <Crown className={cn(iconSize, 'text-white')} />
                </div>
                <div className={cn('absolute -top-1 -right-1 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-amber-900 ring-2 ring-white', numSize)}>1</div>
            </div>
        );
        if (rank === 2) return (
            <div className="relative">
                <div className={cn(dims, 'rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center shadow-md ring-2 ring-gray-300/50')}>
                    <Medal className={cn(iconSize, 'text-white')} />
                </div>
                <div className={cn('absolute -top-1 -right-1 bg-gray-400 rounded-full flex items-center justify-center font-bold text-white ring-2 ring-white', numSize)}>2</div>
            </div>
        );
        if (rank === 3) return (
            <div className="relative">
                <div className={cn(dims, 'rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-md ring-2 ring-amber-400/50')}>
                    <Award className={cn(iconSize, 'text-white')} />
                </div>
                <div className={cn('absolute -top-1 -right-1 bg-amber-600 rounded-full flex items-center justify-center font-bold text-white ring-2 ring-white', numSize)}>3</div>
            </div>
        );
        return (
            <div className={cn(dims, 'rounded-full bg-gray-100 flex items-center justify-center')}>
                <span className={cn('font-bold text-gray-500', size === 'sm' ? 'text-xs' : 'text-sm')}>#{rank}</span>
            </div>
        );
    };

    const getAvatarColors = (entry: LeaderboardEntry) => {
        if (entry.type === 'corporate') return 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white';
        return 'bg-gradient-to-br from-violet-500 to-purple-600 text-white';
    };

    const getRowBg = (entry: LeaderboardEntry, isHovered: boolean) => {
        if (entry.id === 'current-user') return 'bg-indigo-50 border-l-4 border-l-indigo-500';
        if (isHovered) return 'bg-gray-50/80';
        if (entry.rank === 1) return 'bg-gradient-to-r from-amber-50/60 to-transparent';
        if (entry.rank === 2) return 'bg-gradient-to-r from-gray-50/60 to-transparent';
        if (entry.rank === 3) return 'bg-gradient-to-r from-orange-50/40 to-transparent';
        return '';
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            <Navbar />

            {/* ── Sticky Hero Banner ── */}
            <div className="sticky top-0 z-40 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-700 text-white shadow-xl shadow-indigo-900/20">
                {/* Decorative shapes */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
                    <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl" />
                </div>

                <div className="relative container mx-auto px-4 py-5 sm:py-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Title Area */}
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-white/10 backdrop-blur-sm rounded-xl">
                                <Trophy className="h-6 w-6 text-yellow-300" />
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                                    {t('pages.leaderboard.title')}
                                </h1>
                                <p className="text-blue-200 text-xs sm:text-sm">
                                    {t('pages.leaderboard.subtitle')}
                                </p>
                            </div>
                        </div>

                        {/* Stats Pills */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs">
                                <Heart className="h-3.5 w-3.5 text-pink-300" />
                                <span className="font-bold">{formatAmount(totalDonated)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs">
                                <GraduationCap className="h-3.5 w-3.5 text-green-300" />
                                <span className="font-bold">{totalStudents}</span>
                                <span className="text-blue-200 hidden sm:inline">{t('pages.leaderboard.students')}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs">
                                <Building2 className="h-3.5 w-3.5 text-blue-300" />
                                <span className="font-bold">{corporateCount}</span>
                                <span className="text-blue-200 hidden sm:inline">{t('pages.leaderboard.corporate')}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs">
                                <Users className="h-3.5 w-3.5 text-purple-300" />
                                <span className="font-bold">{individualCount}</span>
                                <span className="text-blue-200 hidden sm:inline">{t('pages.leaderboard.individual')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6 sm:py-8">

                {/* ── Your Rank Card ── */}
                {currentUserName && (
                    <div ref={myRankRef} className="mb-6 animate-in fade-in slide-in-from-top-3 duration-500">
                        <div className="bg-gradient-to-r from-indigo-500 via-blue-600 to-purple-600 rounded-2xl p-[1px] shadow-lg shadow-indigo-200/40">
                            <div className="bg-white rounded-[15px] p-4 sm:p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <MapPin className="h-4 w-4 text-indigo-500" />
                                    <h3 className="text-sm font-bold text-gray-900">Senin Sıralaman</h3>
                                </div>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                    {/* Rank number */}
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200/50">
                                                <span className="text-xl font-extrabold">#{simulatedUserRank}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-lg">{simulatedUserEntry.displayName}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full bg-gradient-to-r text-white', getLevelInfo(simulatedUserEntry.points).color)}>
                                                    Lv.{getLevelInfo(simulatedUserEntry.points).level} {getLevelInfo(simulatedUserEntry.points).name}
                                                </span>
                                                <span className="text-xs text-gray-400">{simulatedUserEntry.points} puan</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center gap-3 sm:ml-auto">
                                        <div className="text-center px-4 py-2 bg-gray-50 rounded-xl">
                                            <p className="text-lg font-bold text-gray-900">{formatAmount(simulatedUserEntry.totalDonated)}</p>
                                            <p className="text-[10px] text-gray-500 font-medium">Toplam Bağış</p>
                                        </div>
                                        <div className="text-center px-4 py-2 bg-gray-50 rounded-xl">
                                            <p className="text-lg font-bold text-gray-900">{simulatedUserEntry.studentCount}</p>
                                            <p className="text-[10px] text-gray-500 font-medium">Öğrenci</p>
                                        </div>
                                        <div className="text-center px-4 py-2 bg-indigo-50 rounded-xl">
                                            <p className="text-lg font-bold text-indigo-600">+12 <ArrowUp className="inline h-3.5 w-3.5" /></p>
                                            <p className="text-[10px] text-indigo-500 font-medium">Bu Hafta</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Progress to next milestone */}
                                <div className="mt-4 pt-3 border-t border-gray-100">
                                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                                        <span>Sonraki seviyeye: <span className="font-semibold text-gray-700">Destekçi</span></span>
                                        <span className="font-medium">{simulatedUserEntry.points}/500 puan</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000" style={{ width: `${(simulatedUserEntry.points / 500) * 100}%` }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Top 3 Podium ── */}
                {filter === 'all' && !searchQuery && sortedLeaderboard.length >= 3 && (
                    <div className="mb-8">
                        <div className="flex items-end justify-center gap-2 sm:gap-4 max-w-3xl mx-auto">
                            {/* 2nd place */}
                            <div className="flex-1 text-center">
                                <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                    <div className="relative inline-block mb-2">
                                        <div className={cn('w-14 h-14 sm:w-18 sm:h-18 rounded-full flex items-center justify-center text-base sm:text-lg font-bold mx-auto', getAvatarColors(sortedLeaderboard[1]))}>
                                            {sortedLeaderboard[1].type === 'corporate' ? <Building2 className="h-6 w-6 sm:h-7 sm:w-7" /> : sortedLeaderboard[1].displayName.charAt(0)}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-white shadow">
                                            2
                                        </div>
                                    </div>
                                    <h3 className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{sortedLeaderboard[1].displayName}</h3>
                                    <p className="text-base sm:text-lg font-bold text-gray-900 mt-0.5">{formatAmount(sortedLeaderboard[1].totalDonated)}</p>
                                    <p className="text-[10px] text-gray-500">{sortedLeaderboard[1].studentCount} {t('pages.leaderboard.students')}</p>
                                    <div className="flex flex-wrap justify-center gap-0.5 mt-1.5">
                                        {sortedLeaderboard[1].badges.slice(0, 3).map(id => {
                                            const b = getBadgeById(id);
                                            return b ? <span key={id} className="text-sm" title={b.description}>{b.icon}</span> : null;
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* 1st place */}
                            <div className="flex-1 text-center -mt-3">
                                <div className="bg-gradient-to-b from-amber-50 to-white rounded-2xl border-2 border-amber-200 p-4 sm:p-6 shadow-lg shadow-amber-100/50 relative hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <span className="inline-flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md">
                                            <Crown className="h-3 w-3" /> #1
                                        </span>
                                    </div>
                                    <div className="relative inline-block mb-2 mt-2">
                                        <div className={cn('w-18 h-18 sm:w-22 sm:h-22 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto ring-4 ring-amber-200/50', getAvatarColors(sortedLeaderboard[0]))}>
                                            {sortedLeaderboard[0].type === 'corporate' ? <Building2 className="h-8 w-8 sm:h-9 sm:w-9" /> : sortedLeaderboard[0].displayName.charAt(0)}
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate">{sortedLeaderboard[0].displayName}</h3>
                                    <p className="text-lg sm:text-2xl font-extrabold bg-gradient-to-r from-amber-600 to-yellow-500 bg-clip-text text-transparent mt-0.5">{formatAmount(sortedLeaderboard[0].totalDonated)}</p>
                                    <p className="text-[10px] text-gray-500 mt-0.5">{sortedLeaderboard[0].studentCount} {t('pages.leaderboard.students')} &bull; {sortedLeaderboard[0].points.toLocaleString()} {t('pages.leaderboard.points')}</p>
                                    <div className="flex flex-wrap justify-center gap-1 mt-1.5">
                                        {sortedLeaderboard[0].badges.slice(0, 4).map(id => {
                                            const b = getBadgeById(id);
                                            return b ? <span key={id} className="text-xs" title={b.description}>{b.icon}</span> : null;
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* 3rd place */}
                            <div className="flex-1 text-center">
                                <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                    <div className="relative inline-block mb-2">
                                        <div className={cn('w-14 h-14 sm:w-18 sm:h-18 rounded-full flex items-center justify-center text-base sm:text-lg font-bold mx-auto', getAvatarColors(sortedLeaderboard[2]))}>
                                            {sortedLeaderboard[2].type === 'corporate' ? <Building2 className="h-6 w-6 sm:h-7 sm:w-7" /> : sortedLeaderboard[2].displayName.charAt(0)}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-white shadow">
                                            3
                                        </div>
                                    </div>
                                    <h3 className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{sortedLeaderboard[2].displayName}</h3>
                                    <p className="text-base sm:text-lg font-bold text-gray-900 mt-0.5">{formatAmount(sortedLeaderboard[2].totalDonated)}</p>
                                    <p className="text-[10px] text-gray-500">{sortedLeaderboard[2].studentCount} {t('pages.leaderboard.students')}</p>
                                    <div className="flex flex-wrap justify-center gap-0.5 mt-1.5">
                                        {sortedLeaderboard[2].badges.slice(0, 3).map(id => {
                                            const b = getBadgeById(id);
                                            return b ? <span key={id} className="text-sm" title={b.description}>{b.icon}</span> : null;
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* ── Main Leaderboard Table ── */}
                    <div className="lg:col-span-2" ref={tableRef}>
                        {/* Filters & Search Row */}
                        <div className="flex flex-col gap-3 mb-5">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
                                    {([
                                        { key: 'all' as FilterType, icon: Trophy, label: t('pages.leaderboard.all') },
                                        { key: 'corporate' as FilterType, icon: Building2, label: t('pages.leaderboard.corporate') },
                                        { key: 'individual' as FilterType, icon: User, label: t('pages.leaderboard.individual') },
                                    ] as const).map(f => (
                                        <button
                                            key={f.key}
                                            onClick={() => { setFilter(f.key); setShowCount(10); setSearchQuery(''); }}
                                            className={cn(
                                                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                                                filter === f.key
                                                    ? 'bg-indigo-600 text-white shadow-md'
                                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                            )}
                                        >
                                            <f.icon className="h-3.5 w-3.5" />
                                            <span className="hidden sm:inline">{f.label}</span>
                                        </button>
                                    ))}
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
                                        <button
                                            onClick={() => setTimeRange('allTime')}
                                            className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all', timeRange === 'allTime' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50')}
                                        >
                                            {t('pages.leaderboard.allTime')}
                                        </button>
                                        <button
                                            onClick={() => setTimeRange('thisMonth')}
                                            className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all', timeRange === 'thisMonth' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50')}
                                        >
                                            {t('pages.leaderboard.thisMonth')}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Search Bar */}
                            <div className={cn(
                                'relative transition-all duration-200',
                                searchFocused ? 'ring-2 ring-indigo-500 ring-offset-1' : '',
                                'rounded-xl'
                            )}>
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Search className={cn('h-4 w-4 transition-colors', searchFocused ? 'text-indigo-500' : 'text-gray-400')} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Bağışçı ara... (isim veya kurum)"
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); setShowCount(10); }}
                                    onFocus={() => setSearchFocused(true)}
                                    onBlur={() => setSearchFocused(false)}
                                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center"
                                    >
                                        <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                    </button>
                                )}
                            </div>

                            {searchQuery && (
                                <p className="text-xs text-gray-500">
                                    <span className="font-medium text-gray-700">{sortedLeaderboard.length}</span> sonuç bulundu
                                    {searchQuery && <span> &mdash; &ldquo;{searchQuery}&rdquo;</span>}
                                </p>
                            )}
                        </div>

                        {/* Table */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            {/* Header */}
                            <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-gray-50/80 border-b border-gray-200 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                                <div className="col-span-1 text-center">#</div>
                                <div className="col-span-5 sm:col-span-5">{t('pages.leaderboard.donor')}</div>
                                <div className="col-span-3 text-right">{t('pages.leaderboard.totalDonated')}</div>
                                <div className="col-span-3 text-right hidden sm:block">{t('pages.leaderboard.impact')}</div>
                            </div>

                            {/* Rows */}
                            <div className="divide-y divide-gray-100">
                                {visibleEntries.length === 0 && (
                                    <div className="px-4 py-12 text-center">
                                        <Search className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                                        <p className="text-sm text-gray-500">Sonuç bulunamadı</p>
                                        <p className="text-xs text-gray-400 mt-1">Farklı bir arama terimi deneyin</p>
                                    </div>
                                )}

                                {visibleEntries.map((entry) => {
                                    const level = getLevelInfo(entry.points);
                                    const isHovered = hoveredRow === entry.id;
                                    return (
                                        <div
                                            key={entry.id}
                                            onMouseEnter={() => setHoveredRow(entry.id)}
                                            onMouseLeave={() => setHoveredRow(null)}
                                            className={cn(
                                                'grid grid-cols-12 gap-2 px-4 py-3 items-center transition-all duration-200 cursor-default',
                                                getRowBg(entry, isHovered)
                                            )}
                                        >
                                            {/* Rank */}
                                            <div className="col-span-1 flex justify-center">
                                                {getRankDisplay(entry.rank, 'sm')}
                                            </div>

                                            {/* Donor Info */}
                                            <div className="col-span-5 sm:col-span-5 flex items-center gap-2.5 min-w-0">
                                                <div className={cn('w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0', getAvatarColors(entry))}>
                                                    {entry.type === 'corporate' ? <Building2 className="h-4 w-4" /> : entry.displayName.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-semibold text-gray-900 text-sm truncate">{entry.displayName}</span>
                                                        {entry.isAnonymous && <EyeOff className="h-3 w-3 text-gray-400 flex-shrink-0" />}
                                                        <Badge variant="outline" className={cn('text-[9px] px-1.5 py-0 h-[18px] hidden sm:inline-flex', entry.type === 'corporate' ? 'border-blue-200 text-blue-600 bg-blue-50' : 'border-purple-200 text-purple-600 bg-purple-50')}>
                                                            {entry.type === 'corporate' ? t('pages.leaderboard.corporate') : t('pages.leaderboard.individual')}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-1 mt-0.5">
                                                        <span className={cn('text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-gradient-to-r text-white', level.color)}>
                                                            Lv.{level.level}
                                                        </span>
                                                        <div className="flex gap-0.5">
                                                            {entry.badges.slice(0, 3).map(id => {
                                                                const b = getBadgeById(id);
                                                                return b ? <span key={id} className="text-[11px]" title={t(b.name)}>{b.icon}</span> : null;
                                                            })}
                                                            {entry.badges.length > 3 && <span className="text-[9px] text-gray-400">+{entry.badges.length - 3}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Total Donated */}
                                            <div className="col-span-3 text-right">
                                                <p className="font-bold text-gray-900 text-sm">{formatAmount(entry.totalDonated)}</p>
                                                <p className="text-[10px] text-gray-400">{entry.points.toLocaleString()} puan</p>
                                            </div>

                                            {/* Impact */}
                                            <div className="col-span-3 text-right hidden sm:block">
                                                <p className="text-sm font-semibold text-gray-700">
                                                    {entry.studentCount} <span className="font-normal text-gray-400 text-xs">{t('pages.leaderboard.students')}</span>
                                                </p>
                                                {level.pointsToNext > 0 && (
                                                    <div className="flex items-center gap-1 justify-end mt-1">
                                                        <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                            <div className={cn('h-full rounded-full bg-gradient-to-r', level.color)} style={{ width: `${level.progress}%` }} />
                                                        </div>
                                                        <span className="text-[9px] text-gray-400">{level.pointsToNext}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Show More */}
                            {hasMore && (
                                <div className="p-3 border-t border-gray-100 text-center">
                                    <button
                                        onClick={() => setShowCount(prev => prev + 10)}
                                        className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors px-4 py-1.5 rounded-lg hover:bg-indigo-50"
                                    >
                                        <ChevronDown className="h-4 w-4" />
                                        Daha Fazla Göster (+{Math.min(10, sortedLeaderboard.length - showCount)})
                                    </button>
                                </div>
                            )}

                            {/* End of list */}
                            {!hasMore && sortedLeaderboard.length > 0 && (
                                <div className="px-4 py-3 border-t border-gray-100 text-center">
                                    <p className="text-xs text-gray-400">Toplam {sortedLeaderboard.length} bağışçı listelendi</p>
                                </div>
                            )}
                        </div>

                        {/* Anonymous Notice */}
                        <div className="mt-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl flex items-center gap-2.5 border border-gray-200/80">
                            <EyeOff className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="text-xs text-gray-500">{t('pages.leaderboard.anonymousNotice')}</span>
                        </div>
                    </div>

                    {/* ── Sidebar ── */}
                    <div className="space-y-5">
                        {/* Weekly Highlight */}
                        {topDonor && !searchQuery && (
                            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg shadow-indigo-200/50">
                                <div className="flex items-center gap-2 mb-4">
                                    <Flame className="h-5 w-5 text-yellow-300" />
                                    <h3 className="font-bold text-sm">{t('pages.leaderboard.weeklyHighlight')}</h3>
                                </div>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ring-2 ring-white/30 bg-white/20">
                                        {topDonor.type === 'corporate' ? <Building2 className="h-6 w-6" /> : topDonor.displayName.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold">{topDonor.displayName}</p>
                                        <p className="text-xs text-indigo-200">{t('pages.leaderboard.weeklyHighlightDesc')}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-white/10 rounded-xl p-2.5 text-center backdrop-blur-sm">
                                        <p className="text-lg font-bold">{formatAmount(topDonor.totalDonated)}</p>
                                        <p className="text-[10px] text-indigo-200">{t('pages.leaderboard.totalDonated')}</p>
                                    </div>
                                    <div className="bg-white/10 rounded-xl p-2.5 text-center backdrop-blur-sm">
                                        <p className="text-lg font-bold">{topDonor.studentCount}</p>
                                        <p className="text-[10px] text-indigo-200">{t('pages.leaderboard.studentsSupported')}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Recent Activity Feed */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                                <Zap className="h-4 w-4 text-amber-500" />
                                <h3 className="font-semibold text-sm text-gray-900">{t('pages.leaderboard.recentActivity')}</h3>
                            </div>
                            <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
                                {mockActivity.map(activity => (
                                    <div key={activity.id} className="px-4 py-3 hover:bg-gray-50/50 transition-colors">
                                        <div className="flex items-start gap-2.5">
                                            <div className={cn('w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                                                activity.type === 'donation' ? 'bg-green-100' : activity.type === 'badge' ? 'bg-amber-100' : 'bg-purple-100'
                                            )}>
                                                {activity.type === 'donation' && <Heart className="h-3 w-3 text-green-600" />}
                                                {activity.type === 'badge' && <span className="text-xs">{activity.badgeEmoji}</span>}
                                                {activity.type === 'milestone' && <Target className="h-3 w-3 text-purple-600" />}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs text-gray-700">
                                                    <span className="font-semibold text-gray-900">{activity.donorName}</span>{' '}
                                                    {activity.description}
                                                </p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    {activity.amount && (
                                                        <span className="text-[10px] font-semibold text-green-600">{formatAmount(activity.amount)}</span>
                                                    )}
                                                    <span className="text-[9px] text-gray-400">{activity.timeAgo}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CTA - Join Community */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <Sparkles className="h-5 w-5 text-indigo-500" />
                                <h3 className="font-bold text-sm text-gray-900">{t('pages.leaderboard.joinCommunity')}</h3>
                            </div>
                            <p className="text-xs text-gray-600 mb-4">{t('pages.leaderboard.joinCommunityDesc')}</p>
                            <div className="flex flex-col gap-2">
                                <Link href="/donate">
                                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-sm gap-2 shadow-md shadow-indigo-200/50">
                                        <Gift className="h-4 w-4" />
                                        {t('pages.leaderboard.startDonating')}
                                    </Button>
                                </Link>
                                <Link href="/badges">
                                    <Button variant="outline" className="w-full text-sm gap-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                                        <Award className="h-4 w-4" />
                                        {t('pages.leaderboard.viewBadges')}
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Sosyal</h4>
                            <div className="space-y-0.5">
                                <Link href="/badges" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                                    <Award className="h-4 w-4 text-amber-500" />
                                    <span>{t('nav.menu.badges')}</span>
                                    <ArrowRight className="h-3 w-3 ml-auto text-gray-300" />
                                </Link>
                                <Link href="/updates" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                                    <TrendingUp className="h-4 w-4 text-blue-500" />
                                    <span>{t('nav.menu.studentUpdates')}</span>
                                    <ArrowRight className="h-3 w-3 ml-auto text-gray-300" />
                                </Link>
                                <Link href="/alumni" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                                    <GraduationCap className="h-4 w-4 text-green-500" />
                                    <span>{t('nav.menu.alumni')}</span>
                                    <ArrowRight className="h-3 w-3 ml-auto text-gray-300" />
                                </Link>
                                <Link href="/stories" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                                    <Heart className="h-4 w-4 text-rose-500" />
                                    <span>{t('nav.menu.stories')}</span>
                                    <ArrowRight className="h-3 w-3 ml-auto text-gray-300" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Demo Notice */}
                <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 max-w-2xl mx-auto">
                    <span className="text-amber-600 font-bold text-lg">⚠️</span>
                    <p className="text-amber-800 text-sm font-medium">{t('common.demoLeaderboard')}</p>
                </div>
            </div>

            {/* Scroll to Top Button */}
            {showScrollTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-6 right-6 z-50 w-11 h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-xl shadow-indigo-300/40 flex items-center justify-center transition-all duration-300 hover:scale-110"
                >
                    <ChevronUp className="h-5 w-5" />
                </button>
            )}

            <Footer />
        </div>
    );
}
