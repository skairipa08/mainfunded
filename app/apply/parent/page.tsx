'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { validateEmail, sanitizeInput } from '@/lib/validation';
import { toast } from 'sonner';
import { useTranslation } from '@/lib/i18n';
import {
    Users, User, Mail, Globe, Phone, FileText, Upload, CheckCircle, AlertCircle,
    Loader2, X, Shield, ArrowRight, ArrowLeft, HelpCircle, Heart, School,
    Building, MapPin, GraduationCap, Calendar, Hash, ImageIcon, Video, Baby, Tag,
} from 'lucide-react';
import { COUNTRIES, FUNDING_CATEGORIES, TURKEY_CITIES } from '@/lib/constants';

type DocStatus = 'ready' | 'uploading' | 'uploaded' | 'failed';
interface DocumentItem { id: string; name: string; file: File; status: DocStatus; size: number; uploadedUrl?: string; }
interface PhotoItem { id: string; name: string; file: File; preview: string; }
interface VideoItem { id: string; name: string; file: File; preview: string; size: number; }

const MIN_DESCRIPTION_LENGTH = 100;
const MAX_PHOTOS = 5;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

const STEPS = [
    { id: 1, label: 'Parent Info', icon: User },
    { id: 2, label: 'Child Info', icon: Baby },
    { id: 3, label: 'Verification', icon: Shield },
    { id: 4, label: 'Story & Media', icon: Heart },
    { id: 5, label: 'Review', icon: CheckCircle },
];

const FieldWrapper = ({ id, label, icon: Icon, error, children, required = true }: {
    id: string; label: string; icon: any; error?: string; children: React.ReactNode; required?: boolean;
}) => (
    <div className="space-y-2">
        <Label htmlFor={id} className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Icon className="h-4 w-4 text-slate-400" /> {label}
            {required && <span className="text-red-400">*</span>}
        </Label>
        {children}
        {error && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{error}</p>}
    </div>
);

const inputClass = (hasError: boolean) =>
    `h-12 rounded-xl border-slate-200 bg-white focus:border-purple-400 focus:ring-purple-400/20 focus:ring-4 transition-all duration-200 text-slate-800 placeholder:text-slate-300 ${hasError ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}`;

const selectTriggerClass = (hasError: boolean) =>
    `h-12 rounded-xl border-slate-200 bg-white focus:border-purple-400 focus:ring-purple-400/20 focus:ring-4 transition-all duration-200 ${hasError ? 'border-red-400' : ''}`;

export default function ParentApplyPage() {
    const router = useRouter();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [currentStep, setCurrentStep] = useState(1);

    const [formData, setFormData] = useState({
        parentFullName: '', parentEmail: '', parentPhone: '', parentCountry: '', parentCity: '', parentRelation: '',
        childFullName: '', childDob: '', childGender: '', schoolName: '', schoolCity: '',
        childGrade: '', childStudentId: '', category: '',
        story: '', targetAmount: '',
    });

    // Document states
    const [parentIdDocs, setParentIdDocs] = useState<DocumentItem[]>([]);
    const [childIdDocs, setChildIdDocs] = useState<DocumentItem[]>([]);
    const [reportCards, setReportCards] = useState<DocumentItem[]>([]);
    const [enrollmentDocs, setEnrollmentDocs] = useState<DocumentItem[]>([]);
    const parentIdRef = useRef<HTMLInputElement>(null);
    const childIdRef = useRef<HTMLInputElement>(null);
    const reportCardRef = useRef<HTMLInputElement>(null);
    const enrollmentRef = useRef<HTMLInputElement>(null);

    // Photo/video states
    const [photos, setPhotos] = useState<PhotoItem[]>([]);
    const [video, setVideo] = useState<VideoItem | null>(null);
    const photoInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const [photoDragOver, setPhotoDragOver] = useState(false);

    const calculateAge = (dob: string): number => {
        if (!dob) return 0;
        const birth = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        return age;
    };

    const childAge = calculateAge(formData.childDob);

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const validateCurrentStep = (): boolean => {
        const e: Record<string, string> = {};
        if (currentStep === 1) {
            if (!formData.parentFullName.trim()) e.parentFullName = t('applyParent.validation.parentFullName');
            if (!formData.parentEmail.trim()) e.parentEmail = t('applyParent.validation.email');
            else if (!validateEmail(formData.parentEmail)) e.parentEmail = t('applyParent.validation.invalidEmail');
            if (!formData.parentCountry) e.parentCountry = t('applyParent.validation.country');
            if (!formData.parentRelation) e.parentRelation = t('applyParent.validation.relation');
            if (parentIdDocs.length === 0) e.parentIdDoc = t('applyParent.validation.parentId');
        }
        if (currentStep === 2) {
            if (!formData.childFullName.trim()) e.childFullName = t('applyParent.validation.childName');
            if (!formData.childDob) e.childDob = t('applyParent.validation.childDob');
            else if (childAge >= 18) e.childDob = t('applyParent.validation.childAge');
            if (!formData.schoolName.trim()) e.schoolName = t('applyParent.validation.schoolName');
            if (!formData.schoolCity.trim()) e.schoolCity = t('applyParent.validation.schoolCity');
            if (!formData.childGrade.trim()) e.childGrade = t('applyParent.validation.grade');
        }
        if (currentStep === 3) {
            if (childIdDocs.length === 0) e.childIdDoc = t('applyParent.validation.childId');
            if (reportCards.length === 0) e.reportCard = t('applyParent.validation.reportCard');
        }
        if (currentStep === 4) {
            if (!formData.story.trim()) e.story = t('applyParent.validation.story');
            else if (formData.story.trim().length < MIN_DESCRIPTION_LENGTH) e.story = t('applyParent.validation.storyMin', { min: MIN_DESCRIPTION_LENGTH });
            const minTarget = formData.parentCountry === 'TR' ? 2500 : 50;
            if (!formData.targetAmount) {
                e.targetAmount = t('applyParent.validation.targetAmount');
            } else if (parseInt(formData.targetAmount) < minTarget) {
                e.targetAmount = formData.parentCountry === 'TR' ? 'Minimum 2500 TL' : 'Minimum 50 USD';
            }
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const nextStep = () => { if (validateCurrentStep()) { setCurrentStep(s => Math.min(s + 1, 5)); window.scrollTo({ top: 0, behavior: 'smooth' }); } };
    const prevStep = () => { setCurrentStep(s => Math.max(s - 1, 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); };

    /* ── Doc upload helpers ── */
    const processDocFile = async (file: File, setDocs: React.Dispatch<React.SetStateAction<DocumentItem[]>>) => {
        const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
        if (!allowed.includes(file.type)) { toast.error(t('apply.validation.fileType')); return; }
        if (file.size > 10 * 1024 * 1024) { toast.error(t('apply.validation.fileSize')); return; }
        const newDoc: DocumentItem = { id: Math.random().toString(36).substring(7), name: file.name, file, size: file.size, status: 'uploading' };
        setDocs(prev => [...prev, newDoc]);
        await new Promise(r => setTimeout(r, 1500));
        setDocs(prev => prev.map(d => d.id === newDoc.id ? { ...d, status: 'uploaded', uploadedUrl: `mock_${d.name}` } : d));
        toast.success(t('apply.documents.status.uploaded'));
    };

    const handleDocSelect = (e: React.ChangeEvent<HTMLInputElement>, setDocs: React.Dispatch<React.SetStateAction<DocumentItem[]>>) => {
        const file = e.target.files?.[0]; if (!file) return; e.target.value = ''; processDocFile(file, setDocs);
    };
    const removeDoc = (id: string, setDocs: React.Dispatch<React.SetStateAction<DocumentItem[]>>) => setDocs(prev => prev.filter(d => d.id !== id));

    /* ── Photo handlers ── */
    const processPhoto = (file: File) => {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { toast.error('Only JPG, PNG, WebP allowed'); return; }
        if (file.size > MAX_PHOTO_SIZE) { toast.error('Photo must be < 5 MB'); return; }
        if (photos.length >= MAX_PHOTOS) { toast.error(`Max ${MAX_PHOTOS} photos`); return; }
        setPhotos(prev => [...prev, { id: Math.random().toString(36).substring(7), name: file.name, file, preview: URL.createObjectURL(file) }]);
    };
    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => { const files = e.target.files; if (!files) return; Array.from(files).forEach(processPhoto); e.target.value = ''; };
    const handlePhotoDrop = (e: React.DragEvent) => { e.preventDefault(); setPhotoDragOver(false); const files = e.dataTransfer.files; if (files) Array.from(files).forEach(processPhoto); };
    const removePhoto = (id: string) => { setPhotos(prev => { const p = prev.find(x => x.id === id); if (p) URL.revokeObjectURL(p.preview); return prev.filter(x => x.id !== id); }); };

    /* ── Video handler ── */
    const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return; e.target.value = '';
        if (!['video/mp4', 'video/webm'].includes(file.type)) { toast.error('Only MP4, WebM allowed'); return; }
        if (file.size > MAX_VIDEO_SIZE) { toast.error('Video must be < 50 MB'); return; }
        if (video) URL.revokeObjectURL(video.preview);
        setVideo({ id: Math.random().toString(36).substring(7), name: file.name, file, preview: URL.createObjectURL(file), size: file.size });
    };
    const removeVideo = () => { if (video) { URL.revokeObjectURL(video.preview); setVideo(null); } };

    /* ── Submit ── */
    const handleSubmit = async () => {
        if (loading || submitted) return;
        setLoading(true); setSubmitted(true);
        try {
            const response = await fetch('/api/ops/applications', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'parent',
                    fullName: sanitizeInput(formData.parentFullName),
                    email: formData.parentEmail.trim().toLowerCase(),
                    phone: formData.parentPhone,
                    country: formData.parentCountry,
                    city: formData.parentCity || undefined,
                    category: formData.category || undefined,
                    parentRelation: formData.parentRelation,
                    childName: sanitizeInput(formData.childFullName),
                    childDob: formData.childDob,
                    childGender: formData.childGender,
                    childSchool: sanitizeInput(formData.schoolName),
                    childSchoolCity: sanitizeInput(formData.schoolCity),
                    childGrade: formData.childGrade,
                    childStudentId: formData.childStudentId,
                    needSummary: sanitizeInput(formData.story),
                    story: sanitizeInput(formData.story),
                    targetAmount: parseInt(formData.targetAmount) || 0,
                    documents: [
                        ...parentIdDocs.map(d => `parentId:${d.name}`),
                        ...childIdDocs.map(d => `childId:${d.name}`),
                        ...reportCards.map(d => `reportCard:${d.name}`),
                        ...enrollmentDocs.map(d => `enrollment:${d.name}`),
                    ],
                    photoCount: photos.length,
                    hasVideo: !!video,
                }),
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.error || t('applyParent.submitError'));
            toast.success(t('applyParent.submitSuccess'));
            setTimeout(() => router.push('/'), 1500);
        } catch (error: any) {
            toast.error(error.message || t('applyParent.submitError'));
            setSubmitted(false);
        } finally { setLoading(false); }
    };

    const storyLength = formData.story.trim().length;

    /* ── Doc list component ── */
    const DocList = ({ docs, setDocs }: { docs: DocumentItem[]; setDocs: React.Dispatch<React.SetStateAction<DocumentItem[]>> }) => (
        docs.length > 0 ? (
            <div className="space-y-2 mt-2">
                {docs.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                        <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-purple-500" />
                            <div><p className="text-sm font-medium text-slate-700">{doc.name}</p><p className="text-xs text-slate-400">{(doc.size / 1024).toFixed(1)} KB</p></div>
                        </div>
                        <div className="flex items-center gap-2">
                            {doc.status === 'uploading' && <Loader2 className="h-4 w-4 text-purple-500 animate-spin" />}
                            {doc.status === 'uploaded' && <CheckCircle className="h-4 w-4 text-green-500" />}
                            {doc.status === 'failed' && <AlertCircle className="h-4 w-4 text-red-500" />}
                            <button onClick={() => removeDoc(doc.id, setDocs)} className="text-slate-400 hover:text-red-500 transition-colors"><X className="h-4 w-4" /></button>
                        </div>
                    </div>
                ))}
            </div>
        ) : null
    );

    /* ── Upload Zone component ── */
    const UploadZone = ({ label, hint, inputRef, docs, setDocs, error }: {
        label: string; hint: string; inputRef: React.RefObject<HTMLInputElement>; docs: DocumentItem[];
        setDocs: React.Dispatch<React.SetStateAction<DocumentItem[]>>; error?: string;
    }) => (
        <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Upload className="h-4 w-4 text-slate-400" /> {label} <span className="text-red-400">*</span>
            </Label>
            <p className="text-xs text-slate-400">{hint}</p>
            <div className="border-2 border-dashed rounded-xl p-4 text-center border-slate-200 hover:border-purple-300 transition-colors cursor-pointer"
                onClick={() => inputRef.current?.click()}>
                <Upload className="h-6 w-6 text-slate-400 mx-auto mb-1" />
                <p className="text-sm text-slate-500">{t('applyParent.uploadClick')}</p>
                <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG • Max 10 MB</p>
                <input ref={inputRef as any} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleDocSelect(e, setDocs)} />
            </div>
            <DocList docs={docs} setDocs={setDocs} />
            {error && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{error}</p>}
        </div>
    );

    if (submitted && !loading) {
        return (
            <div className="min-h-screen flex flex-col bg-slate-50">
                <Navbar />
                <main className="flex-grow flex items-center justify-center py-20">
                    <div className="max-w-md mx-auto text-center bg-white rounded-3xl shadow-lg p-10">
                        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">{t('applyParent.successTitle')}</h2>
                        <p className="text-slate-500 mb-6">{t('applyParent.successDesc')}</p>
                        <Button onClick={() => router.push('/')} className="bg-purple-600 hover:bg-purple-700">{t('applyParent.backToHome')}</Button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar />
            <main className="flex-grow">
                {/* HERO */}
                <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-violet-600 to-purple-800">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute -top-24 -right-24 w-[500px] h-[500px] bg-white/5 rounded-full blur-[80px]" />
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-[80px]" />
                        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
                    </div>
                    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
                        <div className="max-w-3xl mx-auto text-center">
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2 mb-6">
                                <Users className="h-4 w-4 text-yellow-300" />
                                <span className="text-sm text-white/90 font-medium">{t('applyParent.badge')}</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                                {t('applyParent.heroTitle')}<br />
                                <span className="bg-gradient-to-r from-yellow-200 via-amber-200 to-orange-200 bg-clip-text text-transparent">
                                    {t('applyParent.heroHighlight')}
                                </span>
                            </h1>
                            <p className="text-base sm:text-lg text-purple-100/80 leading-relaxed max-w-xl mx-auto">{t('applyParent.heroDesc')}</p>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0">
                        <svg viewBox="0 0 1440 60" fill="none" className="w-full"><path d="M0 60L60 52C120 44 240 28 360 24C480 20 600 28 720 32C840 36 960 36 1080 32C1200 28 1320 20 1380 16L1440 12V60H0Z" fill="#f8fafc" /></svg>
                    </div>
                </section>

                {/* MAIN CONTENT */}
                <section className="py-10 sm:py-14">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                            {/* LEFT: Form */}
                            <div className="lg:w-[65%]">
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
                                                        className={`flex items-center gap-2 transition-all duration-300 ${isActive ? 'text-purple-600' : isCompleted ? 'text-purple-500 cursor-pointer' : 'text-slate-300'}`}>
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isActive ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' : isCompleted ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-400'}`}>
                                                            {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                                                        </div>
                                                        <span className="text-xs font-medium hidden lg:block">{t(`applyParent.steps.step${step.id}`)}</span>
                                                    </button>
                                                    {i < STEPS.length - 1 && <div className="flex-1 mx-2"><div className={`h-[2px] rounded-full transition-colors duration-300 ${isCompleted ? 'bg-purple-300' : 'bg-slate-100'}`} /></div>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Form Card */}
                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                    {/* STEP 1 - Parent Info */}
                                    {currentStep === 1 && (
                                        <div className="p-6 sm:p-8 space-y-6">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center"><User className="h-5 w-5 text-purple-500" /></div>
                                                <div><h2 className="text-xl font-bold text-slate-900">{t('applyParent.step1.title')}</h2><p className="text-sm text-slate-400">{t('applyParent.step1.subtitle')}</p></div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <FieldWrapper id="parentFullName" label={t('applyParent.labels.parentFullName')} icon={User} error={errors.parentFullName}>
                                                    <Input id="parentFullName" value={formData.parentFullName} onChange={e => updateField('parentFullName', e.target.value)} placeholder={t('applyParent.placeholders.parentFullName')} className={inputClass(!!errors.parentFullName)} />
                                                </FieldWrapper>
                                                <FieldWrapper id="parentEmail" label={t('applyParent.labels.email')} icon={Mail} error={errors.parentEmail}>
                                                    <Input id="parentEmail" type="email" value={formData.parentEmail} onChange={e => updateField('parentEmail', e.target.value)} placeholder={t('applyParent.placeholders.email')} className={inputClass(!!errors.parentEmail)} />
                                                </FieldWrapper>
                                                <FieldWrapper id="parentPhone" label={t('applyParent.labels.phone')} icon={Phone} error={errors.parentPhone} required={false}>
                                                    <Input id="parentPhone" type="tel" value={formData.parentPhone} onChange={e => updateField('parentPhone', e.target.value)} placeholder="+90 5XX XXX XX XX" className={inputClass(false)} />
                                                </FieldWrapper>
                                                <FieldWrapper id="parentCountry" label={t('applyParent.labels.country')} icon={Globe} error={errors.parentCountry}>
                                                    <Select value={formData.parentCountry} onValueChange={(v) => updateField('parentCountry', v)}>
                                                        <SelectTrigger id="parentCountry" className={selectTriggerClass(!!errors.parentCountry)}><SelectValue placeholder={t('applyParent.placeholders.country')} /></SelectTrigger>
                                                        <SelectContent>
                                                            {COUNTRIES.map((c, index) => (
                                                                <SelectItem key={c.value} value={c.value}>
                                                                    {c.flag} {c.labelTr}{index === 0 ? '' : ` / ${c.label}`}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FieldWrapper>
                                                {formData.parentCountry === 'TR' && (
                                                    <FieldWrapper id="parentCity" label="Şehir / City" icon={MapPin} error={errors.parentCity} required={false}>
                                                        <Select value={formData.parentCity} onValueChange={(v) => updateField('parentCity', v)}>
                                                            <SelectTrigger id="parentCity" className={selectTriggerClass(false)}><SelectValue placeholder="Şehir seçiniz..." /></SelectTrigger>
                                                            <SelectContent>
                                                                {TURKEY_CITIES.map((city) => (
                                                                    <SelectItem key={city} value={city}>{city}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </FieldWrapper>
                                                )}
                                                <div className="md:col-span-2">
                                                    <FieldWrapper id="parentRelation" label={t('applyParent.labels.relation')} icon={Users} error={errors.parentRelation}>
                                                        <Select value={formData.parentRelation} onValueChange={v => updateField('parentRelation', v)}>
                                                            <SelectTrigger id="parentRelation" className={selectTriggerClass(!!errors.parentRelation)}><SelectValue placeholder={t('applyParent.placeholders.selectRelation')} /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="mother">{t('applyParent.options.mother')}</SelectItem>
                                                                <SelectItem value="father">{t('applyParent.options.father')}</SelectItem>
                                                                <SelectItem value="guardian">{t('applyParent.options.guardian')}</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </FieldWrapper>
                                                </div>
                                            </div>
                                            <UploadZone label={t('applyParent.labels.parentId')} hint={t('applyParent.hints.parentId')} inputRef={parentIdRef} docs={parentIdDocs} setDocs={setParentIdDocs} error={errors.parentIdDoc} />
                                        </div>
                                    )}

                                    {/* STEP 2 - Child Info */}
                                    {currentStep === 2 && (
                                        <div className="p-6 sm:p-8 space-y-6">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center"><Baby className="h-5 w-5 text-pink-500" /></div>
                                                <div><h2 className="text-xl font-bold text-slate-900">{t('applyParent.step2.title')}</h2><p className="text-sm text-slate-400">{t('applyParent.step2.subtitle')}</p></div>
                                            </div>
                                            <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-4 flex items-start gap-3">
                                                <HelpCircle className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                                                <p className="text-sm text-purple-700">{t('applyParent.hints.childAgeNote')}</p>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <FieldWrapper id="childFullName" label={t('applyParent.labels.childName')} icon={User} error={errors.childFullName}>
                                                    <Input id="childFullName" value={formData.childFullName} onChange={e => updateField('childFullName', e.target.value)} placeholder={t('applyParent.placeholders.childName')} className={inputClass(!!errors.childFullName)} />
                                                </FieldWrapper>
                                                <FieldWrapper id="childDob" label={t('applyParent.labels.childDob')} icon={Calendar} error={errors.childDob}>
                                                    <Input id="childDob" type="date" value={formData.childDob} onChange={e => updateField('childDob', e.target.value)} className={inputClass(!!errors.childDob)} />
                                                    {formData.childDob && <p className="text-xs text-slate-500 mt-1">{t('applyParent.labels.age')}: {childAge}</p>}
                                                </FieldWrapper>
                                                <FieldWrapper id="childGender" label={t('applyParent.labels.gender')} icon={User} error={errors.childGender} required={false}>
                                                    <Select value={formData.childGender} onValueChange={v => updateField('childGender', v)}>
                                                        <SelectTrigger id="childGender" className={selectTriggerClass(false)}><SelectValue placeholder={t('applyParent.placeholders.selectGender')} /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="male">{t('applyParent.options.male')}</SelectItem>
                                                            <SelectItem value="female">{t('applyParent.options.female')}</SelectItem>
                                                            <SelectItem value="other">{t('applyParent.options.other')}</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FieldWrapper>
                                                <FieldWrapper id="childStudentId" label={t('applyParent.labels.studentId')} icon={Hash} error={errors.childStudentId} required={false}>
                                                    <Input id="childStudentId" value={formData.childStudentId} onChange={e => updateField('childStudentId', e.target.value)} placeholder={t('applyParent.placeholders.studentId')} className={inputClass(false)} />
                                                </FieldWrapper>
                                                <FieldWrapper id="schoolName" label={t('applyParent.labels.schoolName')} icon={School} error={errors.schoolName}>
                                                    <Input id="schoolName" value={formData.schoolName} onChange={e => updateField('schoolName', e.target.value)} placeholder={t('applyParent.placeholders.schoolName')} className={inputClass(!!errors.schoolName)} />
                                                </FieldWrapper>
                                                <FieldWrapper id="schoolCity" label={t('applyParent.labels.schoolCity')} icon={MapPin} error={errors.schoolCity}>
                                                    <Input id="schoolCity" value={formData.schoolCity} onChange={e => updateField('schoolCity', e.target.value)} placeholder={t('applyParent.placeholders.schoolCity')} className={inputClass(!!errors.schoolCity)} />
                                                </FieldWrapper>
                                                <div className="md:col-span-2">
                                                    <FieldWrapper id="childGrade" label={t('applyParent.labels.grade')} icon={GraduationCap} error={errors.childGrade}>
                                                        <Input id="childGrade" value={formData.childGrade} onChange={e => updateField('childGrade', e.target.value)} placeholder={t('applyParent.placeholders.grade')} className={inputClass(!!errors.childGrade)} />
                                                    </FieldWrapper>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 3 - Verification Documents */}
                                    {currentStep === 3 && (
                                        <div className="p-6 sm:p-8 space-y-6">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center"><Shield className="h-5 w-5 text-amber-500" /></div>
                                                <div><h2 className="text-xl font-bold text-slate-900">{t('applyParent.step3.title')}</h2><p className="text-sm text-slate-400">{t('applyParent.step3.subtitle')}</p></div>
                                            </div>
                                            <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 text-sm text-amber-700">
                                                <p className="font-medium mb-1">{t('applyParent.docTips.title')}</p>
                                                <ul className="list-disc list-inside space-y-1 text-amber-600">
                                                    <li>{t('applyParent.docTips.tip1')}</li>
                                                    <li>{t('applyParent.docTips.tip2')}</li>
                                                    <li>{t('applyParent.docTips.tip3')}</li>
                                                </ul>
                                            </div>
                                            <UploadZone label={t('applyParent.labels.childId')} hint={t('applyParent.hints.childId')} inputRef={childIdRef} docs={childIdDocs} setDocs={setChildIdDocs} error={errors.childIdDoc} />
                                            <UploadZone label={t('applyParent.labels.reportCard')} hint={t('applyParent.hints.reportCard')} inputRef={reportCardRef} docs={reportCards} setDocs={setReportCards} error={errors.reportCard} />
                                            <UploadZone label={t('applyParent.labels.enrollment')} hint={t('applyParent.hints.enrollment')} inputRef={enrollmentRef} docs={enrollmentDocs} setDocs={setEnrollmentDocs} />
                                        </div>
                                    )}

                                    {/* STEP 4 - Story & Media */}
                                    {currentStep === 4 && (
                                        <div className="p-6 sm:p-8 space-y-6">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center"><Heart className="h-5 w-5 text-rose-500" /></div>
                                                <div><h2 className="text-xl font-bold text-slate-900">{t('applyParent.step4.title')}</h2><p className="text-sm text-slate-400">{t('applyParent.step4.subtitle')}</p></div>
                                            </div>
                                            <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-4 flex items-start gap-3">
                                                <HelpCircle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
                                                <div className="text-sm text-rose-700 leading-relaxed">
                                                    <p className="font-medium mb-1">{t('applyParent.tips.title')}</p>
                                                    <ul className="list-disc list-inside space-y-1 text-rose-600">
                                                        <li>{t('applyParent.tips.tip1')}</li><li>{t('applyParent.tips.tip2')}</li><li>{t('applyParent.tips.tip3')}</li>
                                                    </ul>
                                                </div>
                                            </div>
                                            {/* Story */}
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <Label htmlFor="story" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                                        <FileText className="h-4 w-4 text-slate-400" />{t('applyParent.labels.story')}<span className="text-red-400">*</span>
                                                    </Label>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-1.5 w-20 rounded-full bg-slate-100 overflow-hidden">
                                                            <div className={`h-full rounded-full transition-all duration-300 ${storyLength >= MIN_DESCRIPTION_LENGTH ? 'bg-emerald-500' : 'bg-amber-400'}`}
                                                                style={{ width: `${Math.min(100, (storyLength / MIN_DESCRIPTION_LENGTH) * 100)}%` }} />
                                                        </div>
                                                        <span className={`text-xs font-medium ${storyLength < MIN_DESCRIPTION_LENGTH ? 'text-amber-500' : 'text-emerald-500'}`}>{storyLength}/{MIN_DESCRIPTION_LENGTH}</span>
                                                    </div>
                                                </div>
                                                <Textarea id="story" value={formData.story} onChange={e => updateField('story', e.target.value)} placeholder={t('applyParent.placeholders.story')} rows={8}
                                                    className={`rounded-xl border-slate-200 bg-white focus:border-purple-400 focus:ring-purple-400/20 focus:ring-4 transition-all duration-200 text-slate-800 placeholder:text-slate-300 resize-none ${errors.story ? 'border-red-400' : ''}`} />
                                                {errors.story && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.story}</p>}
                                            </div>
                                            {/* Category */}
                                            <FieldWrapper id="category" label="İhtiyaç Kategorisi / Need Category" icon={Tag} error={errors.category} required={false}>
                                                <Select value={formData.category} onValueChange={(v) => updateField('category', v)}>
                                                    <SelectTrigger id="category" className={selectTriggerClass(!!errors.category)}><SelectValue placeholder="Kategori seçiniz / Select category..." /></SelectTrigger>
                                                    <SelectContent>
                                                        {FUNDING_CATEGORIES.map((cat) => (
                                                            <SelectItem key={cat.value} value={cat.value}>{cat.labelTr} / {cat.label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FieldWrapper>
                                            {/* Target Amount */}
                                            <FieldWrapper id="targetAmount" label={t('applyParent.labels.targetAmount')} icon={Heart} error={errors.targetAmount}>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">$</span>
                                                    <Input id="targetAmount" type="number" min={1} value={formData.targetAmount} onChange={e => updateField('targetAmount', e.target.value)} placeholder={t('applyParent.placeholders.targetAmount')} className={`${inputClass(!!errors.targetAmount)} pl-8`} />
                                                </div>
                                            </FieldWrapper>
                                            {/* Photos */}
                                            <div className="space-y-3">
                                                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2"><ImageIcon className="h-4 w-4 text-slate-400" />{t('applyParent.labels.photos')}</Label>
                                                <div onDragOver={e => { e.preventDefault(); setPhotoDragOver(true); }} onDragLeave={() => setPhotoDragOver(false)} onDrop={handlePhotoDrop}
                                                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300 ${photoDragOver ? 'border-purple-400 bg-purple-50/50' : 'border-slate-200 hover:border-slate-300'}`}>
                                                    <ImageIcon className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                                                    <p className="text-sm text-slate-500 mb-2">{t('applyParent.photos.dropText')}</p>
                                                    <Button type="button" variant="outline" onClick={() => photoInputRef.current?.click()} className="rounded-xl text-sm">{t('applyParent.photos.selectBtn')}</Button>
                                                    <input ref={photoInputRef} type="file" className="hidden" accept="image/jpeg,image/png,image/webp" multiple onChange={handlePhotoSelect} />
                                                    <p className="text-xs text-slate-400 mt-2">JPG, PNG, WebP • Max 5 MB • {t('applyParent.photos.maxCount')}</p>
                                                </div>
                                                {photos.length > 0 && (
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                        {photos.map(photo => (
                                                            <div key={photo.id} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-[4/3]">
                                                                <img src={photo.preview} alt={photo.name} className="w-full h-full object-cover" />
                                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200" />
                                                                <button type="button" onClick={() => removePhoto(photo.id)} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500/80 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"><X className="h-4 w-4" /></button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            {/* Video */}
                                            <div className="space-y-3">
                                                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2"><Video className="h-4 w-4 text-slate-400" />{t('applyParent.labels.video')}</Label>
                                                {!video ? (
                                                    <div className="border-2 border-dashed rounded-xl p-4 text-center border-slate-200 hover:border-purple-300 transition-colors cursor-pointer" onClick={() => videoInputRef.current?.click()}>
                                                        <Video className="h-6 w-6 text-slate-400 mx-auto mb-1" />
                                                        <p className="text-sm text-slate-500">{t('applyParent.video.selectBtn')}</p>
                                                        <p className="text-xs text-slate-400 mt-1">MP4, WebM • Max 50 MB</p>
                                                        <input ref={videoInputRef} type="file" className="hidden" accept="video/mp4,video/webm" onChange={handleVideoSelect} />
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <Video className="h-5 w-5 text-purple-500" />
                                                            <div><p className="text-sm font-medium text-slate-700">{video.name}</p><p className="text-xs text-slate-400">{(video.size / 1024 / 1024).toFixed(1)} MB</p></div>
                                                        </div>
                                                        <button onClick={removeVideo} className="text-slate-400 hover:text-red-500 transition-colors"><X className="h-4 w-4" /></button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 5 - Review */}
                                    {currentStep === 5 && (
                                        <div className="p-6 sm:p-8 space-y-6">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center"><CheckCircle className="h-5 w-5 text-green-500" /></div>
                                                <div><h2 className="text-xl font-bold text-slate-900">{t('applyParent.step5.title')}</h2><p className="text-sm text-slate-400">{t('applyParent.step5.subtitle')}</p></div>
                                            </div>
                                            {/* Summary */}
                                            <div className="space-y-4">
                                                <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-4">
                                                    <h4 className="font-semibold text-purple-800 mb-2">{t('applyParent.review.parentInfo')}</h4>
                                                    <div className="grid grid-cols-2 gap-2 text-sm"><span className="text-slate-500">{t('applyParent.labels.parentFullName')}:</span><span className="text-slate-800">{formData.parentFullName}</span><span className="text-slate-500">{t('applyParent.labels.email')}:</span><span className="text-slate-800">{formData.parentEmail}</span><span className="text-slate-500">{t('applyParent.labels.relation')}:</span><span className="text-slate-800">{formData.parentRelation}</span><span className="text-slate-500">{t('applyParent.labels.country')}:</span><span className="text-slate-800">{formData.parentCountry}</span></div>
                                                </div>
                                                <div className="bg-pink-50/50 border border-pink-100 rounded-xl p-4">
                                                    <h4 className="font-semibold text-pink-800 mb-2">{t('applyParent.review.childInfo')}</h4>
                                                    <div className="grid grid-cols-2 gap-2 text-sm"><span className="text-slate-500">{t('applyParent.labels.childName')}:</span><span className="text-slate-800">{formData.childFullName}</span><span className="text-slate-500">{t('applyParent.labels.childDob')}:</span><span className="text-slate-800">{formData.childDob} ({childAge} {t('applyParent.review.yearsOld')})</span><span className="text-slate-500">{t('applyParent.labels.schoolName')}:</span><span className="text-slate-800">{formData.schoolName}</span><span className="text-slate-500">{t('applyParent.labels.grade')}:</span><span className="text-slate-800">{formData.childGrade}</span></div>
                                                </div>
                                                <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4">
                                                    <h4 className="font-semibold text-amber-800 mb-2">{t('applyParent.review.documents')}</h4>
                                                    <div className="text-sm text-slate-600 space-y-1">
                                                        <p>📄 {t('applyParent.labels.parentId')}: {parentIdDocs.length} {t('applyParent.review.files')}</p>
                                                        <p>📄 {t('applyParent.labels.childId')}: {childIdDocs.length} {t('applyParent.review.files')}</p>
                                                        <p>📄 {t('applyParent.labels.reportCard')}: {reportCards.length} {t('applyParent.review.files')}</p>
                                                        <p>📄 {t('applyParent.labels.enrollment')}: {enrollmentDocs.length} {t('applyParent.review.files')}</p>
                                                    </div>
                                                </div>
                                                <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-4">
                                                    <h4 className="font-semibold text-rose-800 mb-2">{t('applyParent.review.storyMedia')}</h4>
                                                    <p className="text-sm text-slate-600 line-clamp-3">{formData.story}</p>
                                                    <div className="mt-2 text-sm text-slate-500">
                                                        <span>💰 ${formData.targetAmount} • 📷 {photos.length} {t('applyParent.review.photos')} • 🎥 {video ? 1 : 0} {t('applyParent.review.videos')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Navigation */}
                                    <div className="p-6 sm:p-8 border-t border-slate-100 flex justify-between">
                                        {currentStep > 1 ? (
                                            <Button variant="outline" onClick={prevStep} className="rounded-xl gap-2"><ArrowLeft className="h-4 w-4" /> {t('applyParent.prev')}</Button>
                                        ) : (
                                            <Button variant="outline" onClick={() => router.push('/apply')} className="rounded-xl gap-2"><ArrowLeft className="h-4 w-4" /> {t('applyParent.back')}</Button>
                                        )}
                                        {currentStep < 5 ? (
                                            <Button onClick={nextStep} className="bg-purple-600 hover:bg-purple-700 rounded-xl gap-2">{t('applyParent.next')} <ArrowRight className="h-4 w-4" /></Button>
                                        ) : (
                                            <Button onClick={handleSubmit} disabled={loading} className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 rounded-xl gap-2 px-8">
                                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                                                {loading ? t('applyParent.submitting') : t('applyParent.submit')}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT: Sidebar */}
                            <div className="lg:w-[35%] space-y-6">
                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center"><Shield className="h-5 w-5 text-purple-500" /></div>
                                        <h3 className="font-bold text-slate-900">{t('applyParent.sidebar.title')}</h3>
                                    </div>
                                    <ul className="space-y-3">
                                        {[1, 2, 3, 4].map(i => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                                <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                                <span>{t(`applyParent.sidebar.point${i}`)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl p-6 text-white">
                                    <Users className="h-8 w-8 mb-3 text-purple-200" />
                                    <h3 className="font-bold text-lg mb-2">{t('applyParent.sidebar.bannerTitle')}</h3>
                                    <p className="text-purple-100 text-sm leading-relaxed">{t('applyParent.sidebar.bannerDesc')}</p>
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
