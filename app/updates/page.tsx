'use client';

import React from 'react';
import { BookOpen } from 'lucide-react';
import { StudentBlog, WriteBlogPost, mockBlogPosts } from '@/components/StudentBlog';
import MobileHeader from '@/components/MobileHeader';
import { useTranslation } from '@/lib/i18n/context';

export default function StudentUpdatesPage() {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Mobile Header */}
            <MobileHeader transparent backHref="/" />

            {/* Hero */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 -mt-14 pt-20">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <BookOpen className="h-10 w-10" />
                        <h1 className="text-4xl font-bold">{t('pages.updates.title')}</h1>
                    </div>
                    <p className="text-blue-100 text-lg max-w-2xl mx-auto">
                        {t('pages.updates.subtitle')}
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    {/* Stats */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border mb-8">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-2xl font-bold text-blue-600">156</p>
                                <p className="text-sm text-gray-500">{t('pages.updates.activeJournals')}</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-green-600">1,245</p>
                                <p className="text-sm text-gray-500">{t('pages.updates.posts')}</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-purple-600">8,432</p>
                                <p className="text-sm text-gray-500">{t('pages.updates.likes')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Blog Posts */}
                    <StudentBlog posts={mockBlogPosts} />

                    {/* Load More */}
                    <div className="text-center mt-8">
                        <button className="text-blue-600 font-medium hover:underline">
                            {t('pages.updates.loadMore')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
