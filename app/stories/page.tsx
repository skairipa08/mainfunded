'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Play, Quote, Send, X, Loader2 } from 'lucide-react';
import { ThankYouCard, mockThankYouMessages } from '@/components/ThankYouMessage';
import MobileHeader from '@/components/MobileHeader';
import { useTranslation } from '@/lib/i18n/context';
import { censorSurname } from '@/lib/privacy';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface SuccessStory {
    story_id: string;
    user_name: string;
    title: string;
    quote: string;
    university: string;
    field: string;
    funded_amount: number;
    created_at: string;
}

// Hardcoded fallback stories (shown when DB has none)
const fallbackStories: SuccessStory[] = [
    {
        story_id: 'demo-1',
        user_name: 'Ayse Yilmaz',
        title: 'Hayallerime Kavuştum',
        university: 'Bogazici Universitesi',
        field: 'Bilgisayar Muhendisligi',
        quote: "FundEd sayesinde hayallerime kavustum. Simdi Google'da staj yapiyorum!",
        funded_amount: 0,
        created_at: new Date().toISOString(),
    },
    {
        story_id: 'demo-2',
        user_name: 'Mehmet Kaya',
        title: 'Ailem Destekleyemiyordu',
        university: 'ODTU',
        field: 'Elektrik Elektronik',
        quote: 'Ailem beni destekleyemiyordu. FundEd ailesi olmasa burada olamazdim.',
        funded_amount: 0,
        created_at: new Date().toISOString(),
    },
    {
        story_id: 'demo-3',
        user_name: 'Zeynep Demir',
        title: 'Maddi ve Moral Destek',
        university: 'ITU',
        field: 'Mimarlik',
        quote: 'Bagiscilarin destegi sadece maddi degil, moral olarak da cok degerli.',
        funded_amount: 0,
        created_at: new Date().toISOString(),
    },
];

export default function StoriesPage() {
    const { t } = useTranslation();
    const { data: session } = useSession();
    const router = useRouter();
    const [stories, setStories] = useState<SuccessStory[]>(fallbackStories);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        quote: '',
        university: '',
        field: '',
        funded_amount: '',
    });

    useEffect(() => {
        loadStories();
    }, []);

    const loadStories = async () => {
        try {
            const res = await fetch('/api/stories');
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.data?.stories?.length > 0) {
                    setStories(data.data.stories);
                }
                // else keep fallback stories
            }
        } catch {
            // Keep fallback stories on error
        }
    };

    const handleOpenForm = () => {
        if (!session?.user) {
            toast.error('Hikaye paylaşmak için giriş yapmalısınız');
            router.push('/login');
            return;
        }
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;

        if (formData.quote.trim().length < 10) {
            toast.error('Hikayeniz en az 10 karakter olmalıdır');
            return;
        }
        if (!formData.university.trim() || !formData.field.trim()) {
            toast.error('Üniversite ve bölüm bilgisi gereklidir');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/stories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.title || 'Başarı Hikayem',
                    quote: formData.quote,
                    university: formData.university,
                    field: formData.field,
                    funded_amount: parseFloat(formData.funded_amount) || 0,
                }),
            });

            const data = await res.json();
            if (data.success) {
                toast.success('Hikayeniz gönderildi! Onaylandıktan sonra yayınlanacaktır. 🎉');
                setShowForm(false);
                setFormData({ title: '', quote: '', university: '', field: '', funded_amount: '' });
            } else {
                toast.error(data.error?.message || 'Bir hata oluştu');
            }
        } catch {
            toast.error('Bağlantı hatası. Lütfen tekrar deneyin.');
        } finally {
            setSubmitting(false);
        }
    };

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
                    <p className="text-pink-100 text-lg max-w-2xl mx-auto mb-8">
                        {t('pages.stories.subtitle')}
                    </p>

                    {/* CTA: Share Your Story */}
                    <button
                        onClick={handleOpenForm}
                        className="inline-flex items-center gap-2 bg-white text-pink-600 px-8 py-3 rounded-full font-semibold text-lg hover:bg-pink-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                        <Send className="h-5 w-5" />
                        Başarı Hikayeni Paylaş
                    </button>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Demo Notice */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-center gap-3">
                    <span className="text-amber-600 font-bold text-lg">⚠️</span>
                    <p className="text-amber-800 text-sm font-medium">{t('common.demoStories')}</p>
                </div>

                {/* Success Stories */}
                <div className="grid md:grid-cols-3 gap-8 mb-12">
                    {stories.map((story) => (
                        <div key={story.story_id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                                    <span className="text-4xl">🎓</span>
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="font-bold text-xl text-gray-900">{censorSurname(story.user_name)}</h3>
                                <p className="text-blue-600 text-sm mb-2">{story.university}</p>
                                <p className="text-gray-500 text-sm mb-4">{story.field}</p>

                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <Quote className="h-5 w-5 text-gray-400 mb-2" />
                                    <p className="text-gray-700 italic">{story.quote}</p>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">{t('pages.stories.collected')}:</span>
                                    <span className="font-bold text-green-600">${story.funded_amount.toLocaleString()}</span>
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

            {/* Submit Story Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="bg-pink-100 p-2 rounded-lg">
                                    <Send className="h-5 w-5 text-pink-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Başarı Hikayeni Paylaş</h2>
                                    <p className="text-sm text-gray-500">Hikayeniz onaylandıktan sonra yayınlanacaktır</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowForm(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                aria-label="Kapat"
                            >
                                <X className="h-5 w-5 text-gray-400" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Başlık <span className="text-gray-400">(opsiyonel)</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Örn: Hayallerime Kavuştum"
                                    maxLength={200}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Hikayeniz <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formData.quote}
                                    onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                                    placeholder="FundEd size nasıl yardımcı oldu? Deneyiminizi paylaşın..."
                                    maxLength={1000}
                                    rows={4}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all resize-none"
                                />
                                <p className="text-xs text-gray-400 mt-1">{formData.quote.length}/1000</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Üniversite <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.university}
                                        onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                                        placeholder="Örn: Boğaziçi Üniversitesi"
                                        maxLength={200}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Bölüm <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.field}
                                        onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                                        placeholder="Örn: Bilgisayar Mühendisliği"
                                        maxLength={200}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Toplanan Destek ($) <span className="text-gray-400">(opsiyonel)</span>
                                </label>
                                <input
                                    type="number"
                                    value={formData.funded_amount}
                                    onChange={(e) => setFormData({ ...formData, funded_amount: e.target.value })}
                                    placeholder="0"
                                    min="0"
                                    step="0.01"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white py-3.5 rounded-xl font-semibold hover:from-pink-700 hover:to-rose-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Gönderiliyor...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-5 w-5" />
                                        Hikayemi Gönder
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
