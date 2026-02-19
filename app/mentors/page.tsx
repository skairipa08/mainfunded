'use client';

import React, { useState, useMemo } from 'react';
import {
    Search, Filter, X, Users, Star, Award, TrendingUp,
    Sparkles, HelpCircle, ChevronRight, MessageSquare,
    Target, Handshake, Rocket, ChevronDown,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MobileHeader from '@/components/MobileHeader';
import {
    MentorCard,
    MentorDetailSheet,
    BookingModal,
    MentorApplicationModal,
    mockMentors,
    type MentorProfile,
} from '@/components/MentorConnect';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const categories = [
    { label: '🔵 Yazılım', value: 'Yazılım' },
    { label: '🟢 Finans', value: 'Finans' },
    { label: '🟣 Pazarlama', value: 'Pazarlama' },
    { label: '🟡 Ürün Yönetimi', value: 'Ürün Yönetimi' },
    { label: '🔴 Kariyer Koçluğu', value: 'Kariyer Koçluğu' },
];

const sectors = ['Tümü', 'Yazılım', 'Finans', 'Pazarlama', 'Ürün Yönetimi', 'Kariyer Koçluğu'];
const experienceLevels = ['Tümü', '1-5 yıl', '6-10 yıl', '10+ yıl'];
const ratingOptions = ['Tümü', '4.0+', '4.5+', '4.8+'];

const testimonials = [
    { id: 't1', name: 'Emre Koç', before: 'Jr. Developer', after: 'Sr. Developer @ Google', quote: 'Ali Bey\'in mentorluk desteği olmasa bu kadar hızlı ilerleyemezdim. Sistem tasarımı ve mülakat stratejileri konusunda inanılmaz rehberlik aldım.', mentor: 'Ali Yılmaz', photo: null },
    { id: 't2', name: 'Selin Tekin', before: 'Stajyer', after: 'Investment Analyst @ Goldman Sachs', quote: 'Zeynep Hanım ile çalışmak kariyerimde dönüm noktası oldu. Finans dünyasının kapıları mentorluk sayesinde aralandı.', mentor: 'Zeynep Kara', photo: null },
    { id: 't3', name: 'Burak Arslan', before: 'Yazılım Mühendisi', after: 'Product Manager @ Spotify', quote: 'Sektör geçişi yapabilmek cesaret istiyordu. Doğru mentorun rehberliğinde bu geçişi başarıyla tamamladım.', mentor: 'Mehmet Demir', photo: null },
];

const howItWorks = [
    { icon: Search, title: 'Mentor Keşfet', desc: 'Uzmanlık alanına göre filtrele ve incele', color: 'from-blue-500 to-blue-600' },
    { icon: Target, title: 'Başvurunu Yap', desc: 'Hedeflerini belirt ve randevu talep et', color: 'from-emerald-500 to-emerald-600' },
    { icon: Handshake, title: 'Eşleş ve Görüş', desc: 'Onaylanan tarihte görüntülü görüşme yap', color: 'from-blue-500 to-emerald-500' },
    { icon: Rocket, title: 'Gelişimi Takip Et', desc: 'Aksiyonları uygula ve geri bildirim al', color: 'from-purple-500 to-blue-500' },
];

export default function MentorsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSector, setSelectedSector] = useState('Tümü');
    const [selectedExp, setSelectedExp] = useState('Tümü');
    const [selectedRating, setSelectedRating] = useState('Tümü');
    const [availableOnly, setAvailableOnly] = useState(false);
    const [showCount, setShowCount] = useState(6);

    const [detailMentor, setDetailMentor] = useState<MentorProfile | null>(null);
    const [bookingMentor, setBookingMentor] = useState<MentorProfile | null>(null);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const filteredMentors = useMemo(() => {
        return mockMentors.filter(m => {
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                if (!m.name.toLowerCase().includes(q) && !m.company.toLowerCase().includes(q) && !m.skills.some(s => s.toLowerCase().includes(q))) return false;
            }
            if (selectedSector !== 'Tümü' && m.sector !== selectedSector) return false;
            if (selectedExp !== 'Tümü') {
                if (selectedExp === '1-5 yıl' && m.experienceYears > 5) return false;
                if (selectedExp === '6-10 yıl' && (m.experienceYears < 6 || m.experienceYears > 10)) return false;
                if (selectedExp === '10+ yıl' && m.experienceYears < 10) return false;
            }
            if (selectedRating !== 'Tümü') {
                const minRating = parseFloat(selectedRating);
                if (m.rating < minRating) return false;
            }
            if (availableOnly && m.availability !== 'available') return false;
            return true;
        });
    }, [searchQuery, selectedSector, selectedExp, selectedRating, availableOnly]);

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedSector('Tümü');
        setSelectedExp('Tümü');
        setSelectedRating('Tümü');
        setAvailableOnly(false);
    };

    const hasActiveFilters = searchQuery || selectedSector !== 'Tümü' || selectedExp !== 'Tümü' || selectedRating !== 'Tümü' || availableOnly;

    return (
        <div className="min-h-screen bg-slate-50">
            <MobileHeader transparent backHref="/" />

            {/* ─── HERO ─── */}
            <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-emerald-500 text-white -mt-14 pt-14">
                {/* Animated mesh pattern */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-600/20" />

                <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-3xl mx-auto">
                        <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm mb-6 text-sm px-4 py-1.5">
                            <Sparkles className="w-4 h-4 mr-1.5" /> FundEd Mentor Programı
                        </Badge>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                            Kariyerinizi Uzmanlarla<br />
                            <span className="text-emerald-300">Şekillendirin</span>
                        </h1>
                        <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                            FundEd Mentor Programı ile deneyimli profesyonellerden birebir rehberlik alın
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 rounded-xl px-8 h-14 text-base font-semibold shadow-lg shadow-blue-900/20" onClick={() => document.getElementById('mentors-grid')?.scrollIntoView({ behavior: 'smooth' })}>
                                <Search className="w-5 h-5 mr-2" /> Mentor Bul
                            </Button>
                            <Button size="lg" variant="outline" className="border-2 border-white/50 text-white hover:bg-white/10 rounded-xl px-8 h-14 text-base font-semibold backdrop-blur-sm bg-transparent" onClick={() => setShowApplyModal(true)}>
                                <Award className="w-5 h-5 mr-2" /> Mentor Ol
                            </Button>
                        </div>
                    </motion.div>

                    {/* Stats */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="flex flex-wrap justify-center gap-8 md:gap-16 mt-14 text-center">
                        {[
                            { icon: Users, num: '500+', label: 'Aktif Mentor' },
                            { icon: Handshake, num: '10,000+', label: 'Başarılı Eşleşme' },
                            { icon: Star, num: '4.8/5', label: 'Ortalama Puan' },
                        ].map((s, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                                    <s.icon className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                    <p className="text-2xl font-bold">{s.num}</p>
                                    <p className="text-sm text-blue-200">{s.label}</p>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ─── FILTER BAR ─── */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    {/* Main row */}
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="İsim, şirket veya uzmanlık ara..." className="pl-10 rounded-xl border-slate-200 h-10" />
                        </div>

                        {/* Desktop filters */}
                        <div className="hidden md:flex items-center gap-2">
                            <select value={selectedSector} onChange={e => setSelectedSector(e.target.value)} className="h-10 rounded-xl border border-slate-200 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                                {sectors.map(s => <option key={s}>{s}</option>)}
                            </select>
                            <select value={selectedExp} onChange={e => setSelectedExp(e.target.value)} className="h-10 rounded-xl border border-slate-200 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                                <option value="Tümü">Deneyim</option>
                                {experienceLevels.slice(1).map(l => <option key={l}>{l}</option>)}
                            </select>
                            <select value={selectedRating} onChange={e => setSelectedRating(e.target.value)} className="h-10 rounded-xl border border-slate-200 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                                <option value="Tümü">Rating</option>
                                {ratingOptions.slice(1).map(r => <option key={r}>{r}</option>)}
                            </select>

                            {/* Availability toggle */}
                            <button onClick={() => setAvailableOnly(!availableOnly)} className={cn("flex items-center gap-2 h-10 px-4 rounded-xl border text-sm transition-all", availableOnly ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-white border-slate-200 text-slate-600 hover:border-emerald-300")}>
                                <span className={cn("w-3 h-3 rounded-full transition-colors", availableOnly ? "bg-emerald-500" : "bg-slate-300")} />
                                Müsait
                            </button>

                            {hasActiveFilters && (
                                <button onClick={clearFilters} className="text-sm text-slate-500 hover:text-blue-600 underline underline-offset-2">Temizle</button>
                            )}
                        </div>

                        {/* Mobile filter toggle */}
                        <Button variant="outline" size="sm" className="md:hidden rounded-xl" onClick={() => setShowMobileFilters(!showMobileFilters)}>
                            <Filter className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Mobile filters */}
                    <AnimatePresence>
                        {showMobileFilters && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden overflow-hidden">
                                <div className="pt-3 flex flex-col gap-2">
                                    <select value={selectedSector} onChange={e => setSelectedSector(e.target.value)} className="h-10 rounded-xl border border-slate-200 px-3 text-sm bg-white">{sectors.map(s => <option key={s}>{s}</option>)}</select>
                                    <select value={selectedExp} onChange={e => setSelectedExp(e.target.value)} className="h-10 rounded-xl border border-slate-200 px-3 text-sm bg-white"><option value="Tümü">Deneyim</option>{experienceLevels.slice(1).map(l => <option key={l}>{l}</option>)}</select>
                                    <button onClick={() => setAvailableOnly(!availableOnly)} className={cn("flex items-center gap-2 h-10 px-4 rounded-xl border text-sm", availableOnly ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "border-slate-200")}>
                                        <span className={cn("w-3 h-3 rounded-full", availableOnly ? "bg-emerald-500" : "bg-slate-300")} /> Sadece Müsait
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Category pills */}
                    <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
                        {categories.map(c => (
                            <button key={c.value} onClick={() => setSelectedSector(selectedSector === c.value ? 'Tümü' : c.value)} className={cn("whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium border transition-all flex-shrink-0", selectedSector === c.value ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300")}>
                                {c.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ─── MENTORS GRID ─── */}
            <section id="mentors-grid" className="container mx-auto px-4 py-10">
                <div className="flex items-center justify-between mb-6">
                    <p className="text-sm text-slate-500">{filteredMentors.length} mentor bulundu</p>
                </div>

                {filteredMentors.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-700 mb-2">Sonuç bulunamadı</h3>
                        <p className="text-slate-500 mb-4">Farklı filtreler deneyebilir veya aramayı genişletebilirsiniz</p>
                        <Button variant="outline" className="rounded-xl" onClick={clearFilters}>Filtreleri Temizle</Button>
                    </motion.div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <AnimatePresence mode="popLayout">
                                {filteredMentors.slice(0, showCount).map(m => (
                                    <MentorCard key={m.id} mentor={m} onViewProfile={setDetailMentor} onBook={setBookingMentor} />
                                ))}
                            </AnimatePresence>
                        </div>
                        {filteredMentors.length > showCount && (
                            <div className="text-center mt-10">
                                <Button variant="outline" size="lg" className="rounded-xl px-8" onClick={() => setShowCount(s => s + 6)}>
                                    <ChevronDown className="w-4 h-4 mr-2" /> Daha Fazla Göster
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </section>

            {/* ─── HOW IT WORKS ─── */}
            <section className="container mx-auto px-4 py-16">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Nasıl Çalışır?</h2>
                    <p className="text-slate-500 max-w-xl mx-auto">Dört basit adımda mentorunuzla tanışın ve kariyerinizi şekillendirin</p>
                </motion.div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
                    {/* Connecting line (desktop) */}
                    <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-blue-200 via-emerald-200 to-blue-200" />
                    {howItWorks.map((step, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="text-center relative">
                            <div className={cn("w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg relative z-10", step.color)}>
                                <step.icon className="w-7 h-7" />
                            </div>
                            <h3 className="font-bold text-slate-900 mb-1">{step.title}</h3>
                            <p className="text-sm text-slate-500">{step.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ─── SUCCESS STORIES ─── */}
            <section className="bg-white py-16">
                <div className="container mx-auto px-4">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Mentorluk ile Kariyer Değiştirenler</h2>
                        <p className="text-slate-500">FundEd mentorları ile başarıya ulaşan öğrenciler</p>
                    </motion.div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {testimonials.map((t, i) => (
                            <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                                {/* Before → After */}
                                <div className="flex items-center gap-2 mb-4">
                                    <Badge className="bg-slate-200 text-slate-600 text-xs">{t.before}</Badge>
                                    <ChevronRight className="w-4 h-4 text-emerald-500" />
                                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">{t.after}</Badge>
                                </div>
                                {/* Quote */}
                                <div className="relative mb-4">
                                    <span className="text-5xl text-blue-100 font-serif absolute -top-2 -left-1">&ldquo;</span>
                                    <p className="text-sm text-slate-600 leading-relaxed pl-6">{t.quote}</p>
                                </div>
                                {/* Author */}
                                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                                        {t.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm text-slate-800">{t.name}</p>
                                        <p className="text-xs text-slate-400">Teşekkür: <span className="text-blue-600">{t.mentor}</span></p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── CTA SECTION ─── */}
            <section className="container mx-auto px-4 py-16">
                <div className="bg-gradient-to-br from-blue-600 to-emerald-500 rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Deneyimlerinizi Paylaşmak İster misiniz?</h2>
                        <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">Mentor olarak topluluğumuza katılın ve gelecek nesillere ilham verin</p>
                        <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 rounded-xl px-8 h-14 text-base font-semibold" onClick={() => setShowApplyModal(true)}>
                            <Award className="w-5 h-5 mr-2" /> Mentor Olarak Başvur
                        </Button>
                    </div>
                </div>
            </section>

            {/* ─── Floating Help ─── */}
            <button className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-600/30 flex items-center justify-center hover:bg-blue-700 transition-colors z-30" onClick={() => { /* chat */ }}>
                <HelpCircle className="w-6 h-6" />
            </button>

            {/* ─── Modals ─── */}
            <MentorDetailSheet mentor={detailMentor} open={!!detailMentor} onClose={() => setDetailMentor(null)} onBook={(m) => { setDetailMentor(null); setBookingMentor(m); }} />
            <BookingModal mentor={bookingMentor} open={!!bookingMentor} onClose={() => setBookingMentor(null)} />
            <MentorApplicationModal open={showApplyModal} onClose={() => setShowApplyModal(false)} />
        </div>
    );
}
