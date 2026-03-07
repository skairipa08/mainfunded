'use client';

import React from 'react';
import { useTranslation } from "@/lib/i18n/context";
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import {
    Heart,
    GraduationCap,
    Globe,
    Users,
    Lightbulb,
    Shield,
    Sparkles,
    ArrowRight,
    BookOpen,
    Monitor,
    TreePine,
    HandHelping,
    Rocket,
    Megaphone,
    AlertTriangle,
} from 'lucide-react';

/* ──────────────────────────────────────── */

const DemoWarning = () => {
    const { t } = useTranslation();
    return (
        <div className="bg-amber-50 border-b border-amber-100 px-4 py-3 text-center">
            <div className="flex items-center justify-center gap-2 text-amber-700 text-sm font-medium">
                <AlertTriangle className="h-4 w-4" />
                <span>
                    <span className="font-bold">{t('pages.missionVision.demoWarning.title')}:</span>{' '}
                    {t('pages.missionVision.demoWarning.message')}
                </span>
            </div>
        </div>
    );
};

/* ════════════════════════════════════════
   GOAL DATA — 8 goals, each with icon, color, gradient
   ════════════════════════════════════════ */
const GOALS = [
    {
        id: 'educationEquality',
        num: '01',
        icon: GraduationCap,
        color: 'bg-rose-600',
        gradient: 'from-rose-500 to-red-600',
        textColor: 'text-rose-600',
        shadowColor: 'shadow-rose-500/30',
        bgLight: 'bg-rose-50',
    },
    {
        id: 'transparentFunding',
        num: '02',
        icon: Shield,
        color: 'bg-amber-600',
        gradient: 'from-amber-500 to-orange-600',
        textColor: 'text-amber-600',
        shadowColor: 'shadow-amber-500/30',
        bgLight: 'bg-amber-50',
    },
    {
        id: 'communityPower',
        num: '03',
        icon: Users,
        color: 'bg-emerald-600',
        gradient: 'from-emerald-500 to-teal-600',
        textColor: 'text-emerald-600',
        shadowColor: 'shadow-emerald-500/30',
        bgLight: 'bg-emerald-50',
    },
    {
        id: 'digitalAccess',
        num: '04',
        icon: Monitor,
        color: 'bg-blue-600',
        gradient: 'from-blue-500 to-indigo-600',
        textColor: 'text-blue-600',
        shadowColor: 'shadow-blue-500/30',
        bgLight: 'bg-blue-50',
    },
    {
        id: 'sustainableImpact',
        num: '05',
        icon: TreePine,
        color: 'bg-teal-600',
        gradient: 'from-teal-500 to-cyan-600',
        textColor: 'text-teal-600',
        shadowColor: 'shadow-teal-500/30',
        bgLight: 'bg-teal-50',
    },
    {
        id: 'mentorSupport',
        num: '06',
        icon: BookOpen,
        color: 'bg-purple-600',
        gradient: 'from-purple-500 to-violet-600',
        textColor: 'text-purple-600',
        shadowColor: 'shadow-purple-500/30',
        bgLight: 'bg-purple-50',
    },
    {
        id: 'globalSolidarity',
        num: '07',
        icon: Globe,
        color: 'bg-sky-600',
        gradient: 'from-sky-500 to-blue-600',
        textColor: 'text-sky-600',
        shadowColor: 'shadow-sky-500/30',
        bgLight: 'bg-sky-50',
    },
    {
        id: 'volunteerMovement',
        num: '08',
        icon: HandHelping,
        color: 'bg-pink-600',
        gradient: 'from-pink-500 to-rose-600',
        textColor: 'text-pink-600',
        shadowColor: 'shadow-pink-500/30',
        bgLight: 'bg-pink-50',
    },
];

/* ════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════ */
export default function GoalsPage() {
    const router = useRouter();
    const { t } = useTranslation();

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />
            <DemoWarning />
            <main className="flex-grow">

                {/* ═══════════════════════════════
            HERO
           ═══════════════════════════════ */}
                <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                    {/* Background decorations */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-rose-500/8 rounded-full blur-[120px]" />
                        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/8 rounded-full blur-[120px]" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]" />
                        <div
                            className="absolute inset-0 opacity-[0.03]"
                            style={{
                                backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                                backgroundSize: '40px 40px',
                            }}
                        />
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-36">
                        <div className="max-w-3xl mx-auto text-center">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-5 py-2 mb-8">
                                <Rocket className="h-4 w-4 text-amber-300" />
                                <span className="text-sm text-white/80 font-medium">{t('pages.goals.hero.badge')}</span>
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                                {t('pages.goals.hero.title')}
                                <br />
                                <span className="bg-gradient-to-r from-rose-300 via-amber-300 to-emerald-300 bg-clip-text text-transparent">
                                    {t('pages.goals.hero.titleHighlight')}
                                </span>
                            </h1>

                            <p className="text-lg sm:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto mb-10">
                                {t('pages.goals.hero.desc')}
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Button
                                    type="button"
                                    onClick={() => router.push('/donate')}
                                    size="lg"
                                    className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white h-14 px-10 rounded-2xl text-lg font-semibold shadow-xl shadow-orange-500/25 transition-all duration-300"
                                >
                                    <Heart className="mr-2 h-5 w-5" />
                                    {t('pages.goals.hero.donate')}
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => document.getElementById('goals-grid')?.scrollIntoView({ behavior: 'smooth' })}
                                    size="lg"
                                    variant="outline"
                                    className="border-white/25 text-white hover:bg-white/10 h-14 px-10 rounded-2xl text-lg backdrop-blur-sm"
                                >
                                    {t('pages.goals.hero.explore')}
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Wave separator */}
                    <div className="absolute bottom-0 left-0 right-0">
                        <svg viewBox="0 0 1440 80" fill="none" className="w-full">
                            <path d="M0 80L60 69.3C120 59 240 37 360 32C480 27 600 37 720 42.7C840 48 960 48 1080 42.7C1200 37 1320 27 1380 21.3L1440 16V80H0Z" fill="white" />
                        </svg>
                    </div>
                </section>

                {/* ═══════════════════════════════
            MANIFESTO BANNER
           ═══════════════════════════════ */}
                <section className="py-16 bg-white">
                    <div className="max-w-4xl mx-auto px-4 text-center">
                        <div className="relative">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[100px] font-serif text-slate-100 leading-none select-none pointer-events-none">&ldquo;</div>
                            <div className="relative z-10 pt-6">
                                <p className="text-2xl sm:text-3xl font-medium text-slate-800 leading-relaxed italic">
                                    {t('pages.goals.manifesto.text')}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════
            GOALS GRID — Inspired by Global Goals
           ═══════════════════════════════ */}
                <section id="goals-grid" className="py-16 sm:py-20 bg-slate-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Section header */}
                        <div className="text-center mb-14">
                            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-rose-600 bg-rose-50 px-4 py-1.5 rounded-full mb-4">
                                {t('pages.goals.grid.badge')}
                            </span>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
                                {t('pages.goals.grid.title')}
                            </h2>
                            <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                                {t('pages.goals.grid.desc')}
                            </p>
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
                            {GOALS.map((goal) => {
                                const Icon = goal.icon;
                                return (
                                    <div
                                        key={goal.id}
                                        className="group relative bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500"
                                    >
                                        <div className="flex items-start gap-0">
                                            {/* Left colored panel with icon */}
                                            <div className={`flex-shrink-0 w-[100px] sm:w-[120px] min-h-full bg-gradient-to-br ${goal.gradient} flex flex-col items-center justify-center p-5 sm:p-6 relative overflow-hidden`}>
                                                {/* Subtle decoration */}
                                                <div className="absolute inset-0 bg-black/5" />
                                                <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-[20px]" />

                                                <div className="relative z-10 flex flex-col items-center">
                                                    <span className="text-white/60 text-[11px] font-bold tracking-widest mb-2">
                                                        {t('pages.goals.grid.goalLabel')} {goal.num}
                                                    </span>
                                                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                                        <Icon className="h-7 w-7 text-white" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right content */}
                                            <div className="flex-1 p-5 sm:p-6">
                                                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 group-hover:text-slate-700 transition-colors">
                                                    {t(`pages.goals.items.${goal.id}.title`)}
                                                </h3>
                                                <p className="text-sm sm:text-[15px] text-slate-500 leading-relaxed">
                                                    {t(`pages.goals.items.${goal.id}.desc`)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Bottom accent line on hover */}
                                        <div className={`h-[3px] bg-gradient-to-r ${goal.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════
            BELIEF / VALUES SECTION
           ═══════════════════════════════ */}
                <section className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                            {/* Left — Visual card */}
                            <div className="relative">
                                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 sm:p-10 relative overflow-hidden">
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-400/10 rounded-full blur-[40px]" />
                                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-rose-400/10 rounded-full blur-[40px]" />

                                    <div className="relative z-10">
                                        <Sparkles className="h-10 w-10 mb-6 text-amber-300" />
                                        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 leading-tight">
                                            {t('pages.goals.belief.visualTitle')}
                                        </h3>
                                        <p className="text-slate-400 leading-relaxed mb-8 text-lg">
                                            {t('pages.goals.belief.visualDesc')}
                                        </p>

                                        {/* Mini stats */}
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { val: '8', label: t('pages.goals.belief.stats.goals') },
                                                { val: '∞', label: t('pages.goals.belief.stats.dreams') },
                                                { val: '%100', label: t('pages.goals.belief.stats.transparency') },
                                                { val: '1', label: t('pages.goals.belief.stats.mission') },
                                            ].map((s, j) => (
                                                <div key={j} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                                                    <p className="text-xl font-bold text-white">{s.val}</p>
                                                    <p className="text-[11px] text-slate-400">{s.label}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right — Content */}
                            <div>
                                <span className="inline-block text-xs font-semibold tracking-widest uppercase text-amber-600 bg-amber-50 px-4 py-1.5 rounded-full mb-4">
                                    {t('pages.goals.belief.badge')}
                                </span>
                                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6 leading-tight">
                                    {t('pages.goals.belief.title')}
                                    <br />
                                    <span className="text-amber-500">{t('pages.goals.belief.titleHighlight')}</span>
                                </h2>
                                <p className="text-lg text-slate-500 leading-relaxed mb-8">
                                    {t('pages.goals.belief.desc')}
                                </p>

                                <div className="space-y-5">
                                    {[
                                        { icon: Heart, title: t('pages.goals.belief.items.i1.title'), desc: t('pages.goals.belief.items.i1.desc') },
                                        { icon: Lightbulb, title: t('pages.goals.belief.items.i2.title'), desc: t('pages.goals.belief.items.i2.desc') },
                                        { icon: Globe, title: t('pages.goals.belief.items.i3.title'), desc: t('pages.goals.belief.items.i3.desc') },
                                    ].map((item, i) => {
                                        const ItemIcon = item.icon;
                                        return (
                                            <div key={i} className="flex items-start gap-4 group">
                                                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-100 transition-colors">
                                                    <ItemIcon className="h-5 w-5 text-amber-500" />
                                                </div>
                                                <div>
                                                    <h4 className="text-base font-bold text-slate-900 mb-1">{item.title}</h4>
                                                    <p className="text-sm text-slate-500">{item.desc}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════
            QUOTE
           ═══════════════════════════════ */}
                <section className="py-20 bg-slate-50">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="relative">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[120px] font-serif text-slate-200 leading-none select-none pointer-events-none">&ldquo;</div>
                            <div className="relative z-10 pt-8">
                                <p className="text-2xl sm:text-3xl font-medium text-slate-800 leading-relaxed mb-8 italic">
                                    {t('pages.goals.quote.text')}
                                </p>
                                <div className="flex items-center justify-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                        FE
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-slate-900">{t('pages.goals.quote.author')}</p>
                                        <p className="text-xs text-slate-400">{t('pages.goals.quote.role')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════
            CTA
           ═══════════════════════════════ */}
                <section className="py-20 bg-white">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-gradient-to-br from-rose-600 via-amber-600 to-orange-600 rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden">
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[80px]" />
                                <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-[80px]" />
                                <div
                                    className="absolute inset-0 opacity-[0.04]"
                                    style={{
                                        backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                                        backgroundSize: '28px 28px',
                                    }}
                                />
                            </div>

                            <div className="relative z-10">
                                <Megaphone className="h-10 w-10 text-yellow-200 mx-auto mb-6" />
                                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-5">
                                    {t('pages.goals.cta.title')}
                                </h2>
                                <p className="text-white/80 max-w-xl mx-auto mb-10 text-lg leading-relaxed">
                                    {t('pages.goals.cta.desc')}
                                </p>

                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <Button
                                        type="button"
                                        onClick={() => router.push('/donate')}
                                        size="lg"
                                        className="bg-white text-orange-700 hover:bg-orange-50 h-14 px-10 rounded-2xl text-lg font-semibold shadow-xl"
                                    >
                                        <Heart className="mr-2 h-5 w-5" />
                                        {t('pages.goals.cta.donate')}
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => router.push('/apply')}
                                        size="lg"
                                        variant="outline"
                                        className="border-white/25 text-white hover:bg-white/10 h-14 px-10 rounded-2xl text-lg backdrop-blur-sm"
                                    >
                                        {t('pages.goals.cta.apply')}
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

            </main>
            <Footer />
        </div>
    );
}
