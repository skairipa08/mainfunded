'use client';

import React, { useState } from 'react';
import { useTranslation } from "@/lib/i18n/context";
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, X, Building2, User, Mail, Phone, MessageSquare } from 'lucide-react';

const sponsors = [
    {
        name: 'X Teknoloji',
        logo: '/sponsors/sponsor-x.png',
        description: 'Teknoloji cozumleri'
    },
    {
        name: 'Y Holding',
        logo: '/sponsors/sponsor-y.png',
        description: 'Finansal danismanlik'
    },
    {
        name: 'Z Eğitim',
        logo: '/sponsors/sponsor-z.png',
        description: 'Eğitim platformu'
    },
    {
        name: 'T Saglik',
        logo: '/sponsors/sponsor-t.png',
        description: 'Saglik hizmetleri'
    },
];

export default function SponsorsPage() {
    const { t } = useTranslation();
    const [showForm, setShowForm] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [formData, setFormData] = useState({
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
        message: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitError('');
        try {
            const res = await fetch('/api/sponsor-applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data?.error?.message || 'Bir hata olustu.');
            }
            setSubmitted(true);
        } catch (err: any) {
            setSubmitError(err.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const resetForm = () => {
        setFormData({ companyName: '', contactName: '', email: '', phone: '', message: '' });
        setSubmitted(false);
        setSubmitError('');
        setShowForm(false);
    };

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />
            <main className="flex-grow">
                {/* Hero Section */}
                <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20 px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">
                            {t('app.page.sponsorlarimiz')}</h1>
                        <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
                            {t('app.page.funded_apos_e_inanan_ve_platfo')}</p>
                    </div>
                </section>

                {/* Description Section */}
                <section className="py-16 px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                {t('app.page.neden_funded_apos_i_destekliyo')}</h2>
                            <p className="text-gray-700 leading-relaxed text-lg italic">
                                {t('app.page.ldquo_funded_apos_i_destekliyo')}</p>
                            <p className="text-gray-700 leading-relaxed mt-4">
                                {t('app.page.sponsorlarimiz_funded_platform')}</p>
                            <p className="text-gray-700 leading-relaxed mt-4">
                                {t('app.page.siz_de_funded_apos_in_arkasind')}</p>
                        </div>

                        {/* Sponsors Grid */}
                        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                            {t('app.page.funded_apos_e_inanan_sirketler')}</h2>
                        <p className="text-gray-500 text-center mb-8">
                            {t('app.page.platformumuzu_destekleyerek_e_')}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {sponsors.map((sponsor, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col items-center p-6 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow"
                                >
                                    <div className="w-24 h-24 bg-white rounded-lg p-2 flex items-center justify-center shadow-sm mb-4">
                                        <Image
                                            src={sponsor.logo}
                                            alt={sponsor.name}
                                            width={80}
                                            height={80}
                                            className="object-contain"
                                        />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 text-center text-sm">
                                        {sponsor.name}
                                    </h3>
                                    <p className="text-gray-500 text-xs mt-1 text-center">
                                        {sponsor.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="bg-gray-100 py-12 px-4">
                    <div className="max-w-2xl mx-auto text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            {t('app.page.siz_de_funded_apos_i_destekley')}</h2>
                        <p className="text-gray-600 mb-6">
                            {t('app.page.e_itimde_e_itlik_i_in_platform')}</p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            {t('app.page.iletisime_gecin')}</button>
                    </div>
                </section>
            </main>
            <Footer />

            {/* Sponsor Application Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        {!submitted ? (
                            <>
                                <div className="p-6 border-b flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{t('app.page.sponsor_ba_vuru_formu')}</h3>
                                        <p className="text-sm text-gray-500">{t('app.page.bilgilerinizi_doldurun_sizinle')}</p>
                                    </div>
                                    <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                        <X className="h-5 w-5 text-gray-500" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                    <div>
                                        <Label htmlFor="companyName" className="flex items-center gap-2 mb-2">
                                            <Building2 className="h-4 w-4 text-gray-500" />
                                            {t('app.page.sirket_kurum_adi')}</Label>
                                        <Input
                                            id="companyName"
                                            name="companyName"
                                            required
                                            value={formData.companyName}
                                            onChange={handleInputChange}
                                            placeholder={t('app.page.rnek_a')}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="contactName" className="flex items-center gap-2 mb-2">
                                            <User className="h-4 w-4 text-gray-500" />
                                            {t('app.page.yetkili_ad_soyad')}</Label>
                                        <Input
                                            id="contactName"
                                            name="contactName"
                                            required
                                            value={formData.contactName}
                                            onChange={handleInputChange}
                                            placeholder={t('app.page.ahmet_y_lmaz')}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                                                <Mail className="h-4 w-4 text-gray-500" />
                                                {t('app.page.e_posta')}</Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                placeholder="ornek@sirket.com"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="phone" className="flex items-center gap-2 mb-2">
                                                <Phone className="h-4 w-4 text-gray-500" />
                                                {t('app.page.telefon')}</Label>
                                            <Input
                                                id="phone"
                                                name="phone"
                                                type="tel"
                                                required
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                placeholder={t('app.page.0532_xxx_xx_xx')}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="message" className="flex items-center gap-2 mb-2">
                                            <MessageSquare className="h-4 w-4 text-gray-500" />
                                            {t('app.page.mesajiniz_opsiyonel')}</Label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleInputChange}
                                            placeholder={t('app.page.sponsorluk_hakkinda_sorularini')}
                                            rows={3}
                                            className="w-full px-3 py-2 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
                                        <p>{t('app.page.basvurunuz_bize_ula_tiktan_son')}</p>
                                    </div>

                                    {submitError && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                                            {submitError}
                                        </div>
                                    )}

                                    <div className="flex gap-3 pt-2">
                                        <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1" disabled={submitting}>
                                            {t('app.page.iptal')}</Button>
                                        <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={submitting}>
                                            {submitting ? 'Gönderiliyor...' : 'Başvuru Gönder'}
                                        </Button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <div className="p-8 text-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{t('app.page.basvurunuz_alindi')}</h3>
                                <p className="text-gray-600 mb-6">
                                    {t('app.page.tesekkurler_ekibimiz_en_kisa_s')}{formData.email} {t('app.page.adresinden_sizinle_iletisime_g')}</p>
                                <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700">
                                    {t('app.page.tamam')}</Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
