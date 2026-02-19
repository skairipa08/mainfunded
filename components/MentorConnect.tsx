'use client';

import React, { useState } from 'react';
import {
    Users, Star, Briefcase, Calendar, CheckCircle2, Clock,
    ChevronRight, X, Send, MapPin, Award, TrendingUp,
    MessageSquare, Video, Coffee, FileText, Upload,
    Search, Filter, SlidersHorizontal, ChevronLeft, ChevronDown,
    Quote, Sparkles, HelpCircle, ExternalLink, Linkedin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

/* ─── Data Model ─── */
export interface MentorReview {
    id: string;
    name: string;
    text: string;
    rating: number;
    date: string;
}

export interface MentorProfile {
    id: string;
    name: string;
    title: string;
    company: string;
    industry: string;
    sector: string;
    experience: string;
    experienceYears: number;
    skills: string[];
    linkedIn?: string;
    availability: 'available' | 'busy' | 'unavailable';
    rating: number;
    reviewCount: number;
    menteeCount: number;
    avatar?: string;
    bio: string;
    hourlyRate: number | null; // null = free
    verified: boolean;
    online: boolean;
    sessionType: 'online' | 'hybrid' | 'in-person';
    reviews: MentorReview[];
}

/* ─── Mentor Card ─── */
interface MentorCardProps {
    mentor: MentorProfile;
    onViewProfile: (mentor: MentorProfile) => void;
    onBook: (mentor: MentorProfile) => void;
}

export function MentorCard({ mentor, onViewProfile, onBook }: MentorCardProps) {
    const initials = mentor.name.split(' ').map(n => n[0]).join('');

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            whileHover={{ y: -6 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-slate-100 overflow-hidden group"
        >
            {/* Header */}
            <div className="p-5 pb-3">
                <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-emerald-400 flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {mentor.avatar ? (
                                <img src={mentor.avatar} alt={mentor.name} className="w-full h-full rounded-full object-cover" />
                            ) : initials}
                        </div>
                        {mentor.online && (
                            <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full" />
                        )}
                        {mentor.verified && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-3 h-3 text-white" />
                            </span>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-bold text-slate-900 truncate">{mentor.name}</h3>
                            {mentor.availability === 'available' ? (
                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">Müsait</Badge>
                            ) : mentor.availability === 'busy' ? (
                                <Badge className="bg-orange-50 text-orange-600 border-orange-200 text-xs">Meşgul</Badge>
                            ) : (
                                <Badge className="bg-slate-100 text-slate-500 text-xs">Müsait Değil</Badge>
                            )}
                        </div>
                        <p className="text-sm text-slate-600 truncate">{mentor.title}</p>
                        <p className="text-xs text-slate-400">{mentor.company}</p>
                    </div>
                </div>
            </div>

            {/* Rating & Price */}
            <div className="px-5 flex items-center justify-between">
                <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} className={cn("w-3.5 h-3.5", i < Math.floor(mentor.rating) ? "text-yellow-400 fill-yellow-400" : "text-slate-200")} />
                    ))}
                    <span className="text-sm font-semibold text-slate-700 ml-1">{mentor.rating.toFixed(1)}</span>
                    <span className="text-xs text-slate-400">({mentor.reviewCount})</span>
                </div>
                {mentor.hourlyRate ? (
                    <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-semibold">₺{mentor.hourlyRate}/saat</Badge>
                ) : (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold">Ücretsiz</Badge>
                )}
            </div>

            {/* Skills */}
            <div className="px-5 pt-3 flex flex-wrap gap-1.5">
                {mentor.skills.slice(0, 4).map(skill => (
                    <span key={skill} className="bg-slate-100 text-slate-700 text-xs px-3 py-1 rounded-full">{skill}</span>
                ))}
                {mentor.skills.length > 4 && (
                    <span className="bg-slate-50 text-slate-400 text-xs px-3 py-1 rounded-full">+{mentor.skills.length - 4}</span>
                )}
            </div>

            {/* Stats */}
            <div className="px-5 pt-3 flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{mentor.menteeCount}+ Mentee</span>
                <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{mentor.experience}</span>
            </div>

            {/* Actions */}
            <div className="p-5 pt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50" onClick={() => onViewProfile(mentor)}>
                    Profili İncele
                </Button>
                <Button size="sm" className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white" onClick={() => onBook(mentor)} disabled={mentor.availability === 'unavailable'}>
                    Randevu Talep Et
                </Button>
            </div>
        </motion.div>
    );
}

/* ─── Mentor Detail Sheet ─── */
interface MentorDetailSheetProps {
    mentor: MentorProfile | null;
    open: boolean;
    onClose: () => void;
    onBook: (mentor: MentorProfile) => void;
}

export function MentorDetailSheet({ mentor, open, onClose, onBook }: MentorDetailSheetProps) {
    if (!mentor) return null;
    const initials = mentor.name.split(' ').map(n => n[0]).join('');
    const skillLevels: Record<string, number> = {};
    mentor.skills.forEach((s, i) => { skillLevels[s] = Math.max(60, 95 - i * 8); });

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" onClick={onClose} />
                    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="fixed right-0 top-0 h-full w-full max-w-lg bg-white z-50 shadow-2xl overflow-y-auto">
                        {/* Cover */}
                        <div className="h-40 bg-gradient-to-br from-blue-600 to-emerald-500 relative">
                            <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/30">
                                <X className="w-4 h-4" />
                            </button>
                            <div className="absolute -bottom-10 left-6">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-400 flex items-center justify-center text-white font-bold text-2xl border-4 border-white shadow-lg">
                                    {mentor.avatar ? <img src={mentor.avatar} alt="" className="w-full h-full rounded-2xl object-cover" /> : initials}
                                </div>
                            </div>
                        </div>

                        {/* Profile Info */}
                        <div className="pt-14 px-6 pb-6">
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="text-2xl font-bold text-slate-900">{mentor.name}</h2>
                                {mentor.verified && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
                            </div>
                            <p className="text-slate-600">{mentor.title} @ {mentor.company}</p>
                            <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
                                <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />{mentor.rating.toFixed(1)} ({mentor.reviewCount} değerlendirme)</span>
                                <span className="flex items-center gap-1"><Users className="w-4 h-4" />{mentor.menteeCount} mentee</span>
                            </div>
                            {mentor.hourlyRate ? (
                                <Badge className="mt-3 bg-blue-50 text-blue-700 border-blue-200 text-sm">₺{mentor.hourlyRate}/saat</Badge>
                            ) : (
                                <Badge className="mt-3 bg-emerald-50 text-emerald-700 border-emerald-200 text-sm">Ücretsiz</Badge>
                            )}

                            {/* Bio */}
                            <div className="mt-6">
                                <h3 className="font-semibold text-slate-900 mb-2">Hakkında</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">{mentor.bio}</p>
                            </div>

                            {/* Skills with bars */}
                            <div className="mt-6">
                                <h3 className="font-semibold text-slate-900 mb-3">Uzmanlık Alanları</h3>
                                <div className="space-y-2.5">
                                    {mentor.skills.map(skill => (
                                        <div key={skill}>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-slate-700">{skill}</span>
                                                <span className="text-slate-400">{skillLevels[skill]}%</span>
                                            </div>
                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${skillLevels[skill]}%` }} transition={{ duration: 0.8, delay: 0.2 }} className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Reviews */}
                            {mentor.reviews.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="font-semibold text-slate-900 mb-3">Değerlendirmeler</h3>
                                    <div className="space-y-3">
                                        {mentor.reviews.map(r => (
                                            <div key={r.id} className="bg-slate-50 rounded-xl p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-medium text-sm text-slate-800">{r.name}</span>
                                                    <div className="flex items-center gap-0.5">
                                                        {[...Array(5)].map((_, i) => <Star key={i} className={cn("w-3 h-3", i < r.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-200")} />)}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-slate-600">{r.text}</p>
                                                <p className="text-xs text-slate-400 mt-1">{r.date}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {mentor.linkedIn && (
                                <a href={mentor.linkedIn} target="_blank" rel="noopener noreferrer" className="mt-4 flex items-center gap-2 text-sm text-blue-600 hover:underline">
                                    <Linkedin className="w-4 h-4" /> LinkedIn Profili
                                </a>
                            )}
                        </div>

                        {/* Sticky CTA */}
                        <div className="sticky bottom-0 bg-white border-t p-4">
                            <Button className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white h-12 text-base" onClick={() => onBook(mentor)} disabled={mentor.availability === 'unavailable'}>
                                Şimdi Başvur
                            </Button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

/* ─── Booking Modal ─── */
interface BookingModalProps {
    mentor: MentorProfile | null;
    open: boolean;
    onClose: () => void;
}

const topics = [
    'Kariyer danışmanlığı',
    'Teknik mülakat hazırlığı',
    'CV & Portfolyo inceleme',
    'Sektör geçişi rehberliği',
    'Liderlik & yönetim',
    'Startup danışmanlığı',
];

const durations = [
    { label: '30 dk', value: 30 },
    { label: '45 dk', value: 45 },
    { label: '1 saat', value: 60 },
];

export function BookingModal({ mentor, open, onClose }: BookingModalProps) {
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedDuration, setSelectedDuration] = useState(30);
    const [selectedTopic, setSelectedTopic] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!mentor) return null;

    const slots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
    const price = mentor.hourlyRate ? Math.round(mentor.hourlyRate * (selectedDuration / 60)) : 0;

    const handleSubmit = async () => {
        setSubmitting(true);
        await new Promise(r => setTimeout(r, 1500));
        setSubmitting(false);
        toast.success('Randevu talebiniz gönderildi! Mentor onayı bekleniyor.');
        onClose();
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={onClose} />
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-lg md:w-full bg-white rounded-2xl z-50 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-slate-900">Randevu Talep Et</h2>
                                <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200"><X className="w-4 h-4" /></button>
                            </div>

                            {/* Mentor summary */}
                            <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-emerald-400 flex items-center justify-center text-white font-bold text-sm">
                                    {mentor.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">{mentor.name}</p>
                                    <p className="text-xs text-slate-500">{mentor.title}</p>
                                </div>
                            </div>

                            {/* Duration */}
                            <div className="mb-5">
                                <label className="text-sm font-medium text-slate-700 mb-2 block">Süre</label>
                                <div className="flex gap-2">
                                    {durations.map(d => (
                                        <button key={d.value} onClick={() => setSelectedDuration(d.value)} className={cn("flex-1 py-2 rounded-xl text-sm font-medium border transition-all", selectedDuration === d.value ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300")}>
                                            {d.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Time Slots */}
                            <div className="mb-5">
                                <label className="text-sm font-medium text-slate-700 mb-2 block">Uygun Saat</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {slots.map(s => (
                                        <button key={s} onClick={() => setSelectedDate(s)} className={cn("py-2 rounded-xl text-sm border transition-all", selectedDate === s ? "bg-emerald-500 text-white border-emerald-500" : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300")}>
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Topic */}
                            <div className="mb-5">
                                <label className="text-sm font-medium text-slate-700 mb-2 block">Konu</label>
                                <select value={selectedTopic} onChange={e => setSelectedTopic(e.target.value)} className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">Konu seçin...</option>
                                    {topics.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>

                            {/* Message */}
                            <div className="mb-5">
                                <label className="text-sm font-medium text-slate-700 mb-2 block">Mesajınız</label>
                                <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Bu görüşmeden ne bekliyorsunuz?" rows={3} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>

                            {/* Summary */}
                            <div className="bg-slate-50 rounded-xl p-4 mb-6 space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-slate-500">Süre</span><span className="font-medium">{selectedDuration} dakika</span></div>
                                {selectedDate && <div className="flex justify-between"><span className="text-slate-500">Saat</span><span className="font-medium">{selectedDate}</span></div>}
                                <div className="flex justify-between border-t pt-2"><span className="text-slate-700 font-semibold">Toplam</span><span className="font-bold text-blue-600">{price > 0 ? `₺${price}` : 'Ücretsiz'}</span></div>
                            </div>

                            <Button className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white h-12" onClick={handleSubmit} disabled={submitting || !selectedDate || !selectedTopic}>
                                {submitting ? 'Gönderiliyor...' : 'Talep Gönder'}
                            </Button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

/* ─── Mentor Application Modal ─── */
interface MentorAppModalProps { open: boolean; onClose: () => void; }

const expertiseAreas = ['Yazılım Geliştirme', 'Veri Bilimi', 'Ürün Yönetimi', 'Finans', 'Pazarlama', 'İnsan Kaynakları', 'Tasarım (UX/UI)', 'Girişimcilik', 'Kariyer Koçluğu', 'Liderlik'];

export function MentorApplicationModal({ open, onClose }: MentorAppModalProps) {
    const [step, setStep] = useState(1);
    const totalSteps = 5;
    const [form, setForm] = useState({
        firstName: '', lastName: '', email: '', linkedIn: '',
        role: '', company: '', yearsExp: 5, expertise: [] as string[],
        hourlyRate: 500, weeklyHours: 3, sessionType: 'online',
        motivation: '', cv: null as File | null,
    });
    const [submitting, setSubmitting] = useState(false);

    const updateForm = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));
    const toggleExpertise = (area: string) => {
        setForm(prev => ({
            ...prev,
            expertise: prev.expertise.includes(area) ? prev.expertise.filter(a => a !== area) : [...prev.expertise, area],
        }));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        await new Promise(r => setTimeout(r, 2000));
        setSubmitting(false);
        toast.success('Mentor başvurunuz alındı! 48 saat içinde incelenecektir.');
        onClose();
        setStep(1);
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={onClose} />
                    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }} className="fixed inset-2 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-xl md:w-full bg-white rounded-2xl z-50 shadow-2xl overflow-y-auto max-h-[90vh] flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Mentor Başvurusu</h2>
                                <p className="text-sm text-slate-500">Adım {step} / {totalSteps}</p>
                            </div>
                            <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200"><X className="w-4 h-4" /></button>
                        </div>

                        {/* Progress */}
                        <div className="px-6 pt-4">
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div animate={{ width: `${(step / totalSteps) * 100}%` }} className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full" />
                            </div>
                        </div>

                        {/* Steps */}
                        <div className="p-6 flex-1 overflow-y-auto">
                            {step === 1 && (
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-slate-800">Kişisel Bilgiler</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div><label className="text-xs font-medium text-slate-600 mb-1 block">Ad</label><Input value={form.firstName} onChange={e => updateForm('firstName', e.target.value)} placeholder="Adınız" className="rounded-xl" /></div>
                                        <div><label className="text-xs font-medium text-slate-600 mb-1 block">Soyad</label><Input value={form.lastName} onChange={e => updateForm('lastName', e.target.value)} placeholder="Soyadınız" className="rounded-xl" /></div>
                                    </div>
                                    <div><label className="text-xs font-medium text-slate-600 mb-1 block">E-posta</label><Input type="email" value={form.email} onChange={e => updateForm('email', e.target.value)} placeholder="email@example.com" className="rounded-xl" /></div>
                                    <div><label className="text-xs font-medium text-slate-600 mb-1 block">LinkedIn URL</label><Input value={form.linkedIn} onChange={e => updateForm('linkedIn', e.target.value)} placeholder="https://linkedin.com/in/..." className="rounded-xl" /></div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-slate-800">Profesyonel Bilgiler</h3>
                                    <div><label className="text-xs font-medium text-slate-600 mb-1 block">Mevcut Rol</label><Input value={form.role} onChange={e => updateForm('role', e.target.value)} placeholder="Örn: Senior Software Engineer" className="rounded-xl" /></div>
                                    <div><label className="text-xs font-medium text-slate-600 mb-1 block">Şirket</label><Input value={form.company} onChange={e => updateForm('company', e.target.value)} placeholder="Örn: Google" className="rounded-xl" /></div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-600 mb-1 block">Yıllık Deneyim: {form.yearsExp} yıl</label>
                                        <input type="range" min={1} max={30} value={form.yearsExp} onChange={e => updateForm('yearsExp', +e.target.value)} className="w-full accent-blue-600" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-600 mb-2 block">Uzmanlık Alanları</label>
                                        <div className="flex flex-wrap gap-2">
                                            {expertiseAreas.map(a => (
                                                <button key={a} onClick={() => toggleExpertise(a)} className={cn("px-3 py-1.5 rounded-full text-xs font-medium border transition-all", form.expertise.includes(a) ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300")}>
                                                    {a}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-slate-800">Mentorluk Detayları</h3>
                                    <div>
                                        <label className="text-xs font-medium text-slate-600 mb-1 block">Saatlik Ücret: {form.hourlyRate === 0 ? 'Ücretsiz' : `₺${form.hourlyRate}`}</label>
                                        <input type="range" min={0} max={2000} step={50} value={form.hourlyRate} onChange={e => updateForm('hourlyRate', +e.target.value)} className="w-full accent-blue-600" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-600 mb-1 block">Haftalık kaç saat ayırabilirsiniz: {form.weeklyHours} saat</label>
                                        <input type="range" min={1} max={20} value={form.weeklyHours} onChange={e => updateForm('weeklyHours', +e.target.value)} className="w-full accent-emerald-500" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-600 mb-2 block">Görüşme Tercihi</label>
                                        <div className="flex gap-2">
                                            {[{ v: 'online', l: 'Online', icon: Video }, { v: 'hybrid', l: 'Hibrit', icon: Coffee }, { v: 'in-person', l: 'Yüz Yüze', icon: MapPin }].map(o => (
                                                <button key={o.v} onClick={() => updateForm('sessionType', o.v)} className={cn("flex-1 py-3 rounded-xl text-sm font-medium border flex flex-col items-center gap-1 transition-all", form.sessionType === o.v ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300")}>
                                                    <o.icon className="w-4 h-4" />{o.l}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 4 && (
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-slate-800">Motivasyon & CV</h3>
                                    <div>
                                        <label className="text-xs font-medium text-slate-600 mb-1 block">Neden mentor olmak istiyorsunuz?</label>
                                        <textarea value={form.motivation} onChange={e => updateForm('motivation', e.target.value)} rows={5} placeholder="Deneyimlerinizi ve motivasyonunuzu paylaşın..." className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-600 mb-2 block">CV Yükle (Opsiyonel)</label>
                                        <label className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-blue-300 transition-colors">
                                            <Upload className="w-6 h-6 text-slate-400" />
                                            <span className="text-sm text-slate-500">{form.cv ? form.cv.name : 'PDF veya DOCX yükleyin'}</span>
                                            <input type="file" accept=".pdf,.docx" className="hidden" onChange={e => updateForm('cv', e.target.files?.[0] || null)} />
                                        </label>
                                    </div>
                                </div>
                            )}

                            {step === 5 && (
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-slate-800">Başvuru Özeti</h3>
                                    <div className="bg-slate-50 rounded-xl p-4 space-y-3 text-sm">
                                        <div className="flex justify-between"><span className="text-slate-500">Ad Soyad</span><span className="font-medium">{form.firstName} {form.lastName}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">E-posta</span><span className="font-medium">{form.email}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Rol</span><span className="font-medium">{form.role} @ {form.company}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Deneyim</span><span className="font-medium">{form.yearsExp} yıl</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Ücret</span><span className="font-medium">{form.hourlyRate === 0 ? 'Ücretsiz' : `₺${form.hourlyRate}/saat`}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Haftalık</span><span className="font-medium">{form.weeklyHours} saat</span></div>
                                        <div><span className="text-slate-500 block mb-1">Uzmanlık</span><div className="flex flex-wrap gap-1">{form.expertise.map(e => <Badge key={e} className="bg-blue-50 text-blue-700 text-xs">{e}</Badge>)}</div></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t flex gap-3">
                            {step > 1 && <Button variant="outline" className="rounded-xl" onClick={() => setStep(s => s - 1)}>Geri</Button>}
                            <Button className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white" onClick={() => step < totalSteps ? setStep(s => s + 1) : handleSubmit()} disabled={submitting}>
                                {step < totalSteps ? 'Devam Et' : submitting ? 'Gönderiliyor...' : 'Başvuruyu Gönder'}
                            </Button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

/* ─── Mock Data ─── */
export const mockMentors: MentorProfile[] = [
    { id: '1', name: 'Ali Yılmaz', title: 'Senior Software Engineer', company: 'Google', industry: 'Teknoloji', sector: 'Yazılım', experience: '10+ yıl', experienceYears: 12, skills: ['Python', 'Machine Learning', 'System Design', 'Career Growth', 'Algorithms'], linkedIn: 'https://linkedin.com/in/aliyilmaz', availability: 'available', rating: 4.9, reviewCount: 47, menteeCount: 15, bio: 'Google\'da 10 yılı aşkın deneyim. ML ve sistem tasarımı konularında uzman. Kariyerinizi bir üst seviyeye taşımanıza yardımcı oluyorum.', hourlyRate: 750, verified: true, online: true, sessionType: 'online', reviews: [{ id: 'r1', name: 'Emre K.', text: 'Ali Bey ile yaptığım görüşme kariyerimde dönüm noktası oldu.', rating: 5, date: '2 hafta önce' }, { id: 'r2', name: 'Selin T.', text: 'Çok detaylı ve yapıcı geri bildirimler aldım.', rating: 5, date: '1 ay önce' }] },
    { id: '2', name: 'Zeynep Kara', title: 'Investment Analyst', company: 'JP Morgan', industry: 'Finans', sector: 'Finans', experience: '8 yıl', experienceYears: 8, skills: ['Financial Modeling', 'Valuation', 'Excel', 'Interview Prep', 'DCF Analysis'], linkedIn: 'https://linkedin.com/in/zeynepkara', availability: 'busy', rating: 4.7, reviewCount: 32, menteeCount: 8, bio: 'JP Morgan\'da yatırım analisti olarak çalışıyorum. Finans sektörüne giriş ve mülakat hazırlığı konusunda rehberlik ediyorum.', hourlyRate: 600, verified: true, online: false, sessionType: 'hybrid', reviews: [{ id: 'r3', name: 'Burak A.', text: 'Finans mülakatlarına mükemmel hazırlık.', rating: 5, date: '3 hafta önce' }] },
    { id: '3', name: 'Mehmet Demir', title: 'Product Manager', company: 'Meta', industry: 'Teknoloji', sector: 'Ürün Yönetimi', experience: '6 yıl', experienceYears: 6, skills: ['Product Strategy', 'A/B Testing', 'User Research', 'Roadmapping', 'Agile'], availability: 'available', rating: 4.8, reviewCount: 28, menteeCount: 12, bio: 'Meta\'da ürün yöneticisi. Ürün yönetimi kariyerine geçiş ve büyüme stratejileri konusunda deneyimli.', hourlyRate: null, verified: true, online: true, sessionType: 'online', reviews: [{ id: 'r4', name: 'Ayşe D.', text: 'Ücretsiz mentorluk sunması inanılmaz. Çok değerli bilgiler paylaştı.', rating: 5, date: '1 hafta önce' }] },
    { id: '4', name: 'Elif Aydın', title: 'Marketing Director', company: 'Unilever', industry: 'FMCG', sector: 'Pazarlama', experience: '12 yıl', experienceYears: 12, skills: ['Brand Strategy', 'Digital Marketing', 'Campaign Management', 'Team Leadership', 'Analytics'], availability: 'available', rating: 4.6, reviewCount: 19, menteeCount: 6, bio: 'Unilever\'de pazarlama direktörü. Dijital pazarlama, marka yönetimi ve liderlik konularında mentorluk veriyorum.', hourlyRate: 500, verified: true, online: true, sessionType: 'online', reviews: [{ id: 'r5', name: 'Cansu M.', text: 'Pazarlama kariyerime yön verdi.', rating: 4, date: '2 ay önce' }] },
    { id: '5', name: 'Can Özkan', title: 'Tech Lead', company: 'Spotify', industry: 'Teknoloji', sector: 'Yazılım', experience: '9 yıl', experienceYears: 9, skills: ['React', 'Node.js', 'TypeScript', 'Microservices', 'Cloud Architecture'], linkedIn: 'https://linkedin.com/in/canozkan', availability: 'available', rating: 4.8, reviewCount: 35, menteeCount: 18, bio: 'Spotify\'da Tech Lead. Frontend & backend geliştirme, mimari tasarım ve teknik liderlik konularında uzman.', hourlyRate: 800, verified: true, online: true, sessionType: 'online', reviews: [{ id: 'r6', name: 'Deniz Y.', text: 'Teknik mülakata çok iyi hazırladı.', rating: 5, date: '1 hafta önce' }, { id: 'r7', name: 'Merve B.', text: 'Sistem tasarımı konusunda harika bilgiler', rating: 5, date: '3 hafta önce' }] },
    { id: '6', name: 'Derya Şahin', title: 'Career Coach', company: 'Bağımsız', industry: 'Danışmanlık', sector: 'Kariyer Koçluğu', experience: '15 yıl', experienceYears: 15, skills: ['Career Planning', 'Interview Skills', 'Personal Branding', 'Networking', 'Resume Writing'], availability: 'available', rating: 4.9, reviewCount: 52, menteeCount: 45, bio: '15 yıllık kariyer koçluğu deneyimi. Sektör değişikliği, mülakat hazırlığı ve kişisel marka oluşturma konularında uzman.', hourlyRate: 400, verified: true, online: true, sessionType: 'hybrid', reviews: [{ id: 'r8', name: 'Fatma K.', text: 'Sektör değişikliğimi mümkün kıldı.', rating: 5, date: '2 hafta önce' }] },
    { id: '7', name: 'Hakan Çelik', title: 'Data Scientist', company: 'Amazon', industry: 'Teknoloji', sector: 'Yazılım', experience: '7 yıl', experienceYears: 7, skills: ['Python', 'Deep Learning', 'NLP', 'MLOps', 'Statistics'], availability: 'busy', rating: 4.5, reviewCount: 14, menteeCount: 5, bio: 'Amazon\'da veri bilimci. Makine öğrenmesi, doğal dil işleme ve veri mühendisliği konularında rehberlik sağlıyorum.', hourlyRate: 650, verified: false, online: false, sessionType: 'online', reviews: [{ id: 'r9', name: 'İrem A.', text: 'NLP alanında çok bilgili ve yardımsever.', rating: 5, date: '1 ay önce' }] },
    { id: '8', name: 'Seda Yıldız', title: 'UX Design Lead', company: 'Microsoft', industry: 'Teknoloji', sector: 'Yazılım', experience: '8 yıl', experienceYears: 8, skills: ['UX Design', 'User Research', 'Figma', 'Design Systems', 'Prototyping'], linkedIn: 'https://linkedin.com/in/sedayildiz', availability: 'available', rating: 4.7, reviewCount: 22, menteeCount: 10, bio: 'Microsoft\'ta UX tasarım lideri. Kullanıcı deneyimi tasarımı ve araştırma konularında kapsamlı mentorluk veriyorum.', hourlyRate: null, verified: true, online: true, sessionType: 'online', reviews: [{ id: 'r10', name: 'Oğuz T.', text: 'Portfolyomu tamamen yeniden şekillendirmeme yardımcı oldu.', rating: 5, date: '1 hafta önce' }] },
];
