'use client';
import { useTranslation } from '@/lib/i18n/context';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
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
} from 'lucide-react';

/* ────────────────────────────────────────────
   Unsplash images - Education in Africa theme
   ──────────────────────────────────────────── */
const HERO_IMG = 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=1920&q=80&auto=format&fit=crop';
const IMG_CLASSROOM = 'https://images.unsplash.com/photo-1613899945776-4e36f6f27994?w=800&q=80&auto=format&fit=crop';
const IMG_CHILDREN_WALKING = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80&auto=format&fit=crop';
const IMG_SCHOOL_BUILDING = 'https://images.unsplash.com/photo-1594608661623-aa0bd3a69d98?w=800&q=80&auto=format&fit=crop';
const IMG_BOOKS = 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80&auto=format&fit=crop';
const IMG_HOPE = 'https://images.unsplash.com/photo-1529390079861-591de354faf5?w=800&q=80&auto=format&fit=crop';
const IMG_KIDS_PLAYING = 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=800&q=80&auto=format&fit=crop';

/* ────────────────────────────────────────────
   Campaign stats
   ──────────────────────────────────────────── */
const CAMPAIGN_GOAL = 500000;
const CAMPAIGN_RAISED = 0;
const CAMPAIGN_DONORS = 0;
const CAMPAIGN_STUDENTS = 0;
const CAMPAIGN_COUNTRIES = 1;



/* ────────────────────────────────────────────
   Animated counter
   ──────────────────────────────────────────── */
function AnimatedNumber({ target, prefix = '', suffix = '' }: { target: number; prefix?: string; suffix?: string }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
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
    }, [target]);

    return (
        <span>
            {prefix}{count.toLocaleString('tr-TR')}{suffix}
        </span>
    );
}

/* ════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════ */
export default function EducationEqualityPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const [donationAmount, setDonationAmount] = useState('');
    const [showAllStories, setShowAllStories] = useState(false);

    const progressPercent = Math.round((CAMPAIGN_RAISED / CAMPAIGN_GOAL) * 100);

    const handleDonate = () => {
        if (donationAmount) {
            router.push(`/donate?amount=${donationAmount}&campaign=education-equality`);
        } else {
            router.push('/donate?campaign=education-equality');
        }
    };

    const impactAreas = [
        {
            icon: BookOpen,
            title: t('educationEquality.impact.schoolSupplies'),
            description: t('educationEquality.impact.schoolSuppliesDesc'),
            raised: 0,
            goal: 80000,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
        },
        {
            icon: Target,
            title: t('educationEquality.impact.sportsEquipment'),
            description: t('educationEquality.impact.sportsEquipmentDesc'),
            raised: 0,
            goal: 70000,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
        },
        {
            icon: Target,
            title: t('educationEquality.impact.schoolConstruction'),
            description: t('educationEquality.impact.schoolConstructionDesc'),
            raised: 0,
            goal: 150000,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
        },
        {
            icon: Lightbulb,
            title: t('educationEquality.impact.digitalAccess'),
            description: t('educationEquality.impact.digitalAccessDesc'),
            raised: 0,
            goal: 100000,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
        },
        {
            icon: Heart,
            title: t('educationEquality.impact.nutrition'),
            description: t('educationEquality.impact.nutritionDesc'),
            raised: 0,
            goal: 100000,
            color: 'text-rose-600',
            bg: 'bg-rose-50',
        },
    ];

    const stories = [
        {
            name: 'Amara',
            age: 11,
            country: 'Sierra Leone',
            image: IMG_HOPE,
            quote: t('educationEquality.stories.quote1'),
        },
        {
            name: 'Kofi',
            age: 9,
            country: 'Ghana',
            image: IMG_KIDS_PLAYING,
            quote: t('educationEquality.stories.quote2'),
        },
        {
            name: 'Fatoumata',
            age: 13,
            country: 'Mali',
            image: IMG_CLASSROOM,
            quote: t('educationEquality.stories.quote3'),
        },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />
            <main className="flex-grow">

                {/* ═══════════════════════════════
                    HERO SECTION
                   ═══════════════════════════════ */}
                <section className="relative min-h-[85vh] flex items-center overflow-hidden">
                    {/* Background Image */}
                    <div className="absolute inset-0">
                        <Image
                            src={HERO_IMG}
                            alt="Eğitimde eşitlik - Afrikalı çocuklar"
                            fill
                            className="object-cover"
                            priority
                        />
                        {/* Dark gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
                        <div className="max-w-3xl">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2 mb-8">
                                <Globe className="h-4 w-4 text-amber-400" />
                                <span className="text-sm text-white/90 font-medium">{t('educationEquality.badge')}</span>
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight mb-6">
                                {t('educationEquality.heroTitle1')}
                                <br />
                                <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-rose-300 bg-clip-text text-transparent">
                                    {t('educationEquality.heroTitle2')}
                                </span>
                            </h1>

                            <p className="text-lg sm:text-xl text-white/80 leading-relaxed mb-10 max-w-2xl" dangerouslySetInnerHTML={{ __html: t('educationEquality.heroSubtitle') }} />

                            {/* Quick donation */}
                            <div className="flex flex-col sm:flex-row gap-4 mb-10">
                                <Button
                                    size="lg"
                                    onClick={handleDonate}
                                    className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white h-14 px-10 rounded-2xl text-lg font-semibold shadow-xl shadow-orange-500/30 transition-all duration-300"
                                >
                                    <Heart className="mr-2 h-5 w-5" />
                                    {t('educationEquality.donateNow')}
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    onClick={() => document.getElementById('impact')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="border-white/30 text-white hover:bg-white/10 h-14 px-8 rounded-2xl text-lg backdrop-blur-sm"
                                >
                                    {t('educationEquality.exploreCampaign')}
                                    <ChevronDown className="ml-2 h-5 w-5" />
                                </Button>
                            </div>

                            {/* Progress bar */}
                            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 max-w-xl">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-white/70 text-sm font-medium">{t('educationEquality.raised')}</span>
                                    <span className="text-white/70 text-sm font-medium">{t('educationEquality.goal')}</span>
                                </div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-2xl font-bold text-white">${CAMPAIGN_RAISED.toLocaleString()}</span>
                                    <span className="text-lg text-white/60">${CAMPAIGN_GOAL.toLocaleString()}</span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-amber-400 to-orange-500 h-3 rounded-full transition-all duration-1000"
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between mt-3">
                                    <span className="text-amber-300 font-semibold text-sm">%{progressPercent} {t('educationEquality.completed')}</span>
                                    <span className="text-white/50 text-sm">{CAMPAIGN_DONORS.toLocaleString()} {t('educationEquality.donors')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════
                    STATISTICS BAND
                   ═══════════════════════════════ */}
                <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 py-16 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute inset-0" style={{
                            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                            backgroundSize: '40px 40px',
                        }} />
                    </div>
                    <div className="relative z-10 max-w-7xl mx-auto px-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                            {[
                                { value: CAMPAIGN_STUDENTS, label: t('educationEquality.stats.studentsSupported'), icon: Users, suffix: '+', color: 'text-blue-400' },
                                { value: CAMPAIGN_COUNTRIES, label: t('educationEquality.stats.countries'), icon: Globe, suffix: '', color: 'text-emerald-400' },
                                { value: CAMPAIGN_DONORS, label: t('educationEquality.stats.donorCount'), icon: Heart, suffix: '+', color: 'text-rose-400' },
                                { value: 96, label: t('educationEquality.stats.fundingRate'), icon: TrendingUp, suffix: '%', color: 'text-amber-400' },
                            ].map((stat, i) => {
                                const Icon = stat.icon;
                                return (
                                    <div key={i} className="text-center">
                                        <Icon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />
                                        <div className="text-3xl sm:text-4xl font-bold text-white mb-1">
                                            <AnimatedNumber target={stat.value} suffix={stat.suffix} />
                                        </div>
                                        <p className="text-slate-400 text-sm">{stat.label}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════
                    THE PROBLEM
                   ═══════════════════════════════ */}
                <section className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="text-center mb-16">
                            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-rose-600 bg-rose-50 px-4 py-1.5 rounded-full mb-4">
                                {t('educationEquality.problem.badge')}
                            </span>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
                                {t('educationEquality.problem.title')}
                            </h2>
                            <p className="text-lg text-slate-500 max-w-3xl mx-auto leading-relaxed">
                                {t('educationEquality.problem.subtitle')}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            {/* Image collage */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg">
                                        <Image
                                            src={IMG_CLASSROOM}
                                            alt="Kötü şartlarda eğitim gören Afrikalı çocuklar"
                                            fill
                                            className="object-cover hover:scale-105 transition-transform duration-700"
                                        />
                                    </div>
                                    <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg">
                                        <Image
                                            src={IMG_BOOKS}
                                            alt="Eğitim materyalleri"
                                            fill
                                            className="object-cover hover:scale-105 transition-transform duration-700"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4 pt-8">
                                    <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg">
                                        <Image
                                            src={IMG_CHILDREN_WALKING}
                                            alt="Okula yürüyen çocuklar"
                                            fill
                                            className="object-cover hover:scale-105 transition-transform duration-700"
                                        />
                                    </div>
                                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg">
                                        <Image
                                            src={IMG_SCHOOL_BUILDING}
                                            alt="Kırsal bölge okulu"
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
                                        stat: '244M',
                                        text: t('educationEquality.problem.fact1'),
                                        color: 'bg-rose-500',
                                    },
                                    {
                                        stat: '%60',
                                        text: t('educationEquality.problem.fact2'),
                                        color: 'bg-amber-500',
                                    },
                                    {
                                        stat: '617M',
                                        text: t('educationEquality.problem.fact3'),
                                        color: 'bg-blue-500',
                                    },
                                    {
                                        stat: '4M',
                                        text: t('educationEquality.problem.fact4'),
                                        color: 'bg-purple-500',
                                    },
                                    {
                                        stat: '$50',
                                        text: t('educationEquality.problem.fact5'),
                                        color: 'bg-emerald-500',
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
                    IMPACT AREAS
                   ═══════════════════════════════ */}
                <section id="impact" className="py-20 bg-slate-50">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="text-center mb-16">
                            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full mb-4">
                                {t('educationEquality.impact.badge')}
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                                {t('educationEquality.impact.title')}
                            </h2>
                            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                                {t('educationEquality.impact.subtitle')}
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
                                                <span className="font-semibold text-slate-700">${area.raised.toLocaleString()}</span>
                                                <span className="text-slate-400">${area.goal.toLocaleString()}</span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                                <div
                                                    className={`h-2.5 rounded-full transition-all duration-700 ${area.color.includes('blue') ? 'bg-blue-500' :
                                                            area.color.includes('emerald') ? 'bg-emerald-500' :
                                                                area.color.includes('amber') ? 'bg-amber-500' :
                                                                    area.color.includes('purple') ? 'bg-purple-500' :
                                                                        'bg-rose-500'
                                                        }`}
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-slate-400 text-right">%{percent} {t('educationEquality.completed')}</p>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Donation CTA card */}
                            <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-7 text-white flex flex-col justify-between shadow-lg shadow-orange-500/20">
                                <div>
                                    <Sparkles className="h-10 w-10 mb-4 text-white/80" />
                                    <h3 className="text-2xl font-bold mb-3">{t('educationEquality.impact.joinCard')}</h3>
                                    <p className="text-white/80 leading-relaxed mb-6">
                                        {t('educationEquality.impact.joinCardDesc')}
                                    </p>
                                </div>
                                <Button
                                    onClick={handleDonate}
                                    size="lg"
                                    className="w-full bg-white text-orange-600 hover:bg-white/90 font-semibold rounded-xl h-12"
                                >
                                    {t('educationEquality.impact.donate')}
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════
                    STORIES
                   ═══════════════════════════════ */}
                <section className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="text-center mb-16">
                            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full mb-4">
                                {t('educationEquality.stories.badge')}
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                                {t('educationEquality.stories.title')}
                            </h2>
                            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                                {t('educationEquality.stories.subtitle')}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {stories.map((story, i) => (
                                <div
                                    key={i}
                                    className="group relative bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500"
                                >
                                    <div className="relative h-64 overflow-hidden">
                                        <Image
                                            src={story.image}
                                            alt={story.name}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        <div className="absolute bottom-4 left-4 flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-white/80" />
                                            <span className="text-sm text-white/90 font-medium">{story.country}</span>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                {story.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900">{story.name}</p>
                                                <p className="text-xs text-slate-400">{story.age} {t('educationEquality.stories.yearsOld')}</p>
                                            </div>
                                        </div>
                                        <blockquote className="text-slate-600 italic leading-relaxed">
                                            &ldquo;{story.quote}&rdquo;
                                        </blockquote>
                                    </div>
                                </div>
                            ))}
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
                                {t('educationEquality.transparency.badge')}
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                                {t('educationEquality.transparency.title')}
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            {[
                                {
                                    step: '01',
                                    icon: Heart,
                                    title: t('educationEquality.transparency.step1'),
                                    desc: t('educationEquality.transparency.step1Desc'),
                                    color: 'from-rose-500 to-pink-600',
                                },
                                {
                                    step: '02',
                                    icon: Shield,
                                    title: t('educationEquality.transparency.step2'),
                                    desc: t('educationEquality.transparency.step2Desc'),
                                    color: 'from-blue-500 to-indigo-600',
                                },
                                {
                                    step: '03',
                                    icon: Target,
                                    title: t('educationEquality.transparency.step3'),
                                    desc: t('educationEquality.transparency.step3Desc'),
                                    color: 'from-amber-500 to-orange-600',
                                },
                                {
                                    step: '04',
                                    icon: CheckCircle,
                                    title: t('educationEquality.transparency.step4'),
                                    desc: t('educationEquality.transparency.step4Desc'),
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
                    DONATION AMOUNTS - Quick Donate
                   ═══════════════════════════════ */}
                <section className="py-20 bg-white">
                    <div className="max-w-4xl mx-auto px-4">
                        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 sm:p-14 text-center relative overflow-hidden">
                            {/* Subtle background decoration */}
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400 rounded-full blur-[100px]" />
                                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400 rounded-full blur-[100px]" />
                            </div>

                            <div className="relative z-10">
                                <Hand className="h-12 w-12 text-amber-400 mx-auto mb-6" />
                                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                                    {t('educationEquality.ctaTitle')}
                                </h2>
                                <p className="text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed">
                                    {t('educationEquality.ctaSubtitle')}
                                </p>

                                {/* Quick amount buttons */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 max-w-lg mx-auto">
                                    {[25, 50, 100, 250].map((amount) => (
                                        <button
                                            key={amount}
                                            onClick={() => setDonationAmount(amount.toString())}
                                            className={`py-4 rounded-xl font-bold text-lg transition-all duration-200 ${donationAmount === amount.toString()
                                                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30 scale-105'
                                                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                                                }`}
                                        >
                                            ${amount}
                                        </button>
                                    ))}
                                </div>

                                {/* Custom amount */}
                                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-3">
                                    <div className="relative flex-1">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-bold">$</span>
                                        <Input
                                            type="number"
                                            placeholder={t('educationEquality.otherAmount')}
                                            value={donationAmount}
                                            onChange={(e) => setDonationAmount(e.target.value)}
                                            className="pl-8 h-14 bg-white/10 border-white/10 text-white placeholder:text-white/30 rounded-xl text-lg font-medium focus:border-amber-500/50"
                                            min="1"
                                        />
                                    </div>
                                    <Button
                                        onClick={handleDonate}
                                        size="lg"
                                        className="h-14 px-10 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white rounded-xl font-bold text-lg shadow-xl shadow-orange-500/25"
                                    >
                                        {t('educationEquality.donateNow')}
                                        <Heart className="ml-2 h-5 w-5" />
                                    </Button>
                                </div>
                                <p className="text-xs text-slate-500">
                                    {t('educationEquality.allSecure')}
                                    <Link href="/transparency" className="text-amber-400 hover:underline ml-1">
                                        {t('educationEquality.transparencyPolicy')}
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════
                    SHARE / SOCIAL
                   ═══════════════════════════════ */}
                <section className="py-16 bg-slate-50">
                    <div className="max-w-3xl mx-auto px-4 text-center">
                        <Share2 className="h-8 w-8 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-slate-900 mb-3">
                            {t('educationEquality.share.title')}
                        </h3>
                        <p className="text-slate-500 mb-8">
                            {t('educationEquality.share.subtitle')}
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                            {[
                                { label: 'Twitter / X', bg: 'bg-black hover:bg-gray-800' },
                                { label: 'LinkedIn', bg: 'bg-blue-700 hover:bg-blue-600' },
                                { label: 'WhatsApp', bg: 'bg-green-600 hover:bg-green-500' },
                                { label: t('educationEquality.share.copyLink'), bg: 'bg-slate-700 hover:bg-slate-600' },
                            ].map((btn, i) => (
                                <Button
                                    key={i}
                                    className={`${btn.bg} text-white rounded-xl px-6`}
                                    onClick={() => {
                                        if (btn.label === t('educationEquality.share.copyLink')) {
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
            </main>
            <Footer />
        </div>
    );
}
