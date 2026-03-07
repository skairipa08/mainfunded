'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/context';
import { useCurrency } from '@/lib/currency-context';
import {
    Heart,
    MapPin,
    Star,
    ArrowLeft,
    Quote,
    ChevronRight,
    Sparkles,
} from 'lucide-react';

const IMG_HOPE = 'https://images.unsplash.com/photo-1491013516836-7db643ee125a?w=800&q=80&auto=format&fit=crop';
const IMG_JOY = 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800&q=80&auto=format&fit=crop';
const IMG_INCLUSIVE = 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80&auto=format&fit=crop';
const IMG_PLAY = 'https://images.unsplash.com/photo-1587654780291-39c9404d7dd0?w=800&q=80&auto=format&fit=crop';
const IMG_LEARNING = 'https://images.unsplash.com/photo-1588075592446-265fd1e6e76f?w=800&q=80&auto=format&fit=crop';
const IMG_THERAPY = 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&q=80&auto=format&fit=crop';

export default function SpecialNeedsStoriesPage() {
    const { t } = useTranslation();
    const { formatAmount, currency } = useCurrency();
    const router = useRouter();

    const stories = [
        {
            name: 'Elif',
            age: 8,
            country: t('specialNeeds.stories.country1'),
            image: IMG_HOPE,
            quote: t('specialNeeds.stories.quote1'),
            condition: t('specialNeeds.stories.condition1'),
            dream: t('specialNeeds.stories.dream1'),
            color: 'from-rose-500 to-pink-600',
            bgColor: 'bg-rose-50',
            longStory: t('specialNeeds.storiesPage.elifStory'),
        },
        {
            name: 'Yusuf',
            age: 6,
            country: t('specialNeeds.stories.country2'),
            image: IMG_JOY,
            quote: t('specialNeeds.stories.quote2'),
            condition: t('specialNeeds.stories.condition2'),
            dream: t('specialNeeds.stories.dream2'),
            color: 'from-purple-500 to-indigo-600',
            bgColor: 'bg-purple-50',
            longStory: t('specialNeeds.storiesPage.yusufStory'),
        },
        {
            name: 'Zeynep',
            age: 10,
            country: t('specialNeeds.stories.country3'),
            image: IMG_INCLUSIVE,
            quote: t('specialNeeds.stories.quote3'),
            condition: t('specialNeeds.stories.condition3'),
            dream: t('specialNeeds.stories.dream3'),
            color: 'from-teal-500 to-cyan-600',
            bgColor: 'bg-teal-50',
            longStory: t('specialNeeds.storiesPage.zeynepStory'),
        },
        {
            name: 'Emre',
            age: 7,
            country: t('specialNeeds.storiesPage.country4'),
            image: IMG_PLAY,
            quote: t('specialNeeds.storiesPage.quote4'),
            condition: t('specialNeeds.storiesPage.condition4'),
            dream: t('specialNeeds.storiesPage.dream4'),
            color: 'from-amber-500 to-orange-600',
            bgColor: 'bg-amber-50',
            longStory: t('specialNeeds.storiesPage.emreStory'),
        },
        {
            name: 'Aylin',
            age: 9,
            country: t('specialNeeds.storiesPage.country5'),
            image: IMG_LEARNING,
            quote: t('specialNeeds.storiesPage.quote5'),
            condition: t('specialNeeds.storiesPage.condition5'),
            dream: t('specialNeeds.storiesPage.dream5'),
            color: 'from-blue-500 to-indigo-600',
            bgColor: 'bg-blue-50',
            longStory: t('specialNeeds.storiesPage.aylinStory'),
        },
        {
            name: 'Can',
            age: 5,
            country: t('specialNeeds.storiesPage.country6'),
            image: IMG_THERAPY,
            quote: t('specialNeeds.storiesPage.quote6'),
            condition: t('specialNeeds.storiesPage.condition6'),
            dream: t('specialNeeds.storiesPage.dream6'),
            color: 'from-emerald-500 to-teal-600',
            bgColor: 'bg-emerald-50',
            longStory: t('specialNeeds.storiesPage.canStory'),
        },
    ];

    const handleDonate = () => {
        router.push('/donate?campaign=special-needs');
    };

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />
            <main className="flex-grow">

                {/* Hero */}
                <section className="relative bg-gradient-to-br from-purple-950 via-pink-950 to-indigo-950 py-20 overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-pink-500 rounded-full blur-[150px]" />
                        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500 rounded-full blur-[150px]" />
                    </div>
                    <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
                        <Link
                            href="/special-needs"
                            className="inline-flex items-center gap-2 text-white/60 hover:text-white/90 transition-colors mb-8 text-sm"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            {t('specialNeeds.storiesPage.backToMain')}
                        </Link>

                        <div className="text-5xl mb-6">💜</div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
                            {t('specialNeeds.storiesPage.heroTitle')}
                        </h1>
                        <p className="text-lg text-purple-200 max-w-2xl mx-auto leading-relaxed">
                            {t('specialNeeds.storiesPage.heroSubtitle')}
                        </p>
                    </div>
                </section>

                {/* Stories Grid */}
                <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
                    <div className="max-w-6xl mx-auto px-4">
                        <div className="space-y-16">
                            {stories.map((story, i) => (
                                <div
                                    key={i}
                                    className={`flex flex-col ${i % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-8 items-stretch`}
                                >
                                    {/* Image side */}
                                    <div className="lg:w-5/12 relative">
                                        <div className="relative h-80 lg:h-full min-h-[320px] rounded-3xl overflow-hidden shadow-xl group">
                                            <Image
                                                src={story.image}
                                                alt={story.name}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                                            <div className="absolute bottom-5 left-5 flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-white/80" />
                                                <span className="text-sm text-white/90 font-medium">{story.country}</span>
                                            </div>
                                            <div className="absolute top-5 right-5">
                                                <span className={`bg-gradient-to-r ${story.color} text-white text-xs px-4 py-1.5 rounded-full font-semibold shadow-lg`}>
                                                    {story.condition}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content side */}
                                    <div className="lg:w-7/12 flex flex-col justify-center">
                                        <div className={`${story.bgColor} rounded-3xl p-8 sm:p-10 relative overflow-hidden`}>
                                            <Quote className="absolute top-6 right-6 h-12 w-12 text-slate-200" />

                                            <div className="relative z-10">
                                                {/* Name & badge */}
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className={`w-12 h-12 bg-gradient-to-br ${story.color} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                                                        {story.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 text-lg">{story.name}</p>
                                                        <p className="text-xs text-slate-500">{story.age} {t('specialNeeds.stories.yearsOld')}</p>
                                                    </div>
                                                    <div className="ml-auto">
                                                        <span className="bg-white/80 backdrop-blur-sm text-slate-600 text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1 shadow-sm">
                                                            <Star className="h-3 w-3 text-amber-500" />
                                                            {story.dream}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Quote */}
                                                <blockquote className="text-lg text-slate-700 italic leading-relaxed mb-5 border-l-4 border-pink-300 pl-4">
                                                    &ldquo;{story.quote}&rdquo;
                                                </blockquote>

                                                {/* Long story */}
                                                <p className="text-slate-600 leading-relaxed mb-6 text-sm">
                                                    {story.longStory}
                                                </p>

                                                {/* CTA */}
                                                <Button
                                                    onClick={handleDonate}
                                                    className={`bg-gradient-to-r ${story.color} hover:opacity-90 text-white rounded-xl font-semibold px-8 h-12 shadow-lg transition-all hover:scale-105`}
                                                >
                                                    <Heart className="mr-2 h-4 w-4" />
                                                    {t('specialNeeds.stories.helpChild', { name: story.name })}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-20 bg-gradient-to-br from-purple-950 via-pink-950 to-indigo-950 text-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-400 rounded-full blur-[100px]" />
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400 rounded-full blur-[100px]" />
                    </div>
                    <div className="relative z-10 max-w-3xl mx-auto px-4">
                        <div className="text-5xl mb-6 animate-pulse">🙏</div>
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                            {t('specialNeeds.storiesPage.ctaTitle')}
                        </h2>
                        <p className="text-pink-200 max-w-xl mx-auto mb-10 leading-relaxed">
                            {t('specialNeeds.storiesPage.ctaSubtitle')}
                        </p>
                        <Button
                            onClick={handleDonate}
                            size="lg"
                            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white h-14 px-12 rounded-2xl text-lg font-semibold shadow-xl shadow-pink-500/30 transition-all duration-300 hover:scale-105"
                        >
                            <Heart className="mr-2 h-5 w-5" />
                            {t('specialNeeds.donateNow')}
                        </Button>
                    </div>
                </section>

            </main>
            <Footer />
        </div>
    );
}
