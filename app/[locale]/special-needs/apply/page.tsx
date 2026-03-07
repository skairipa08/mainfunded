'use client';

import { useState, useRef } from 'react';
import { useTranslation } from '@/lib/i18n/context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { validateEmail, sanitizeInput } from '@/lib/validation';
import { toast } from 'sonner';
import {
    Heart, User, Mail, Globe, DollarSign, FileText, Upload, CheckCircle,
    AlertCircle, Loader2, X, Shield, ArrowRight, ArrowLeft, MapPin, UserCircle, Tag,
    Accessibility, FileCheck, ClipboardList,
} from 'lucide-react';
import { COUNTRIES, TURKEY_CITIES } from '@/lib/constants';

type DocStatus = 'ready' | 'uploading' | 'uploaded' | 'failed';
interface DocumentItem {
    id: string; name: string; file: File; status: DocStatus; size: number; uploadedUrl?: string;
}

const STEPS = [
    { id: 1, label: 'Kişisel Bilgiler', icon: User },
    { id: 2, label: 'Engel Bilgileri', icon: Accessibility },
    { id: 3, label: 'İhtiyaç Detayı', icon: ClipboardList },
    { id: 4, label: 'Belgeler', icon: Upload },
];

const DISABILITY_TYPES = [
    { value: 'physical', labelTr: 'Fiziksel Engel', label: 'Physical Disability' },
    { value: 'visual', labelTr: 'Görme Engeli', label: 'Visual Impairment' },
    { value: 'hearing', labelTr: 'İşitme Engeli', label: 'Hearing Impairment' },
    { value: 'autism', labelTr: 'Otizm Spektrum Bozukluğu', label: 'Autism Spectrum' },
    { value: 'intellectual', labelTr: 'Zihinsel Engel', label: 'Intellectual Disability' },
    { value: 'learning', labelTr: 'Öğrenme Güçlüğü (Disleksi vb.)', label: 'Learning Difficulty' },
    { value: 'speech', labelTr: 'Konuşma/Dil Bozukluğu', label: 'Speech/Language Disorder' },
    { value: 'cerebral_palsy', labelTr: 'Serebral Palsi', label: 'Cerebral Palsy' },
    { value: 'chronic', labelTr: 'Kronik Hastalık', label: 'Chronic Illness' },
    { value: 'multiple', labelTr: 'Çoklu Engel', label: 'Multiple Disabilities' },
    { value: 'other', labelTr: 'Diğer', label: 'Other' },
];

const RELATIONSHIP_OPTIONS = [
    { value: 'self', labelTr: 'Kendim', label: 'Self' },
    { value: 'parent', labelTr: 'Anne/Baba', label: 'Parent' },
    { value: 'guardian', labelTr: 'Vasi/Veli', label: 'Guardian' },
    { value: 'sibling', labelTr: 'Kardeş', label: 'Sibling' },
    { value: 'caregiver', labelTr: 'Bakıcı', label: 'Caregiver' },
    { value: 'other', labelTr: 'Diğer', label: 'Other' },
];

const FieldWrapper = ({
    id, label, icon: Icon, error, children, required = true,
}: {
    id: string; label: string; icon: any; error?: string; children: React.ReactNode; required?: boolean;
}) => (
    <div className="space-y-2">
        <Label htmlFor={id} className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Icon className="h-4 w-4 text-slate-400" />
            {label}
            {required && <span className="text-red-400">*</span>}
        </Label>
        {children}
        {error && (
            <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />{error}
            </p>
        )}
    </div>
);

const inputClass = (hasError: boolean) =>
    `h-12 rounded-xl border-slate-200 bg-white focus:border-purple-400 focus:ring-purple-400/20 focus:ring-4 transition-all duration-200 text-slate-800 placeholder:text-slate-300 ${hasError ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}`;
const selectTriggerClass = (hasError: boolean) =>
    `h-12 rounded-xl border-slate-200 bg-white focus:border-purple-400 focus:ring-purple-400/20 focus:ring-4 transition-all duration-200 ${hasError ? 'border-red-400' : ''}`;

export default function SpecialNeedsApplyPage() {
    const router = useRouter();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [currentStep, setCurrentStep] = useState(1);

    const [formData, setFormData] = useState({
        applicantName: '', applicantEmail: '', applicantPhone: '', relationship: '',
        country: '', city: '',
        childName: '', childAge: '', childGender: '',
        disabilityType: '', disabilityDetail: '', disabilityPercent: '',
        currentTherapy: '', neededSupport: '',
        needSummary: '', targetAmount: '', campaignTitle: '',
    });

    const [documents, setDocuments] = useState<DocumentItem[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = useState(false);

    const updateField = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
        if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
    };

    const validateCurrentStep = (): boolean => {
        const e: Record<string, string> = {};
        if (currentStep === 1) {
            if (!formData.applicantName.trim()) e.applicantName = 'İsim zorunludur';
            if (!formData.applicantEmail.trim()) e.applicantEmail = 'E-posta zorunludur';
            else if (!validateEmail(formData.applicantEmail)) e.applicantEmail = 'Geçersiz e-posta';
            if (!formData.relationship) e.relationship = 'Yakınlık durumu seçiniz';
            if (!formData.country) e.country = 'Ülke seçiniz';
            if (!formData.childName.trim()) e.childName = 'Çocuğun adı zorunludur';
            if (!formData.childAge.trim()) e.childAge = 'Yaş zorunludur';
        }
        if (currentStep === 2) {
            if (!formData.disabilityType) e.disabilityType = 'Engel türü seçiniz';
            if (!formData.disabilityDetail.trim()) e.disabilityDetail = 'Engel açıklaması zorunludur';
            if (!formData.neededSupport.trim()) e.neededSupport = 'İhtiyaç duyulan destek zorunludur';
        }
        if (currentStep === 3) {
            if (!formData.needSummary.trim()) e.needSummary = 'Kampanya açıklaması zorunludur';
            else if (formData.needSummary.trim().length < 100) e.needSummary = `En az 100 karakter gerekli (${100 - formData.needSummary.trim().length} kaldı)`;
            if (!formData.targetAmount) e.targetAmount = 'Hedef tutar zorunludur';
            else if (parseInt(formData.targetAmount) < (formData.country === 'TR' ? 2500 : 50)) e.targetAmount = formData.country === 'TR' ? 'Minimum 2.500 TL' : 'Minimum $50';
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const nextStep = () => { if (validateCurrentStep()) { setCurrentStep(s => Math.min(s + 1, 4)); window.scrollTo({ top: 0, behavior: 'smooth' }); } };
    const prevStep = () => { setCurrentStep(s => Math.max(s - 1, 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); };

    const processFile = async (file: File) => {
        const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
        if (!allowed.includes(file.type)) { toast.error('Sadece PDF, JPEG veya PNG yükleyebilirsiniz.'); return; }
        if (file.size > 10 * 1024 * 1024) { toast.error('Dosya boyutu max 10 MB olabilir.'); return; }
        const newDoc: DocumentItem = { id: Math.random().toString(36).substring(7), name: file.name, file, size: file.size, status: 'ready' };
        setDocuments(prev => [...prev, newDoc]);
        // Upload
        try {
            setDocuments(prev => prev.map(d => d.id === newDoc.id ? { ...d, status: 'uploading' } : d));
            const fd = new FormData(); fd.append('file', file); fd.append('type', 'document');
            const res = await fetch('/api/upload', { method: 'POST', body: fd });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.error || 'Yükleme başarısız');
            setDocuments(prev => prev.map(d => d.id === newDoc.id ? { ...d, status: 'uploaded', uploadedUrl: json.data.url } : d));
            toast.success('Belge yüklendi');
        } catch {
            setDocuments(prev => prev.map(d => d.id === newDoc.id ? { ...d, status: 'failed' } : d));
            toast.error('Belge yüklenemedi');
        }
    };

    const handleSubmit = async () => {
        if (loading || submitted) return;
        // Validate all steps
        for (let step = 1; step <= 3; step++) {
            setCurrentStep(step);
            const e: Record<string, string> = {};
            // Quick validation
            if (step === 1 && (!formData.applicantName.trim() || !formData.applicantEmail.trim() || !formData.relationship || !formData.country || !formData.childName.trim() || !formData.childAge.trim())) {
                toast.error('Lütfen tüm zorunlu alanları doldurun.'); return;
            }
            if (step === 2 && (!formData.disabilityType || !formData.disabilityDetail.trim() || !formData.neededSupport.trim())) {
                toast.error('Engel bilgilerini doldurun.'); return;
            }
            if (step === 3 && (!formData.needSummary.trim() || formData.needSummary.trim().length < 100 || !formData.targetAmount)) {
                toast.error('Kampanya detaylarını doldurun.'); return;
            }
        }
        setCurrentStep(4);

        const pendingDocs = documents.some(d => d.status === 'uploading');
        if (pendingDocs) { toast.warning('Belgeler yükleniyor, lütfen bekleyin.'); return; }

        setLoading(true);
        setSubmitted(true);
        try {
            const documentData = documents.filter(d => d.status === 'uploaded' && d.uploadedUrl).map(d => ({ name: d.name, url: d.uploadedUrl! }));
            const response = await fetch('/api/ops/applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'special-needs',
                    fullName: sanitizeInput(formData.childName),
                    email: formData.applicantEmail.trim().toLowerCase(),
                    country: formData.country,
                    city: formData.city || undefined,
                    gender: formData.childGender || undefined,
                    needSummary: sanitizeInput(formData.needSummary),
                    documents: documentData,
                    targetAmount: parseInt(formData.targetAmount) || 0,
                    campaignTitle: sanitizeInput(formData.campaignTitle || ''),
                    category: 'special-needs',
                    // Special needs specific fields
                    applicantName: sanitizeInput(formData.applicantName),
                    applicantPhone: formData.applicantPhone || undefined,
                    relationship: formData.relationship,
                    childAge: formData.childAge,
                    disabilityType: formData.disabilityType,
                    disabilityDetail: sanitizeInput(formData.disabilityDetail),
                    disabilityPercent: formData.disabilityPercent || undefined,
                    currentTherapy: sanitizeInput(formData.currentTherapy || ''),
                    neededSupport: sanitizeInput(formData.neededSupport),
                }),
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.error || 'Başvuru gönderilemedi');
            toast.success('Başvurunuz başarıyla alındı! En kısa sürede incelenecektir.');
            setTimeout(() => router.push('/special-needs'), 1500);
        } catch (error: any) {
            toast.error(error.message || 'Bir hata oluştu');
            setSubmitted(false);
        } finally {
            setLoading(false);
        }
    };

    const GENDER_OPTIONS = [
        { value: 'female', label: 'Kız' },
        { value: 'male', label: 'Erkek' },
        { value: 'other', label: 'Diğer' },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar />
            <main className="flex-grow">

                {/* Hero */}
                <section className="relative overflow-hidden bg-gradient-to-br from-purple-700 via-pink-700 to-purple-900">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute -top-24 -right-24 w-[500px] h-[500px] bg-white/5 rounded-full blur-[80px]" />
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-[80px]" />
                    </div>
                    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
                        <div className="max-w-3xl mx-auto text-center">
                            <Link href="/special-needs" className="inline-flex items-center gap-2 text-white/60 hover:text-white/90 transition-colors mb-6 text-sm">
                                <ArrowLeft className="h-4 w-4" /> Kampanyaya Dön
                            </Link>
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2 mb-6">
                                <Heart className="h-4 w-4 text-pink-300" />
                                <span className="text-sm text-white/90 font-medium">Özel Gereksinimli Çocuklar İçin Kampanya Başvurusu</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                                Çocuğunuz İçin<br />
                                <span className="bg-gradient-to-r from-pink-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">Destek Kampanyası Başlatın</span>
                            </h1>
                            <p className="text-base sm:text-lg text-purple-100/80 leading-relaxed max-w-xl mx-auto">
                                Başvurunuzu tamamlayın, ekibimiz inceledikten sonra kampanyanız yayına alınacaktır.
                            </p>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0">
                        <svg viewBox="0 0 1440 60" fill="none" className="w-full">
                            <path d="M0 60L60 52C120 44 240 28 360 24C480 20 600 28 720 32C840 36 960 36 1080 32C1200 28 1320 20 1380 16L1440 12V60H0Z" fill="#f8fafc" />
                        </svg>
                    </div>
                </section>

                {/* Form Section */}
                <section className="py-10 sm:py-14">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                        {/* Step Indicator */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-8">
                            <div className="flex items-center justify-between">
                                {STEPS.map((step, i) => {
                                    const Icon = step.icon;
                                    const isActive = currentStep === step.id;
                                    const isCompleted = currentStep > step.id;
                                    return (
                                        <div key={step.id} className="flex items-center flex-1">
                                            <button type="button" onClick={() => { if (step.id < currentStep) setCurrentStep(step.id); }}
                                                className={`flex items-center gap-2.5 transition-all duration-300 ${isActive ? 'text-purple-600' : isCompleted ? 'text-purple-500 cursor-pointer' : 'text-slate-300'}`}>
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isActive ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' : isCompleted ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-400'}`}>
                                                    {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                                                </div>
                                                <span className="text-sm font-medium hidden sm:block">{step.label}</span>
                                            </button>
                                            {i < STEPS.length - 1 && (
                                                <div className="flex-1 mx-3">
                                                    <div className={`h-[2px] rounded-full transition-colors duration-300 ${isCompleted ? 'bg-purple-300' : 'bg-slate-100'}`} />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Form Card */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

                            {/* STEP 1 — Personal Info */}
                            {currentStep === 1 && (
                                <div className="p-6 sm:p-8 space-y-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                                            <User className="h-5 w-5 text-purple-500" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900">Başvuran ve Çocuk Bilgileri</h2>
                                            <p className="text-sm text-slate-400">Başvuranın ve çocuğun temel bilgileri</p>
                                        </div>
                                    </div>

                                    <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 text-sm text-purple-800">
                                        💜 Bu formu çocuğun kendisi, velisi veya vasisi doldurabilir.
                                    </div>

                                    <h3 className="font-semibold text-slate-800 border-b pb-2">Başvuran Kişi</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <FieldWrapper id="applicantName" label="Başvuranın Adı Soyadı" icon={User} error={errors.applicantName}>
                                            <Input id="applicantName" value={formData.applicantName} onChange={e => updateField('applicantName', e.target.value)} placeholder="Adınız Soyadınız" className={inputClass(!!errors.applicantName)} />
                                        </FieldWrapper>
                                        <FieldWrapper id="applicantEmail" label="E-posta" icon={Mail} error={errors.applicantEmail}>
                                            <Input id="applicantEmail" type="email" value={formData.applicantEmail} onChange={e => updateField('applicantEmail', e.target.value)} placeholder="ornek@email.com" className={inputClass(!!errors.applicantEmail)} />
                                        </FieldWrapper>
                                        <FieldWrapper id="applicantPhone" label="Telefon" icon={User} error={errors.applicantPhone} required={false}>
                                            <Input id="applicantPhone" type="tel" value={formData.applicantPhone} onChange={e => updateField('applicantPhone', e.target.value)} placeholder="+90 5xx xxx xx xx" className={inputClass(false)} />
                                        </FieldWrapper>
                                        <FieldWrapper id="relationship" label="Çocukla Yakınlığınız" icon={Heart} error={errors.relationship}>
                                            <Select value={formData.relationship} onValueChange={v => updateField('relationship', v)}>
                                                <SelectTrigger id="relationship" className={selectTriggerClass(!!errors.relationship)}><SelectValue placeholder="Seçiniz" /></SelectTrigger>
                                                <SelectContent>
                                                    {RELATIONSHIP_OPTIONS.map(r => <SelectItem key={r.value} value={r.value}>{r.labelTr}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </FieldWrapper>
                                    </div>

                                    <h3 className="font-semibold text-slate-800 border-b pb-2 mt-6">Çocuk Bilgileri</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <FieldWrapper id="childName" label="Çocuğun Adı Soyadı" icon={User} error={errors.childName}>
                                            <Input id="childName" value={formData.childName} onChange={e => updateField('childName', e.target.value)} placeholder="Çocuğun adı" className={inputClass(!!errors.childName)} />
                                        </FieldWrapper>
                                        <FieldWrapper id="childAge" label="Yaşı" icon={User} error={errors.childAge}>
                                            <Input id="childAge" type="number" min="0" max="25" value={formData.childAge} onChange={e => updateField('childAge', e.target.value)} placeholder="Yaş" className={inputClass(!!errors.childAge)} />
                                        </FieldWrapper>
                                        <FieldWrapper id="childGender" label="Cinsiyeti" icon={UserCircle} error={errors.childGender} required={false}>
                                            <Select value={formData.childGender} onValueChange={v => updateField('childGender', v)}>
                                                <SelectTrigger id="childGender" className={selectTriggerClass(false)}><SelectValue placeholder="Seçiniz" /></SelectTrigger>
                                                <SelectContent>
                                                    {GENDER_OPTIONS.map(g => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </FieldWrapper>
                                        <FieldWrapper id="country" label="Ülke" icon={Globe} error={errors.country}>
                                            <Select value={formData.country} onValueChange={v => { updateField('country', v); setFormData(prev => ({ ...prev, city: '' })); }}>
                                                <SelectTrigger id="country" className={selectTriggerClass(!!errors.country)}><SelectValue placeholder="Ülke seçiniz" /></SelectTrigger>
                                                <SelectContent>
                                                    {COUNTRIES.map(c => <SelectItem key={c.value} value={c.value}>{c.flag} {c.labelTr}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </FieldWrapper>
                                        {formData.country === 'TR' && (
                                            <FieldWrapper id="city" label="Şehir" icon={MapPin} error={errors.city} required={false}>
                                                <Select value={formData.city} onValueChange={v => updateField('city', v)}>
                                                    <SelectTrigger id="city" className={selectTriggerClass(false)}><SelectValue placeholder="Şehir seçiniz" /></SelectTrigger>
                                                    <SelectContent>
                                                        {TURKEY_CITIES.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </FieldWrapper>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* STEP 2 — Disability Info */}
                            {currentStep === 2 && (
                                <div className="p-6 sm:p-8 space-y-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center">
                                            <Accessibility className="h-5 w-5 text-pink-500" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900">Engel Bilgileri</h2>
                                            <p className="text-sm text-slate-400">Çocuğun engel durumu ve mevcut tedavileri</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <FieldWrapper id="disabilityType" label="Engel Türü" icon={Tag} error={errors.disabilityType}>
                                            <Select value={formData.disabilityType} onValueChange={v => updateField('disabilityType', v)}>
                                                <SelectTrigger id="disabilityType" className={selectTriggerClass(!!errors.disabilityType)}><SelectValue placeholder="Engel türü seçiniz" /></SelectTrigger>
                                                <SelectContent>
                                                    {DISABILITY_TYPES.map(d => <SelectItem key={d.value} value={d.value}>{d.labelTr}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </FieldWrapper>
                                        <FieldWrapper id="disabilityPercent" label="Engel Oranı (%)" icon={Tag} error={errors.disabilityPercent} required={false}>
                                            <Input id="disabilityPercent" type="number" min="0" max="100" value={formData.disabilityPercent} onChange={e => updateField('disabilityPercent', e.target.value)} placeholder="Örn: 40" className={inputClass(false)} />
                                        </FieldWrapper>
                                    </div>

                                    <FieldWrapper id="disabilityDetail" label="Engel Durumunu Açıklayınız" icon={FileText} error={errors.disabilityDetail}>
                                        <Textarea id="disabilityDetail" value={formData.disabilityDetail} onChange={e => updateField('disabilityDetail', e.target.value)}
                                            placeholder="Çocuğun engel durumunu, tanı geçmişini ve günlük yaşamına etkisini açıklayınız..." rows={4}
                                            className={`rounded-xl border-slate-200 bg-white focus:border-purple-400 focus:ring-purple-400/20 focus:ring-4 ${errors.disabilityDetail ? 'border-red-400' : ''}`} />
                                    </FieldWrapper>

                                    <FieldWrapper id="currentTherapy" label="Mevcut Tedavi/Terapi (varsa)" icon={Heart} error={errors.currentTherapy} required={false}>
                                        <Textarea id="currentTherapy" value={formData.currentTherapy} onChange={e => updateField('currentTherapy', e.target.value)}
                                            placeholder="Şu an aldığı tedavi, terapi veya eğitim desteğini yazınız..." rows={3}
                                            className="rounded-xl border-slate-200 bg-white focus:border-purple-400 focus:ring-purple-400/20 focus:ring-4" />
                                    </FieldWrapper>

                                    <FieldWrapper id="neededSupport" label="İhtiyaç Duyulan Destek" icon={ClipboardList} error={errors.neededSupport}>
                                        <Textarea id="neededSupport" value={formData.neededSupport} onChange={e => updateField('neededSupport', e.target.value)}
                                            placeholder="Çocuğun en çok ihtiyaç duyduğu destek türünü yazınız (terapi, cihaz, eğitim materyali, ulaşım vb.)..." rows={3}
                                            className={`rounded-xl border-slate-200 bg-white focus:border-purple-400 focus:ring-purple-400/20 focus:ring-4 ${errors.neededSupport ? 'border-red-400' : ''}`} />
                                    </FieldWrapper>
                                </div>
                            )}

                            {/* STEP 3 — Campaign Details */}
                            {currentStep === 3 && (
                                <div className="p-6 sm:p-8 space-y-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                            <ClipboardList className="h-5 w-5 text-indigo-500" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900">Kampanya Detayları</h2>
                                            <p className="text-sm text-slate-400">Kampanyanızın başlığı, açıklaması ve hedef tutarı</p>
                                        </div>
                                    </div>

                                    <FieldWrapper id="campaignTitle" label="Kampanya Başlığı" icon={FileText} error={errors.campaignTitle} required={false}>
                                        <Input id="campaignTitle" value={formData.campaignTitle} onChange={e => updateField('campaignTitle', e.target.value)}
                                            placeholder="Örn: Yusuf'un İşitme Cihazı İçin Destek" className={inputClass(false)} />
                                    </FieldWrapper>

                                    <FieldWrapper id="needSummary" label="Kampanya Açıklaması" icon={FileText} error={errors.needSummary}>
                                        <Textarea id="needSummary" value={formData.needSummary} onChange={e => updateField('needSummary', e.target.value)}
                                            placeholder="Çocuğun hikayesini, ihtiyacını ve bu kampanyanın neden önemli olduğunu detaylı anlatınız (en az 100 karakter)..." rows={6}
                                            className={`rounded-xl border-slate-200 bg-white focus:border-purple-400 focus:ring-purple-400/20 focus:ring-4 ${errors.needSummary ? 'border-red-400' : ''}`} />
                                        <p className={`text-xs ${formData.needSummary.trim().length >= 100 ? 'text-green-500' : 'text-slate-400'}`}>
                                            {formData.needSummary.trim().length} / 100 karakter
                                        </p>
                                    </FieldWrapper>

                                    <FieldWrapper id="targetAmount" label={`Hedef Tutar (${formData.country === 'TR' ? '₺' : '$'})`} icon={DollarSign} error={errors.targetAmount}>
                                        <Input id="targetAmount" type="number" value={formData.targetAmount} onChange={e => updateField('targetAmount', e.target.value)}
                                            placeholder={formData.country === 'TR' ? 'Örn: 50000' : 'Örn: 2000'} className={inputClass(!!errors.targetAmount)} />
                                    </FieldWrapper>
                                </div>
                            )}

                            {/* STEP 4 — Documents */}
                            {currentStep === 4 && (
                                <div className="p-6 sm:p-8 space-y-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                                            <Upload className="h-5 w-5 text-amber-500" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900">Belgeler ve Kanıtlar</h2>
                                            <p className="text-sm text-slate-400">Engelli raporu, sağlık raporu, kimlik kartı vb.</p>
                                        </div>
                                    </div>

                                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
                                        📋 Aşağıdaki belgeleri yüklemeniz başvurunuzun hızla değerlendirilmesini sağlar:
                                        <ul className="mt-2 space-y-1 ml-4 list-disc">
                                            <li>Engelli sağlık kurulu raporu</li>
                                            <li>Engelli kimlik kartı</li>
                                            <li>Hastane veya terapi raporu</li>
                                            <li>Nüfus cüzdanı / kimlik fotokopisi</li>
                                        </ul>
                                    </div>

                                    {/* File Upload */}
                                    <div
                                        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer ${dragOver ? 'border-purple-400 bg-purple-50' : 'border-slate-200 hover:border-purple-300'}`}
                                        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                        onDragLeave={() => setDragOver(false)}
                                        onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) processFile(f); }}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                                        <p className="text-sm text-slate-600 font-medium">Belge yüklemek için tıklayın veya sürükleyin</p>
                                        <p className="text-xs text-slate-400 mt-1">PDF, JPEG, PNG — Maks. 10 MB</p>
                                        <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); e.target.value = ''; }} />
                                    </div>

                                    {/* Document List */}
                                    {documents.length > 0 && (
                                        <div className="space-y-2">
                                            {documents.map(doc => (
                                                <div key={doc.id} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                                                    <FileCheck className={`h-5 w-5 ${doc.status === 'uploaded' ? 'text-green-500' : doc.status === 'failed' ? 'text-red-500' : 'text-slate-400'}`} />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-slate-700 truncate">{doc.name}</p>
                                                        <p className="text-xs text-slate-400">{(doc.size / 1024).toFixed(0)} KB — {doc.status === 'uploaded' ? '✅ Yüklendi' : doc.status === 'uploading' ? '⏳ Yükleniyor...' : doc.status === 'failed' ? '❌ Başarısız' : '⏳ Hazır'}</p>
                                                    </div>
                                                    <button onClick={() => setDocuments(prev => prev.filter(d => d.id !== doc.id))} className="text-slate-400 hover:text-red-500">
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="p-6 sm:p-8 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                                {currentStep > 1 ? (
                                    <Button variant="outline" onClick={prevStep} className="gap-2 rounded-xl">
                                        <ArrowLeft className="h-4 w-4" /> Geri
                                    </Button>
                                ) : <div />}

                                {currentStep < 4 ? (
                                    <Button onClick={nextStep} className="bg-purple-600 hover:bg-purple-700 text-white gap-2 rounded-xl px-8 h-12">
                                        Devam Et <ArrowRight className="h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button onClick={handleSubmit} disabled={loading || submitted}
                                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white gap-2 rounded-xl px-8 h-12 shadow-lg shadow-purple-500/20">
                                        {loading ? (
                                            <><Loader2 className="h-5 w-5 animate-spin" /> Gönderiliyor...</>
                                        ) : submitted ? (
                                            <><CheckCircle className="h-5 w-5" /> Gönderildi!</>
                                        ) : (
                                            <><Heart className="h-5 w-5" /> Başvuruyu Gönder</>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Info sidebar */}
                        <div className="mt-8 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-7">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Shield className="h-4 w-4 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-purple-900 mb-1">Gizlilik Garantisi</p>
                                    <p className="text-sm text-purple-700/70 leading-relaxed">
                                        Tüm kişisel bilgiler ve engel raporları gizli tutulur. Belgeleriniz yalnızca ekibimiz tarafından değerlendirilir ve üçüncü şahıslarla paylaşılmaz.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
