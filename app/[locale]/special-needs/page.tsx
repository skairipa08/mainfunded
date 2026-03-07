'use client';
import { useCurrency } from '@/lib/currency-context';
import { useTranslation } from "@/lib/i18n/context";
import DOMPurify from 'isomorphic-dompurify';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Heart,
    Globe,
    Users,
    BookOpen,
    ArrowRight,
    CheckCircle,
    MapPin,
    Target,
    TrendingUp,
    Share2,
    ChevronDown,
    Star,
    Shield,
    Sparkles,
    GraduationCap,
    Hand,
    Lightbulb,
    Accessibility,
    Brain,
    Ear,
    Eye,
    Puzzle,
    HandHeart,
    Clock,
    Gift,
    Quote,
    Baby,
    Stethoscope,
} from 'lucide-react';

/* ────────────────────────────────────────────
   Unsplash images - Special Needs Children theme
   ──────────────────────────────────────────── */
const HERO_IMG = 'https://images.unsplash.com/photo-1607453998774-d533f65dac99?w=1920&q=80&auto=format&fit=crop';
const IMG_THERAPY = 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&q=80&auto=format&fit=crop';
const IMG_INCLUSIVE = 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80&auto=format&fit=crop';
const IMG_LEARNING = 'https://images.unsplash.com/photo-1588075592446-265fd1e6e76f?w=800&q=80&auto=format&fit=crop';
const IMG_PLAY = 'https://images.unsplash.com/photo-1587654780291-39c9404d7dd0?w=800&q=80&auto=format&fit=crop';
const IMG_HOPE = 'https://images.unsplash.com/photo-1491013516836-7db643ee125a?w=800&q=80&auto=format&fit=crop';
const IMG_JOY = 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800&q=80&auto=format&fit=crop';

/* ────────────────────────────────────────────
   Campaign stats
   ──────────────────────────────────────────── */
const CAMPAIGN_GOAL = 750000;
const CAMPAIGN_RAISED = 0;
const CAMPAIGN_DONORS = 0;
const CAMPAIGN_CHILDREN = 0;
const CAMPAIGN_COUNTRIES = 1;

/* ────────────────────────────────────────────
   Animated counter
   ──────────────────────────────────────────── */
function AnimatedNumber({ target, prefix = '', suffix = '' }: { target: number; prefix?: string; suffix?: string }) {
    const [count, setCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) setIsVisible(true);
        }, { threshold: 0.3 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;
        const duration = 2000;
        const steps = 60;
        const increment = target / steps;
        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(Math.floor(current));
            }
        }, duration / steps);
        return () => clearInterval(timer);
    }, [target, isVisible]);

    return (
        <span ref={ref}>
            {prefix}{count.toLocaleString('tr-TR')}{suffix}
        </span>
    );
}

/* ────────────────────────────────────────────
   Heartbeat pulse component
   ──────────────────────────────────────────── */
function HeartbeatPulse() {
    return (
        <div className="relative">
            <Heart className="h-5 w-5 text-pink-400 animate-pulse" />
            <Heart className="absolute inset-0 h-5 w-5 text-pink-400 animate-ping opacity-30" />
        </div>
    );
}

/* ════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════ */
export default function SpecialNeedsPage() {
    const { t } = useTranslation();
    const { formatAmount, currencySymbol, currency } = useCurrency();
    const router = useRouter();
    const [donationAmount, setDonationAmount] = useState('');
    const [urgencySeconds, setUrgencySeconds] = useState(0);

    // Urgency timer
    useEffect(() => {
        const timer = setInterval(() => {
            setUrgencySeconds(prev => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const progressPercent = Math.round((CAMPAIGN_RAISED / CAMPAIGN_GOAL) * 100);

    const handleDonate = () => {
        const minAmount = currency === 'TRY' ? 100 : 10;
        if (donationAmount && Number(donationAmount) < minAmount) {
            alert(`Lütfen en az ${minAmount} ${currencySymbol} tutarında bir bağış girin.`);
            return;
        }
        if (donationAmount) {
            router.push(`/donate?amount=${donationAmount}&campaign=special-needs`);
        } else {
            router.push('/donate?campaign=special-needs');
        }
    };

    const impactAreas = [
        {
            icon: Lightbulb,
            title: t('specialNeeds.impact.assistiveTech'),
            description: t('specialNeeds.impact.assistiveTechDesc'),
            raised: 0,
            goal: 120000,
            color: 'text-teal-600',
            bg: 'bg-teal-50',
        },
        {
            icon: Stethoscope,
            title: t('specialNeeds.impact.therapy'),
            description: t('specialNeeds.impact.therapyDesc'),
            raised: 0,
            goal: 150000,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
        },
        {
            icon: BookOpen,
            title: t('specialNeeds.impact.inclusiveClassroom'),
            description: t('specialNeeds.impact.inclusiveClassroomDesc'),
            raised: 0,
            goal: 130000,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
        },
        {
            icon: GraduationCap,
            title: t('specialNeeds.impact.joyTrips'),
            description: t('specialNeeds.impact.joyTripsDesc'),
            raised: 0,
            goal: 100000,
            color: 'text-rose-600',
            bg: 'bg-rose-50',
        },
        {
            icon: Sparkles,
            title: t('specialNeeds.impact.sensoryRooms'),
            description: t('specialNeeds.impact.sensoryRoomsDesc'),
            raised: 0,
            goal: 180000,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
        },
    ];

    const stories = [
        {
            name: 'Elif',
            age: 8,
            country: t('specialNeeds.stories.country1'),
            image: IMG_HOPE,
            quote: t('specialNeeds.stories.quote1'),
            condition: t('specialNeeds.stories.condition1'),
            dream: t('specialNeeds.stories.dream1'),
        },
        {
            name: 'Yusuf',
            age: 6,
            country: t('specialNeeds.stories.country2'),
            image: IMG_JOY,
            quote: t('specialNeeds.stories.quote2'),
            condition: t('specialNeeds.stories.condition2'),
            dream: t('specialNeeds.stories.dream2'),
        },
        {
            name: 'Zeynep',
            age: 10,
            country: t('specialNeeds.stories.country3'),
            image: IMG_INCLUSIVE,
            quote: t('specialNeeds.stories.quote3'),
            condition: t('specialNeeds.stories.condition3'),
            dream: t('specialNeeds.stories.dream3'),
        },
    ];

    const coffeeCostItems = [
        {
            amount: currency === 'TRY' ? 1000 : 75,
            impact: t('specialNeeds.coffee.impact1'),
            emoji: '📖',
        },
        {
            amount: currency === 'TRY' ? 8000 : 700,
            impact: t('specialNeeds.coffee.impact2'),
            emoji: '🎨',
        },
        {
            amount: currency === 'TRY' ? 10000 : 500,
            impact: t('specialNeeds.coffee.impact3'),
            emoji: '🧩',
        },
        {
            amount: currency === 'TRY' ? 50000 : 2000,
            impact: t('specialNeeds.coffee.impact4'),
            emoji: '💜',
        },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />
            <main className="flex-grow">

                {/* ═══════════════════════════════
                    HERO SECTION — Deeply Emotional
                   ═══════════════════════════════ */}
                <section className="relative min-h-[90vh] flex items-center overflow-hidden">
                    {/* Background Image */}
                    <div className="absolute inset-0">
                        <Image
                            src={HERO_IMG}
                            alt={t('specialNeeds.heroAlt')}
                            fill
                            className="object-cover"
                            priority
                        />
                        {/* Deeper, more dramatic overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-purple-950/75 to-black/50" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
                        <div className="max-w-3xl">
                            {/* Urgent Badge */}
                            <div className="inline-flex items-center gap-2 bg-red-500/20 backdrop-blur-md border border-red-400/30 rounded-full px-5 py-2 mb-8 animate-pulse">
                                <HeartbeatPulse />
                                <span className="text-sm text-white/90 font-medium">{t('specialNeeds.badge')}</span>
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight mb-6">
                                {t('specialNeeds.heroTitle1')}
                                <br />
                                <span className="bg-gradient-to-r from-pink-300 via-purple-300 to-teal-300 bg-clip-text text-transparent">
                                    {t('specialNeeds.heroTitle2')}
                                </span>
                            </h1>

                            <p className="text-lg sm:text-xl text-white/80 leading-relaxed mb-4 max-w-2xl" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(t('specialNeeds.heroSubtitle')) }} />

                            {/* Emotional urgency line */}
                            <p className="text-rose-300 font-medium text-base mb-10 flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {t('specialNeeds.heroUrgency')}
                            </p>

                            {/* Quick donation and Apply */}
                            <div className="flex flex-wrap gap-4 mb-10">
                                <Button
                                    size="lg"
                                    onClick={handleDonate}
                                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white h-14 px-8 sm:px-10 rounded-2xl text-base sm:text-lg font-semibold shadow-xl shadow-pink-500/30 transition-all duration-300 hover:scale-105"
                                >
                                    <Heart className="mr-2 h-5 w-5" />
                                    {t('specialNeeds.donateNow')}
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    onClick={() => {
                                        const el = document.getElementById('stories');
                                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="border-white/30 text-white hover:bg-white/10 h-14 px-6 sm:px-8 rounded-2xl text-base sm:text-lg backdrop-blur-sm"
                                >
                                    {t('specialNeeds.hearStories')}
                                    <ChevronDown className="ml-2 h-5 w-5" />
                                </Button>
                                <Button
                                    size="lg"
                                    onClick={() => router.push('/special-needs/apply')}
                                    className="bg-white/20 hover:bg-white/30 border border-white/40 text-white h-14 px-6 sm:px-8 rounded-2xl text-base sm:text-lg font-medium backdrop-blur-sm transition-all"
                                >
                                    {t('specialNeeds.apply.startApplication')}
                                </Button>
                            </div>

                            {/* Progress bar */}
                            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 max-w-xl">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-white/70 text-sm font-medium">{t('specialNeeds.raised')}</span>
                                    <span className="text-white/70 text-sm font-medium">{t('specialNeeds.goal')}</span>
                                </div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-2xl font-bold text-white">{formatAmount(CAMPAIGN_RAISED)}</span>
                                    <span className="text-lg text-white/60">{formatAmount(CAMPAIGN_GOAL)}</span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-pink-400 to-purple-500 h-3 rounded-full transition-all duration-1000"
                                        style={{ width: `${Math.max(progressPercent, 2)}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between mt-3">
                                    <span className="text-pink-300 font-semibold text-sm">%{progressPercent} {t('specialNeeds.completed')}</span>
                                    <span className="text-white/50 text-sm">{CAMPAIGN_DONORS.toLocaleString()} {t('specialNeeds.donors')}</span>
                                </div>
                                {/* Emotional urgency note */}
                                <p className="text-white/40 text-xs mt-3 italic text-center">
                                    {t('specialNeeds.heroProgressNote')}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════
                    EMOTIONAL QUOTE — Gut Punch
                   ═══════════════════════════════ */}
                <section className="relative py-20 bg-gradient-to-br from-purple-950 via-slate-900 to-pink-950 overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-pink-500 rounded-full blur-[150px]" />
                        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500 rounded-full blur-[150px]" />
                    </div>
                    <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
                        <div className="text-7xl mb-8 animate-pulse">💜</div>
                        <blockquote className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-relaxed mb-8">
                            &ldquo;{t('specialNeeds.emotionalQuote.text')}&rdquo;
                        </blockquote>
                        <p className="text-lg text-purple-200 mb-3">
                            {t('specialNeeds.emotionalQuote.subtext')}
                        </p>
                        <div className="flex items-center justify-center gap-3 mt-6">
                            <div className="w-12 h-0.5 bg-pink-400" />
                            <span className="text-slate-400 font-medium">{t('specialNeeds.emotionalQuote.author')}</span>
                            <div className="w-12 h-0.5 bg-purple-400" />
                        </div>

                        <div className="mt-12">
                            <Button
                                onClick={handleDonate}
                                size="lg"
                                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white h-14 px-12 rounded-2xl text-lg font-semibold shadow-xl shadow-pink-500/30 transition-all duration-300 hover:scale-105"
                            >
                                <Heart className="mr-2 h-5 w-5" />
                                {t('specialNeeds.emotionalQuote.cta')}
                            </Button>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════
                    STATISTICS BAND — Shocking Numbers
                   ═══════════════════════════════ */}
                <section className="bg-gradient-to-r from-teal-900 via-purple-900 to-indigo-900 py-16 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute inset-0" style={{
                            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                            backgroundSize: '40px 40px',
                        }} />
                    </div>
                    <div className="relative z-10 max-w-7xl mx-auto px-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                            {[
                                { value: CAMPAIGN_CHILDREN, label: t('specialNeeds.stats.childrenSupported'), icon: Users, suffix: '+', color: 'text-teal-400' },
                                { value: CAMPAIGN_COUNTRIES, label: t('specialNeeds.stats.countries'), icon: Globe, suffix: '', color: 'text-cyan-400' },
                                { value: CAMPAIGN_DONORS, label: t('specialNeeds.stats.donorCount'), icon: Heart, suffix: '+', color: 'text-pink-400' },
                                { value: 100, label: t('specialNeeds.stats.fundingRate'), icon: TrendingUp, suffix: '%', color: 'text-purple-400' },
                            ].map((stat, i) => {
                                const Icon = stat.icon;
                                return (
                                    <div key={i} className="text-center">
                                        <Icon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />
                                        <div className="text-3xl sm:text-4xl font-bold text-white mb-1">
                                            <AnimatedNumber target={stat.value} suffix={stat.suffix} />
                                        </div>
                                        <p className="text-slate-300 text-sm">{stat.label}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════
                    THE CHALLENGE — Heart-Wrenching Facts
                   ═══════════════════════════════ */}
                <section className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="text-center mb-16">
                            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-purple-600 bg-purple-50 px-4 py-1.5 rounded-full mb-4">
                                {t('specialNeeds.challenge.badge')}
                            </span>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
                                {t('specialNeeds.challenge.title')}
                            </h2>
                            <p className="text-lg text-slate-500 max-w-3xl mx-auto leading-relaxed">
                                {t('specialNeeds.challenge.subtitle')}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            {/* Image collage */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg">
                                        <Image
                                            src={IMG_THERAPY}
                                            alt={t('specialNeeds.challenge.imgAlt1')}
                                            fill
                                            className="object-cover hover:scale-105 transition-transform duration-700"
                                        />
                                    </div>
                                    <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg">
                                        <Image
                                            src={IMG_LEARNING}
                                            alt={t('specialNeeds.challenge.imgAlt2')}
                                            fill
                                            className="object-cover hover:scale-105 transition-transform duration-700"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4 pt-8">
                                    <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg">
                                        <Image
                                            src={IMG_PLAY}
                                            alt={t('specialNeeds.challenge.imgAlt3')}
                                            fill
                                            className="object-cover hover:scale-105 transition-transform duration-700"
                                        />
                                    </div>
                                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg">
                                        <Image
                                            src={IMG_INCLUSIVE}
                                            alt={t('specialNeeds.challenge.imgAlt4')}
                                            fill
                                            className="object-cover hover:scale-105 transition-transform duration-700"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Facts */}
                            <div className="space-y-8">
                                {[
                                    {
                                        stat: '240M',
                                        text: t('specialNeeds.challenge.fact1'),
                                        color: 'bg-purple-500',
                                    },
                                    {
                                        stat: '%90',
                                        text: t('specialNeeds.challenge.fact2'),
                                        color: 'bg-teal-500',
                                    },
                                    {
                                        stat: '%50',
                                        text: t('specialNeeds.challenge.fact3'),
                                        color: 'bg-indigo-500',
                                    },
                                    {
                                        stat: '1/10',
                                        text: t('specialNeeds.challenge.fact4'),
                                        color: 'bg-rose-500',
                                    },
                                    {
                                        stat: formatAmount(75),
                                        text: t('specialNeeds.challenge.fact5'),
                                        color: 'bg-cyan-500',
                                    },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-5 group">
                                        <div className={`${item.color} text-white text-xl font-bold px-4 py-3 rounded-xl min-w-[80px] text-center shadow-lg group-hover:scale-105 transition-transform`}>
                                            {item.stat}
                                        </div>
                                        <p className="text-slate-600 text-lg leading-relaxed pt-2">{item.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════
                    CHILDREN STORIES — Deep Emotional Connection
                   ═══════════════════════════════ */}
                <section id="stories" className="py-20 bg-gradient-to-b from-slate-50 to-white">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="text-center mb-16">
                            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-pink-600 bg-pink-50 px-4 py-1.5 rounded-full mb-4">
                                {t('specialNeeds.stories.badge')}
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                                {t('specialNeeds.stories.title')}
                            </h2>
                            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                                {t('specialNeeds.stories.subtitle')}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {stories.map((story, i) => (
                                <div
                                    key={i}
                                    className="group relative bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                                >
                                    <div className="relative h-72 overflow-hidden">
                                        <Image
                                            src={story.image}
                                            alt={story.name}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                        <div className="absolute bottom-4 left-4 flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-white/80" />
                                            <span className="text-sm text-white/90 font-medium">{story.country}</span>
                                        </div>
                                        <div className="absolute top-4 right-4">
                                            <span className="bg-purple-500/80 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-medium">
                                                {story.condition}
                                            </span>
                                        </div>
                                        {/* Dream badge */}
                                        <div className="absolute bottom-4 right-4">
                                            <span className="bg-pink-500/80 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
                                                <Star className="h-3 w-3" />
                                                {story.dream}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                {story.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900">{story.name}</p>
                                                <p className="text-xs text-slate-400">{story.age} {t('specialNeeds.stories.yearsOld')}</p>
                                            </div>
                                        </div>
                                        <blockquote className="text-slate-600 italic leading-relaxed mb-4">
                                            &ldquo;{story.quote}&rdquo;
                                        </blockquote>
                                        <Button
                                            onClick={() => router.push(`/campaign/special-needs-story-${encodeURIComponent(story.name)}/donate`)}
                                            size="sm"
                                            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white rounded-xl font-medium"
                                        >
                                            <Heart className="mr-1 h-4 w-4" />
                                            {t('specialNeeds.stories.helpChild', { name: story.name })}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════
                    "ONE COFFEE IS ENOUGH" — Micro-donation Impact
                   ═══════════════════════════════ */}
                <section className="py-20 bg-white">
                    <div className="max-w-5xl mx-auto px-4">
                        <div className="text-center mb-16">
                            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-amber-600 bg-amber-50 px-4 py-1.5 rounded-full mb-4">
                                {t('specialNeeds.coffee.badge')}
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                                {t('specialNeeds.coffee.title')}
                            </h2>
                            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                                {t('specialNeeds.coffee.subtitle')}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {coffeeCostItems.map((item, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setDonationAmount(item.amount.toString());
                                        document.getElementById('donate-section')?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-pink-200 transition-all duration-300 group text-left hover:-translate-y-1"
                                >
                                    <div className="text-4xl mb-4">{item.emoji}</div>
                                    <div className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-pink-600 transition-colors">
                                        {formatAmount(item.amount)}
                                    </div>
                                    <p className="text-sm text-slate-500 leading-relaxed">{item.impact}</p>
                                    <div className="mt-4 flex items-center text-pink-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                        {t('specialNeeds.coffee.selectAmount')}
                                        <ArrowRight className="ml-1 h-4 w-4" />
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Emotional note */}
                        <div className="mt-12 text-center">
                            <p className="text-slate-400 italic text-sm max-w-lg mx-auto">
                                {t('specialNeeds.coffee.emotionalNote')}
                            </p>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════
                    IMPACT AREAS
                   ═══════════════════════════════ */}
                <section id="impact" className="py-20 bg-slate-50">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="text-center mb-16">
                            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-teal-600 bg-teal-50 px-4 py-1.5 rounded-full mb-4">
                                {t('specialNeeds.impact.badge')}
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                                {t('specialNeeds.impact.title')}
                            </h2>
                            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                                {t('specialNeeds.impact.subtitle')}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {impactAreas.map((area, i) => {
                                const Icon = area.icon;
                                const percent = Math.round((area.raised / area.goal) * 100);
                                return (
                                    <div
                                        key={i}
                                        className="bg-white rounded-2xl p-7 border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200 transition-all duration-300 group"
                                    >
                                        <div className={`${area.bg} w-14 h-14 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                                            <Icon className={`h-7 w-7 ${area.color}`} />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">{area.title}</h3>
                                        <p className="text-slate-500 text-sm mb-5 leading-relaxed">{area.description}</p>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-semibold text-slate-700">{formatAmount(area.raised)}</span>
                                                <span className="text-slate-400">{formatAmount(area.goal)}</span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                                <div
                                                    className={`h-2.5 rounded-full transition-all duration-700 ${area.color.includes('teal') ? 'bg-teal-500' :
                                                        area.color.includes('purple') ? 'bg-purple-500' :
                                                            area.color.includes('indigo') ? 'bg-indigo-500' :
                                                                area.color.includes('rose') ? 'bg-rose-500' :
                                                                    'bg-amber-500'
                                                        }`}
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-slate-400 text-right">%{percent} {t('specialNeeds.completed')}</p>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Donation CTA card */}
                            <div className="bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 rounded-2xl p-7 text-white flex flex-col justify-between shadow-lg shadow-purple-500/20">
                                <div>
                                    <HandHeart className="h-10 w-10 mb-4 text-white/80" />
                                    <h3 className="text-2xl font-bold mb-3">{t('specialNeeds.impact.joinCard')}</h3>
                                    <p className="text-white/80 leading-relaxed mb-6">
                                        {t('specialNeeds.impact.joinCardDesc')}
                                    </p>
                                </div>
                                <Button
                                    onClick={handleDonate}
                                    size="lg"
                                    className="w-full bg-white text-purple-600 hover:bg-white/90 font-semibold rounded-xl h-12"
                                >
                                    {t('specialNeeds.impact.donate')}
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════
                    PARENT LETTER — Deep Emotional
                   ═══════════════════════════════ */}
                <section className="py-20 bg-white">
                    <div className="max-w-3xl mx-auto px-4">
                        <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-white rounded-3xl p-8 sm:p-12 border border-purple-100 relative overflow-hidden">
                            <div className="absolute top-6 left-6 text-purple-200">
                                <Quote className="h-16 w-16" />
                            </div>
                            <div className="relative z-10">
                                <span className="inline-block text-xs font-semibold tracking-widest uppercase text-purple-600 bg-purple-100 px-4 py-1.5 rounded-full mb-6">
                                    {t('specialNeeds.parentLetter.badge')}
                                </span>
                                <p className="text-lg sm:text-xl text-slate-700 leading-relaxed mb-6 italic">
                                    {t('specialNeeds.parentLetter.text')}
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                        A
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900">{t('specialNeeds.parentLetter.author')}</p>
                                        <p className="text-xs text-slate-400">{t('specialNeeds.parentLetter.role')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════
                    HOW IT WORKS - TRANSPARENT
                   ═══════════════════════════════ */}
                <section className="py-20 bg-slate-50">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="text-center mb-16">
                            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full mb-4">
                                {t('specialNeeds.transparency.badge')}
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                                {t('specialNeeds.transparency.title')}
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            {[
                                {
                                    step: '01',
                                    icon: Heart,
                                    title: t('specialNeeds.transparency.step1'),
                                    desc: t('specialNeeds.transparency.step1Desc'),
                                    color: 'from-pink-500 to-rose-600',
                                },
                                {
                                    step: '02',
                                    icon: Shield,
                                    title: t('specialNeeds.transparency.step2'),
                                    desc: t('specialNeeds.transparency.step2Desc'),
                                    color: 'from-purple-500 to-indigo-600',
                                },
                                {
                                    step: '03',
                                    icon: Target,
                                    title: t('specialNeeds.transparency.step3'),
                                    desc: t('specialNeeds.transparency.step3Desc'),
                                    color: 'from-teal-500 to-cyan-600',
                                },
                                {
                                    step: '04',
                                    icon: CheckCircle,
                                    title: t('specialNeeds.transparency.step4'),
                                    desc: t('specialNeeds.transparency.step4Desc'),
                                    color: 'from-emerald-500 to-teal-600',
                                },
                            ].map((item, i) => {
                                const Icon = item.icon;
                                return (
                                    <div key={i} className="text-center group">
                                        <div className={`w-16 h-16 mx-auto mb-5 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                            <Icon className="h-8 w-8 text-white" />
                                        </div>
                                        <div className="text-xs font-bold text-slate-300 mb-2">{item.step}</div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                                        <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════
                    NEEDS AWARENESS SECTION
                   ═══════════════════════════════ */}
                <section className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="text-center mb-16">
                            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-teal-600 bg-teal-50 px-4 py-1.5 rounded-full mb-4">
                                {t('specialNeeds.awareness.badge')}
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                                {t('specialNeeds.awareness.title')}
                            </h2>
                            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                                {t('specialNeeds.awareness.subtitle')}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                {
                                    icon: Brain,
                                    title: t('specialNeeds.awareness.autism'),
                                    desc: t('specialNeeds.awareness.autismDesc'),
                                    gradient: 'from-purple-500 to-indigo-600',
                                    bgColor: 'bg-purple-50',
                                },
                                {
                                    icon: Eye,
                                    title: t('specialNeeds.awareness.visual'),
                                    desc: t('specialNeeds.awareness.visualDesc'),
                                    gradient: 'from-teal-500 to-cyan-600',
                                    bgColor: 'bg-teal-50',
                                },
                                {
                                    icon: Ear,
                                    title: t('specialNeeds.awareness.hearing'),
                                    desc: t('specialNeeds.awareness.hearingDesc'),
                                    gradient: 'from-rose-500 to-pink-600',
                                    bgColor: 'bg-rose-50',
                                },
                                {
                                    icon: Puzzle,
                                    title: t('specialNeeds.awareness.learning'),
                                    desc: t('specialNeeds.awareness.learningDesc'),
                                    gradient: 'from-amber-500 to-orange-600',
                                    bgColor: 'bg-amber-50',
                                },
                            ].map((item, i) => {
                                const Icon = item.icon;
                                return (
                                    <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 group text-center">
                                        <div className={`w-14 h-14 mx-auto mb-4 bg-gradient-to-br ${item.gradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                            <Icon className="h-7 w-7 text-white" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                                        <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════
                    FINAL CTA — DONATION SECTION
                   ═══════════════════════════════ */}
                <section id="donate-section" className="py-20 bg-slate-50">
                    <div className="max-w-4xl mx-auto px-4">
                        <div className="bg-gradient-to-br from-purple-950 via-pink-950 to-indigo-950 rounded-3xl p-8 sm:p-14 text-center relative overflow-hidden">
                            {/* Subtle background decoration */}
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-pink-400 rounded-full blur-[100px]" />
                                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400 rounded-full blur-[100px]" />
                            </div>

                            <div className="relative z-10">
                                <div className="text-5xl mb-6 animate-pulse">🙏</div>
                                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                                    {t('specialNeeds.ctaTitle')}
                                </h2>
                                <p className="text-pink-200 max-w-xl mx-auto mb-4 leading-relaxed">
                                    {t('specialNeeds.ctaSubtitle')}
                                </p>
                                <p className="text-white/50 text-sm mb-10 italic">
                                    {t('specialNeeds.ctaEmotional')}
                                </p>

                                {/* Quick amount buttons */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 max-w-lg mx-auto">
                                    {[25, 50, 100, 250].map((amount) => (
                                        <button
                                            key={amount}
                                            onClick={() => setDonationAmount(amount.toString())}
                                            className={`py-4 rounded-xl font-bold text-lg transition-all duration-200 ${donationAmount === amount.toString()
                                                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/30 scale-105'
                                                : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                                                }`}
                                        >
                                            {formatAmount(amount)}
                                        </button>
                                    ))}
                                </div>

                                {/* Custom amount */}
                                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-3">
                                    <div className="relative flex-1">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-bold">{currencySymbol}</span>
                                        <Input
                                            type="number"
                                            placeholder={t('specialNeeds.otherAmount')}
                                            value={donationAmount}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDonationAmount(e.target.value)}
                                            className="pl-8 h-14 bg-white/10 border-white/10 text-white placeholder:text-white/30 rounded-xl text-lg font-medium focus:border-pink-500/50"
                                            min={currency === 'TRY' ? 100 : 10}
                                        />
                                    </div>
                                    <Button
                                        onClick={handleDonate}
                                        size="lg"
                                        className="h-14 px-10 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white rounded-xl font-bold text-lg shadow-xl shadow-pink-500/25 hover:scale-105 transition-all"
                                    >
                                        {t('specialNeeds.donateNow')}
                                        <Heart className="ml-2 h-5 w-5" />
                                    </Button>
                                </div>
                                <p className="text-xs text-slate-500">
                                    {t('specialNeeds.allSecure')}
                                    <Link href="/transparency" className="text-pink-400 hover:underline ml-1">
                                        {t('specialNeeds.transparencyPolicy')}
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════
                    SHARE / SOCIAL
                   ═══════════════════════════════ */}
                <section className="py-16 bg-white">
                    <div className="max-w-3xl mx-auto px-4 text-center">
                        <Share2 className="h-8 w-8 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-slate-900 mb-3">
                            {t('specialNeeds.share.title')}
                        </h3>
                        <p className="text-slate-500 mb-8">
                            {t('specialNeeds.share.subtitle')}
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                            {[
                                { label: 'Twitter / X', bg: 'bg-black hover:bg-gray-800' },
                                { label: 'LinkedIn', bg: 'bg-blue-700 hover:bg-blue-600' },
                                { label: 'WhatsApp', bg: 'bg-green-600 hover:bg-green-500' },
                                { label: t('specialNeeds.share.copyLink'), bg: 'bg-slate-700 hover:bg-slate-600' },
                            ].map((btn, i) => (
                                <Button
                                    key={i}
                                    className={`${btn.bg} text-white rounded-xl px-6`}
                                    onClick={() => {
                                        if (btn.label === t('specialNeeds.share.copyLink')) {
                                            navigator.clipboard.writeText(window.location.href);
                                        }
                                    }}
                                >
                                    {btn.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Apply CTA Section */}
                <section className="py-16 bg-gradient-to-b from-purple-50 to-white">
                    <div className="max-w-4xl mx-auto px-4 text-center">
                        <div className="bg-white rounded-3xl border-2 border-purple-100 shadow-xl shadow-purple-100/50 p-8 sm:p-12">
                            <div className="text-5xl mb-4">✨</div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                                {t('specialNeeds.apply.sectionTitle')}
                            </h2>
                            <p className="text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
                                {t('specialNeeds.apply.sectionDesc')}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    onClick={() => router.push('/special-needs/apply')}
                                    size="lg"
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white h-14 px-10 rounded-2xl text-lg font-semibold shadow-xl shadow-purple-500/20 transition-all duration-300 hover:scale-105"
                                >
                                    <Heart className="mr-2 h-5 w-5" />
                                    {t('specialNeeds.apply.startApplication')}
                                </Button>
                            </div>
                            <p className="text-xs text-slate-400 mt-4">
                                {t('specialNeeds.apply.privacyNote')}
                            </p>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
