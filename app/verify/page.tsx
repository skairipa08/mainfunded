'use client';

import { useState, useEffect, Suspense, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useTranslation } from '@/lib/i18n';
import {
    TIER_CONFIG,
    isEducationalEmail,
    getTierBadgeInfo
} from '@/lib/verification/tiers';
import type { VerificationTier } from '@/types/verification';
import {
    X, Upload, FileText, CheckCircle2, AlertCircle,
    ShieldCheck, Shield, Mail, GraduationCap, User,
    FileUp, ClipboardCheck, ChevronRight, ChevronLeft,
    Building2, MapPin, Calendar, Phone, BookOpen, Star
} from 'lucide-react';

// Multi-step form stages
type FormStep = 'tier-select' | 'personal-info' | 'education-info' | 'documents' | 'review';

interface FormData {
    tierRequested: VerificationTier;
    institutionEmail: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    phone: string;
    country: string;
    city: string;
    institutionName: string;
    institutionCountry: string;
    institutionType: 'university' | 'college' | 'vocational' | 'high_school';
    studentId: string;
    enrollmentYear: number;
    expectedGraduation: number;
    degreeProgram: string;
    degreeLevel: 'bachelor' | 'master' | 'phd' | 'associate' | 'certificate';
    isFullTime: boolean;
    financialNeedStatement: string;
}

const initialFormData: FormData = {
    tierRequested: 1,
    institutionEmail: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phone: '',
    country: '',
    city: '',
    institutionName: '',
    institutionCountry: '',
    institutionType: 'university',
    studentId: '',
    enrollmentYear: new Date().getFullYear(),
    expectedGraduation: new Date().getFullYear() + 4,
    degreeProgram: '',
    degreeLevel: 'bachelor',
    isFullTime: true,
    financialNeedStatement: '',
};

// File upload
const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

interface UploadedFile {
    file: File;
    status: 'queued' | 'uploading' | 'uploaded' | 'error';
    error?: string;
}

// Step Icons
const STEP_ICONS: Record<FormStep, React.ElementType> = {
    'tier-select': Shield,
    'personal-info': User,
    'education-info': GraduationCap,
    'documents': FileUp,
    'review': ClipboardCheck,
};

// Documents Upload Component
function DocumentsUploadStep({ tierRequested, t }: { tierRequested: number; t: (key: string) => string }) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [dragActive, setDragActive] = useState(false);

    const validateFile = (file: File): string | null => {
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            return `Gecersiz dosya turu. Izin verilen: ${ALLOWED_EXTENSIONS.join(', ')}`;
        }
        if (file.size > MAX_FILE_SIZE) {
            return 'Dosya cok buyuk. Maksimum: 10MB';
        }
        return null;
    };

    const handleFiles = useCallback((fileList: FileList | null) => {
        if (!fileList) return;
        const newFiles: UploadedFile[] = [];
        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            const error = validateFile(file);
            newFiles.push({ file, status: error ? 'error' : 'queued', error: error || undefined });
        }
        setFiles(prev => [...prev, ...newFiles]);
    }, []);

    const handleButtonClick = () => fileInputRef.current?.click();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(e.type === 'dragenter' || e.type === 'dragover');
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        handleFiles(e.dataTransfer.files);
    };

    const removeFile = (index: number) => setFiles(prev => prev.filter((_, i) => i !== index));

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="space-y-6">
            <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-amber-900 mb-2">
                            {t('verification.documentGuidance') || 'Belgeler okunakli, tam kadraj ve guncel olmali.'}
                        </h4>
                        <p className="text-sm text-amber-700 mb-3">
                            {t('verification.documentMaskingHint') || 'Gerekli olmayan hassas bilgileri kapatabilirsin.'}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div className="flex items-center gap-2 text-sm text-amber-800">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                {t('verification.acceptedDocs.enrollment') || 'Ogrenci belgesi / Kayit belgesi'}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-amber-800">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                {t('verification.acceptedDocs.studentId') || 'Ogrenci kimligi'}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-amber-800">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                {t('verification.acceptedDocs.transcript') || 'Transkript'}
                            </div>
                            {tierRequested >= 2 && (
                                <div className="flex items-center gap-2 text-sm text-amber-800">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                    {t('verification.acceptedDocs.portalScreenshot') || 'Okul portali ekran goruntusu'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ALLOWED_EXTENSIONS.join(',')}
                onChange={handleFileChange}
                className="hidden"
            />

            <div
                className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer group ${dragActive
                    ? 'border-emerald-500 bg-emerald-50 scale-[1.01]'
                    : 'border-gray-300 hover:border-emerald-400 hover:bg-emerald-50/30'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={handleButtonClick}
            >
                <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center transition-colors ${dragActive ? 'bg-emerald-100' : 'bg-gray-100 group-hover:bg-emerald-100'}`}>
                    <Upload className={`w-8 h-8 transition-colors ${dragActive ? 'text-emerald-600' : 'text-gray-400 group-hover:text-emerald-500'}`} />
                </div>
                <p className="text-gray-700 font-medium mb-1">
                    {t('verification.dragDrop') || 'Surukle birak veya dosya sec'}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                    {t('verification.fileTypes') || 'PDF, JPG, PNG (max 10MB)'}
                </p>
                <Button type="button" variant="outline" size="sm" className="pointer-events-none">
                    <Upload className="w-4 h-4 mr-2" />
                    {t('verification.form.uploadDocuments') || 'Belgeleri Yukle'}
                </Button>
            </div>

            {files.length > 0 && (
                <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        {t('verification.selectedFiles') || 'Secilen Dosyalar'} ({files.length})
                    </h4>
                    <div className="space-y-2">
                        {files.map((uploadedFile, index) => (
                            <div
                                key={index}
                                className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${uploadedFile.status === 'error'
                                    ? 'bg-red-50 border-red-200'
                                    : uploadedFile.status === 'uploaded'
                                        ? 'bg-emerald-50 border-emerald-200'
                                        : 'bg-white border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className={`p-2 rounded-lg ${uploadedFile.status === 'error' ? 'bg-red-100' : 'bg-gray-100'}`}>
                                    <FileText className={`w-4 h-4 ${uploadedFile.status === 'error' ? 'text-red-500' : 'text-gray-500'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{uploadedFile.file.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {formatFileSize(uploadedFile.file.size)}
                                        {uploadedFile.error && (
                                            <span className="text-red-600 ml-2">- {uploadedFile.error}</span>
                                        )}
                                    </p>
                                </div>
                                {uploadedFile.status === 'queued' && (
                                    <span className="text-xs text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full font-medium">Hazir</span>
                                )}
                                {uploadedFile.status === 'uploaded' && (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                )}
                                {uploadedFile.status === 'error' && (
                                    <AlertCircle className="w-5 h-5 text-red-500" />
                                )}
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                                    className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                                >
                                    <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <p className="text-sm text-gray-500 text-center flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" />
                {t('verification.documentsNote') || 'Belgeler sadece dogrulama icin kullanilir ve guvenli sekilde saklanir.'}
            </p>
        </div>
    );
}

// Main Component
function VerifyPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session, status } = useSession();
    const { t } = useTranslation();

    const isPreviewMode = searchParams.get('preview') === 'true';

    const [currentStep, setCurrentStep] = useState<FormStep>('tier-select');
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [loading, setLoading] = useState(false);
    const [existingVerification, setExistingVerification] = useState<any>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!isPreviewMode && status === 'unauthenticated') {
            router.replace('/login?callbackUrl=/verify');
        }
    }, [status, router, isPreviewMode]);

    useEffect(() => {
        if (session?.user) {
            fetch('/api/verification')
                .then(res => res.json())
                .then(data => {
                    if (data.verification) setExistingVerification(data.verification);
                })
                .catch(console.error);
        }
    }, [session]);

    const steps: { id: FormStep; title: string; shortTitle: string }[] = [
        { id: 'tier-select', title: t('verification.steps.tierSelect') || 'Dogrulama Seviyesi Secin', shortTitle: 'Seviye' },
        { id: 'personal-info', title: t('verification.steps.personalInfo') || 'Kisisel Bilgiler', shortTitle: 'Kisisel' },
        { id: 'education-info', title: t('verification.steps.educationInfo') || 'Egitim Bilgileri', shortTitle: 'Egitim' },
        { id: 'documents', title: t('verification.steps.documents') || 'Belge Yukle', shortTitle: 'Belgeler' },
        { id: 'review', title: t('verification.steps.review') || 'Incele ve Gonder', shortTitle: 'Gonder' },
    ];

    const currentStepIndex = steps.findIndex(s => s.id === currentStep);

    const validateCurrentStep = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (currentStep === 'personal-info') {
            if (!formData.firstName.trim()) newErrors.firstName = 'Ad zorunludur';
            if (!formData.lastName.trim()) newErrors.lastName = 'Soyad zorunludur';
            if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Dogum tarihi zorunludur';
            if (!formData.phone.trim()) newErrors.phone = 'Telefon zorunludur';
            if (!formData.country.trim()) newErrors.country = 'Ulke zorunludur';
        }

        if (currentStep === 'education-info') {
            if (!formData.institutionName.trim()) newErrors.institutionName = 'Kurum adi zorunludur';
            if (!formData.institutionCountry.trim()) newErrors.institutionCountry = 'Kurum ulkesi zorunludur';
            if (!formData.degreeProgram.trim()) newErrors.degreeProgram = 'Bolum zorunludur';
        }

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            toast.error('Lutfen zorunlu alanlari doldurun');
            return false;
        }
        return true;
    };

    const nextStep = () => {
        if (!validateCurrentStep()) return;
        const nextIndex = currentStepIndex + 1;
        if (nextIndex < steps.length) {
            setCurrentStep(steps[nextIndex].id);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const prevStep = () => {
        const prevIndex = currentStepIndex - 1;
        if (prevIndex >= 0) {
            setErrors({});
            setCurrentStep(steps[prevIndex].id);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const goToStep = (stepIndex: number) => {
        if (stepIndex <= currentStepIndex) {
            setErrors({});
            setCurrentStep(steps[stepIndex].id);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tier_requested: formData.tierRequested,
                    institution_email: formData.institutionEmail,
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    date_of_birth: formData.dateOfBirth,
                    phone: formData.phone,
                    country: formData.country,
                    city: formData.city,
                    institution_name: formData.institutionName,
                    institution_country: formData.institutionCountry,
                    institution_type: formData.institutionType,
                    student_id: formData.studentId,
                    enrollment_year: formData.enrollmentYear,
                    expected_graduation: formData.expectedGraduation,
                    degree_program: formData.degreeProgram,
                    degree_level: formData.degreeLevel,
                    is_full_time: formData.isFullTime,
                    financial_need_statement: formData.financialNeedStatement,
                }),
            });

            if (!response.ok) throw new Error('Failed to submit verification');

            const data = await response.json();
            toast.success(t('verification.submitSuccess') || 'Dogrulama basvurusu basariyla gonderildi!');
            router.push(`/verify/status?id=${data.verification.verification_id}`);
        } catch (error) {
            console.error('Verification error:', error);
            toast.error(t('verification.submitError') || 'Basvuru gonderilemedi. Lutfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    // Already verified
    if (existingVerification && existingVerification.status !== 'REJECTED') {
        return (
            <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
                <Navbar />
                <main className="flex-grow flex items-center justify-center px-4">
                    <div className="max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl border border-gray-100 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200">
                            <ShieldCheck className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            {t('verification.alreadySubmitted') || 'Basvuru Zaten Gonderildi'}
                        </h2>
                        <p className="text-gray-600 mb-6">
                            {t('verification.checkStatus') || 'Dogrulama durumunuzu kontrol edin.'}
                        </p>
                        <Button
                            onClick={() => router.push(`/verify/status?id=${existingVerification.verification_id}`)}
                            className="bg-emerald-600 hover:bg-emerald-700 w-full"
                            size="lg"
                        >
                            {t('verification.viewStatus') || 'Durumu Goruntule'}
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Yukleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
            <Navbar />
            <main className="flex-grow">
                {/* Hero Header */}
                <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 text-white py-10 px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <ShieldCheck className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-3">
                            {t('verification.title') || 'Ogrenci Dogrulamasi'}
                        </h1>
                        <p className="text-emerald-100 text-lg max-w-xl mx-auto">
                            {t('verification.subtitle') || 'Bagiscilarin guvenini artirmak icin dogrulama seviyeni sec ve gerekli belgeleri yukle.'}
                        </p>
                    </div>
                </div>

                {/* Step Indicator */}
                <div className="max-w-3xl mx-auto px-4 -mt-6">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
                        <div className="flex items-center justify-between">
                            {steps.map((step, index) => {
                                const Icon = STEP_ICONS[step.id];
                                const isActive = index === currentStepIndex;
                                const isCompleted = index < currentStepIndex;
                                const isClickable = index <= currentStepIndex;

                                return (
                                    <div key={step.id} className="flex items-center flex-1 last:flex-initial">
                                        <button
                                            onClick={() => isClickable && goToStep(index)}
                                            className={`flex flex-col items-center gap-1.5 transition-all ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
                                        >
                                            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${isActive
                                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 scale-110'
                                                : isCompleted
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-gray-100 text-gray-400'
                                                }`}>
                                                {isCompleted ? (
                                                    <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
                                                ) : (
                                                    <Icon className="w-5 h-5 md:w-6 md:h-6" />
                                                )}
                                            </div>
                                            <span className={`text-xs font-medium hidden sm:block ${isActive ? 'text-emerald-700' : isCompleted ? 'text-emerald-600' : 'text-gray-400'}`}>
                                                {step.shortTitle}
                                            </span>
                                        </button>

                                        {index < steps.length - 1 && (
                                            <div className="flex-1 mx-2 md:mx-3">
                                                <div className={`h-1 rounded-full transition-all duration-500 ${index < currentStepIndex ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Form Body */}
                <div className="max-w-3xl mx-auto px-4 py-8">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        {/* Step Header */}
                        <div className="px-6 md:px-8 pt-6 md:pt-8 pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                {(() => {
                                    const Icon = STEP_ICONS[currentStep];
                                    return (
                                        <div className="p-2.5 bg-emerald-100 rounded-xl">
                                            <Icon className="w-5 h-5 text-emerald-700" />
                                        </div>
                                    );
                                })()}
                                <div>
                                    <p className="text-sm text-emerald-600 font-medium">Adim {currentStepIndex + 1} / {steps.length}</p>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        {steps[currentStepIndex].title}
                                    </h2>
                                </div>
                            </div>
                        </div>

                        {/* Step Content */}
                        <div className="px-6 md:px-8 py-6 md:py-8">

                            {/* Step 1: Tier Selection */}
                            {currentStep === 'tier-select' && (
                                <div className="space-y-5">
                                    <p className="text-gray-600">
                                        {t('verification.tierSelectDescription') || 'Daha yuksek seviye = daha yuksek guven. Seviye arttikca ek kanit istenebilir.'}
                                    </p>

                                    <div className="space-y-4">
                                        {TIER_CONFIG.filter(tier => tier.tier >= 1 && tier.tier <= 2).map((tier) => {
                                            const isSelected = formData.tierRequested === tier.tier;
                                            const tierNames: Record<number, string> = {
                                                1: t('verification.tiers.tier1.name') || 'Belge ile Dogrulama',
                                                2: t('verification.tiers.tier2.name') || 'Yuksek Guven',
                                            };
                                            const tierDescs: Record<number, string> = {
                                                1: t('verification.tiers.tier1.description') || 'Ogrenci belgesi veya kayit belgesi yukleyerek dogrula.',
                                                2: t('verification.tiers.tier2.description') || 'Belge + okul portali ekran goruntusu ile dogrula.',
                                            };
                                            const tierReqs: Record<number, string> = {
                                                1: t('verification.tiers.tier1.subtext') || 'Gerekli: Ogrenci belgesi',
                                                2: t('verification.tiers.tier2.subtext') || 'Gerekli: Ogrenci belgesi, Portal ekran goruntusu',
                                            };

                                            return (
                                                <div
                                                    key={tier.tier}
                                                    onClick={() => setFormData({ ...formData, tierRequested: tier.tier as VerificationTier })}
                                                    className={`relative p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 group ${isSelected
                                                        ? 'border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-100'
                                                        : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <div className="flex items-start gap-4">
                                                        <div className={`p-3 rounded-xl transition-colors ${isSelected ? 'bg-emerald-100' : 'bg-gray-100 group-hover:bg-emerald-50'}`}>
                                                            {tier.tier === 1 ? (
                                                                <Shield className={`w-6 h-6 ${isSelected ? 'text-emerald-700' : 'text-gray-500'}`} />
                                                            ) : (
                                                                <ShieldCheck className={`w-6 h-6 ${isSelected ? 'text-emerald-700' : 'text-gray-500'}`} />
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${isSelected
                                                                    ? 'bg-emerald-600 text-white'
                                                                    : 'bg-gray-200 text-gray-700'}`}>
                                                                    Tier {tier.tier}
                                                                </span>
                                                                <h3 className="font-semibold text-gray-900">{tierNames[tier.tier]}</h3>
                                                            </div>
                                                            <p className="text-sm text-gray-600 mb-2">{tierDescs[tier.tier]}</p>
                                                            <p className="text-xs text-gray-500 flex items-center gap-1.5">
                                                                <FileText className="w-3.5 h-3.5" />
                                                                {tierReqs[tier.tier]}
                                                            </p>
                                                        </div>
                                                        {isSelected && (
                                                            <div className="absolute top-4 right-4">
                                                                <div className="w-7 h-7 bg-emerald-600 rounded-full flex items-center justify-center">
                                                                    <CheckCircle2 className="w-5 h-5 text-white" />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Tier 0 Email verification */}
                                    <div className="relative mt-6">
                                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                            <div className="w-full border-t border-gray-200" />
                                        </div>
                                        <div className="relative flex justify-center">
                                            <span className="bg-white px-3 text-sm text-gray-500">veya</span>
                                        </div>
                                    </div>

                                    <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <Mail className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-blue-900">
                                                    {t('verification.tier0Option') || 'Okul E-postasi ile Hizli Dogrulama'}
                                                </h4>
                                                <p className="text-sm text-blue-700 mt-1">
                                                    {t('verification.tier0Description') || 'Okul e-postaniza bir dogrulama baglantisi gondeririz.'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <Input
                                                type="email"
                                                placeholder="ogrenci@universite.edu.tr"
                                                value={formData.institutionEmail}
                                                onChange={(e) => setFormData({ ...formData, institutionEmail: e.target.value })}
                                                className="flex-1 bg-white"
                                            />
                                            {formData.institutionEmail && isEducationalEmail(formData.institutionEmail) && (
                                                <span className="text-emerald-600 flex items-center gap-1 text-sm font-medium whitespace-nowrap">
                                                    <CheckCircle2 className="w-4 h-4" /> Gecerli
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Personal Information */}
                            {currentStep === 'personal-info' && (
                                <div className="space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="firstName" className="flex items-center gap-1.5">
                                                <User className="w-3.5 h-3.5 text-gray-400" />
                                                {t('verification.form.firstName') || 'Ad'} <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="firstName"
                                                value={formData.firstName}
                                                onChange={(e) => { setFormData({ ...formData, firstName: e.target.value }); setErrors({ ...errors, firstName: '' }); }}
                                                className={errors.firstName ? 'border-red-300 focus:border-red-400' : ''}
                                                placeholder="Ahmet"
                                            />
                                            {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lastName" className="flex items-center gap-1.5">
                                                <User className="w-3.5 h-3.5 text-gray-400" />
                                                {t('verification.form.lastName') || 'Soyad'} <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="lastName"
                                                value={formData.lastName}
                                                onChange={(e) => { setFormData({ ...formData, lastName: e.target.value }); setErrors({ ...errors, lastName: '' }); }}
                                                className={errors.lastName ? 'border-red-300 focus:border-red-400' : ''}
                                                placeholder="Yilmaz"
                                            />
                                            {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="dateOfBirth" className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                            {t('verification.form.dateOfBirth') || 'Dogum Tarihi'} <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="dateOfBirth"
                                            type="date"
                                            value={formData.dateOfBirth}
                                            onChange={(e) => { setFormData({ ...formData, dateOfBirth: e.target.value }); setErrors({ ...errors, dateOfBirth: '' }); }}
                                            className={errors.dateOfBirth ? 'border-red-300 focus:border-red-400' : ''}
                                        />
                                        {errors.dateOfBirth && <p className="text-xs text-red-500">{errors.dateOfBirth}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="flex items-center gap-1.5">
                                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                                            {t('verification.form.phone') || 'Telefon Numarasi'} <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); setErrors({ ...errors, phone: '' }); }}
                                            className={errors.phone ? 'border-red-300 focus:border-red-400' : ''}
                                            placeholder="+90 5XX XXX XX XX"
                                        />
                                        {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="country" className="flex items-center gap-1.5">
                                                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                                {t('verification.form.country') || 'Ulke'} <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="country"
                                                value={formData.country}
                                                onChange={(e) => { setFormData({ ...formData, country: e.target.value }); setErrors({ ...errors, country: '' }); }}
                                                className={errors.country ? 'border-red-300 focus:border-red-400' : ''}
                                                placeholder="Turkiye"
                                            />
                                            {errors.country && <p className="text-xs text-red-500">{errors.country}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="city" className="flex items-center gap-1.5">
                                                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                                {t('verification.form.city') || 'Sehir'}
                                            </Label>
                                            <Input
                                                id="city"
                                                value={formData.city}
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                placeholder="Istanbul"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Education Information */}
                            {currentStep === 'education-info' && (
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="institutionName" className="flex items-center gap-1.5">
                                            <Building2 className="w-3.5 h-3.5 text-gray-400" />
                                            {t('verification.form.institution') || 'Kurum Adi'} <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="institutionName"
                                            value={formData.institutionName}
                                            onChange={(e) => { setFormData({ ...formData, institutionName: e.target.value }); setErrors({ ...errors, institutionName: '' }); }}
                                            className={errors.institutionName ? 'border-red-300 focus:border-red-400' : ''}
                                            placeholder="Or: Bogazici Universitesi"
                                        />
                                        {errors.institutionName && <p className="text-xs text-red-500">{errors.institutionName}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="institutionCountry" className="flex items-center gap-1.5">
                                                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                                {t('verification.form.institutionCountry') || 'Kurum Ulkesi'} <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="institutionCountry"
                                                value={formData.institutionCountry}
                                                onChange={(e) => { setFormData({ ...formData, institutionCountry: e.target.value }); setErrors({ ...errors, institutionCountry: '' }); }}
                                                className={errors.institutionCountry ? 'border-red-300 focus:border-red-400' : ''}
                                                placeholder="Turkiye"
                                            />
                                            {errors.institutionCountry && <p className="text-xs text-red-500">{errors.institutionCountry}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="institutionType" className="flex items-center gap-1.5">
                                                <Building2 className="w-3.5 h-3.5 text-gray-400" />
                                                {t('verification.form.institutionType') || 'Kurum Turu'} <span className="text-red-500">*</span>
                                            </Label>
                                            <Select
                                                value={formData.institutionType}
                                                onValueChange={(value: any) => setFormData({ ...formData, institutionType: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="university">{t('verification.form.institutionTypes.university') || 'Universite'}</SelectItem>
                                                    <SelectItem value="college">{t('verification.form.institutionTypes.college') || 'Yuksekokul'}</SelectItem>
                                                    <SelectItem value="vocational">{t('verification.form.institutionTypes.vocational') || 'Meslek Yuksekokulu'}</SelectItem>
                                                    <SelectItem value="high_school">{t('verification.form.institutionTypes.high_school') || 'Lise'}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="degreeProgram" className="flex items-center gap-1.5">
                                            <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                                            {t('verification.form.program') || 'Bolum'} <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="degreeProgram"
                                            value={formData.degreeProgram}
                                            onChange={(e) => { setFormData({ ...formData, degreeProgram: e.target.value }); setErrors({ ...errors, degreeProgram: '' }); }}
                                            className={errors.degreeProgram ? 'border-red-300 focus:border-red-400' : ''}
                                            placeholder="Or: Bilgisayar Muhendisligi"
                                        />
                                        {errors.degreeProgram && <p className="text-xs text-red-500">{errors.degreeProgram}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="degreeLevel" className="flex items-center gap-1.5">
                                                <Star className="w-3.5 h-3.5 text-gray-400" />
                                                {t('verification.form.degreeLevel') || 'Derece Seviyesi'} <span className="text-red-500">*</span>
                                            </Label>
                                            <Select
                                                value={formData.degreeLevel}
                                                onValueChange={(value: any) => setFormData({ ...formData, degreeLevel: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="associate">{t('verification.form.degreeLevels.associate') || 'On Lisans'}</SelectItem>
                                                    <SelectItem value="bachelor">{t('verification.form.degreeLevels.bachelor') || 'Lisans'}</SelectItem>
                                                    <SelectItem value="master">{t('verification.form.degreeLevels.master') || 'Yuksek Lisans'}</SelectItem>
                                                    <SelectItem value="phd">{t('verification.form.degreeLevels.phd') || 'Doktora'}</SelectItem>
                                                    <SelectItem value="certificate">{t('verification.form.degreeLevels.certificate') || 'Sertifika'}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="studentId" className="flex items-center gap-1.5">
                                                <GraduationCap className="w-3.5 h-3.5 text-gray-400" />
                                                {t('verification.form.studentId') || 'Ogrenci No (Opsiyonel)'}
                                            </Label>
                                            <Input
                                                id="studentId"
                                                value={formData.studentId}
                                                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                                                placeholder="Sifrelenecektir"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="enrollmentYear" className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                {t('verification.form.enrollmentYear') || 'Kayit Yili'} <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="enrollmentYear"
                                                type="number"
                                                min={2000}
                                                max={new Date().getFullYear()}
                                                value={formData.enrollmentYear}
                                                onChange={(e) => setFormData({ ...formData, enrollmentYear: parseInt(e.target.value) })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="expectedGraduation" className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                {t('verification.form.graduationYear') || 'Tahmini Mezuniyet'} <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="expectedGraduation"
                                                type="number"
                                                min={new Date().getFullYear()}
                                                max={new Date().getFullYear() + 10}
                                                value={formData.expectedGraduation}
                                                onChange={(e) => setFormData({ ...formData, expectedGraduation: parseInt(e.target.value) })}
                                            />
                                        </div>
                                    </div>

                                    <label htmlFor="isFullTime" className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                                        <input
                                            type="checkbox"
                                            id="isFullTime"
                                            checked={formData.isFullTime}
                                            onChange={(e) => setFormData({ ...formData, isFullTime: e.target.checked })}
                                            className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <div>
                                            <span className="font-medium text-gray-900">{t('verification.form.fullTime') || 'Tam zamanli ogrenci'}</span>
                                            <p className="text-xs text-gray-500 mt-0.5">Aktif olarak tam zamanli egitime devam ediyorum</p>
                                        </div>
                                    </label>
                                </div>
                            )}

                            {/* Step 4: Documents */}
                            {currentStep === 'documents' && (
                                <DocumentsUploadStep tierRequested={formData.tierRequested} t={t} />
                            )}

                            {/* Step 5: Review */}
                            {currentStep === 'review' && (
                                <div className="space-y-5">
                                    <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-100 rounded-lg">
                                                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-emerald-600 font-medium">{t('verification.review.tier') || 'Secilen Seviye'}</p>
                                                <p className="font-semibold text-gray-900">Tier {formData.tierRequested} - {TIER_CONFIG[formData.tierRequested]?.name}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <User className="w-4 h-4 text-gray-500" />
                                            {t('verification.review.personal') || 'Kisisel Bilgiler'}
                                        </h4>
                                        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                            <span className="text-gray-500">Ad Soyad</span>
                                            <span className="text-gray-900 font-medium">{formData.firstName} {formData.lastName}</span>
                                            <span className="text-gray-500">Dogum Tarihi</span>
                                            <span className="text-gray-900 font-medium">{formData.dateOfBirth || '-'}</span>
                                            <span className="text-gray-500">Telefon</span>
                                            <span className="text-gray-900 font-medium">{formData.phone || '-'}</span>
                                            <span className="text-gray-500">Ulke / Sehir</span>
                                            <span className="text-gray-900 font-medium">{formData.country}{formData.city ? `, ${formData.city}` : ''}</span>
                                        </div>
                                    </div>

                                    <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <GraduationCap className="w-4 h-4 text-gray-500" />
                                            {t('verification.review.education') || 'Egitim Bilgileri'}
                                        </h4>
                                        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                            <span className="text-gray-500">Kurum</span>
                                            <span className="text-gray-900 font-medium">{formData.institutionName}</span>
                                            <span className="text-gray-500">Bolum</span>
                                            <span className="text-gray-900 font-medium">{formData.degreeProgram}</span>
                                            <span className="text-gray-500">Derece</span>
                                            <span className="text-gray-900 font-medium capitalize">{formData.degreeLevel}</span>
                                            <span className="text-gray-500">Kayit / Mezuniyet</span>
                                            <span className="text-gray-900 font-medium">{formData.enrollmentYear} - {formData.expectedGraduation}</span>
                                            <span className="text-gray-500">Durum</span>
                                            <span className="text-gray-900 font-medium">{formData.isFullTime ? 'Tam Zamanli' : 'Yari Zamanli'}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="financialNeedStatement" className="flex items-center gap-1.5">
                                            <FileText className="w-3.5 h-3.5 text-gray-400" />
                                            {t('verification.review.note') || 'Not (Opsiyonel)'}
                                        </Label>
                                        <Textarea
                                            id="financialNeedStatement"
                                            placeholder={t('verification.review.notePlaceholder') || 'Varsa ek aciklama yazabilirsin.'}
                                            value={formData.financialNeedStatement}
                                            onChange={(e: any) => setFormData({ ...formData, financialNeedStatement: e.target.value })}
                                            className="h-24 resize-none"
                                        />
                                    </div>

                                    <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                                        <div className="flex items-start gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-emerald-800">
                                                {t('verification.reviewNote') || 'Gondererek, saglanan tum bilgilerin dogru oldugunu onaylayabilirsiniz. Ekibimiz basvurunuzu 1-3 is gunu icinde inceleyecektir.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="px-6 md:px-8 py-5 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                            <Button
                                variant="outline"
                                onClick={prevStep}
                                disabled={currentStepIndex === 0}
                                className="gap-2"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                {t('common.back') || 'Geri'}
                            </Button>

                            <div className="text-sm text-gray-500 hidden sm:block">
                                {currentStepIndex + 1} / {steps.length}
                            </div>

                            {currentStep === 'review' ? (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="bg-emerald-600 hover:bg-emerald-700 gap-2 px-6"
                                    size="lg"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Gonderiliyor...
                                        </>
                                    ) : (
                                        <>
                                            {t('verification.form.submit') || 'Incelemeye Gonder'}
                                            <ChevronRight className="w-4 h-4" />
                                        </>
                                    )}
                                </Button>
                            ) : (
                                <Button onClick={nextStep} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                                    {t('common.next') || 'Ileri'}
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Yukleniyor...</p>
                </div>
            </div>
        }>
            <VerifyPageContent />
        </Suspense>
    );
}
