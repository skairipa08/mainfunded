'use client';

import React from 'react';
import { MessageSquare, Play, Quote } from 'lucide-react';
import { ThankYouCard, mockThankYouMessages } from '@/components/ThankYouMessage';
import MobileHeader from '@/components/MobileHeader';
import { useTranslation } from '@/lib/i18n/context';
import { censorSurname } from '@/lib/privacy';

export default function StoriesPage() {
    const { t } = useTranslation();

    const successStories = [
        {
            id: '1',
            name: 'Ayse Yilmaz',
            university: 'Bogazici Universitesi',
            field: 'Bilgisayar Muhendisligi',
            quote: 'FundEd sayesinde hayallerime kavustum. Simdi Google\'da staj yapiyorum!',
            image: '/images/student-1.jpg',
            funded: 0,
        },
        {
            id: '2',
            name: 'Mehmet Kaya',
            university: 'ODTU',
            field: 'Elektrik Elektronik',
            quote: 'Ailem beni destekleyemiyordu. FundEd ailesi olmasa burada olamazdim.',
            image: '/images/student-2.jpg',
            funded: 0,
        },
        {
            id: '3',
            name: 'Zeynep Demir',
            university: 'ITU',
            field: 'Mimarlik',
            quote: 'Bagiscilarin destegi sadece maddi degil, moral olarak da cok degerli.',
            image: '/images/student-3.jpg',
            funded: 0,
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-pink-50">
            {/* Mobile Header */}
            <MobileHeader transparent backHref="/" />

            {/* Hero */}
            <div className="bg-gradient-to-r from-pink-600 to-rose-700 text-white py-16 -mt-14 pt-20">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <MessageSquare className="h-10 w-10" />
                        <h1 className="text-4xl font-bold">{t('pages.stories.title')}</h1>
                    </div>
                    <p className="text-pink-100 text-lg max-w-2xl mx-auto">
                        {t('pages.stories.subtitle')}
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Demo Notice */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-center gap-3">
                    <span className="text-amber-600 font-bold text-lg">⚠️</span>
                    <p className="text-amber-800 text-sm font-medium">Bu sayfa demo amaclidir. Hikayeler ve tutarlar ornek icin gosterilmektedir; gercek veriler platform aktif oldugunda guncellenecektir.</p>
                </div>

                {/* Success Stories */}
                <div className="grid md:grid-cols-3 gap-8 mb-12">
                    {successStories.map((story) => (
                        <div key={story.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                            <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                                    <span className="text-4xl">🎓</span>
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="font-bold text-xl text-gray-900">{censorSurname(story.name)}</h3>
                                <p className="text-blue-600 text-sm mb-2">{story.university}</p>
                                <p className="text-gray-500 text-sm mb-4">{story.field}</p>

                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <Quote className="h-5 w-5 text-gray-400 mb-2" />
                                    <p className="text-gray-700 italic">{story.quote}</p>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">{t('pages.stories.collected')}:</span>
                                    <span className="font-bold text-green-600">${story.funded.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Thank You Messages */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('pages.stories.thankYouMessages')}</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {mockThankYouMessages.map((message) => (
                            <ThankYouCard
                                key={message.id}
                                message={message}
                                onMarkRead={(id) => console.log('Marked read:', id)}
                            />
                        ))}
                    </div>
                </div>

                {/* Video CTA */}
                <div className="mt-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-center text-white">
                    <Play className="h-12 w-12 mx-auto mb-4 bg-white/20 p-3 rounded-full" />
                    <h3 className="text-2xl font-bold mb-2">{t('pages.stories.watchVideos')}</h3>
                    <p className="text-purple-100 mb-4">
                        {t('pages.stories.watchVideosDesc')}
                    </p>
                    <button className="bg-white text-purple-600 px-6 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors">
                        {t('pages.stories.watchNow')}
                    </button>
                </div>
            </div>
        </div>
    );
}
