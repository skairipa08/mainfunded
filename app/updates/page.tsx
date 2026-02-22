'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
    BookOpen,
    TrendingUp,
    Heart,
    FileText,
    Users,
    Search,
    Sparkles,
    ArrowDown,
    Filter,
    Clock,
    Star,
    X,
    Hash,
    SlidersHorizontal,
} from 'lucide-react';
import { StudentBlog, mockBlogPosts } from '@/components/StudentBlog';
import MobileHeader from '@/components/MobileHeader';
import { useTranslation } from '@/lib/i18n/context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const ALL_TAGS = ['all', 'tesekkur', 'basari', 'finals', 'staj', 'kariyer', 'google', 'yenidonem', 'universite'];

function AnimatedCounter({ value, className }: { value: number; className?: string }) {
    const [displayed, setDisplayed] = React.useState(0);
    React.useEffect(() => {
        let start = 0;
        const duration = 1200;
        const step = Math.ceil(value / (duration / 16));
        const interval = setInterval(() => {
            start += step;
            if (start >= value) {
                setDisplayed(value);
                clearInterval(interval);
            } else {
                setDisplayed(start);
            }
        }, 16);
        return () => clearInterval(interval);
    }, [value]);
    return <span className={className}>{displayed.toLocaleString('tr-TR')}</span>;
}

export default function StudentUpdatesPage() {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState('all');
    const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');
    const [showStickyBar, setShowStickyBar] = useState(false);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const heroSearchRef = useRef<HTMLDivElement>(null);
    const stickySearchInputRef = useRef<HTMLInputElement>(null);

    // Show sticky bar when hero search scrolls out of view
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setShowStickyBar(!entry.isIntersecting);
            },
            { threshold: 0, rootMargin: '-80px 0px 0px 0px' }
        );
        if (heroSearchRef.current) {
            observer.observe(heroSearchRef.current);
        }
        return () => observer.disconnect();
    }, []);

    const clearSearch = useCallback(() => {
        setSearchQuery('');
    }, []);

    const clearAllFilters = useCallback(() => {
        setSearchQuery('');
        setSelectedTag('all');
        setSortBy('recent');
    }, []);

    const hasActiveFilters = searchQuery.trim() !== '' || selectedTag !== 'all' || sortBy !== 'recent';

    const filteredPosts = useMemo(() => {
        let posts = [...mockBlogPosts];

        // Filter by search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            posts = posts.filter(
                (p) =>
                    p.title.toLowerCase().includes(q) ||
                    p.content.toLowerCase().includes(q) ||
                    p.studentName.toLowerCase().includes(q)
            );
        }

        // Filter by tag
        if (selectedTag !== 'all') {
            posts = posts.filter((p) => p.tags?.includes(selectedTag));
        }

        // Sort
        if (sortBy === 'popular') {
            posts.sort((a, b) => b.likes - a.likes);
        } else {
            posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }

        return posts;
    }, [searchQuery, selectedTag, sortBy]);

    // Featured post = most liked
    const featuredPost = useMemo(
        () => [...mockBlogPosts].sort((a, b) => b.likes - a.likes)[0],
        []
    );

    return (
        <div className="min-h-screen bg-gray-50/80">
            {/* Mobile Header */}
            <MobileHeader transparent backHref="/" />

            {/* Hero Section - Modern gradient with pattern overlay */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white -mt-14 pt-20 pb-24">
                {/* Decorative background pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-300 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-300 rounded-full blur-3xl" />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                            <Sparkles className="h-4 w-4 text-yellow-300" />
                            <span className="text-sm font-medium text-white/90">
                                {t('pages.updates.featuredLabel') || 'Öğrencilerden Son Güncellemeler'}
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                            {t('pages.updates.title')}
                        </h1>
                        <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
                            {t('pages.updates.subtitle')}
                        </p>

                        {/* Search Bar in Hero */}
                        <div ref={heroSearchRef} className="max-w-xl mx-auto relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t('pages.updates.searchPlaceholder') || 'Güncelleme ara...'}
                                className="w-full pl-12 pr-24 py-3.5 bg-white/95 backdrop-blur-sm text-gray-900 rounded-2xl shadow-xl shadow-black/10 border-0 focus:outline-none focus:ring-4 focus:ring-white/30 placeholder:text-gray-400 text-base"
                            />
                            {searchQuery && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute right-16 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                            <button
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5"
                                onClick={() => {
                                    /* Search is already reactive */
                                }}
                            >
                                <Search className="h-4 w-4" />
                                {t('pages.updates.searchBtn') || 'Ara'}
                            </button>
                        </div>

                        {/* Quick Tag Pills in Hero */}
                        <div className="max-w-xl mx-auto mt-4 flex items-center justify-center gap-2 flex-wrap">
                            <span className="text-blue-200 text-xs font-medium">
                                <Hash className="h-3 w-3 inline mr-0.5" />
                                {t('pages.updates.popularTags') || 'Popüler:'}
                            </span>
                            {['basari', 'tesekkur', 'kariyer', 'staj'].map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => setSelectedTag(tag)}
                                    className={cn(
                                        'px-3 py-1 rounded-full text-xs font-medium transition-all duration-200',
                                        selectedTag === tag
                                            ? 'bg-white text-blue-700 shadow-md'
                                            : 'bg-white/20 text-white/90 hover:bg-white/30 border border-white/20'
                                    )}
                                >
                                    #{tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Wave divider */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 80" fill="none" className="w-full">
                        <path
                            d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,80 L0,80 Z"
                            className="fill-gray-50/80"
                        />
                    </svg>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-10 relative z-10">

                {/* Sticky Search & Filter Bar */}
                <div
                    className={cn(
                        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
                        showStickyBar
                            ? 'translate-y-0 opacity-100'
                            : '-translate-y-full opacity-0 pointer-events-none'
                    )}
                >
                    <div className="bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg">
                        <div className="container mx-auto px-4 py-3">
                            <div className="max-w-4xl mx-auto flex items-center gap-3">
                                {/* Sticky Search Input */}
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        ref={stickySearchInputRef}
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder={t('pages.updates.searchPlaceholder') || 'Güncelleme ara...'}
                                        className="w-full pl-10 pr-10 py-2.5 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 placeholder:text-gray-400 text-sm"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={clearSearch}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>

                                {/* Sticky Tag Selector */}
                                <div className="hidden md:flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
                                    {ALL_TAGS.slice(0, 5).map((tag) => (
                                        <button
                                            key={tag}
                                            onClick={() => setSelectedTag(tag)}
                                            className={cn(
                                                'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all',
                                                selectedTag === tag
                                                    ? 'bg-blue-600 text-white shadow-sm'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                                            )}
                                        >
                                            {tag === 'all' ? (t('pages.updates.allPosts') || 'Tümü') : `#${tag}`}
                                        </button>
                                    ))}
                                </div>

                                {/* Mobile Filter Toggle */}
                                <button
                                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                                    className={cn(
                                        'md:hidden flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border',
                                        hasActiveFilters
                                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                                            : 'bg-gray-50 text-gray-600 border-gray-200'
                                    )}
                                >
                                    <SlidersHorizontal className="h-4 w-4" />
                                    {hasActiveFilters && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                    )}
                                </button>

                                {/* Sort Toggle (Sticky) */}
                                <div className="hidden md:flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
                                    <button
                                        onClick={() => setSortBy('recent')}
                                        className={cn(
                                            'px-2.5 py-1.5 rounded-md text-xs font-medium transition-all',
                                            sortBy === 'recent'
                                                ? 'bg-white text-blue-700 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'
                                        )}
                                    >
                                        <Clock className="h-3 w-3 inline mr-1" />
                                        {t('pages.updates.sortRecent') || 'En Yeni'}
                                    </button>
                                    <button
                                        onClick={() => setSortBy('popular')}
                                        className={cn(
                                            'px-2.5 py-1.5 rounded-md text-xs font-medium transition-all',
                                            sortBy === 'popular'
                                                ? 'bg-white text-blue-700 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'
                                        )}
                                    >
                                        <TrendingUp className="h-3 w-3 inline mr-1" />
                                        {t('pages.updates.sortPopular') || 'Popüler'}
                                    </button>
                                </div>

                                {/* Clear All (if active) */}
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearAllFilters}
                                        className="hidden md:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <X className="h-3 w-3" />
                                        {t('pages.updates.clearFilters') || 'Temizle'}
                                    </button>
                                )}
                            </div>

                            {/* Mobile Filters Dropdown */}
                            {showMobileFilters && (
                                <div className="md:hidden mt-3 pt-3 border-t border-gray-100">
                                    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
                                        {ALL_TAGS.map((tag) => (
                                            <button
                                                key={tag}
                                                onClick={() => setSelectedTag(tag)}
                                                className={cn(
                                                    'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all',
                                                    selectedTag === tag
                                                        ? 'bg-blue-600 text-white shadow-sm'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                                                )}
                                            >
                                                {tag === 'all' ? (t('pages.updates.allPosts') || 'Tümü') : `#${tag}`}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                                            <button
                                                onClick={() => setSortBy('recent')}
                                                className={cn(
                                                    'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                                                    sortBy === 'recent'
                                                        ? 'bg-white text-blue-700 shadow-sm'
                                                        : 'text-gray-500'
                                                )}
                                            >
                                                {t('pages.updates.sortRecent') || 'En Yeni'}
                                            </button>
                                            <button
                                                onClick={() => setSortBy('popular')}
                                                className={cn(
                                                    'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                                                    sortBy === 'popular'
                                                        ? 'bg-white text-blue-700 shadow-sm'
                                                        : 'text-gray-500'
                                                )}
                                            >
                                                {t('pages.updates.sortPopular') || 'Popüler'}
                                            </button>
                                        </div>
                                        {hasActiveFilters && (
                                            <button
                                                onClick={clearAllFilters}
                                                className="text-xs text-red-500 font-medium"
                                            >
                                                {t('pages.updates.clearFilters') || 'Temizle'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {/* Stats Cards */}
                <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-10">
                    {[
                        {
                            icon: Users,
                            value: 156,
                            label: t('pages.updates.activeJournals'),
                            color: 'blue',
                            gradient: 'from-blue-500 to-blue-600',
                        },
                        {
                            icon: FileText,
                            value: 1245,
                            label: t('pages.updates.posts'),
                            color: 'emerald',
                            gradient: 'from-emerald-500 to-emerald-600',
                        },
                        {
                            icon: Heart,
                            value: 8432,
                            label: t('pages.updates.likes'),
                            color: 'rose',
                            gradient: 'from-rose-500 to-rose-600',
                        },
                        {
                            icon: TrendingUp,
                            value: 94,
                            label: t('pages.updates.engagementRate') || 'Etkileşim %',
                            color: 'violet',
                            gradient: 'from-violet-500 to-violet-600',
                        },
                    ].map((stat, idx) => (
                        <div
                            key={idx}
                            className="group bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                        >
                            <div
                                className={cn(
                                    'w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br text-white shadow-sm',
                                    stat.gradient
                                )}
                            >
                                <stat.icon className="h-5 w-5" />
                            </div>
                            <AnimatedCounter
                                value={stat.value}
                                className={cn('text-2xl md:text-3xl font-bold block', {
                                    'text-blue-600': stat.color === 'blue',
                                    'text-emerald-600': stat.color === 'emerald',
                                    'text-rose-600': stat.color === 'rose',
                                    'text-violet-600': stat.color === 'violet',
                                })}
                            />
                            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Featured Post Banner */}
                {featuredPost && (
                    <div className="max-w-4xl mx-auto mb-10">
                        <div className="relative bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-2xl p-6 md:p-8 overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-200/40 to-transparent rounded-bl-full" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-3">
                                    <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                                    <span className="text-sm font-semibold text-amber-700 uppercase tracking-wide">
                                        {t('pages.updates.featuredPost') || 'Öne Çıkan Güncelleme'}
                                    </span>
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                                    {featuredPost.title}
                                </h3>
                                <p className="text-gray-600 line-clamp-2 mb-4 max-w-2xl">
                                    {featuredPost.content}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Heart className="h-4 w-4 text-rose-400" />
                                        {featuredPost.likes} {t('pages.updates.likes')}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <BookOpen className="h-4 w-4 text-blue-400" />
                                        {featuredPost.studentName}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters & Content */}
                <div className="max-w-4xl mx-auto">
                    {/* Filter Bar */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
                        <div className="flex flex-col gap-3">
                            {/* Inline Search (visible when not using sticky) */}
                            <div className="relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={t('pages.updates.searchPlaceholder') || 'Başlık, içerik veya öğrenci adı ile ara...'}
                                    className="w-full pl-10 pr-20 py-2.5 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 placeholder:text-gray-400 text-sm"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={clearSearch}
                                        className="absolute right-14 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                )}
                                <button
                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
                                >
                                    <Search className="h-3.5 w-3.5" />
                                    {t('pages.updates.searchBtn') || 'Ara'}
                                </button>
                            </div>

                            {/* Tags + Sort Row */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                {/* Tag Filters */}
                                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                                    <Filter className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                    {ALL_TAGS.map((tag) => (
                                        <button
                                            key={tag}
                                            onClick={() => setSelectedTag(tag)}
                                            className={cn(
                                                'px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200',
                                                selectedTag === tag
                                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                                                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50'
                                            )}
                                        >
                                            {tag === 'all'
                                                ? t('pages.updates.allPosts') || 'Tümü'
                                                : `#${tag}`}
                                        </button>
                                    ))}
                                </div>

                                {/* Sort Buttons */}
                                <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl p-1 flex-shrink-0">
                                    <button
                                        onClick={() => setSortBy('recent')}
                                        className={cn(
                                            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                                            sortBy === 'recent'
                                                ? 'bg-white text-blue-700 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'
                                        )}
                                    >
                                        <Clock className="h-3.5 w-3.5" />
                                        {t('pages.updates.sortRecent') || 'En Yeni'}
                                    </button>
                                    <button
                                        onClick={() => setSortBy('popular')}
                                        className={cn(
                                            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                                            sortBy === 'popular'
                                                ? 'bg-white text-blue-700 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'
                                        )}
                                    >
                                        <TrendingUp className="h-3.5 w-3.5" />
                                        {t('pages.updates.sortPopular') || 'Popüler'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Active Filters Summary */}
                        {hasActiveFilters && (
                            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs text-gray-400 font-medium">
                                        {t('pages.updates.activeFilters') || 'Aktif Filtreler:'}
                                    </span>
                                    {searchQuery && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                                            <Search className="h-3 w-3" />
                                            &quot;{searchQuery}&quot;
                                            <button onClick={clearSearch} className="ml-0.5 hover:text-blue-900">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    )}
                                    {selectedTag !== 'all' && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                                            <Hash className="h-3 w-3" />
                                            {selectedTag}
                                            <button onClick={() => setSelectedTag('all')} className="ml-0.5 hover:text-purple-900">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    )}
                                    {sortBy !== 'recent' && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">
                                            <TrendingUp className="h-3 w-3" />
                                            {t('pages.updates.sortPopular') || 'Popüler'}
                                            <button onClick={() => setSortBy('recent')} className="ml-0.5 hover:text-amber-900">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={clearAllFilters}
                                    className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1 transition-colors"
                                >
                                    <X className="h-3 w-3" />
                                    {t('pages.updates.clearAll') || 'Tümünü Temizle'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Results Count */}
                    {(searchQuery || selectedTag !== 'all') && (
                        <div className="mb-4 flex items-center gap-2">
                            <p className="text-sm text-gray-500">
                                <span className="font-semibold text-gray-900">{filteredPosts.length}</span>{' '}
                                {t('pages.updates.resultsFound') || 'sonuç bulundu'}
                                {searchQuery && (
                                    <span className="text-gray-400">
                                        {' '}
                                        &quot;{searchQuery}&quot; {t('pages.updates.forSearch') || 'için'}
                                    </span>
                                )}
                                {selectedTag !== 'all' && (
                                    <span className="text-gray-400">
                                        {' '}#{selectedTag} {t('pages.updates.inTag') || 'etiketinde'}
                                    </span>
                                )}
                            </p>
                        </div>
                    )}

                    {/* Blog Posts - Timeline Style */}
                    {filteredPosts.length > 0 ? (
                        <div className="relative">
                            {/* Timeline line */}
                            <div className="hidden md:block absolute left-6 top-4 bottom-4 w-0.5 bg-gradient-to-b from-blue-200 via-purple-200 to-transparent" />

                            <StudentBlog posts={filteredPosts} showTimeline />
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Search className="h-8 w-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {t('pages.updates.noResults') || 'Sonuç Bulunamadı'}
                            </h3>
                            <p className="text-gray-500 max-w-sm mx-auto">
                                {t('pages.updates.noResultsDesc') || 'Arama kriterlerinize uygun güncelleme bulunamadı. Filtreleri değiştirmeyi deneyin.'}
                            </p>
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={clearAllFilters}
                            >
                                {t('pages.updates.clearFilters') || 'Filtreleri Temizle'}
                            </Button>
                        </div>
                    )}

                    {/* Load More */}
                    {filteredPosts.length > 0 && (
                        <div className="text-center mt-10 mb-16">
                            <Button
                                variant="outline"
                                size="lg"
                                className="rounded-xl px-8 border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all group"
                            >
                                <ArrowDown className="h-4 w-4 mr-2 group-hover:animate-bounce" />
                                {t('pages.updates.loadMore')}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
