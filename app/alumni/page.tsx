'use client';

import React from 'react';
import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import { AlumniTracking, AlumniStats, mockAlumni } from '@/components/AlumniTracking';
import MobileHeader from '@/components/MobileHeader';
import { useTranslation } from '@/lib/i18n/context';

export default function AlumniPage() {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
            {/* Mobile Header */}
            <MobileHeader transparent backHref="/" />

            {/* Hero */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-16 -mt-14 pt-20">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <GraduationCap className="h-10 w-10" />
                        <h1 className="text-4xl font-bold">{t('pages.alumni.title')}</h1>
                    </div>
                    <p className="text-indigo-100 text-lg max-w-2xl mx-auto">
                        {t('pages.alumni.subtitle')}
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Demo Notice */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-center gap-3">
                    <span className="text-amber-600 font-bold text-lg">⚠️</span>
                    <p className="text-amber-800 text-sm font-medium">{t('common.demoAlumni')}</p>
                </div>

                {/* Stats */}
                <AlumniStats className="mb-8" />

                {/* Alumni Grid */}
                <div className="max-w-3xl mx-auto">
                    <AlumniTracking alumni={mockAlumni} />
                </div>

                {/* Give Back CTA */}
                <div className="max-w-3xl mx-auto mt-12">
                    <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl p-8 text-center text-white">
                        <h3 className="text-2xl font-bold mb-2">{t('pages.alumni.giveBackProgram')}</h3>
                        <p className="text-green-100 mb-4">
                            {t('pages.alumni.giveBackDesc')}
                        </p>
                        <Link href="/browse">
                            <button className="bg-white text-green-600 px-6 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors">
                                {t('pages.alumni.joinProgram')}
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
