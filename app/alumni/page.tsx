'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    GraduationCap,
    Heart,
    Sparkles,
    ArrowRight,
    Quote,
    Play,
    Star,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import {
    AlumniTracking,
    AlumniStats,
    AlumniJourney,
    AlumniLetter,
    type AlumniProfile,
} from '@/components/AlumniTracking';
import MobileHeader from '@/components/MobileHeader';
import { useTranslation } from '@/lib/i18n/context';

export default function AlumniPage() {
    const { t } = useTranslation();
    const [activeTestimonial, setActiveTestimonial] = useState(0);

    const mockAlumni: AlumniProfile[] = [
        {
            id: '1',
            name: 'Ayse Yilmaz',
            graduationYear: 2024,
            university: 'Bogazici Universitesi',
            degree: 'Bilgisayar Muhendisligi',
            currentRole: 'Software Engineer',
            company: 'Google',
            location: 'Dublin, Irlanda',
            linkedIn: 'https://linkedin.com/in/ayseyilmaz',
            story: t('pages.alumni.mock.story1'),
            dream: t('pages.alumni.mock.dream1'),
            now: t('pages.alumni.mock.now1'),
            totalReceived: 0,
            givingBack: 0,
            emoji: '👩‍💻',
        },
        {
            id: '2',
            name: 'Mehmet Kaya',
            graduationYear: 2023,
            university: 'ODTU',
            degree: 'Elektrik Elektronik',
            currentRole: 'Hardware Engineer',
            company: 'Apple',
            location: 'Cupertino, ABD',
            story: t('pages.alumni.mock.story2'),
            dream: t('pages.alumni.mock.dream2'),
            now: t('pages.alumni.mock.now2'),
            totalReceived: 0,
            givingBack: 0,
            emoji: '👨‍🔬',
        },
        {
            id: '3',
            name: 'Zeynep Demir',
            graduationYear: 2024,
            university: 'ITU',
            degree: 'Mimarlik',
            currentRole: 'Junior Architect',
            company: 'Foster + Partners',
            location: 'Londra, Ingiltere',
            story: t('pages.alumni.mock.story3'),
            dream: t('pages.alumni.mock.dream3'),
            now: t('pages.alumni.mock.now3'),
            totalReceived: 0,
            emoji: '👩‍🎨',
        },
        {
            id: '4',
            name: 'Ali Ozkan',
            graduationYear: 2022,
            university: 'Hacettepe Universitesi',
            degree: 'Tip Fakultesi',
            currentRole: 'Uzman Doktor',
            company: 'Ankara Sehir Hastanesi',
            location: 'Ankara, Turkiye',
            story: t('pages.alumni.mock.story4'),
            dream: t('pages.alumni.mock.dream4'),
            now: t('pages.alumni.mock.now4'),
            totalReceived: 0,
            givingBack: 0,
            emoji: '👨‍⚕️',
        },
        {
            id: '5',
            name: 'Elif Sahin',
            graduationYear: 2023,
            university: 'Ankara Universitesi',
            degree: 'Hukuk Fakultesi',
            currentRole: 'Cocuk Haklari Avukati',
            company: 'UNICEF Turkiye',
            location: 'Istanbul, Turkiye',
            story: t('pages.alumni.mock.story5'),
            dream: t('pages.alumni.mock.dream5'),
            now: t('pages.alumni.mock.now5'),
            totalReceived: 0,
            givingBack: 0,
            emoji: '👩‍⚖️',
        },
    ];

    const testimonials = [
        { text: t('pages.alumni.mock.story1'), name: 'Ayse Y.', emoji: '👩‍💻', role: t('pages.alumni.mock.now1') },
        { text: t('pages.alumni.mock.story2'), name: 'Mehmet K.', emoji: '👨‍🔬', role: t('pages.alumni.mock.now2') },
        { text: t('pages.alumni.mock.story3'), name: 'Zeynep D.', emoji: '👩‍🎨', role: t('pages.alumni.mock.now3') },
        { text: t('pages.alumni.mock.story4'), name: 'Ali O.', emoji: '👨‍⚕️', role: t('pages.alumni.mock.now4') },
        { text: t('pages.alumni.mock.story5'), name: 'Elif S.', emoji: '👩‍⚖️', role: t('pages.alumni.mock.now5') },
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Mobile Header */}
            <MobileHeader transparent backHref="/" />

            {/* ===== HERO SECTION ===== */}
            <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 text-white -mt-14">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-40 right-1/4 w-48 h-48 bg-pink-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
                    {/* Floating icons */}
                    <div className="absolute top-32 left-1/4 opacity-10">
                        <GraduationCap className="h-24 w-24" />
                    </div>
                    <div className="absolute bottom-20 right-1/3 opacity-10">
                        <Heart className="h-16 w-16" />
                    </div>
                    <div className="absolute top-1/2 left-10 opacity-10">
                        <Star className="h-12 w-12" />
                    </div>
                </div>

                <div className="relative container mx-auto px-4 pt-28 pb-20 md:pt-36 md:pb-28">
                    <div className="max-w-4xl mx-auto text-center">
                        {/* Emotional badge */}
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2.5 mb-8 border border-white/20">
                            <Sparkles className="h-4 w-4 text-yellow-300" />
                            <span className="text-sm font-medium text-white/90">{t('pages.alumni.title')}</span>
                            <Sparkles className="h-4 w-4 text-yellow-300" />
                        </div>

                        {/* Main headline */}
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-6">
                            <span className="block bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-transparent">
                                {t('pages.alumni.heroHeadline')}
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-purple-200 max-w-2xl mx-auto mb-10 leading-relaxed">
                            {t('pages.alumni.heroSubtitle')}
                        </p>

                        {/* Mandela Quote */}
                        <div className="relative max-w-lg mx-auto">
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                                <Quote className="h-8 w-8 text-yellow-300/50 mx-auto mb-3" />
                                <p className="text-white/80 italic text-base md:text-lg leading-relaxed font-serif">
                                    &ldquo;{t('pages.alumni.heroQuote')}&rdquo;
                                </p>
                                <p className="text-yellow-300/80 text-sm mt-3 font-medium">— {t('pages.alumni.heroQuoteAuthor')}</p>
                            </div>
                        </div>

                        {/* Scroll indicator */}
                        <div className="mt-12 flex flex-col items-center gap-2 animate-bounce">
                            <span className="text-white/40 text-xs uppercase tracking-widest">Scroll</span>
                            <div className="w-px h-8 bg-gradient-to-b from-white/40 to-transparent" />
                        </div>
                    </div>
                </div>

                {/* Wave separator */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                        <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
                    </svg>
                </div>
            </section>

            {/* ===== DEMO NOTICE ===== */}
            <div className="container mx-auto px-4 pt-4">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                    <span className="text-amber-600 font-bold text-lg shrink-0">⚠️</span>
                    <p className="text-amber-800 text-sm font-medium">{t('common.demoAlumni')}</p>
                </div>
            </div>

            {/* ===== IMPACT STATS ===== */}
            <section className="container mx-auto px-4 py-16 md:py-20">
                <AlumniStats />
            </section>

            {/* ===== JOURNEY TIMELINE ===== */}
            <section className="bg-gradient-to-b from-gray-50 to-white py-16 md:py-20">
                <div className="container mx-auto px-4">
                    <AlumniJourney />
                </div>
            </section>

            {/* ===== TESTIMONIAL CAROUSEL ===== */}
            <section className="py-16 md:py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 bg-rose-50 rounded-full px-4 py-2 mb-4">
                            <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
                            <span className="text-sm font-semibold text-rose-600">{t('pages.alumni.featuredStories')}</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                            {t('pages.alumni.featuredStoriesDesc')}
                        </h2>
                    </div>

                    {/* Carousel */}
                    <div className="max-w-3xl mx-auto relative">
                        <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl p-8 md:p-12 border border-indigo-100 shadow-lg">
                            <Quote className="h-10 w-10 text-indigo-300 mb-4" />
                            <p className="text-gray-700 text-base md:text-lg leading-relaxed italic mb-8 min-h-[120px]">
                                &ldquo;{testimonials[activeTestimonial].text}&rdquo;
                            </p>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-2xl shadow-md">
                                        {testimonials[activeTestimonial].emoji}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{testimonials[activeTestimonial].name}</p>
                                        <p className="text-sm text-gray-500">{testimonials[activeTestimonial].role}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                                        className="w-10 h-10 rounded-full bg-white shadow-md border flex items-center justify-center hover:bg-gray-50 transition-colors"
                                    >
                                        <ChevronLeft className="h-5 w-5 text-gray-600" />
                                    </button>
                                    <button
                                        onClick={() => setActiveTestimonial((prev) => (prev + 1) % testimonials.length)}
                                        className="w-10 h-10 rounded-full bg-white shadow-md border flex items-center justify-center hover:bg-gray-50 transition-colors"
                                    >
                                        <ChevronRight className="h-5 w-5 text-gray-600" />
                                    </button>
                                </div>
                            </div>

                            {/* Dots */}
                            <div className="flex items-center justify-center gap-2 mt-6">
                                {testimonials.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveTestimonial(i)}
                                        className={`h-2 rounded-full transition-all duration-300 ${
                                            i === activeTestimonial
                                                ? 'w-8 bg-gradient-to-r from-indigo-500 to-purple-500'
                                                : 'w-2 bg-gray-300 hover:bg-gray-400'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== ALUMNI LETTER ===== */}
            <section className="py-16 md:py-20 bg-gradient-to-b from-white to-gray-50">
                <div className="container mx-auto px-4 max-w-3xl">
                    <AlumniLetter />
                </div>
            </section>

            {/* ===== ALUMNI GRID ===== */}
            <section className="py-16 md:py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 bg-indigo-50 rounded-full px-4 py-2 mb-4">
                            <GraduationCap className="h-4 w-4 text-indigo-500" />
                            <span className="text-sm font-semibold text-indigo-600">{t('pages.alumni.title')}</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{t('pages.alumni.subtitle')}</h2>
                    </div>

                    <div className="max-w-3xl mx-auto">
                        <AlumniTracking alumni={mockAlumni} />
                    </div>
                </div>
            </section>

            {/* ===== GIVE BACK CTA ===== */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-600 via-pink-600 to-purple-700" />
                {/* Decorative */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-10 left-10 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5">
                        <Heart className="h-64 w-64" />
                    </div>
                </div>

                <div className="relative container mx-auto px-4 py-20 md:py-28">
                    <div className="max-w-3xl mx-auto text-center text-white">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/20">
                            <Heart className="h-4 w-4 text-rose-200 fill-rose-200" />
                            <span className="text-sm font-medium">{t('pages.alumni.giveBackProgram')}</span>
                        </div>

                        <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
                            {t('pages.alumni.giveBackHeadline')}
                        </h2>

                        <p className="text-lg text-white/80 mb-4 max-w-xl mx-auto leading-relaxed">
                            {t('pages.alumni.giveBackDesc')}
                        </p>

                        <p className="text-white/60 italic text-sm mb-10">
                            {t('pages.alumni.giveBackEmotional')}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/browse">
                                <button className="group bg-white text-rose-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-rose-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center gap-2">
                                    <Heart className="h-5 w-5 fill-rose-500 text-rose-500 group-hover:scale-110 transition-transform" />
                                    {t('pages.alumni.joinProgram')}
                                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </Link>
                        </div>

                        {/* Trust indicators */}
                        <div className="mt-12 flex items-center justify-center gap-8 text-white/50 text-sm">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4" />
                                <span>100% {t('pages.alumni.stats.dreamsRealized')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Heart className="h-4 w-4" />
                                <span>27% {t('pages.alumni.stats.givingBack')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
