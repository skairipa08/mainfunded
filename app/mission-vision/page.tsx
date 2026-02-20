'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/context';
import {
  Heart,
  Target,
  Eye,
  Compass,
  Rocket,
  Shield,
  Users,
  GraduationCap,
  Globe,
  Lightbulb,
  ArrowRight,
  CheckCircle,
  Sparkles,
  TrendingUp,
  Handshake,
  Scale,
  BookOpen,
  Zap,
  Star,
  Award,
  BarChart3,
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

export default function MissionVisionPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const principles = [
    {
      icon: Shield,
      title: t('pages.missionVision.principles.items.transparency.title'),
      desc: t('pages.missionVision.principles.items.transparency.desc'),
      gradient: 'from-blue-500 to-indigo-600',
      bg: 'bg-blue-50',
      color: 'text-blue-600',
    },
    {
      icon: Scale,
      title: t('pages.missionVision.principles.items.equality.title'),
      desc: t('pages.missionVision.principles.items.equality.desc'),
      gradient: 'from-emerald-500 to-teal-600',
      bg: 'bg-emerald-50',
      color: 'text-emerald-600',
    },
    {
      icon: CheckCircle,
      title: t('pages.missionVision.principles.items.verification.title'),
      desc: t('pages.missionVision.principles.items.verification.desc'),
      gradient: 'from-purple-500 to-pink-600',
      bg: 'bg-purple-50',
      color: 'text-purple-600',
    },
    {
      icon: Handshake,
      title: t('pages.missionVision.principles.items.community.title'),
      desc: t('pages.missionVision.principles.items.community.desc'),
      gradient: 'from-amber-500 to-orange-600',
      bg: 'bg-amber-50',
      color: 'text-amber-600',
    },
    {
      icon: Lightbulb,
      title: t('pages.missionVision.principles.items.innovation.title'),
      desc: t('pages.missionVision.principles.items.innovation.desc'),
      gradient: 'from-cyan-500 to-blue-600',
      bg: 'bg-cyan-50',
      color: 'text-cyan-600',
    },
    {
      icon: Heart,
      title: t('pages.missionVision.principles.items.impact.title'),
      desc: t('pages.missionVision.principles.items.impact.desc'),
      gradient: 'from-rose-500 to-red-600',
      bg: 'bg-rose-50',
      color: 'text-rose-600',
    },
  ];

  const goals = [
    {
      year: '2026',
      title: t('pages.missionVision.roadmap.items.g1.title'),
      desc: t('pages.missionVision.roadmap.items.g1.desc'),
      icon: GraduationCap,
      color: 'bg-blue-500',
    },
    {
      year: '2027',
      title: t('pages.missionVision.roadmap.items.g2.title'),
      desc: t('pages.missionVision.roadmap.items.g2.desc'),
      icon: Globe,
      color: 'bg-emerald-500',
    },
    {
      year: '2028',
      title: t('pages.missionVision.roadmap.items.g3.title'),
      desc: t('pages.missionVision.roadmap.items.g3.desc'),
      icon: Handshake,
      color: 'bg-purple-500',
    },
    {
      year: '2030',
      title: t('pages.missionVision.roadmap.items.g4.title'),
      desc: t('pages.missionVision.roadmap.items.g4.desc'),
      icon: Scale,
      color: 'bg-amber-500',
    },
  ];

  const impactNumbers = [
    { value: '0', label: t('pages.missionVision.impactNumbers.students'), icon: GraduationCap },
    { value: '1', label: t('pages.missionVision.impactNumbers.countries'), icon: Globe },
    { value: '$0', label: t('pages.missionVision.impactNumbers.funding'), icon: TrendingUp },
    { value: '-', label: t('pages.missionVision.impactNumbers.satisfaction'), icon: Star },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <DemoWarning />
      <main className="flex-grow">

        {/* ═══════════════════════════
            HERO
           ═══════════════════════════ */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px]" />
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                backgroundSize: '40px 40px',
              }}
            />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-5 py-2 mb-8">
                <Compass className="h-4 w-4 text-indigo-300" />
                <span className="text-sm text-white/80 font-medium">{t('pages.missionVision.hero.badge')}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                {t('pages.missionVision.hero.title')}
                <br />
                <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                  {t('pages.missionVision.hero.titleHighlight')}
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
                {t('pages.missionVision.hero.desc')}
              </p>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 80" fill="none" className="w-full">
              <path d="M0 80L60 69.3C120 59 240 37 360 32C480 27 600 37 720 42.7C840 48 960 48 1080 42.7C1200 37 1320 27 1380 21.3L1440 16V80H0Z" fill="white" />
            </svg>
          </div>
        </section>

        {/* ═══════════════════════════
            MISSION & VISION CARDS
           ═══════════════════════════ */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* Mission Card */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-[28px] opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-lg" />
                <div className="relative bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden">
                  {/* Top accent */}
                  <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600" />

                  <div className="p-8 sm:p-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                        <Target className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">{t('pages.missionVision.cards.mission.badge')}</span>
                        <h2 className="text-2xl font-bold text-slate-900">{t('pages.missionVision.cards.mission.title')}</h2>
                      </div>
                    </div>

                    <p className="text-lg text-slate-600 leading-relaxed mb-6">
                      {t('pages.missionVision.cards.mission.desc')}
                    </p>

                    <div className="space-y-3">
                      {[
                        t('pages.missionVision.cards.mission.items.i1'),
                        t('pages.missionVision.cards.mission.items.i2'),
                        t('pages.missionVision.cards.mission.items.i3'),
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-600">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Vision Card */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-600 rounded-[28px] opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-lg" />
                <div className="relative bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden">
                  {/* Top accent */}
                  <div className="h-1.5 bg-gradient-to-r from-purple-500 to-pink-600" />

                  <div className="p-8 sm:p-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                        <Eye className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-purple-500 uppercase tracking-widest">{t('pages.missionVision.cards.vision.badge')}</span>
                        <h2 className="text-2xl font-bold text-slate-900">{t('pages.missionVision.cards.vision.title')}</h2>
                      </div>
                    </div>

                    <p className="text-lg text-slate-600 leading-relaxed mb-6">
                      {t('pages.missionVision.cards.vision.desc')}
                    </p>

                    <div className="space-y-3">
                      {[
                        t('pages.missionVision.cards.vision.items.i1'),
                        t('pages.missionVision.cards.vision.items.i2'),
                        t('pages.missionVision.cards.vision.items.i3'),
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <Sparkles className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-600">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════
            IMPACT NUMBERS
           ═══════════════════════════ */}
        <section className="py-16 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-[80px]" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {impactNumbers.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="text-center group">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/15 transition-colors">
                      <Icon className="h-6 w-6 text-indigo-300" />
                    </div>
                    <p className="text-3xl sm:text-4xl font-bold text-white mb-1">{item.value}</p>
                    <p className="text-sm text-slate-400">{item.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════
            CORE PRINCIPLES
           ═══════════════════════════ */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="inline-block text-xs font-semibold tracking-widest uppercase text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full mb-4">
                {t('pages.missionVision.principles.badge')}
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                {t('pages.missionVision.principles.title')}
              </h2>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                {t('pages.missionVision.principles.desc')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {principles.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-7 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                  >
                    <div className={`w-14 h-14 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
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

        {/* ═══════════════════════════
            APPROACH — How we're different
           ═══════════════════════════ */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

              {/* Left — Visual */}
              <div className="lg:w-5/12">
                <div className="relative">
                  {/* Stacked cards visual */}
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-[40px]" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-[40px]" />

                    <div className="relative z-10">
                      <Rocket className="h-10 w-10 mb-6 text-indigo-200" />
                      <h3 className="text-2xl font-bold mb-3">{t('pages.missionVision.approach.visual.title')}</h3>
                      <p className="text-indigo-200 leading-relaxed mb-6">
                        {t('pages.missionVision.approach.visual.desc')}
                      </p>

                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { val: t('pages.missionVision.approach.visual.stats.verification.val'), label: t('pages.missionVision.approach.visual.stats.verification.label') },
                          { val: t('pages.missionVision.approach.visual.stats.traceability.val'), label: t('pages.missionVision.approach.visual.stats.traceability.label') },
                          { val: t('pages.missionVision.approach.visual.stats.hiddenCost.val'), label: t('pages.missionVision.approach.visual.stats.hiddenCost.label') },
                          { val: t('pages.missionVision.approach.visual.stats.reviewTime.val'), label: t('pages.missionVision.approach.visual.stats.reviewTime.label') },
                        ].map((s, j) => (
                          <div key={j} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                            <p className="text-xl font-bold">{s.val}</p>
                            <p className="text-[11px] text-indigo-200">{s.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Floating badge */}
                  <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <Award className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">{t('pages.missionVision.approach.visual.trustScore.label')}</p>
                      <p className="text-sm font-bold text-slate-900">{t('pages.missionVision.approach.visual.trustScore.val')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right — Content */}
              <div className="lg:w-7/12">
                <span className="inline-block text-xs font-semibold tracking-widest uppercase text-purple-600 bg-purple-50 px-4 py-1.5 rounded-full mb-4">
                  {t('pages.missionVision.approach.content.badge')}
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
                  {t('pages.missionVision.approach.content.title')}
                  <br />
                  <span className="text-purple-500">{t('pages.missionVision.approach.content.titleHighlight')}</span>
                </h2>
                <p className="text-lg text-slate-500 leading-relaxed mb-8">
                  {t('pages.missionVision.approach.content.desc')}
                </p>

                <div className="space-y-5">
                  {[
                    {
                      icon: Shield,
                      title: t('pages.missionVision.approach.content.items.verified.title'),
                      desc: t('pages.missionVision.approach.content.items.verified.desc'),
                    },
                    {
                      icon: BarChart3,
                      title: t('pages.missionVision.approach.content.items.impact.title'),
                      desc: t('pages.missionVision.approach.content.items.impact.desc'),
                    },
                    {
                      icon: Zap,
                      title: t('pages.missionVision.approach.content.items.speed.title'),
                      desc: t('pages.missionVision.approach.content.items.speed.desc'),
                    },
                    {
                      icon: Users,
                      title: t('pages.missionVision.approach.content.items.community.title'),
                      desc: t('pages.missionVision.approach.content.items.community.desc'),
                    },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="flex items-start gap-4 group">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-100 transition-colors">
                          <Icon className="h-5 w-5 text-purple-500" />
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

        {/* ═══════════════════════════
            ROADMAP / GOALS
           ═══════════════════════════ */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="inline-block text-xs font-semibold tracking-widest uppercase text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full mb-4">
                {t('pages.missionVision.roadmap.badge')}
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                {t('pages.missionVision.roadmap.title')}
              </h2>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                {t('pages.missionVision.roadmap.desc')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
              {/* Connection line (desktop) */}
              <div className="hidden lg:block absolute top-[48px] left-[12.5%] right-[12.5%] h-[2px] bg-gradient-to-r from-blue-200 via-emerald-200 via-purple-200 to-amber-200 z-0" />

              {goals.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="relative z-10 text-center group">
                    <div className={`w-[60px] h-[60px] mx-auto mb-5 ${item.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-shadow duration-300">
                      <span className="inline-block text-xs font-bold text-slate-400 tracking-widest mb-2 bg-slate-50 px-3 py-1 rounded-full">{item.year}</span>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════
            QUOTE / BELIEF
           ═══════════════════════════ */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[120px] font-serif text-indigo-100 leading-none select-none pointer-events-none">&ldquo;</div>
              <div className="relative z-10 pt-8">
                <p className="text-2xl sm:text-3xl font-medium text-slate-800 leading-relaxed mb-8 italic">
                  {t('pages.missionVision.quote.text')}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    FE
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-900">{t('pages.missionVision.quote.author')}</p>
                    <p className="text-xs text-slate-400">{t('pages.missionVision.quote.role')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════
            CTA
           ═══════════════════════════ */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden">
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
                <Sparkles className="h-10 w-10 text-yellow-300 mx-auto mb-6" />
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-5">
                  {t('pages.missionVision.cta.title')}
                </h2>
                <p className="text-indigo-200 max-w-xl mx-auto mb-10 text-lg leading-relaxed">
                  {t('pages.missionVision.cta.desc')}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    type="button"
                    onClick={() => router.push('/donate')}
                    size="lg"
                    className="bg-white text-indigo-700 hover:bg-indigo-50 h-14 px-10 rounded-2xl text-lg font-semibold shadow-xl"
                  >
                    <Heart className="mr-2 h-5 w-5" />
                    {t('pages.missionVision.cta.donate')}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => router.push('/apply')}
                    size="lg"
                    variant="outline"
                    className="border-white/25 text-white hover:bg-white/10 h-14 px-10 rounded-2xl text-lg backdrop-blur-sm"
                  >
                    {t('pages.missionVision.cta.apply')}
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
