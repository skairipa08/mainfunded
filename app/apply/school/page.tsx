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
    Phone,
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
    Video,
    Briefcase,
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

interface VideoItem {
    id: string;
    name: string;
    file: File;
    preview: string;
    size: number;
}

const MIN_DESCRIPTION_LENGTH = 100;
const MAX_PHOTOS = 10;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB

const STEPS = [
    { id: 1, label: 'Okul Bilgileri', icon: School },
    { id: 2, label: 'Başvuran Bilgileri', icon: User },
    { id: 3, label: 'Proje Detayı', icon: FileText },
    { id: 4, label: 'Medya & Belgeler', icon: Upload },
    { id: 5, label: 'İnceleme', icon: CheckCircle },
];

/* ── FieldWrapper ── */
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
    `h-12 rounded-xl border-slate-200 bg-white focus:border-amber-400 focus:ring-amber-400/20 focus:ring-4 transition-all duration-200 text-slate-800 placeholder:text-slate-300 ${hasError ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}`;

const selectTriggerClass = (hasError: boolean) =>
    `h-12 rounded-xl border-slate-200 bg-white focus:border-amber-400 focus:ring-amber-400/20 focus:ring-4 transition-all duration-200 ${hasError ? 'border-red-400' : ''}`;

export default function SchoolApplyPage() {
    const router = useRouter();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [currentStep, setCurrentStep] = useState(1);

    const [formData, setFormData] = useState({
        // School info
        schoolName: '',
        schoolCity: '',
        schoolDistrict: '',
        schoolAddress: '',
        schoolType: '',
        studentTotal: '',
        schoolWebsite: '',
        schoolPhone: '',
        // Applicant info
        applicantFullName: '',
        applicantEmail: '',
        applicantPhone: '',
        applicantRole: '',
        applicantTitle: '',
        // Project info
        projectTitle: '',
        projectCategory: '',
        needSummary: '',
        targetAmount: '',
        beneficiaryCount: '',
    });

    // Documents
    const [documents, setDocuments] = useState<DocumentItem[]>([]);
    const [documentNameInput, setDocumentNameInput] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = useState(false);

    // Photos
    const [photos, setPhotos] = useState<PhotoItem[]>([]);
    const [photoDragOver, setPhotoDragOver] = useState(false);
    const photoInputRef = useRef<HTMLInputElement>(null);

    // Video
    const [video, setVideo] = useState<VideoItem | null>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    const updateField = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const validateCurrentStep = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (currentStep === 1) {
            if (!formData.schoolName.trim()) newErrors.schoolName = t('applySchool.validation.schoolName');
            if (!formData.schoolCity.trim()) newErrors.schoolCity = t('applySchool.validation.schoolCity');
            if (!formData.schoolDistrict.trim()) newErrors.schoolDistrict = t('applySchool.validation.schoolDistrict');
            if (!formData.schoolType) newErrors.schoolType = t('applySchool.validation.schoolType');
            if (!formData.studentTotal || parseInt(formData.studentTotal) < 1)
                newErrors.studentTotal = t('applySchool.validation.studentTotal');
        }

        if (currentStep === 2) {
            if (!formData.applicantFullName.trim()) newErrors.applicantFullName = t('applySchool.validation.applicantFullName');
            else if (formData.applicantFullName.trim().length < 2) newErrors.applicantFullName = t('applySchool.validation.invalidName');
            if (!formData.applicantEmail.trim()) newErrors.applicantEmail = t('applySchool.validation.email');
            else if (!validateEmail(formData.applicantEmail)) newErrors.applicantEmail = t('applySchool.validation.invalidEmail');
            if (!formData.applicantRole) newErrors.applicantRole = t('applySchool.validation.applicantRole');
        }

        if (currentStep === 3) {
            if (!formData.projectTitle.trim()) newErrors.projectTitle = t('applySchool.validation.projectTitle');
            if (!formData.projectCategory) newErrors.projectCategory = t('applySchool.validation.projectCategory');
            if (!formData.needSummary.trim()) newErrors.needSummary = t('applySchool.validation.needSummary');
            else if (formData.needSummary.trim().length < MIN_DESCRIPTION_LENGTH) {
                newErrors.needSummary = t('applySchool.validation.needSummaryMin', { min: MIN_DESCRIPTION_LENGTH });
            }
            if (!formData.targetAmount || parseInt(formData.targetAmount) < 1) newErrors.targetAmount = t('applySchool.validation.targetAmount');
            if (!formData.beneficiaryCount || parseInt(formData.beneficiaryCount) < 1) newErrors.beneficiaryCount = t('applySchool.validation.beneficiaryCount');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (validateCurrentStep()) {
            setCurrentStep((s) => Math.min(s + 1, 5));
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
        const newDoc: DocumentItem = {
            id: Math.random().toString(36).substring(7),
            name,
            file,
            size: file.size,
            status: 'ready',
        };
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
        if (!allowedTypes.includes(file.type)) { toast.error(t('applySchool.photos.typeError')); return; }
        if (file.size > MAX_PHOTO_SIZE) { toast.error(t('applySchool.photos.sizeError')); return; }
        if (photos.length >= MAX_PHOTOS) { toast.error(t('applySchool.photos.maxError')); return; }
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

    /* ── Video handler ── */
    const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = '';
        if (!['video/mp4', 'video/webm', 'video/quicktime'].includes(file.type)) {
            toast.error(t('applySchool.video.typeError'));
            return;
        }
        if (file.size > MAX_VIDEO_SIZE) {
            toast.error(t('applySchool.video.sizeError'));
            return;
        }
        if (video) URL.revokeObjectURL(video.preview);
        setVideo({
            id: Math.random().toString(36).substring(7),
            name: file.name,
            file,
            preview: URL.createObjectURL(file),
            size: file.size,
        });
    };

    const removeVideo = () => {
        if (video) {
            URL.revokeObjectURL(video.preview);
            setVideo(null);
        }
    };

    /* ── Submit ── */
    const handleSubmit = async () => {
        if (loading || submitted) return;

        // Final validation across all steps
        if (!formData.schoolName.trim() || !formData.schoolCity.trim() || !formData.schoolType) { setCurrentStep(1); return; }
        if (!formData.applicantFullName.trim() || !formData.applicantEmail.trim() || !validateEmail(formData.applicantEmail) || !formData.applicantRole) { setCurrentStep(2); return; }
        if (!formData.projectTitle.trim() || !formData.projectCategory || !formData.needSummary.trim() || formData.needSummary.trim().length < MIN_DESCRIPTION_LENGTH) { setCurrentStep(3); return; }
        if (!formData.targetAmount || parseInt(formData.targetAmount) < 1 || !formData.beneficiaryCount || parseInt(formData.beneficiaryCount) < 1) { setCurrentStep(3); return; }

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
                    type: 'school',
                    // School info
                    schoolName: sanitizeInput(formData.schoolName),
                    schoolCity: sanitizeInput(formData.schoolCity),
                    schoolDistrict: sanitizeInput(formData.schoolDistrict),
                    schoolAddress: sanitizeInput(formData.schoolAddress),
                    schoolType: formData.schoolType,
                    studentTotal: parseInt(formData.studentTotal) || 0,
                    schoolWebsite: formData.schoolWebsite || null,
                    schoolPhone: formData.schoolPhone || null,
                    // Applicant info
                    fullName: sanitizeInput(formData.applicantFullName),
                    email: formData.applicantEmail.trim().toLowerCase(),
                    phone: formData.applicantPhone || null,
                    applicantRole: formData.applicantRole,
                    applicantTitle: sanitizeInput(formData.applicantTitle) || null,
                    // Project info
                    projectTitle: sanitizeInput(formData.projectTitle),
                    projectCategory: formData.projectCategory,
                    needSummary: sanitizeInput(formData.needSummary),
                    targetAmount: parseInt(formData.targetAmount) || 0,
                    beneficiaryCount: parseInt(formData.beneficiaryCount) || 0,
                    // Media
                    documents: documentNames,
                    photoCount: photos.length,
                    hasVideo: !!video,
                    country: sanitizeInput(formData.schoolCity),
                }),
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.error || t('applySchool.submitError'));
            toast.success(t('applySchool.submitSuccess'));
            setTimeout(() => router.push('/'), 1500);
        } catch (error: any) {
            console.error('Failed to submit school application:', error);
            toast.error(error.message || t('applySchool.submitError'));
            setSubmitted(false);
        } finally {
            setLoading(false);
        }
    };

    const descriptionLength = formData.needSummary.trim().length;

    /* ── Success state ── */
    if (submitted && !loading) {
        return (
            <div className="min-h-screen flex flex-col bg-slate-50">
                <Navbar />
                <main className="flex-grow flex items-center justify-center py-20">
                    <div className="max-w-md mx-auto text-center bg-white rounded-3xl shadow-lg p-10">
                        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">{t('applySchool.successTitle')}</h2>
                        <p className="text-slate-500 mb-6">{t('applySchool.successDesc')}</p>
                        <Button onClick={() => router.push('/')} className="bg-amber-600 hover:bg-amber-700">
                            {t('applySchool.backToHome')}
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
                <section className="relative overflow-hidden bg-gradient-to-br from-amber-600 via-orange-600 to-amber-800">
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
                                <span className="text-sm text-white/90 font-medium">{t('applySchool.badge')}</span>
                            </div>

                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                                {t('applySchool.heroTitle')}
                                <br />
                                <span className="bg-gradient-to-r from-yellow-200 via-amber-200 to-orange-200 bg-clip-text text-transparent">
                                    {t('applySchool.heroHighlight')}
                                </span>
                            </h1>

                            <p className="text-base sm:text-lg text-amber-100/80 leading-relaxed max-w-xl mx-auto">
                                {t('applySchool.heroDesc')}
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
                                                        className={`flex items-center gap-2.5 transition-all duration-300 ${isActive ? 'text-amber-600' : isCompleted ? 'text-amber-500 cursor-pointer' : 'text-slate-300'}`}
                                                    >
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isActive ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : isCompleted ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                                                            {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                                                        </div>
                                                        <span className="text-sm font-medium hidden sm:block">{step.label}</span>
                                                    </button>
                                                    {i < STEPS.length - 1 && (
                                                        <div className="flex-1 mx-3">
                                                            <div className={`h-[2px] rounded-full transition-colors duration-300 ${isCompleted ? 'bg-amber-300' : 'bg-slate-100'}`} />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Form Card */}
                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

                                    {/* ══════ STEP 1 — School Info ══════ */}
                                    {currentStep === 1 && (
                                        <div className="p-6 sm:p-8 space-y-6">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                                                    <School className="h-5 w-5 text-amber-500" />
                                                </div>
                                                <div>
                                                    <h2 className="text-xl font-bold text-slate-900">{t('applySchool.step1.title')}</h2>
                                                    <p className="text-sm text-slate-400">{t('applySchool.step1.subtitle')}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <FieldWrapper id="schoolName" label={t('applySchool.labels.schoolName')} icon={Building} error={errors.schoolName}>
                                                    <Input id="schoolName" type="text" value={formData.schoolName}
                                                        onChange={(e) => updateField('schoolName', e.target.value)}
                                                        placeholder={t('applySchool.placeholders.schoolName')} className={inputClass(!!errors.schoolName)} />
                                                </FieldWrapper>

                                                <FieldWrapper id="schoolType" label={t('applySchool.labels.schoolType')} icon={GraduationCap} error={errors.schoolType}>
                                                    <Select value={formData.schoolType} onValueChange={(v) => updateField('schoolType', v)}>
                                                        <SelectTrigger className={selectTriggerClass(!!errors.schoolType)}>
                                                            <SelectValue placeholder={t('applySchool.placeholders.schoolType')} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="ilkokul">{t('applySchool.schoolTypes.ilkokul')}</SelectItem>
                                                            <SelectItem value="ortaokul">{t('applySchool.schoolTypes.ortaokul')}</SelectItem>
                                                            <SelectItem value="lise">{t('applySchool.schoolTypes.lise')}</SelectItem>
                                                            <SelectItem value="meslek_lisesi">{t('applySchool.schoolTypes.meslek_lisesi')}</SelectItem>
                                                            <SelectItem value="universite">{t('applySchool.schoolTypes.universite')}</SelectItem>
                                                            <SelectItem value="ozel">{t('applySchool.schoolTypes.ozel')}</SelectItem>
                                                            <SelectItem value="diger">{t('applySchool.schoolTypes.diger')}</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FieldWrapper>

                                                <FieldWrapper id="schoolCity" label={t('applySchool.labels.schoolCity')} icon={MapPin} error={errors.schoolCity}>
                                                    <Input id="schoolCity" type="text" value={formData.schoolCity}
                                                        onChange={(e) => updateField('schoolCity', e.target.value)}
                                                        placeholder={t('applySchool.placeholders.schoolCity')} className={inputClass(!!errors.schoolCity)} />
                                                </FieldWrapper>

                                                <FieldWrapper id="schoolDistrict" label={t('applySchool.labels.schoolDistrict')} icon={MapPin} error={errors.schoolDistrict}>
                                                    <Input id="schoolDistrict" type="text" value={formData.schoolDistrict}
                                                        onChange={(e) => updateField('schoolDistrict', e.target.value)}
                                                        placeholder={t('applySchool.placeholders.schoolDistrict')} className={inputClass(!!errors.schoolDistrict)} />
                                                </FieldWrapper>

                                                <div className="md:col-span-2">
                                                    <FieldWrapper id="schoolAddress" label={t('applySchool.labels.schoolAddress')} icon={MapPin} error={errors.schoolAddress} required={false}>
                                                        <Input id="schoolAddress" type="text" value={formData.schoolAddress}
                                                            onChange={(e) => updateField('schoolAddress', e.target.value)}
                                                            placeholder={t('applySchool.placeholders.schoolAddress')} className={inputClass(false)} />
                                                    </FieldWrapper>
                                                </div>

                                                <FieldWrapper id="studentTotal" label={t('applySchool.labels.studentTotal')} icon={Users} error={errors.studentTotal}>
                                                    <Input id="studentTotal" type="number" min={1} value={formData.studentTotal}
                                                        onChange={(e) => updateField('studentTotal', e.target.value)}
                                                        placeholder={t('applySchool.placeholders.studentTotal')} className={inputClass(!!errors.studentTotal)} />
                                                </FieldWrapper>

                                                <FieldWrapper id="schoolWebsite" label={t('applySchool.labels.schoolWebsite')} icon={Globe} error={errors.schoolWebsite} required={false}>
                                                    <Input id="schoolWebsite" type="url" value={formData.schoolWebsite}
                                                        onChange={(e) => updateField('schoolWebsite', e.target.value)}
                                                        placeholder={t('applySchool.placeholders.schoolWebsite')} className={inputClass(false)} />
                                                </FieldWrapper>

                                                <FieldWrapper id="schoolPhone" label={t('applySchool.labels.schoolPhone')} icon={Phone} error={errors.schoolPhone} required={false}>
                                                    <Input id="schoolPhone" type="tel" value={formData.schoolPhone}
                                                        onChange={(e) => updateField('schoolPhone', e.target.value)}
                                                        placeholder={t('applySchool.placeholders.schoolPhone')} className={inputClass(false)} />
                                                </FieldWrapper>
                                            </div>
                                        </div>
                                    )}

                                    {/* ══════ STEP 2 — Applicant Info ══════ */}
                                    {currentStep === 2 && (
                                        <div className="p-6 sm:p-8 space-y-6">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                                    <User className="h-5 w-5 text-blue-500" />
                                                </div>
                                                <div>
                                                    <h2 className="text-xl font-bold text-slate-900">{t('applySchool.step2.title')}</h2>
                                                    <p className="text-sm text-slate-400">{t('applySchool.step2.subtitle')}</p>
                                                </div>
                                            </div>

                                            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                                                <HelpCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                                <p className="text-sm text-blue-700">{t('applySchool.step2.notice')}</p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <FieldWrapper id="applicantFullName" label={t('applySchool.labels.applicantFullName')} icon={User} error={errors.applicantFullName}>
                                                    <Input id="applicantFullName" type="text" value={formData.applicantFullName}
                                                        onChange={(e) => updateField('applicantFullName', e.target.value)}
                                                        placeholder={t('applySchool.placeholders.applicantFullName')} className={inputClass(!!errors.applicantFullName)} />
                                                </FieldWrapper>

                                                <FieldWrapper id="applicantRole" label={t('applySchool.labels.applicantRole')} icon={Briefcase} error={errors.applicantRole}>
                                                    <Select value={formData.applicantRole} onValueChange={(v) => updateField('applicantRole', v)}>
                                                        <SelectTrigger className={selectTriggerClass(!!errors.applicantRole)}>
                                                            <SelectValue placeholder={t('applySchool.placeholders.applicantRole')} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="mudur">{t('applySchool.roles.mudur')}</SelectItem>
                                                            <SelectItem value="mudur_yardimcisi">{t('applySchool.roles.mudur_yardimcisi')}</SelectItem>
                                                            <SelectItem value="ogretmen">{t('applySchool.roles.ogretmen')}</SelectItem>
                                                            <SelectItem value="okul_aile_birligi">{t('applySchool.roles.okul_aile_birligi')}</SelectItem>
                                                            <SelectItem value="idari_personel">{t('applySchool.roles.idari_personel')}</SelectItem>
                                                            <SelectItem value="diger">{t('applySchool.roles.diger')}</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FieldWrapper>

                                                <FieldWrapper id="applicantTitle" label={t('applySchool.labels.applicantTitle')} icon={Briefcase} error={errors.applicantTitle} required={false}>
                                                    <Input id="applicantTitle" type="text" value={formData.applicantTitle}
                                                        onChange={(e) => updateField('applicantTitle', e.target.value)}
                                                        placeholder={t('applySchool.placeholders.applicantTitle')} className={inputClass(false)} />
                                                </FieldWrapper>

                                                <FieldWrapper id="applicantEmail" label={t('applySchool.labels.applicantEmail')} icon={Mail} error={errors.applicantEmail}>
                                                    <Input id="applicantEmail" type="email" value={formData.applicantEmail}
                                                        onChange={(e) => updateField('applicantEmail', e.target.value)}
                                                        placeholder={t('applySchool.placeholders.applicantEmail')} className={inputClass(!!errors.applicantEmail)} />
                                                </FieldWrapper>

                                                <FieldWrapper id="applicantPhone" label={t('applySchool.labels.applicantPhone')} icon={Phone} error={errors.applicantPhone} required={false}>
                                                    <Input id="applicantPhone" type="tel" value={formData.applicantPhone}
                                                        onChange={(e) => updateField('applicantPhone', e.target.value)}
                                                        placeholder="+90 5XX XXX XX XX" className={inputClass(false)} />
                                                </FieldWrapper>
                                            </div>
                                        </div>
                                    )}

                                    {/* ══════ STEP 3 — Project Details ══════ */}
                                    {currentStep === 3 && (
                                        <div className="p-6 sm:p-8 space-y-6">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                                                    <FileText className="h-5 w-5 text-purple-500" />
                                                </div>
                                                <div>
                                                    <h2 className="text-xl font-bold text-slate-900">{t('applySchool.step3.title')}</h2>
                                                    <p className="text-sm text-slate-400">{t('applySchool.step3.subtitle')}</p>
                                                </div>
                                            </div>

                                            <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
                                                <HelpCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                                <div className="text-sm text-amber-700 leading-relaxed">
                                                    <p className="font-medium mb-1">{t('applySchool.tips.title')}</p>
                                                    <ul className="list-disc list-inside space-y-1 text-amber-600">
                                                        <li>{t('applySchool.tips.tip1')}</li>
                                                        <li>{t('applySchool.tips.tip2')}</li>
                                                        <li>{t('applySchool.tips.tip3')}</li>
                                                        <li>{t('applySchool.tips.tip4')}</li>
                                                    </ul>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <FieldWrapper id="projectTitle" label={t('applySchool.labels.projectTitle')} icon={BookOpen} error={errors.projectTitle}>
                                                    <Input id="projectTitle" type="text" value={formData.projectTitle}
                                                        onChange={(e) => updateField('projectTitle', e.target.value)}
                                                        placeholder={t('applySchool.placeholders.projectTitle')} className={inputClass(!!errors.projectTitle)} />
                                                </FieldWrapper>

                                                <FieldWrapper id="projectCategory" label={t('applySchool.labels.projectCategory')} icon={Hash} error={errors.projectCategory}>
                                                    <Select value={formData.projectCategory} onValueChange={(v) => updateField('projectCategory', v)}>
                                                        <SelectTrigger className={selectTriggerClass(!!errors.projectCategory)}>
                                                            <SelectValue placeholder={t('applySchool.placeholders.projectCategory')} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="laboratuvar">{t('applySchool.categories.laboratuvar')}</SelectItem>
                                                            <SelectItem value="kutuphane">{t('applySchool.categories.kutuphane')}</SelectItem>
                                                            <SelectItem value="teknoloji">{t('applySchool.categories.teknoloji')}</SelectItem>
                                                            <SelectItem value="spor">{t('applySchool.categories.spor')}</SelectItem>
                                                            <SelectItem value="sanat">{t('applySchool.categories.sanat')}</SelectItem>
                                                            <SelectItem value="altyapi">{t('applySchool.categories.altyapi')}</SelectItem>
                                                            <SelectItem value="malzeme">{t('applySchool.categories.malzeme')}</SelectItem>
                                                            <SelectItem value="diger">{t('applySchool.categories.diger')}</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FieldWrapper>

                                                <FieldWrapper id="targetAmount" label={t('applySchool.labels.targetAmount')} icon={DollarSign} error={errors.targetAmount}>
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">$</span>
                                                        <Input id="targetAmount" type="number" min={1} value={formData.targetAmount}
                                                            onChange={(e) => updateField('targetAmount', e.target.value)}
                                                            placeholder={t('applySchool.placeholders.targetAmount')} className={`${inputClass(!!errors.targetAmount)} pl-8`} />
                                                    </div>
                                                </FieldWrapper>

                                                <FieldWrapper id="beneficiaryCount" label={t('applySchool.labels.beneficiaryCount')} icon={Users} error={errors.beneficiaryCount}>
                                                    <Input id="beneficiaryCount" type="number" min={1} value={formData.beneficiaryCount}
                                                        onChange={(e) => updateField('beneficiaryCount', e.target.value)}
                                                        placeholder={t('applySchool.placeholders.beneficiaryCount')} className={inputClass(!!errors.beneficiaryCount)} />
                                                </FieldWrapper>
                                            </div>

                                            {/* Description */}
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <Label htmlFor="needSummary" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                                        <FileText className="h-4 w-4 text-slate-400" />
                                                        {t('applySchool.labels.needSummary')}
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
                                                    onChange={(e) => updateField('needSummary', e.target.value)}
                                                    placeholder={t('applySchool.placeholders.needSummary')}
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
                                        </div>
                                    )}

                                    {/* ══════ STEP 4 — Media & Documents ══════ */}
                                    {currentStep === 4 && (
                                        <div className="p-6 sm:p-8 space-y-8">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                                    <Upload className="h-5 w-5 text-indigo-500" />
                                                </div>
                                                <div>
                                                    <h2 className="text-xl font-bold text-slate-900">{t('applySchool.step4.title')}</h2>
                                                    <p className="text-sm text-slate-400">{t('applySchool.step4.subtitle')}</p>
                                                </div>
                                            </div>

                                            {/* ── Photo Upload ── */}
                                            <div className="space-y-3">
                                                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                                    <ImageIcon className="h-4 w-4 text-slate-400" />
                                                    {t('applySchool.photos.label')}
                                                </Label>
                                                <p className="text-xs text-slate-400">{t('applySchool.photos.hint')}</p>

                                                <div
                                                    onDragOver={(e) => { e.preventDefault(); setPhotoDragOver(true); }}
                                                    onDragLeave={() => setPhotoDragOver(false)}
                                                    onDrop={handlePhotoDrop}
                                                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300 ${photoDragOver ? 'border-amber-400 bg-amber-50/50' : 'border-slate-200 hover:border-slate-300'}`}
                                                >
                                                    <ImageIcon className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                                                    <p className="text-sm text-slate-500 mb-2">{t('applySchool.photos.dropText')}</p>
                                                    <Button type="button" variant="outline" onClick={() => photoInputRef.current?.click()} className="rounded-xl text-sm">
                                                        {t('applySchool.photos.selectBtn')}
                                                    </Button>
                                                    <input
                                                        ref={photoInputRef}
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/jpeg,image/png,image/webp"
                                                        multiple
                                                        onChange={handlePhotoSelect}
                                                    />
                                                    <p className="text-xs text-slate-400 mt-2">JPG, PNG, WebP • Max 5 MB • {t('applySchool.photos.maxCount')}</p>
                                                </div>

                                                {photos.length > 0 && (
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                        {photos.map((photo) => (
                                                            <div key={photo.id} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-[4/3]">
                                                                <img src={photo.preview} alt={photo.name} className="w-full h-full object-cover" />
                                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200" />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemovePhoto(photo.id)}
                                                                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500/80 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </button>
                                                                <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-2 py-1 truncate">{photo.name}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* ── Video Upload ── */}
                                            <div className="space-y-3">
                                                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                                    <Video className="h-4 w-4 text-slate-400" />
                                                    {t('applySchool.video.label')}
                                                </Label>
                                                <p className="text-xs text-slate-400">{t('applySchool.video.hint')}</p>

                                                {!video ? (
                                                    <div className="border-2 border-dashed rounded-2xl p-6 text-center border-slate-200 hover:border-slate-300 transition-all duration-300">
                                                        <Video className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                                                        <p className="text-sm text-slate-500 mb-2">{t('applySchool.video.dropText')}</p>
                                                        <Button type="button" variant="outline" onClick={() => videoInputRef.current?.click()} className="rounded-xl text-sm">
                                                            {t('applySchool.video.selectBtn')}
                                                        </Button>
                                                        <input
                                                            ref={videoInputRef}
                                                            type="file"
                                                            className="hidden"
                                                            accept="video/mp4,video/webm,video/quicktime"
                                                            onChange={handleVideoSelect}
                                                        />
                                                        <p className="text-xs text-slate-400 mt-2">MP4, WebM • Max 50 MB</p>
                                                    </div>
                                                ) : (
                                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className="flex items-center gap-3">
                                                                <Video className="h-5 w-5 text-indigo-500" />
                                                                <div>
                                                                    <p className="text-sm font-medium text-slate-700">{video.name}</p>
                                                                    <p className="text-xs text-slate-400">{(video.size / (1024 * 1024)).toFixed(1)} MB</p>
                                                                </div>
                                                            </div>
                                                            <button onClick={removeVideo} className="text-slate-400 hover:text-red-500 transition-colors">
                                                                <X className="h-5 w-5" />
                                                            </button>
                                                        </div>
                                                        <video src={video.preview} controls className="w-full rounded-lg max-h-60" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* ── Document Upload ── */}
                                            <div className="space-y-3">
                                                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-slate-400" />
                                                    {t('applySchool.documents.label')}
                                                </Label>

                                                <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 text-sm text-amber-700">
                                                    <p className="font-medium mb-1">{t('applySchool.docTips.title')}</p>
                                                    <ul className="list-disc list-inside space-y-1 text-amber-600">
                                                        <li>{t('applySchool.docTips.tip1')}</li>
                                                        <li>{t('applySchool.docTips.tip2')}</li>
                                                        <li>{t('applySchool.docTips.tip3')}</li>
                                                    </ul>
                                                </div>

                                                <div
                                                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                                    onDragLeave={() => setDragOver(false)}
                                                    onDrop={handleDrop}
                                                    className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${dragOver ? 'border-amber-400 bg-amber-50/50' : 'border-slate-200 hover:border-slate-300'}`}
                                                >
                                                    <Upload className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                                                    <p className="text-sm text-slate-500 mb-3">{t('applySchool.docUploadText')}</p>
                                                    <Button variant="outline" onClick={handleAddDocumentClick} className="rounded-xl">
                                                        {t('applySchool.docSelectFile')}
                                                    </Button>
                                                    <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileSelect} />
                                                    <p className="text-xs text-slate-400 mt-2">PDF, JPG, PNG • Max 10 MB</p>
                                                </div>

                                                {documents.length > 0 && (
                                                    <div className="space-y-2">
                                                        {documents.map((doc) => (
                                                            <div key={doc.id} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                                                                <div className="flex items-center gap-3">
                                                                    <FileText className="h-5 w-5 text-amber-500" />
                                                                    <div>
                                                                        <p className="text-sm font-medium text-slate-700">{doc.name}</p>
                                                                        <p className="text-xs text-slate-400">{(doc.size / 1024).toFixed(1)} KB</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    {doc.status === 'uploading' && <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />}
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
                                        </div>
                                    )}

                                    {/* ══════ STEP 5 — Review ══════ */}
                                    {currentStep === 5 && (
                                        <div className="p-6 sm:p-8 space-y-6">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                                                </div>
                                                <div>
                                                    <h2 className="text-xl font-bold text-slate-900">{t('applySchool.step5.title')}</h2>
                                                    <p className="text-sm text-slate-400">{t('applySchool.step5.subtitle')}</p>
                                                </div>
                                            </div>

                                            {/* School Info Summary */}
                                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-3">
                                                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                                    <School className="h-4 w-4 text-amber-500" />
                                                    {t('applySchool.step1.title')}
                                                </h3>
                                                <div className="grid grid-cols-2 gap-3 text-sm">
                                                    <div><span className="text-slate-400">{t('applySchool.labels.schoolName')}:</span> <span className="text-slate-700 font-medium">{formData.schoolName}</span></div>
                                                    <div><span className="text-slate-400">{t('applySchool.labels.schoolType')}:</span> <span className="text-slate-700 font-medium">{formData.schoolType && t(`applySchool.schoolTypes.${formData.schoolType}`)}</span></div>
                                                    <div><span className="text-slate-400">{t('applySchool.labels.schoolCity')}:</span> <span className="text-slate-700 font-medium">{formData.schoolCity}</span></div>
                                                    <div><span className="text-slate-400">{t('applySchool.labels.schoolDistrict')}:</span> <span className="text-slate-700 font-medium">{formData.schoolDistrict}</span></div>
                                                    <div><span className="text-slate-400">{t('applySchool.labels.studentTotal')}:</span> <span className="text-slate-700 font-medium">{formData.studentTotal}</span></div>
                                                </div>
                                            </div>

                                            {/* Applicant Info Summary */}
                                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-3">
                                                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                                    <User className="h-4 w-4 text-blue-500" />
                                                    {t('applySchool.step2.title')}
                                                </h3>
                                                <div className="grid grid-cols-2 gap-3 text-sm">
                                                    <div><span className="text-slate-400">{t('applySchool.labels.applicantFullName')}:</span> <span className="text-slate-700 font-medium">{formData.applicantFullName}</span></div>
                                                    <div><span className="text-slate-400">{t('applySchool.labels.applicantRole')}:</span> <span className="text-slate-700 font-medium">{formData.applicantRole && t(`applySchool.roles.${formData.applicantRole}`)}</span></div>
                                                    <div><span className="text-slate-400">{t('applySchool.labels.applicantEmail')}:</span> <span className="text-slate-700 font-medium">{formData.applicantEmail}</span></div>
                                                    {formData.applicantPhone && (
                                                        <div><span className="text-slate-400">{t('applySchool.labels.applicantPhone')}:</span> <span className="text-slate-700 font-medium">{formData.applicantPhone}</span></div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Project Summary */}
                                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-3">
                                                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-purple-500" />
                                                    {t('applySchool.step3.title')}
                                                </h3>
                                                <div className="grid grid-cols-2 gap-3 text-sm">
                                                    <div><span className="text-slate-400">{t('applySchool.labels.projectTitle')}:</span> <span className="text-slate-700 font-medium">{formData.projectTitle}</span></div>
                                                    <div><span className="text-slate-400">{t('applySchool.labels.projectCategory')}:</span> <span className="text-slate-700 font-medium">{formData.projectCategory && t(`applySchool.categories.${formData.projectCategory}`)}</span></div>
                                                    <div><span className="text-slate-400">{t('applySchool.labels.targetAmount')}:</span> <span className="text-slate-700 font-medium">${formData.targetAmount}</span></div>
                                                    <div><span className="text-slate-400">{t('applySchool.labels.beneficiaryCount')}:</span> <span className="text-slate-700 font-medium">{formData.beneficiaryCount}</span></div>
                                                </div>
                                                <div className="text-sm mt-2">
                                                    <span className="text-slate-400 block mb-1">{t('applySchool.labels.needSummary')}:</span>
                                                    <p className="text-slate-700 bg-white p-3 rounded-lg border border-slate-100 whitespace-pre-wrap">{formData.needSummary}</p>
                                                </div>
                                            </div>

                                            {/* Media Summary */}
                                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-3">
                                                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                                    <Upload className="h-4 w-4 text-indigo-500" />
                                                    {t('applySchool.step4.title')}
                                                </h3>
                                                <div className="text-sm text-slate-600 space-y-1">
                                                    <p>{t('applySchool.review.photos')}: <span className="font-medium">{photos.length}</span></p>
                                                    <p>{t('applySchool.review.video')}: <span className="font-medium">{video ? t('applySchool.review.yes') : t('applySchool.review.no')}</span></p>
                                                    <p>{t('applySchool.review.documents')}: <span className="font-medium">{documents.length}</span></p>
                                                </div>
                                            </div>

                                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                                                <Shield className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                                <p className="text-sm text-amber-800">{t('applySchool.review.notice')}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Navigation Buttons */}
                                    <div className="p-6 sm:p-8 border-t border-slate-100 flex justify-between">
                                        {currentStep > 1 ? (
                                            <Button variant="outline" onClick={prevStep} className="rounded-xl gap-2">
                                                <ArrowLeft className="h-4 w-4" /> {t('applySchool.prev')}
                                            </Button>
                                        ) : (
                                            <Button variant="outline" onClick={() => router.push('/apply')} className="rounded-xl gap-2">
                                                <ArrowLeft className="h-4 w-4" /> {t('applySchool.back')}
                                            </Button>
                                        )}

                                        {currentStep < 5 ? (
                                            <Button onClick={nextStep} className="bg-amber-600 hover:bg-amber-700 rounded-xl gap-2">
                                                {t('applySchool.next')} <ArrowRight className="h-4 w-4" />
                                            </Button>
                                        ) : (
                                            <Button onClick={handleSubmit} disabled={loading} className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 rounded-xl gap-2 px-8">
                                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                                                {loading ? t('applySchool.submitting') : t('applySchool.submit')}
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
                                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                                            <Shield className="h-5 w-5 text-amber-500" />
                                        </div>
                                        <h3 className="font-bold text-slate-900">{t('applySchool.sidebar.title')}</h3>
                                    </div>
                                    <ul className="space-y-3">
                                        <li className="flex items-start gap-2 text-sm text-slate-600">
                                            <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                            <span>{t('applySchool.sidebar.point1')}</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-slate-600">
                                            <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                            <span>{t('applySchool.sidebar.point2')}</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-slate-600">
                                            <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                            <span>{t('applySchool.sidebar.point3')}</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-slate-600">
                                            <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                            <span>{t('applySchool.sidebar.point4')}</span>
                                        </li>
                                    </ul>
                                </div>

                                {/* School Campaign Banner */}
                                <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white">
                                    <School className="h-8 w-8 mb-3 text-amber-200" />
                                    <h3 className="font-bold text-lg mb-2">{t('applySchool.sidebar.bannerTitle')}</h3>
                                    <p className="text-amber-100 text-sm leading-relaxed">{t('applySchool.sidebar.bannerDesc')}</p>
                                </div>

                                {/* Progress */}
                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                    <h3 className="font-bold text-slate-900 mb-4">{t('applySchool.sidebar.progressTitle')}</h3>
                                    <div className="space-y-3">
                                        {STEPS.map((step) => {
                                            const isActive = currentStep === step.id;
                                            const isDone = currentStep > step.id;
                                            return (
                                                <div key={step.id} className="flex items-center gap-3">
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isDone ? 'bg-emerald-100 text-emerald-600' : isActive ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                                                        {isDone ? <CheckCircle className="h-4 w-4" /> : step.id}
                                                    </div>
                                                    <span className={`text-sm ${isDone ? 'text-emerald-600 font-medium' : isActive ? 'text-amber-600 font-medium' : 'text-slate-400'}`}>
                                                        {step.label}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
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
