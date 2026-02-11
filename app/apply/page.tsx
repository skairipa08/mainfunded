'use client';

import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useTranslation } from '@/lib/i18n';
import {
  GraduationCap,
  BookOpen,
  Users,
  ArrowRight,
  Sparkles,
  Heart,
  Shield,
  CheckCircle,
  School,
  UserCheck,
} from 'lucide-react';

export default function ApplyLandingPage() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-grow">
        {/* ═══════════ HERO ═══════════ */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px]" />
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                backgroundSize: '32px 32px',
              }}
            />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2 mb-6">
                <Sparkles className="h-4 w-4 text-yellow-300" />
                <span className="text-sm text-white/90 font-medium">{t('applyLanding.badge')}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                {t('applyLanding.heroTitle')}
                <br />
                <span className="bg-gradient-to-r from-yellow-200 via-amber-200 to-orange-200 bg-clip-text text-transparent">
                  {t('applyLanding.heroTitleHighlight')}
                </span>
              </h1>

              <p className="text-base sm:text-lg text-blue-100/80 leading-relaxed max-w-xl mx-auto">
                {t('applyLanding.heroDescription')}
              </p>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 60" fill="none" className="w-full">
              <path d="M0 60L60 52C120 44 240 28 360 24C480 20 600 28 720 32C840 36 960 36 1080 32C1200 28 1320 20 1380 16L1440 12V60H0Z" fill="#f8fafc" />
            </svg>
          </div>
        </section>

        {/* ═══════════ CARDS ═══════════ */}
        <section className="py-16 sm:py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
                {t('applyLanding.selectRole')}
              </h2>
              <p className="text-slate-500 max-w-lg mx-auto">
                {t('applyLanding.selectRoleDesc')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* STUDENT CARD */}
              <button
                onClick={() => router.push('/apply/student')}
                className="group relative bg-white rounded-3xl border-2 border-slate-100 hover:border-emerald-300 shadow-sm hover:shadow-xl transition-all duration-500 p-8 text-left overflow-hidden"
              >
                {/* Gradient glow */}
                <div className="absolute -top-8 -right-8 w-40 h-40 bg-gradient-to-br from-emerald-400/20 to-teal-400/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform duration-300">
                    <GraduationCap className="h-8 w-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-emerald-700 transition-colors">
                    {t('applyLanding.studentTitle')}
                  </h3>
                  <p className="text-slate-500 mb-6 leading-relaxed">
                    {t('applyLanding.studentDescription')}
                  </p>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      <span>{t('applyLanding.studentFeature1')}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      <span>{t('applyLanding.studentFeature2')}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      <span>{t('applyLanding.studentFeature3')}</span>
                    </div>
                  </div>

                  <div className="flex items-center text-emerald-600 font-semibold group-hover:gap-3 gap-2 transition-all duration-300">
                    <span>{t('applyLanding.studentCta')}</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>

              {/* TEACHER CARD */}
              <button
                onClick={() => router.push('/apply/teacher')}
                className="group relative bg-white rounded-3xl border-2 border-slate-100 hover:border-blue-300 shadow-sm hover:shadow-xl transition-all duration-500 p-8 text-left overflow-hidden"
              >
                {/* Gradient glow */}
                <div className="absolute -top-8 -right-8 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-indigo-400/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform duration-300">
                    <School className="h-8 w-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-700 transition-colors">
                    {t('applyLanding.teacherTitle')}
                  </h3>
                  <p className="text-slate-500 mb-6 leading-relaxed">
                    {t('applyLanding.teacherDescription')}
                  </p>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <span>{t('applyLanding.teacherFeature1')}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <span>{t('applyLanding.teacherFeature2')}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <span>{t('applyLanding.teacherFeature3')}</span>
                    </div>
                  </div>

                  <div className="flex items-center text-blue-600 font-semibold group-hover:gap-3 gap-2 transition-all duration-300">
                    <span>{t('applyLanding.teacherCta')}</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* ═══════════ HOW IT WORKS ═══════════ */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-12">
              {t('applyLanding.howItWorks')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{t('applyLanding.step1Title')}</h3>
                <p className="text-sm text-slate-500">{t('applyLanding.step1Desc')}</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
                  <UserCheck className="h-7 w-7 text-amber-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{t('applyLanding.step2Title')}</h3>
                <p className="text-sm text-slate-500">{t('applyLanding.step2Desc')}</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{t('applyLanding.step3Title')}</h3>
                <p className="text-sm text-slate-500">{t('applyLanding.step3Desc')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ TRUST BANNER ═══════════ */}
        <section className="py-12 bg-gradient-to-br from-slate-800 to-slate-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Shield className="h-10 w-10 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">{t('applyLanding.trustTitle')}</h3>
            <p className="text-slate-300 max-w-lg mx-auto">{t('applyLanding.trustDesc')}</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
