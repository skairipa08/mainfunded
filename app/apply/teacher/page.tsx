'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { validateEmail, sanitizeInput } from '@/lib/validation';
import { toast } from 'sonner';
import { useTranslation } from '@/lib/i18n';
import {
    School,
    User,
    Mail,
    Globe,
    DollarSign,
    BookOpen,
    Users,
    FileText,
    Upload,
    CheckCircle,
    AlertCircle,
    Loader2,
    X,
    Shield,
    ArrowRight,
    ArrowLeft,
    HelpCircle,
    GraduationCap,
    Building,
    Hash,
    MapPin,
    ImageIcon,
} from 'lucide-react';

type DocStatus = 'ready' | 'uploading' | 'uploaded' | 'failed';

interface DocumentItem {
    id: string;
    name: string;
    file: File;
    status: DocStatus;
    size: number;
    uploadedUrl?: string;
}

interface PhotoItem {
    id: string;
    name: string;
    file: File;
    preview: string;
}

const MIN_DESCRIPTION_LENGTH = 100;

const STEPS = [
    { id: 1, label: 'Öğretmen Bilgileri', icon: User },
    { id: 2, label: 'Okul & Sınıf Bilgileri', icon: School },
    { id: 3, label: 'İhtiyaç Detayı', icon: FileText },
    { id: 4, label: 'Belgeler', icon: Upload },
];

/* ── FieldWrapper (outside component to prevent remount) ── */
const FieldWrapper = ({
    id,
    label,
    icon: Icon,
    error,
    children,
    required = true,
}: {
    id: string;
    label: string;
    icon: any;
    error?: string;
    children: React.ReactNode;
    required?: boolean;
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
                <AlertCircle className="h-3 w-3" />
                {error}
            </p>
        )}
    </div>
);

const inputClass = (hasError: boolean) =>
    `h-12 rounded-xl border-slate-200 bg-white focus:border-blue-400 focus:ring-blue-400/20 focus:ring-4 transition-all duration-200 text-slate-800 placeholder:text-slate-300 ${hasError ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}`;

const selectTriggerClass = (hasError: boolean) =>
    `h-12 rounded-xl border-slate-200 bg-white focus:border-blue-400 focus:ring-blue-400/20 focus:ring-4 transition-all duration-200 ${hasError ? 'border-red-400' : ''}`;

export default function TeacherApplyPage() {
    const router = useRouter();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [currentStep, setCurrentStep] = useState(1);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        country: '',
        schoolName: '',
        schoolCity: '',
        classGrade: '',
        studentCount: '',
        subject: '',
        needSummary: '',
        targetAmount: '',
    });

    const [documents, setDocuments] = useState<DocumentItem[]>([]);
    const [documentNameInput, setDocumentNameInput] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = useState(false);

    // Photo upload state
    const [photos, setPhotos] = useState<PhotoItem[]>([]);
    const [photoDragOver, setPhotoDragOver] = useState(false);
    const photoInputRef = useRef<HTMLInputElement>(null);
    const MAX_PHOTOS = 5;
    const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5 MB

    const validateCurrentStep = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (currentStep === 1) {
            if (!formData.fullName.trim()) newErrors.fullName = t('applyTeacher.validation.fullName');
            else if (formData.fullName.trim().length < 2) newErrors.fullName = t('applyTeacher.validation.invalidName');
            if (!formData.email.trim()) newErrors.email = t('applyTeacher.validation.email');
            else if (!validateEmail(formData.email)) newErrors.email = t('applyTeacher.validation.invalidEmail');
            if (!formData.country.trim()) newErrors.country = t('applyTeacher.validation.country');
        }

        if (currentStep === 2) {
            if (!formData.schoolName.trim()) newErrors.schoolName = t('applyTeacher.validation.schoolName');
            if (!formData.schoolCity.trim()) newErrors.schoolCity = t('applyTeacher.validation.schoolCity');
            if (!formData.classGrade.trim()) newErrors.classGrade = t('applyTeacher.validation.classGrade');
            if (!formData.studentCount || parseInt(formData.studentCount) < 1) newErrors.studentCount = t('applyTeacher.validation.studentCount');
            if (!formData.subject.trim()) newErrors.subject = t('applyTeacher.validation.subject');
            if (!formData.targetAmount || parseInt(formData.targetAmount) < 1) newErrors.targetAmount = t('applyTeacher.validation.targetAmount');
        }

        if (currentStep === 3) {
            if (!formData.needSummary.trim()) newErrors.needSummary = t('applyTeacher.validation.needSummary');
            else if (formData.needSummary.trim().length < MIN_DESCRIPTION_LENGTH) {
                newErrors.needSummary = t('applyTeacher.validation.needSummaryMin', { min: MIN_DESCRIPTION_LENGTH });
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (validateCurrentStep()) {
            setCurrentStep((s) => Math.min(s + 1, 4));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const prevStep = () => {
        setCurrentStep((s) => Math.max(s - 1, 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    /* ── Document handlers ── */
    const handleAddDocumentClick = () => fileInputRef.current?.click();

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = '';
        await processFile(file);
    };

    const processFile = async (file: File) => {
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        const maxSize = 10 * 1024 * 1024;
        if (!allowedTypes.includes(file.type)) { toast.error(t('apply.validation.fileType')); return; }
        if (file.size > maxSize) { toast.error(t('apply.validation.fileSize')); return; }
        const name = documentNameInput.trim() || file.name;
        const newDoc: DocumentItem = { id: Math.random().toString(36).substring(7), name, file, size: file.size, status: 'ready' };
        setDocuments((prev) => [...prev, newDoc]);
        setDocumentNameInput('');
        await simulateUpload(newDoc.id);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) await processFile(file);
    };

    const simulateUpload = async (docId: string) => {
        setDocuments((prev) => prev.map((d) => (d.id === docId ? { ...d, status: 'uploading' } : d)));
        try {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            setDocuments((prev) => prev.map((d) => (d.id === docId ? { ...d, status: 'uploaded', uploadedUrl: `mock_url_${d.name}` } : d)));
            toast.success(t('apply.documents.status.uploaded'));
        } catch {
            setDocuments((prev) => prev.map((d) => (d.id === docId ? { ...d, status: 'failed' } : d)));
            toast.error(t('apply.documents.status.failed'));
        }
    };

    const handleRemoveDocument = (id: string) => setDocuments((prev) => prev.filter((d) => d.id !== id));

    /* ── Photo handlers ── */
    const processPhoto = (file: File) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) { toast.error('Only JPG, PNG, WebP images are allowed'); return; }
        if (file.size > MAX_PHOTO_SIZE) { toast.error('Photo must be smaller than 5 MB'); return; }
        if (photos.length >= MAX_PHOTOS) { toast.error(`Maximum ${MAX_PHOTOS} photos allowed`); return; }
        const newPhoto: PhotoItem = {
            id: Math.random().toString(36).substring(7),
            name: file.name,
            file,
            preview: URL.createObjectURL(file),
        };
        setPhotos((prev) => [...prev, newPhoto]);
    };

    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        Array.from(files).forEach(processPhoto);
        e.target.value = '';
    };

    const handlePhotoDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setPhotoDragOver(false);
        const files = e.dataTransfer.files;
        if (files) Array.from(files).forEach(processPhoto);
    };

    const handleRemovePhoto = (id: string) => {
        setPhotos((prev) => {
            const photo = prev.find((p) => p.id === id);
            if (photo) URL.revokeObjectURL(photo.preview);
            return prev.filter((p) => p.id !== id);
        });
    };

    const handleSubmit = async () => {
        if (loading || submitted) return;

        // Validate all steps
        const allErrors: Record<string, string> = {};
        if (!formData.fullName.trim() || formData.fullName.trim().length < 2) { setCurrentStep(1); return; }
        if (!formData.email.trim() || !validateEmail(formData.email)) { setCurrentStep(1); return; }
        if (!formData.country.trim()) { setCurrentStep(1); return; }
        if (!formData.schoolName.trim() || !formData.schoolCity.trim() || !formData.classGrade.trim() || !formData.subject.trim()) { setCurrentStep(2); return; }
        if (!formData.studentCount || parseInt(formData.studentCount) < 1) { setCurrentStep(2); return; }
        if (!formData.targetAmount || parseInt(formData.targetAmount) < 1) { setCurrentStep(2); return; }
        if (!formData.needSummary.trim() || formData.needSummary.trim().length < MIN_DESCRIPTION_LENGTH) { setCurrentStep(3); return; }

        const pendingDocs = documents.some((d) => d.status === 'uploading');
        if (pendingDocs) { toast.warning(t('apply.validation.waitUpload')); return; }

        setLoading(true);
        setSubmitted(true);

        try {
            const documentNames = documents.map((d) => d.name);
            const response = await fetch('/api/ops/applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'teacher',
                    fullName: sanitizeInput(formData.fullName),
                    email: formData.email.trim().toLowerCase(),
                    country: sanitizeInput(formData.country),
                    needSummary: sanitizeInput(formData.needSummary),
                    documents: documentNames,
                    targetAmount: parseInt(formData.targetAmount) || 0,
                    schoolName: sanitizeInput(formData.schoolName),
                    schoolCity: sanitizeInput(formData.schoolCity),
                    classGrade: formData.classGrade,
                    subject: sanitizeInput(formData.subject),
                    studentCount: parseInt(formData.studentCount) || 0,
                    phone: formData.phone || null,
                    photoCount: photos.length,
                }),
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.error || t('applyTeacher.submitError'));
            toast.success(t('applyTeacher.submitSuccess'));
            setTimeout(() => router.push('/'), 1500);
        } catch (error: any) {
            console.error('Failed to submit teacher application:', error);
            toast.error(error.message || t('applyTeacher.submitError'));
            setSubmitted(false);
        } finally {
            setLoading(false);
        }
    };

    const descriptionLength = formData.needSummary.trim().length;

    if (submitted && !loading) {
        return (
            <div className="min-h-screen flex flex-col bg-slate-50">
                <Navbar />
                <main className="flex-grow flex items-center justify-center py-20">
                    <div className="max-w-md mx-auto text-center bg-white rounded-3xl shadow-lg p-10">
                        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">{t('applyTeacher.successTitle')}</h2>
                        <p className="text-slate-500 mb-6">{t('applyTeacher.successDesc')}</p>
                        <Button onClick={() => router.push('/')} className="bg-blue-600 hover:bg-blue-700">
                            {t('applyTeacher.backToHome')}
                        </Button>
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

                {/* ═══════════ HERO ═══════════ */}
                <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute -top-24 -right-24 w-[500px] h-[500px] bg-white/5 rounded-full blur-[80px]" />
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-[80px]" />
                        <div
                            className="absolute inset-0 opacity-[0.04]"
                            style={{
                                backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                                backgroundSize: '32px 32px',
                            }}
                        />
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
                        <div className="max-w-3xl mx-auto text-center">
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2 mb-6">
                                <School className="h-4 w-4 text-yellow-300" />
                                <span className="text-sm text-white/90 font-medium">{t('applyTeacher.badge')}</span>
                            </div>

                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                                {t('applyTeacher.heroTitle')}
                                <br />
                                <span className="bg-gradient-to-r from-yellow-200 via-amber-200 to-orange-200 bg-clip-text text-transparent">
                                    {t('applyTeacher.heroHighlight')}
                                </span>
                            </h1>

                            <p className="text-base sm:text-lg text-blue-100/80 leading-relaxed max-w-xl mx-auto">
                                {t('applyTeacher.heroDesc')}
                            </p>
                        </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0">
                        <svg viewBox="0 0 1440 60" fill="none" className="w-full">
                            <path d="M0 60L60 52C120 44 240 28 360 24C480 20 600 28 720 32C840 36 960 36 1080 32C1200 28 1320 20 1380 16L1440 12V60H0Z" fill="#f8fafc" />
                        </svg>
                    </div>
                </section>

                {/* ═══════════ MAIN CONTENT ═══════════ */}
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
                                                    <button
                                                        type="button"
                                                        onClick={() => { if (step.id < currentStep) setCurrentStep(step.id); }}
                                                        className={`flex items-center gap-2.5 transition-all duration-300 ${isActive ? 'text-blue-600' : isCompleted ? 'text-blue-500 cursor-pointer' : 'text-slate-300'
                                                            }`}
                                                    >
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isActive ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : isCompleted ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'
                                                            }`}>
                                                            {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                                                        </div>
                                                        <span className="text-sm font-medium hidden sm:block">{step.label}</span>
                                                    </button>
                                                    {i < STEPS.length - 1 && (
                                                        <div className="flex-1 mx-3">
                                                            <div className={`h-[2px] rounded-full transition-colors duration-300 ${isCompleted ? 'bg-blue-300' : 'bg-slate-100'}`} />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Form Card */}
                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

                                    {/* STEP 1 — Teacher Info */}
                                    {currentStep === 1 && (
                                        <div className="p-6 sm:p-8 space-y-6">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                                    <User className="h-5 w-5 text-blue-500" />
                                                </div>
                                                <div>
                                                    <h2 className="text-xl font-bold text-slate-900">{t('applyTeacher.step1.title')}</h2>
                                                    <p className="text-sm text-slate-400">{t('applyTeacher.step1.subtitle')}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <FieldWrapper id="fullName" label={t('applyTeacher.labels.fullName')} icon={User} error={errors.fullName}>
                                                    <Input id="fullName" type="text" value={formData.fullName}
                                                        onChange={(e) => { setFormData({ ...formData, fullName: e.target.value }); if (errors.fullName) setErrors({ ...errors, fullName: '' }); }}
                                                        placeholder={t('applyTeacher.placeholders.fullName')} className={inputClass(!!errors.fullName)} />
                                                </FieldWrapper>

                                                <FieldWrapper id="email" label={t('applyTeacher.labels.email')} icon={Mail} error={errors.email}>
                                                    <Input id="email" type="email" value={formData.email}
                                                        onChange={(e) => { setFormData({ ...formData, email: e.target.value }); if (errors.email) setErrors({ ...errors, email: '' }); }}
                                                        placeholder={t('applyTeacher.placeholders.email')} className={inputClass(!!errors.email)} />
                                                </FieldWrapper>

                                                <FieldWrapper id="phone" label={t('applyTeacher.labels.phone')} icon={Mail} error={errors.phone} required={false}>
                                                    <Input id="phone" type="tel" value={formData.phone}
                                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                        placeholder="+90 5XX XXX XX XX" className={inputClass(false)} />
                                                </FieldWrapper>

                                                <FieldWrapper id="country" label={t('applyTeacher.labels.country')} icon={Globe} error={errors.country}>
                                                    <Input id="country" type="text" value={formData.country}
                                                        onChange={(e) => { setFormData({ ...formData, country: e.target.value }); if (errors.country) setErrors({ ...errors, country: '' }); }}
                                                        placeholder={t('applyTeacher.placeholders.country')} className={inputClass(!!errors.country)} />
                                                </FieldWrapper>
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 2 — School & Class Info */}
                                    {currentStep === 2 && (
                                        <div className="p-6 sm:p-8 space-y-6">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                                    <School className="h-5 w-5 text-indigo-500" />
                                                </div>
                                                <div>
                                                    <h2 className="text-xl font-bold text-slate-900">{t('applyTeacher.step2.title')}</h2>
                                                    <p className="text-sm text-slate-400">{t('applyTeacher.step2.subtitle')}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <FieldWrapper id="schoolName" label={t('applyTeacher.labels.schoolName')} icon={Building} error={errors.schoolName}>
                                                    <Input id="schoolName" type="text" value={formData.schoolName}
                                                        onChange={(e) => { setFormData({ ...formData, schoolName: e.target.value }); if (errors.schoolName) setErrors({ ...errors, schoolName: '' }); }}
                                                        placeholder={t('applyTeacher.placeholders.schoolName')} className={inputClass(!!errors.schoolName)} />
                                                </FieldWrapper>

                                                <FieldWrapper id="schoolCity" label={t('applyTeacher.labels.schoolCity')} icon={MapPin} error={errors.schoolCity}>
                                                    <Input id="schoolCity" type="text" value={formData.schoolCity}
                                                        onChange={(e) => { setFormData({ ...formData, schoolCity: e.target.value }); if (errors.schoolCity) setErrors({ ...errors, schoolCity: '' }); }}
                                                        placeholder={t('applyTeacher.placeholders.schoolCity')} className={inputClass(!!errors.schoolCity)} />
                                                </FieldWrapper>

                                                <FieldWrapper id="classGrade" label={t('applyTeacher.labels.classGrade')} icon={GraduationCap} error={errors.classGrade}>
                                                    <Input id="classGrade" type="text" value={formData.classGrade}
                                                        onChange={(e) => { setFormData({ ...formData, classGrade: e.target.value }); if (errors.classGrade) setErrors({ ...errors, classGrade: '' }); }}
                                                        placeholder={t('applyTeacher.placeholders.classGrade')} className={inputClass(!!errors.classGrade)} />
                                                </FieldWrapper>

                                                <FieldWrapper id="studentCount" label={t('applyTeacher.labels.studentCount')} icon={Users} error={errors.studentCount}>
                                                    <Input id="studentCount" type="number" min={1} value={formData.studentCount}
                                                        onChange={(e) => { setFormData({ ...formData, studentCount: e.target.value }); if (errors.studentCount) setErrors({ ...errors, studentCount: '' }); }}
                                                        placeholder={t('applyTeacher.placeholders.studentCount')} className={inputClass(!!errors.studentCount)} />
                                                </FieldWrapper>

                                                <FieldWrapper id="subject" label={t('applyTeacher.labels.subject')} icon={BookOpen} error={errors.subject}>
                                                    <Input id="subject" type="text" value={formData.subject}
                                                        onChange={(e) => { setFormData({ ...formData, subject: e.target.value }); if (errors.subject) setErrors({ ...errors, subject: '' }); }}
                                                        placeholder={t('applyTeacher.placeholders.subject')} className={inputClass(!!errors.subject)} />
                                                </FieldWrapper>

                                                <FieldWrapper id="targetAmount" label={t('applyTeacher.labels.targetAmount')} icon={DollarSign} error={errors.targetAmount}>
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">$</span>
                                                        <Input id="targetAmount" type="number" min={1} value={formData.targetAmount}
                                                            onChange={(e) => { setFormData({ ...formData, targetAmount: e.target.value }); if (errors.targetAmount) setErrors({ ...errors, targetAmount: '' }); }}
                                                            placeholder={t('applyTeacher.placeholders.targetAmount')} className={`${inputClass(!!errors.targetAmount)} pl-8`} />
                                                    </div>
                                                </FieldWrapper>
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 3 — Need Summary + Photos */}
                                    {currentStep === 3 && (
                                        <div className="p-6 sm:p-8 space-y-6">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                                                    <FileText className="h-5 w-5 text-purple-500" />
                                                </div>
                                                <div>
                                                    <h2 className="text-xl font-bold text-slate-900">{t('applyTeacher.step3.title')}</h2>
                                                    <p className="text-sm text-slate-400">{t('applyTeacher.step3.subtitle')}</p>
                                                </div>
                                            </div>

                                            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                                                <HelpCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                                <div className="text-sm text-blue-700 leading-relaxed">
                                                    <p className="font-medium mb-1">{t('applyTeacher.tips.title')}</p>
                                                    <ul className="list-disc list-inside space-y-1 text-blue-600">
                                                        <li>{t('applyTeacher.tips.tip1')}</li>
                                                        <li>{t('applyTeacher.tips.tip2')}</li>
                                                        <li>{t('applyTeacher.tips.tip3')}</li>
                                                    </ul>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <Label htmlFor="needSummary" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                                        <FileText className="h-4 w-4 text-slate-400" />
                                                        {t('applyTeacher.labels.needSummary')}
                                                        <span className="text-red-400">*</span>
                                                    </Label>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-1.5 w-20 rounded-full bg-slate-100 overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-300 ${descriptionLength >= MIN_DESCRIPTION_LENGTH ? 'bg-emerald-500' : 'bg-amber-400'}`}
                                                                style={{ width: `${Math.min(100, (descriptionLength / MIN_DESCRIPTION_LENGTH) * 100)}%` }}
                                                            />
                                                        </div>
                                                        <span className={`text-xs font-medium ${descriptionLength < MIN_DESCRIPTION_LENGTH ? 'text-amber-500' : 'text-emerald-500'}`}>
                                                            {descriptionLength}/{MIN_DESCRIPTION_LENGTH}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Textarea
                                                    id="needSummary"
                                                    value={formData.needSummary}
                                                    onChange={(e) => { setFormData({ ...formData, needSummary: e.target.value }); if (errors.needSummary) setErrors({ ...errors, needSummary: '' }); }}
                                                    placeholder={t('applyTeacher.placeholders.needSummary')}
                                                    rows={8}
                                                    className={`rounded-xl border-slate-200 bg-white focus:border-purple-400 focus:ring-purple-400/20 focus:ring-4 transition-all duration-200 text-slate-800 placeholder:text-slate-300 resize-none ${errors.needSummary ? 'border-red-400' : ''}`}
                                                />
                                                {errors.needSummary && (
                                                    <p className="text-xs text-red-500 flex items-center gap-1">
                                                        <AlertCircle className="h-3 w-3" />
                                                        {errors.needSummary}
                                                    </p>
                                                )}
                                            </div>

                                            {/* ── Photo Upload Section ── */}
                                            <div className="space-y-3">
                                                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                                    <ImageIcon className="h-4 w-4 text-slate-400" />
                                                    {t('applyTeacher.photos.label')}
                                                </Label>
                                                <p className="text-xs text-slate-400">{t('applyTeacher.photos.hint')}</p>

                                                <div
                                                    onDragOver={(e) => { e.preventDefault(); setPhotoDragOver(true); }}
                                                    onDragLeave={() => setPhotoDragOver(false)}
                                                    onDrop={handlePhotoDrop}
                                                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300 ${photoDragOver ? 'border-purple-400 bg-purple-50/50' : 'border-slate-200 hover:border-slate-300'}`}
                                                >
                                                    <ImageIcon className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                                                    <p className="text-sm text-slate-500 mb-2">{t('applyTeacher.photos.dropText')}</p>
                                                    <Button type="button" variant="outline" onClick={() => photoInputRef.current?.click()} className="rounded-xl text-sm">
                                                        {t('applyTeacher.photos.selectBtn')}
                                                    </Button>
                                                    <input
                                                        ref={photoInputRef}
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/jpeg,image/png,image/webp"
                                                        multiple
                                                        onChange={handlePhotoSelect}
                                                    />
                                                    <p className="text-xs text-slate-400 mt-2">JPG, PNG, WebP • Max 5 MB • {t('applyTeacher.photos.maxCount')}</p>
                                                </div>

                                                {/* Photo Previews */}
                                                {photos.length > 0 && (
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                        {photos.map((photo) => (
                                                            <div key={photo.id} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-[4/3]">
                                                                <img
                                                                    src={photo.preview}
                                                                    alt={photo.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200" />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemovePhoto(photo.id)}
                                                                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500/80 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </button>
                                                                <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-2 py-1 truncate">
                                                                    {photo.name}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
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
                                                    <h2 className="text-xl font-bold text-slate-900">{t('applyTeacher.step4.title')}</h2>
                                                    <p className="text-sm text-slate-400">{t('applyTeacher.step4.subtitle')}</p>
                                                </div>
                                            </div>

                                            <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 text-sm text-amber-700">
                                                <p className="font-medium mb-1">{t('applyTeacher.docTips.title')}</p>
                                                <ul className="list-disc list-inside space-y-1 text-amber-600">
                                                    <li>{t('applyTeacher.docTips.tip1')}</li>
                                                    <li>{t('applyTeacher.docTips.tip2')}</li>
                                                    <li>{t('applyTeacher.docTips.tip3')}</li>
                                                </ul>
                                            </div>

                                            {/* Upload Area */}
                                            <div
                                                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                                onDragLeave={() => setDragOver(false)}
                                                onDrop={handleDrop}
                                                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${dragOver ? 'border-blue-400 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'}`}
                                            >
                                                <Upload className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                                                <p className="text-sm text-slate-500 mb-3">{t('applyTeacher.docUploadText')}</p>
                                                <Button variant="outline" onClick={handleAddDocumentClick} className="rounded-xl">
                                                    {t('applyTeacher.docSelectFile')}
                                                </Button>
                                                <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileSelect} />
                                                <p className="text-xs text-slate-400 mt-2">PDF, JPG, PNG • Max 10 MB</p>
                                            </div>

                                            {/* Document List */}
                                            {documents.length > 0 && (
                                                <div className="space-y-2">
                                                    {documents.map((doc) => (
                                                        <div key={doc.id} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                                                            <div className="flex items-center gap-3">
                                                                <FileText className="h-5 w-5 text-blue-500" />
                                                                <div>
                                                                    <p className="text-sm font-medium text-slate-700">{doc.name}</p>
                                                                    <p className="text-xs text-slate-400">{(doc.size / 1024).toFixed(1)} KB</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {doc.status === 'uploading' && <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />}
                                                                {doc.status === 'uploaded' && <CheckCircle className="h-4 w-4 text-green-500" />}
                                                                {doc.status === 'failed' && <AlertCircle className="h-4 w-4 text-red-500" />}
                                                                <button onClick={() => handleRemoveDocument(doc.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                                                                    <X className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Navigation Buttons */}
                                    <div className="p-6 sm:p-8 border-t border-slate-100 flex justify-between">
                                        {currentStep > 1 ? (
                                            <Button variant="outline" onClick={prevStep} className="rounded-xl gap-2">
                                                <ArrowLeft className="h-4 w-4" /> {t('applyTeacher.prev')}
                                            </Button>
                                        ) : (
                                            <Button variant="outline" onClick={() => router.push('/apply')} className="rounded-xl gap-2">
                                                <ArrowLeft className="h-4 w-4" /> {t('applyTeacher.back')}
                                            </Button>
                                        )}

                                        {currentStep < 4 ? (
                                            <Button onClick={nextStep} className="bg-blue-600 hover:bg-blue-700 rounded-xl gap-2">
                                                {t('applyTeacher.next')} <ArrowRight className="h-4 w-4" />
                                            </Button>
                                        ) : (
                                            <Button onClick={handleSubmit} disabled={loading} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl gap-2 px-8">
                                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                                                {loading ? t('applyTeacher.submitting') : t('applyTeacher.submit')}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT: Sidebar */}
                            <div className="lg:w-[35%] space-y-6">
                                {/* Info Card */}
                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                            <Shield className="h-5 w-5 text-blue-500" />
                                        </div>
                                        <h3 className="font-bold text-slate-900">{t('applyTeacher.sidebar.title')}</h3>
                                    </div>
                                    <ul className="space-y-3">
                                        <li className="flex items-start gap-2 text-sm text-slate-600">
                                            <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                            <span>{t('applyTeacher.sidebar.point1')}</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-slate-600">
                                            <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                            <span>{t('applyTeacher.sidebar.point2')}</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-slate-600">
                                            <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                            <span>{t('applyTeacher.sidebar.point3')}</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-slate-600">
                                            <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                            <span>{t('applyTeacher.sidebar.point4')}</span>
                                        </li>
                                    </ul>
                                </div>

                                {/* Class Campaign Banner */}
                                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
                                    <School className="h-8 w-8 mb-3 text-blue-200" />
                                    <h3 className="font-bold text-lg mb-2">{t('applyTeacher.sidebar.bannerTitle')}</h3>
                                    <p className="text-blue-100 text-sm leading-relaxed">{t('applyTeacher.sidebar.bannerDesc')}</p>
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
