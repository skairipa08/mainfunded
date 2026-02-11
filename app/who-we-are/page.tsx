'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/context';
import {
  Heart,
  Shield,
  Users,
  Globe,
  Target,
  Lightbulb,
  GraduationCap,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Eye,
  Zap,
  BookOpen,
  Award,
  HandHeart,
  Star,
} from 'lucide-react';

export default function WhoWeArePage() {
  const router = useRouter();
  const { t } = useTranslation();

  const teamMembers = [
    {
      name: 'Baran Deniz',
      role: t('pages.whoWeAre.team.items.te1.role'),
      bio: t('pages.whoWeAre.team.items.te1.bio'),
      initials: 'BD',
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      name: 'Elif Korkmaz',
      role: t('pages.whoWeAre.team.items.te2.role'),
      bio: t('pages.whoWeAre.team.items.te2.bio'),
      initials: 'EK',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      name: 'Ahmet Yıldırım',
      role: t('pages.whoWeAre.team.items.te3.role'),
      bio: t('pages.whoWeAre.team.items.te3.bio'),
      initials: 'AY',
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      name: 'Zeynep Acar',
      role: t('pages.whoWeAre.team.items.te4.role'),
      bio: t('pages.whoWeAre.team.items.te4.bio'),
      initials: 'ZA',
      gradient: 'from-rose-500 to-pink-600',
    },
  ];

  const values = [
    {
      icon: Shield,
      title: t('pages.whoWeAre.values.items.transparency.title'),
      desc: t('pages.whoWeAre.values.items.transparency.desc'),
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
    },
    {
      icon: Heart,
      title: t('pages.whoWeAre.values.items.empathy.title'),
      desc: t('pages.whoWeAre.values.items.empathy.desc'),
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-100',
    },
    {
      icon: Globe,
      title: t('pages.whoWeAre.values.items.equality.title'),
      desc: t('pages.whoWeAre.values.items.equality.desc'),
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
    },
    {
      icon: Lightbulb,
      title: t('pages.whoWeAre.values.items.innovation.title'),
      desc: t('pages.whoWeAre.values.items.innovation.desc'),
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
    },
    {
      icon: Users,
      title: t('pages.whoWeAre.values.items.community.title'),
      desc: t('pages.whoWeAre.values.items.community.desc'),
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-100',
    },
    {
      icon: Target,
      title: t('pages.whoWeAre.values.items.impact.title'),
      desc: t('pages.whoWeAre.values.items.impact.desc'),
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-100',
    },
  ];

  const milestones = [
    { year: '2024', event: t('pages.whoWeAre.timeline.items.e1.event'), desc: t('pages.whoWeAre.timeline.items.e1.desc') },
    { year: '2025 Q1', event: t('pages.whoWeAre.timeline.items.e2.event'), desc: t('pages.whoWeAre.timeline.items.e2.desc') },
    { year: '2025 Q2', event: t('pages.whoWeAre.timeline.items.e3.event'), desc: t('pages.whoWeAre.timeline.items.e3.desc') },
    { year: '2025 Q3', event: t('pages.whoWeAre.timeline.items.e4.event'), desc: t('pages.whoWeAre.timeline.items.e4.desc') },
    { year: '2026', event: t('pages.whoWeAre.timeline.items.e5.event'), desc: t('pages.whoWeAre.timeline.items.e5.desc') },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-grow">

        {/* ═══════════════════════════════
            HERO
           ═══════════════════════════════ */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950">
          {/* Decorative */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 right-20 w-72 h-72 bg-blue-500/10 rounded-full blur-[80px]" />
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]" />
            <div className="absolute inset-0 opacity-[0.04]" style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '40px 40px',
            }} />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-5 py-2 mb-8">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span className="text-sm text-white/80 font-medium">{t('pages.whoWeAre.hero.badge')}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                {t('pages.whoWeAre.hero.title')}
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                  {t('pages.whoWeAre.hero.titleHighlight')}
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-300/80 leading-relaxed max-w-2xl mx-auto mb-10">
                {t('pages.whoWeAre.hero.desc')}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  type="button"
                  onClick={() => router.push('/donate')}
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white h-13 px-8 rounded-2xl text-base font-semibold shadow-xl shadow-blue-500/25"
                >
                  <Heart className="mr-2 h-5 w-5" />
                  {t('pages.whoWeAre.hero.donate')}
                </Button>
                <Button
                  type="button"
                  onClick={() => router.push('/education-equality')}
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 h-13 px-8 rounded-2xl text-base backdrop-blur-sm"
                >
                  {t('pages.whoWeAre.hero.campaign')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Wave */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 80" fill="none" className="w-full">
              <path d="M0 80L80 69.3C160 59 320 37 480 32C640 27 800 37 960 42.7C1120 48 1280 48 1360 48L1440 48V80H0Z" fill="white" />
            </svg>
          </div>
        </section>

        {/* ═══════════════════════════════
            STORY SECTION
           ═══════════════════════════════ */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left - Text */}
              <div>
                <span className="inline-block text-xs font-semibold tracking-widest uppercase text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full mb-6">
                  {t('pages.whoWeAre.story.badge')}
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6 leading-tight">
                  {t('pages.whoWeAre.story.title')}
                  <br />
                  {t('pages.whoWeAre.story.titleHighlight')}
                </h2>
                <div className="space-y-5">
                  <p className="text-lg text-slate-600 leading-relaxed">
                    &ldquo;{t('pages.whoWeAre.story.quote')}&rdquo;
                  </p>
                  <p className="text-slate-500 leading-relaxed">
                    {t('pages.whoWeAre.story.p1')}
                  </p>
                  <p className="text-slate-500 leading-relaxed">
                    {t('pages.whoWeAre.story.p2')}
                  </p>
                  <p className="text-slate-500 leading-relaxed">
                    {t('pages.whoWeAre.story.p3')} <strong className="text-slate-800">{t('pages.whoWeAre.story.p3Highlight')}</strong> {t('pages.whoWeAre.story.p3End')}
                  </p>
                </div>
              </div>

              {/* Right - Visual stats */}
              <div className="grid grid-cols-2 gap-5">
                {[
                  { icon: GraduationCap, value: '1,200+', label: t('pages.whoWeAre.story.stats.students'), gradient: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50' },
                  { icon: Globe, value: '12', label: t('pages.whoWeAre.story.stats.countries'), gradient: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50' },
                  { icon: HandHeart, value: '2,800+', label: t('pages.whoWeAre.story.stats.donors'), gradient: 'from-rose-500 to-pink-600', bg: 'bg-rose-50' },
                  { icon: TrendingUp, value: '%96', label: t('pages.whoWeAre.story.stats.successRate'), gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-50' },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={i}
                      className={`${stat.bg} rounded-3xl p-7 border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}
                    >
                      <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
                      <div className="text-sm text-slate-500">{stat.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════
            VALUES
           ═══════════════════════════════ */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="inline-block text-xs font-semibold tracking-widest uppercase text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full mb-4">
                {t('pages.whoWeAre.values.badge')}
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                {t('pages.whoWeAre.values.title')}
              </h2>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                {t('pages.whoWeAre.values.desc')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {values.map((value, i) => {
                const Icon = value.icon;
                return (
                  <div
                    key={i}
                    className={`bg-white rounded-2xl p-7 border ${value.border} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group`}
                  >
                    <div className={`${value.bg} w-14 h-14 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`h-7 w-7 ${value.color}`} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{value.title}</h3>
                    <p className="text-slate-500 leading-relaxed">{value.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════
            HOW WE WORK
           ═══════════════════════════════ */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="inline-block text-xs font-semibold tracking-widest uppercase text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full mb-4">
                {t('pages.whoWeAre.howItWorks.badge')}
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                {t('pages.whoWeAre.howItWorks.title')}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              {/* Connection line (desktop) */}
              <div className="hidden md:block absolute top-[60px] left-[12.5%] right-[12.5%] h-[2px] bg-gradient-to-r from-blue-200 via-emerald-200 to-amber-200" />

              {[
                {
                  step: '01',
                  icon: BookOpen,
                  title: t('pages.whoWeAre.howItWorks.items.step1.title'),
                  desc: t('pages.whoWeAre.howItWorks.items.step1.desc'),
                  gradient: 'from-blue-500 to-indigo-600',
                },
                {
                  step: '02',
                  icon: Heart,
                  title: t('pages.whoWeAre.howItWorks.items.step2.title'),
                  desc: t('pages.whoWeAre.howItWorks.items.step2.desc'),
                  gradient: 'from-emerald-500 to-teal-600',
                },
                {
                  step: '03',
                  icon: Zap,
                  title: t('pages.whoWeAre.howItWorks.items.step3.title'),
                  desc: t('pages.whoWeAre.howItWorks.items.step3.desc'),
                  gradient: 'from-amber-500 to-orange-600',
                },
                {
                  step: '04',
                  icon: Eye,
                  title: t('pages.whoWeAre.howItWorks.items.step4.title'),
                  desc: t('pages.whoWeAre.howItWorks.items.step4.desc'),
                  gradient: 'from-purple-500 to-pink-600',
                },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="text-center relative group">
                    <div className={`w-[72px] h-[72px] mx-auto mb-6 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-xs font-bold text-slate-300 mb-2 tracking-widest">{item.step}</div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed max-w-[220px] mx-auto">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════
            TIMELINE
           ═══════════════════════════════ */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="inline-block text-xs font-semibold tracking-widest uppercase text-amber-600 bg-amber-50 px-4 py-1.5 rounded-full mb-4">
                {t('pages.whoWeAre.timeline.badge')}
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                {t('pages.whoWeAre.timeline.title')}
              </h2>
            </div>

            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-6 sm:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-300 via-emerald-300 to-amber-300 sm:-translate-x-1/2" />

              <div className="space-y-10">
                {milestones.map((m, i) => (
                  <div key={i} className={`relative flex items-start gap-8 ${i % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'}`}>
                    {/* Dot */}
                    <div className="absolute left-6 sm:left-1/2 w-4 h-4 bg-white border-[3px] border-blue-500 rounded-full -translate-x-1/2 mt-1.5 z-10 shadow" />

                    {/* Content */}
                    <div className={`ml-14 sm:ml-0 sm:w-[calc(50%-40px)] ${i % 2 === 0 ? 'sm:text-right sm:pr-4' : 'sm:text-left sm:pl-4'}`}>
                      <span className="inline-block text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-2">
                        {m.year}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{m.event}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{m.desc}</p>
                    </div>

                    {/* Spacer for alternate side */}
                    <div className="hidden sm:block sm:w-[calc(50%-40px)]" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════
            TEAM
           ═══════════════════════════════ */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="inline-block text-xs font-semibold tracking-widest uppercase text-rose-600 bg-rose-50 px-4 py-1.5 rounded-full mb-4">
                {t('pages.whoWeAre.team.badge')}
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                {t('pages.whoWeAre.team.title')}
              </h2>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                {t('pages.whoWeAre.team.desc')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {teamMembers.map((member, i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl p-7 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-center group"
                >
                  <div className={`w-20 h-20 mx-auto mb-5 bg-gradient-to-br ${member.gradient} rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {member.initials}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-0.5">{member.name}</h3>
                  <p className="text-sm font-medium text-blue-600 mb-3">{member.role}</p>
                  <p className="text-sm text-slate-500 leading-relaxed">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════
            TRUST / TRANSPARENCY
           ═══════════════════════════════ */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-10 sm:p-16 relative overflow-hidden">
              {/* Decorative */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-400 rounded-full blur-[80px]" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-400 rounded-full blur-[80px]" />
              </div>

              <div className="relative z-10 text-center max-w-3xl mx-auto">
                <Shield className="h-12 w-12 text-blue-400 mx-auto mb-6" />
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-5">
                  {t('pages.whoWeAre.transparency.title')}
                </h2>
                <p className="text-slate-400 text-lg leading-relaxed mb-10">
                  {t('pages.whoWeAre.transparency.desc')}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                  {[
                    { icon: CheckCircle, title: t('pages.whoWeAre.transparency.items.t1.title'), desc: t('pages.whoWeAre.transparency.items.t1.desc') },
                    { icon: Shield, title: t('pages.whoWeAre.transparency.items.t2.title'), desc: t('pages.whoWeAre.transparency.items.t2.desc') },
                    { icon: Award, title: t('pages.whoWeAre.transparency.items.t3.title'), desc: t('pages.whoWeAre.transparency.items.t3.desc') },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                        <Icon className="h-8 w-8 text-emerald-400 mx-auto mb-3" />
                        <h3 className="text-white font-bold mb-1">{item.title}</h3>
                        <p className="text-slate-400 text-sm">{item.desc}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    type="button"
                    onClick={() => router.push('/transparency')}
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white h-12 px-8 rounded-2xl font-semibold shadow-xl shadow-blue-500/20"
                  >
                    {t('pages.whoWeAre.transparency.btn1')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    type="button"
                    onClick={() => router.push('/reports')}
                    size="lg"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 h-12 px-8 rounded-2xl backdrop-blur-sm"
                  >
                    {t('pages.whoWeAre.transparency.btn2')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════
            CTA
           ═══════════════════════════════ */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-full px-5 py-2 mb-6">
              <Star className="h-4 w-4 text-emerald-600" />
              <span className="text-sm text-emerald-700 font-medium">{t('pages.whoWeAre.cta.badge')}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-5 leading-tight">
              {t('pages.whoWeAre.cta.title')}
            </h2>
            <p className="text-lg text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
              {t('pages.whoWeAre.cta.desc')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                type="button"
                onClick={() => router.push('/donate')}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white h-14 px-10 rounded-2xl text-lg font-semibold shadow-xl shadow-blue-500/25"
              >
                <Heart className="mr-2 h-5 w-5" />
                {t('pages.whoWeAre.cta.donate')}
              </Button>
              <Button
                type="button"
                onClick={() => router.push('/apply')}
                size="lg"
                variant="outline"
                className="border-slate-200 text-slate-700 hover:bg-slate-50 h-14 px-10 rounded-2xl text-lg"
              >
                <GraduationCap className="mr-2 h-5 w-5" />
                {t('pages.whoWeAre.cta.apply')}
              </Button>
              <Button
                type="button"
                onClick={() => router.push('/corporate/auth/login')}
                size="lg"
                variant="outline"
                className="border-slate-200 text-slate-700 hover:bg-slate-50 h-14 px-10 rounded-2xl text-lg"
              >
                {t('pages.whoWeAre.cta.corporate')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
