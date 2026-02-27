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
  GraduationCap,
  User,
  Mail,
  Globe,
  DollarSign,
  BookOpen,
  Calendar,
  Building,
  Layers,
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  Shield,
  Clock,
  Eye,
  Heart,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  FileCheck,
  HelpCircle,
  Zap,
  Star,
  Camera,
  ImagePlus,
  Film,
  GripVertical,
  ChevronUp,
  ChevronDown,
  UserCircle,
  MapPin,
  Tag,
} from 'lucide-react';
import { COUNTRIES, FUNDING_CATEGORIES, TURKEY_CITIES } from '@/lib/constants';

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
  file: File;
  previewUrl: string;
  label: string;
  uploadedUrl?: string;
  status: DocStatus;
}

interface VideoItem {
  id: string;
  file: File;
  previewUrl: string;
  label: string;
  uploadedUrl?: string;
  status: DocStatus;
}

const CLASS_YEAR_KEYS = [
  'prep', '1', '2', '3', '4', '5', '6', 'grad', 'master', 'phd'
];

const EDUCATION_LEVEL_KEYS = [
  'highSchool', 'undergrad', 'master', 'phd', 'vocational'
];

const MIN_DESCRIPTION_LENGTH = 100;

/* ── Step config ── */
const STEPS = [
  { id: 1, label: 'Kişisel Bilgiler', icon: User },
  { id: 2, label: 'Eğitim Bilgileri', icon: GraduationCap },
  { id: 3, label: 'İhtiyaç Detayı', icon: FileText },
  { id: 4, label: 'Belgeler', icon: Upload },
];

/* ── Field helper component (MUST be outside ApplyPage to avoid remounting on every keystroke) ── */
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

export default function ApplyPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    country: '',
    city: '',
    gender: '',
    educationLevel: '',
    category: '',
    needSummary: '',
    targetAmount: '',
    classYear: '',
    faculty: '',
    department: '',
    campaignTitle: '',
  });

  const GENDER_OPTIONS = [
    { value: 'female', labelKey: 'apply.options.gender.female' },
    { value: 'male', labelKey: 'apply.options.gender.male' },
    { value: 'other', labelKey: 'apply.options.gender.other' },
    { value: 'prefer_not_to_say', labelKey: 'apply.options.gender.preferNotToSay' },
  ];

  // Document State
  const [documentNameInput, setDocumentNameInput] = useState('');
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  // Photo State (step 3 optional)
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [photoDragOver, setPhotoDragOver] = useState(false);

  // Video State (step 3 optional)
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [videoDragOver, setVideoDragOver] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = t('apply.validation.fullName');
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = t('apply.validation.invalidName');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('apply.validation.email');
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t('apply.validation.invalidEmail');
    }

    if (!formData.country) {
      newErrors.country = t('apply.validation.country');
    }

    if (!formData.gender) {
      newErrors.gender = t('apply.validation.gender');
    }

    if (!formData.educationLevel) {
      newErrors.educationLevel = t('apply.validation.educationLevel');
    }

    const minTarget = formData.country === 'TR' ? 2500 : 50;
    if (!formData.targetAmount) {
      newErrors.targetAmount = t('apply.validation.targetAmount');
    } else if (parseInt(formData.targetAmount) < minTarget) {
      newErrors.targetAmount = formData.country === 'TR' ? 'Minimum 2500 TL' : 'Minimum 50 USD';
    }

    if (!formData.classYear) {
      newErrors.classYear = t('apply.validation.classYear');
    }

    if (!formData.faculty.trim()) {
      newErrors.faculty = t('apply.validation.faculty');
    }

    if (!formData.department.trim()) {
      newErrors.department = t('apply.validation.department');
    }

    if (!formData.needSummary.trim()) {
      newErrors.needSummary = t('apply.validation.needSummary');
    } else if (formData.needSummary.trim().length < MIN_DESCRIPTION_LENGTH) {
      const remaining = MIN_DESCRIPTION_LENGTH - formData.needSummary.trim().length;
      newErrors.needSummary = t('apply.validation.needSummaryMin', {
        min: MIN_DESCRIPTION_LENGTH,
        remaining: remaining,
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = t('apply.validation.fullName');
      else if (formData.fullName.trim().length < 2) newErrors.fullName = t('apply.validation.invalidName');
      if (!formData.email.trim()) newErrors.email = t('apply.validation.email');
      else if (!validateEmail(formData.email)) newErrors.email = t('apply.validation.invalidEmail');
      if (!formData.country) newErrors.country = t('apply.validation.country');
      if (!formData.gender) newErrors.gender = t('apply.validation.gender');
    }

    if (currentStep === 2) {
      if (!formData.educationLevel) newErrors.educationLevel = t('apply.validation.educationLevel');
      if (!formData.classYear) newErrors.classYear = t('apply.validation.classYear');
      if (!formData.faculty.trim()) newErrors.faculty = t('apply.validation.faculty');
      if (!formData.department.trim()) newErrors.department = t('apply.validation.department');
      const minTarget = formData.country === 'TR' ? 2500 : 50;
      if (!formData.targetAmount) newErrors.targetAmount = t('apply.validation.targetAmount');
      else if (parseInt(formData.targetAmount) < minTarget) newErrors.targetAmount = formData.country === 'TR' ? 'Minimum 2500 TL' : 'Minimum 50 USD';
    }

    if (currentStep === 3) {
      if (!formData.needSummary.trim()) newErrors.needSummary = t('apply.validation.needSummary');
      else if (formData.needSummary.trim().length < MIN_DESCRIPTION_LENGTH) {
        const remaining = MIN_DESCRIPTION_LENGTH - formData.needSummary.trim().length;
        newErrors.needSummary = t('apply.validation.needSummaryMin', { min: MIN_DESCRIPTION_LENGTH, remaining });
      }
    }

    // Step 4 has no required validation (documents are optional)

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
  const handleAddDocumentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    await processFile(file);
  };

  const processFile = async (file: File) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    const maxSize = 10 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      toast.error(t('apply.validation.fileType'));
      return;
    }

    if (file.size > maxSize) {
      toast.error(t('apply.validation.fileSize'));
      return;
    }

    const name = documentNameInput.trim() || file.name;

    const newDoc: DocumentItem = {
      id: Math.random().toString(36).substring(7),
      name: name,
      file: file,
      size: file.size,
      status: 'ready',
    };

    const updatedDocs = [...documents, newDoc];
    setDocuments(updatedDocs);
    setDocumentNameInput('');
    await uploadFile(newDoc.id!, file, 'document');
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await processFile(file);
  };

  const uploadFile = async (docId: string, file: File, type: 'document' | 'photo' = 'document') => {
    setDocuments((prev) => prev.map((d) => (d.id === docId ? { ...d, status: 'uploading' } : d)));
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', type);

      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Upload failed');
      }

      setDocuments((prev) =>
        prev.map((d) => (d.id === docId ? { ...d, status: 'uploaded', uploadedUrl: json.data.url } : d))
      );
      toast.success(t('apply.documents.status.uploaded'));
    } catch (err: any) {
      setDocuments((prev) => prev.map((d) => (d.id === docId ? { ...d, status: 'failed' } : d)));
      toast.error(err.message || t('apply.documents.status.failed'));
    }
  };

  const handleRemoveDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  /* ── Photo upload helper ── */
  const uploadPhoto = async (photoId: string, file: File) => {
    setPhotos((prev) => prev.map((p) => (p.id === photoId ? { ...p, status: 'uploading' as DocStatus } : p)));
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', 'photo');

      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Upload failed');
      }

      setPhotos((prev) =>
        prev.map((p) => (p.id === photoId ? { ...p, status: 'uploaded' as DocStatus, uploadedUrl: json.data.url } : p))
      );
    } catch {
      setPhotos((prev) => prev.map((p) => (p.id === photoId ? { ...p, status: 'failed' as DocStatus } : p)));
      toast.error('Fotoğraf yüklenemedi.');
    }
  };

  /* ── Video upload helper ── */
  const uploadVideo = async (videoId: string, file: File) => {
    setVideos((prev) => prev.map((v) => (v.id === videoId ? { ...v, status: 'uploading' as DocStatus } : v)));
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', 'video');

      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Upload failed');
      }

      setVideos((prev) =>
        prev.map((v) => (v.id === videoId ? { ...v, status: 'uploaded' as DocStatus, uploadedUrl: json.data.url } : v))
      );
    } catch {
      setVideos((prev) => prev.map((v) => (v.id === videoId ? { ...v, status: 'failed' as DocStatus } : v)));
      toast.error('Video yüklenemedi.');
    }
  };

  /* ── Photo handlers (step 3) ── */
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    e.target.value = '';

    Array.from(files).forEach((file) => {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error('Sadece JPEG, PNG veya WebP formatında fotoğraf yükleyebilirsiniz.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Fotoğraf boyutu maksimum 5 MB olabilir.');
        return;
      }
      if (photos.length >= 5) {
        toast.error('En fazla 5 fotoğraf yükleyebilirsiniz.');
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      const newPhoto: PhotoItem = {
        id: Math.random().toString(36).substring(7),
        file,
        previewUrl,
        label: file.name,
        status: 'ready',
      };
      setPhotos((prev) => [...prev, newPhoto]);
      uploadPhoto(newPhoto.id, file);
    });
  };

  const handlePhotoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setPhotoDragOver(false);
    const files = e.dataTransfer.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return;
      if (file.size > 5 * 1024 * 1024) return;
      if (photos.length >= 5) return;

      const previewUrl = URL.createObjectURL(file);
      const newPhoto: PhotoItem = {
        id: Math.random().toString(36).substring(7),
        file,
        previewUrl,
        label: file.name,
        status: 'ready',
      };
      setPhotos((prev) => [...prev, newPhoto]);
      uploadPhoto(newPhoto.id, file);
    });
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos((prev) => {
      const photo = prev.find((p) => p.id === id);
      if (photo) URL.revokeObjectURL(photo.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  };

  /* ── Submit handler (no form tag) ── */
  const handleSubmit = async () => {
    if (loading || submitted) return;

    if (!validateForm()) {
      toast.error(t('apply.validation.fixErrors'));
      const newErrors: Record<string, string> = {};
      // Re-validate to get current errors
      if (!formData.fullName.trim() || formData.fullName.trim().length < 2) { setCurrentStep(1); return; }
      if (!formData.email.trim() || !validateEmail(formData.email)) { setCurrentStep(1); return; }
      if (!formData.country) { setCurrentStep(1); return; }
      const minTarget = formData.country === 'TR' ? 2500 : 50;
      if (!formData.educationLevel || !formData.classYear || !formData.faculty.trim() || !formData.department.trim() || !formData.targetAmount || parseInt(formData.targetAmount) < minTarget) { setCurrentStep(2); return; }
      if (!formData.needSummary.trim() || formData.needSummary.trim().length < MIN_DESCRIPTION_LENGTH) { setCurrentStep(3); return; }
      return;
    }

    const pendingDocs = documents.some((d) => d.status === 'uploading');
    const failedDocs = documents.some((d) => d.status === 'failed');
    const pendingPhotos = photos.some((p) => p.status === 'uploading');
    const failedPhotos = photos.some((p) => p.status === 'failed');
    const pendingVideos = videos.some((v) => v.status === 'uploading');
    const failedVideos = videos.some((v) => v.status === 'failed');

    if (pendingDocs || pendingPhotos || pendingVideos) {
      toast.warning(t('apply.validation.waitUpload'));
      return;
    }
    if (failedDocs || failedPhotos || failedVideos) {
      toast.error(t('apply.validation.removeFailed'));
      return;
    }

    setLoading(true);
    setSubmitted(true);

    try {
      // Build document objects with name + URL
      const documentData = documents
        .filter((d) => d.status === 'uploaded' && d.uploadedUrl)
        .map((d) => ({ name: d.name, url: d.uploadedUrl! }));

      // Build photo URLs
      const photoUrls = photos
        .filter((p) => p.status === 'uploaded' && p.uploadedUrl)
        .map((p) => p.uploadedUrl!);

      const videoUrls = videos
        .filter((v) => v.status === 'uploaded' && v.uploadedUrl)
        .map((v) => v.uploadedUrl!);

      const response = await fetch('/api/ops/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: sanitizeInput(formData.fullName),
          email: formData.email.trim().toLowerCase(),
          country: formData.country,
          city: formData.city || undefined,
          gender: formData.gender,
          educationLevel: formData.educationLevel,
          category: formData.category || undefined,
          needSummary: sanitizeInput(formData.needSummary),
          documents: documentData,
          photos: photoUrls,
          videos: videoUrls,
          targetAmount: parseInt(formData.targetAmount) || 0,
          classYear: formData.classYear,
          faculty: sanitizeInput(formData.faculty),
          department: sanitizeInput(formData.department),
          campaignTitle: sanitizeInput(formData.campaignTitle || ''),
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || t('apply.validation.error'));
      toast.success(t('apply.validation.success'));
      setTimeout(() => router.push(`/student/status?id=${result.data.id}`), 500);
    } catch (error: any) {
      console.error('Failed to submit application:', error);
      toast.error(error.message || t('apply.validation.error'));
      setSubmitted(false);
    } finally {
      setLoading(false);
    }
  };

  const descriptionLength = formData.needSummary.trim().length;

  const movePhoto = (index: number, direction: 'up' | 'down') => {
    setPhotos((prev) => {
      const newArr = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newArr.length) return prev;
      const temp = newArr[index];
      newArr[index] = newArr[targetIndex];
      newArr[targetIndex] = temp;
      return newArr;
    });
  };

  const moveVideo = (index: number, direction: 'up' | 'down') => {
    setVideos((prev) => {
      const newArr = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newArr.length) return prev;
      const temp = newArr[index];
      newArr[index] = newArr[targetIndex];
      newArr[targetIndex] = temp;
      return newArr;
    });
  };

  /* ───────────────────────
     RENDER
     ─────────────────────── */
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-grow">

        {/* ═══════════ HERO ═══════════ */}
        <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700">
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
                <GraduationCap className="h-4 w-4 text-yellow-300" />
                <span className="text-sm text-white/90 font-medium">Öğrenci Başvuru Formu</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                Eğitim Hayallerinize
                <br />
                <span className="bg-gradient-to-r from-yellow-200 via-amber-200 to-orange-200 bg-clip-text text-transparent">
                  Birlikte Ulaşalım
                </span>
              </h1>

              <p className="text-base sm:text-lg text-emerald-100/80 leading-relaxed max-w-xl mx-auto">
                Başvurunuzu tamamlayın, doğrulama sürecimizden geçin ve bağışçılarla buluşun.
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

              {/* ──── LEFT: Form ──── */}
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
                            onClick={() => {
                              if (step.id < currentStep) setCurrentStep(step.id);
                            }}
                            className={`flex items-center gap-2.5 transition-all duration-300 ${isActive
                              ? 'text-emerald-600'
                              : isCompleted
                                ? 'text-emerald-500 cursor-pointer'
                                : 'text-slate-300'
                              }`}
                          >
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isActive
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                : isCompleted
                                  ? 'bg-emerald-100 text-emerald-600'
                                  : 'bg-slate-100 text-slate-400'
                                }`}
                            >
                              {isCompleted ? (
                                <CheckCircle className="h-5 w-5" />
                              ) : (
                                <Icon className="h-5 w-5" />
                              )}
                            </div>
                            <span className="text-sm font-medium hidden sm:block">{step.label}</span>
                          </button>
                          {i < STEPS.length - 1 && (
                            <div className="flex-1 mx-3">
                              <div className={`h-[2px] rounded-full transition-colors duration-300 ${isCompleted ? 'bg-emerald-300' : 'bg-slate-100'}`} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Form Card — NO <form> tag to prevent accidental submission */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

                  {/* STEP 1 — Personal Info */}
                  {currentStep === 1 && (
                    <div className="p-6 sm:p-8 space-y-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-slate-900">Kişisel Bilgiler</h2>
                          <p className="text-sm text-slate-400">Temel kimlik ve iletişim bilgilerinizi girin</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FieldWrapper id="fullName" label={t('apply.labels.fullName')} icon={User} error={errors.fullName}>
                          <Input
                            id="fullName"
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => {
                              setFormData({ ...formData, fullName: e.target.value });
                              if (errors.fullName) setErrors({ ...errors, fullName: '' });
                            }}
                            placeholder={t('apply.placeholders.fullName')}
                            className={inputClass(!!errors.fullName)}
                          />
                        </FieldWrapper>

                        <FieldWrapper id="email" label={t('apply.labels.email')} icon={Mail} error={errors.email}>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => {
                              setFormData({ ...formData, email: e.target.value });
                              if (errors.email) setErrors({ ...errors, email: '' });
                            }}
                            placeholder={t('apply.placeholders.email')}
                            className={inputClass(!!errors.email)}
                          />
                        </FieldWrapper>

                        <FieldWrapper id="country" label={t('apply.labels.country')} icon={Globe} error={errors.country}>
                          <Select
                            value={formData.country}
                            onValueChange={(value) => {
                              setFormData({ ...formData, country: value, city: '' });
                              if (errors.country) setErrors({ ...errors, country: '' });
                            }}
                          >
                            <SelectTrigger id="country" className={selectTriggerClass(!!errors.country)}>
                              <SelectValue placeholder={t('apply.placeholders.country')} />
                            </SelectTrigger>
                            <SelectContent>
                              {COUNTRIES.map((c, index) => (
                                <SelectItem key={c.value} value={c.value}>
                                  {c.flag} {c.labelTr}{index === 0 ? '' : ` / ${c.label}`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FieldWrapper>

                        {formData.country === 'TR' && (
                          <FieldWrapper id="city" label="Şehir / City" icon={MapPin} error={errors.city} required={false}>
                            <Select
                              value={formData.city}
                              onValueChange={(value) => {
                                setFormData({ ...formData, city: value });
                              }}
                            >
                              <SelectTrigger id="city" className={selectTriggerClass(false)}>
                                <SelectValue placeholder="Şehir seçiniz..." />
                              </SelectTrigger>
                              <SelectContent>
                                {TURKEY_CITIES.map((city) => (
                                  <SelectItem key={city} value={city}>
                                    {city}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FieldWrapper>
                        )}

                        <FieldWrapper id="gender" label={t('apply.labels.gender')} icon={UserCircle} error={errors.gender}>
                          <Select
                            value={formData.gender}
                            onValueChange={(value) => {
                              setFormData({ ...formData, gender: value });
                              if (errors.gender) setErrors({ ...errors, gender: '' });
                            }}
                          >
                            <SelectTrigger id="gender" className={selectTriggerClass(!!errors.gender)}>
                              <SelectValue placeholder={t('apply.placeholders.selectGender')} />
                            </SelectTrigger>
                            <SelectContent>
                              {GENDER_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {t(opt.labelKey)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FieldWrapper>
                      </div>
                    </div>
                  )}

                  {/* STEP 2 — Education Info */}
                  {currentStep === 2 && (
                    <div className="p-6 sm:p-8 space-y-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                          <GraduationCap className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-slate-900">Eğitim Bilgileri</h2>
                          <p className="text-sm text-slate-400">Eğitim durumunuz ve hedef bütçeniz</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FieldWrapper id="educationLevel" label={t('apply.labels.educationLevel')} icon={BookOpen} error={errors.educationLevel}>
                          <Select
                            value={formData.educationLevel}
                            onValueChange={(value) => {
                              setFormData({ ...formData, educationLevel: value });
                              if (errors.educationLevel) setErrors({ ...errors, educationLevel: '' });
                            }}
                          >
                            <SelectTrigger id="educationLevel" className={selectTriggerClass(!!errors.educationLevel)}>
                              <SelectValue placeholder={t('apply.placeholders.select')} />
                            </SelectTrigger>
                            <SelectContent>
                              {EDUCATION_LEVEL_KEYS.map((key) => (
                                <SelectItem key={key} value={t(`apply.options.educationLevel.${key}`)}>
                                  {t(`apply.options.educationLevel.${key}`)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FieldWrapper>

                        <FieldWrapper id="classYear" label={t('apply.labels.classYear')} icon={Calendar} error={errors.classYear}>
                          <Select
                            value={formData.classYear}
                            onValueChange={(value) => {
                              setFormData({ ...formData, classYear: value });
                              if (errors.classYear) setErrors({ ...errors, classYear: '' });
                            }}
                          >
                            <SelectTrigger id="classYear" className={selectTriggerClass(!!errors.classYear)}>
                              <SelectValue placeholder={t('apply.placeholders.select')} />
                            </SelectTrigger>
                            <SelectContent>
                              {CLASS_YEAR_KEYS.map((key) => (
                                <SelectItem key={key} value={t(`apply.options.classYear.${key}`)}>
                                  {t(`apply.options.classYear.${key}`)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FieldWrapper>

                        <FieldWrapper id="faculty" label={t('apply.labels.faculty')} icon={Building} error={errors.faculty}>
                          <Input
                            id="faculty"
                            type="text"
                            value={formData.faculty}
                            onChange={(e) => {
                              setFormData({ ...formData, faculty: e.target.value });
                              if (errors.faculty) setErrors({ ...errors, faculty: '' });
                            }}
                            placeholder={t('apply.placeholders.faculty')}
                            className={inputClass(!!errors.faculty)}
                          />
                        </FieldWrapper>

                        <FieldWrapper id="department" label={t('apply.labels.department')} icon={Layers} error={errors.department}>
                          <Input
                            id="department"
                            type="text"
                            value={formData.department}
                            onChange={(e) => {
                              setFormData({ ...formData, department: e.target.value });
                              if (errors.department) setErrors({ ...errors, department: '' });
                            }}
                            placeholder={t('apply.placeholders.department')}
                            className={inputClass(!!errors.department)}
                          />
                        </FieldWrapper>

                        <FieldWrapper id="category" label="İhtiyaç Kategorisi / Need Category" icon={Tag} error={errors.category} required={false}>
                          <Select
                            value={formData.category}
                            onValueChange={(value) => {
                              setFormData({ ...formData, category: value });
                              if (errors.category) setErrors({ ...errors, category: '' });
                            }}
                          >
                            <SelectTrigger id="category" className={selectTriggerClass(!!errors.category)}>
                              <SelectValue placeholder="Kategori seçiniz / Select category..." />
                            </SelectTrigger>
                            <SelectContent>
                              {FUNDING_CATEGORIES.map((cat) => (
                                <SelectItem key={cat.value} value={cat.value}>
                                  {cat.labelTr} / {cat.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FieldWrapper>

                        <div className="md:col-span-2">
                          <FieldWrapper id="targetAmount" label={t('apply.labels.targetAmount')} icon={DollarSign} error={errors.targetAmount}>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">$</span>
                              <Input
                                id="targetAmount"
                                type="number"
                                min={1}
                                value={formData.targetAmount}
                                onChange={(e) => {
                                  setFormData({ ...formData, targetAmount: e.target.value });
                                  if (errors.targetAmount) setErrors({ ...errors, targetAmount: '' });
                                }}
                                placeholder={t('apply.placeholders.targetAmount')}
                                className={`${inputClass(!!errors.targetAmount)} pl-8`}
                              />
                            </div>
                          </FieldWrapper>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3 — Need Summary + Optional Photos */}
                  {currentStep === 3 && (
                    <div className="p-6 sm:p-8 space-y-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-purple-500" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-slate-900">İhtiyaç Detayı</h2>
                          <p className="text-sm text-slate-400">Durumunuzu ve ihtiyaçlarınızı anlatın</p>
                        </div>
                      </div>

                      <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                        <HelpCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-700 leading-relaxed">
                          <p className="font-medium mb-1">İpuçları:</p>
                          <ul className="list-disc list-inside space-y-1 text-blue-600">
                            <li>Eğitim durumunuzu ve maddi ihtiyaçlarınızı detaylıca anlatın</li>
                            <li>Bağışçıların sizi daha iyi tanıması için hikayenizi paylaşın</li>
                            <li>Neye ihtiyacınız olduğunu (kitap, burs, ekipman vb.) belirtin</li>
                          </ul>
                        </div>
                      </div>

                      {/* Description + Custom Campaign Title */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="needSummary" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-slate-400" />
                            {t('apply.labels.needSummary', { min: MIN_DESCRIPTION_LENGTH })}
                            <span className="text-red-400">*</span>
                          </Label>
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-20 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${descriptionLength >= MIN_DESCRIPTION_LENGTH ? 'bg-emerald-500' : 'bg-amber-400'
                                  }`}
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
                          onChange={(e) => {
                            setFormData({ ...formData, needSummary: e.target.value });
                            if (errors.needSummary) setErrors({ ...errors, needSummary: '' });
                          }}
                          placeholder={t('apply.placeholders.needSummary')}
                          rows={8}
                          className={`rounded-xl border-slate-200 bg-white focus:border-purple-400 focus:ring-purple-400/20 focus:ring-4 transition-all duration-200 text-slate-800 placeholder:text-slate-300 resize-none ${errors.needSummary ? 'border-red-400' : ''
                            }`}
                        />
                        {errors.needSummary && (
                          <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.needSummary}
                          </p>
                        )}
                      </div>

                      {/* Optional custom campaign title (used as headline when approved) */}
                      <div className="space-y-2 pt-2">
                        <Label htmlFor="campaignTitle" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-slate-400" />
                          Kampanya Başlığı (Opsiyonel)
                        </Label>
                        <Input
                          id="campaignTitle"
                          type="text"
                          value={formData.campaignTitle}
                          onChange={(e) => {
                            setFormData({ ...formData, campaignTitle: e.target.value });
                          }}
                          placeholder="Örn: Mehmet'in Bilgisayar Mühendisliği Eğitimine Destek"
                          className={inputClass(false)}
                          maxLength={200}
                        />
                        <p className="text-xs text-slate-400">
                          Bu alanı doldurursanız, kampanya onaylandığında sayfanın başlığında bu metin görünecek.
                        </p>
                      </div>

                      {/* ── Optional Photo Upload ── */}
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <Camera className="h-4 w-4 text-slate-400" />
                            Fotoğraflar
                            <span className="text-xs font-normal text-slate-400 ml-1">(Opsiyonel)</span>
                          </Label>
                          <span className="text-xs text-slate-400">{photos.length}/5</span>
                        </div>

                        <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-3.5 flex items-start gap-2.5">
                          <Camera className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-purple-600 leading-relaxed">
                            Kendinizin, okulunuzun veya eğitim ortamınızın fotoğraflarını ekleyebilirsiniz.
                            Bu fotoğraflar bağışçıların hikayenizi daha iyi anlamasına yardımcı olur.
                          </p>
                        </div>

                        <input
                          type="file"
                          ref={photoInputRef}
                          className="hidden"
                          accept="image/jpeg,image/png,image/webp"
                          multiple
                          onChange={handlePhotoSelect}
                        />

                        {/* Photo grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {photos.map((photo, index) => (
                            <div key={photo.id} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-[4/3] flex flex-col">
                              <div className="relative flex-1 w-full">
                                <img
                                  src={photo.previewUrl}
                                  alt={photo.label}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200" />
                                {/* Upload status overlay */}
                                {photo.status === 'uploading' && (
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                                  </div>
                                )}
                                {photo.status === 'uploaded' && (
                                  <div className="absolute top-2 left-2">
                                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
                                      <CheckCircle className="h-3.5 w-3.5 text-white" />
                                    </div>
                                  </div>
                                )}
                                {photo.status === 'failed' && (
                                  <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                                    <div className="bg-red-500 text-white text-[10px] px-2 py-1 rounded-full font-medium">
                                      Yükleme Başarısız
                                    </div>
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleRemovePhoto(photo.id)}
                                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-500"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <p className="text-[10px] text-white truncate">{photo.label}</p>
                                </div>
                              </div>

                              {/* Order controls */}
                              <div className="flex items-center justify-between px-2 py-1.5 bg-slate-900/80 text-white text-[10px]">
                                <div className="flex items-center gap-1">
                                  <GripVertical className="h-3 w-3 text-slate-400" />
                                  <span className="font-medium">Fotoğraf {index + 1}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => movePhoto(index, 'up')}
                                    disabled={index === 0}
                                    className="disabled:opacity-40 hover:text-emerald-300 transition-colors"
                                  >
                                    <ChevronUp className="h-3 w-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => movePhoto(index, 'down')}
                                    disabled={index === photos.length - 1}
                                    className="disabled:opacity-40 hover:text-emerald-300 transition-colors"
                                  >
                                    <ChevronDown className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Add photo button */}
                          {photos.length < 5 && (
                            <div
                              onClick={() => photoInputRef.current?.click()}
                              onDragOver={(e) => { e.preventDefault(); setPhotoDragOver(true); }}
                              onDragLeave={() => setPhotoDragOver(false)}
                              onDrop={handlePhotoDrop}
                              className={`aspect-[4/3] rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${photoDragOver
                                ? 'border-purple-400 bg-purple-50'
                                : 'border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 bg-slate-50/50'
                                }`}
                            >
                              <ImagePlus className={`h-7 w-7 mb-1.5 transition-colors ${photoDragOver ? 'text-purple-500' : 'text-slate-300'}`} />
                              <span className="text-xs text-slate-400 font-medium">Fotoğraf Ekle</span>
                              <span className="text-[10px] text-slate-300 mt-0.5">JPEG, PNG, WebP</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* ── Optional Video Upload ── */}
                      <div className="space-y-3 pt-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <Film className="h-4 w-4 text-slate-400" />
                            Videolar
                            <span className="text-xs font-normal text-slate-400 ml-1">(Opsiyonel)</span>
                          </Label>
                          <span className="text-xs text-slate-400">{videos.length}/2</span>
                        </div>

                        <input
                          type="file"
                          ref={videoInputRef}
                          className="hidden"
                          accept="video/mp4,video/quicktime,video/webm"
                          multiple
                          onChange={(e) => {
                            const files = e.target.files;
                            if (!files) return;
                            e.target.value = '';

                            Array.from(files).forEach((file) => {
                              if (!file.type.startsWith('video/')) {
                                toast.error('Sadece video dosyaları yükleyebilirsiniz.');
                                return;
                              }
                              if (file.size > 50 * 1024 * 1024) {
                                toast.error('Video boyutu maksimum 50 MB olabilir.');
                                return;
                              }
                              if (videos.length >= 2) {
                                toast.error('En fazla 2 video yükleyebilirsiniz.');
                                return;
                              }

                              const previewUrl = URL.createObjectURL(file);
                              const newVideo: VideoItem = {
                                id: Math.random().toString(36).substring(7),
                                file,
                                previewUrl,
                                label: file.name,
                                status: 'ready',
                              };
                              setVideos((prev) => [...prev, newVideo]);
                              uploadVideo(newVideo.id, file);
                            });
                          }}
                        />

                        <div
                          onClick={() => videoInputRef.current?.click()}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setVideoDragOver(true);
                          }}
                          onDragLeave={() => setVideoDragOver(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setVideoDragOver(false);
                            const files = e.dataTransfer.files;
                            if (!files) return;

                            Array.from(files).forEach((file) => {
                              if (!file.type.startsWith('video/')) return;
                              if (file.size > 50 * 1024 * 1024) return;
                              if (videos.length >= 2) return;

                              const previewUrl = URL.createObjectURL(file);
                              const newVideo: VideoItem = {
                                id: Math.random().toString(36).substring(7),
                                file,
                                previewUrl,
                                label: file.name,
                                status: 'ready',
                              };
                              setVideos((prev) => [...prev, newVideo]);
                              uploadVideo(newVideo.id, file);
                            });
                          }}
                          className={`rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all duration-200 ${videoDragOver
                              ? 'border-blue-400 bg-blue-50'
                              : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 bg-slate-50/50'
                            }`}
                        >
                          <Film className={`h-7 w-7 mb-1.5 ${videoDragOver ? 'text-blue-500' : 'text-slate-300'}`} />
                          <span className="text-xs text-slate-500 font-medium">Video Ekle veya Bırak</span>
                          <span className="text-[10px] text-slate-300 mt-0.5">MP4, WebM, QuickTime • Maks. 50 MB</span>
                        </div>

                        {videos.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {videos.map((video, index) => (
                              <div key={video.id} className="relative rounded-xl border border-slate-200 overflow-hidden bg-black">
                                <div className="aspect-video relative">
                                  <video
                                    src={video.previewUrl}
                                    className="w-full h-full object-contain bg-black"
                                    controls
                                  />
                                  {video.status === 'uploading' && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                                    </div>
                                  )}
                                  {video.status === 'failed' && (
                                    <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center">
                                      <div className="bg-red-500 text-white text-[10px] px-2 py-1 rounded-full font-medium">
                                        Yükleme Başarısız
                                      </div>
                                    </div>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setVideos((prev) => {
                                        const found = prev.find((v) => v.id === video.id);
                                        if (found) URL.revokeObjectURL(found.previewUrl);
                                        return prev.filter((v) => v.id !== video.id);
                                      });
                                    }}
                                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-red-500"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                                <div className="flex items-center justify-between px-2 py-1.5 bg-slate-900/80 text-white text-[10px]">
                                  <div className="flex items-center gap-1">
                                    <GripVertical className="h-3 w-3 text-slate-400" />
                                    <span className="font-medium">Video {index + 1}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => moveVideo(index, 'up')}
                                      disabled={index === 0}
                                      className="disabled:opacity-40 hover:text-emerald-300 transition-colors"
                                    >
                                      <ChevronUp className="h-3 w-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => moveVideo(index, 'down')}
                                      disabled={index === videos.length - 1}
                                      className="disabled:opacity-40 hover:text-emerald-300 transition-colors"
                                    >
                                      <ChevronDown className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
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
                          <h2 className="text-xl font-bold text-slate-900">Belgeler</h2>
                          <p className="text-sm text-slate-400">Kimlik ve eğitim belgelerinizi yükleyin</p>
                        </div>
                      </div>

                      <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
                        <FileCheck className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-amber-700">
                          <p>{t('apply.documents.help')}</p>
                          <p className="text-xs text-amber-500 mt-1">PDF, JPEG, PNG — Maks. 10 MB</p>
                        </div>
                      </div>

                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="application/pdf,image/jpeg,image/png"
                        onChange={handleFileSelect}
                      />

                      {/* Drag & Drop Zone */}
                      <div
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer ${dragOver ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                          }`}
                        onClick={handleAddDocumentClick}
                      >
                        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                          <Upload className={`h-7 w-7 transition-colors ${dragOver ? 'text-emerald-500' : 'text-slate-400'}`} />
                        </div>
                        <p className="text-sm font-medium text-slate-600 mb-1">
                          {dragOver ? 'Dosyayı bırakın...' : 'Dosyaları sürükleyip bırakın'}
                        </p>
                        <p className="text-xs text-slate-400">veya tıklayarak dosya seçin</p>
                      </div>

                      {/* Optional name input */}
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          value={documentNameInput}
                          onChange={(e) => setDocumentNameInput(e.target.value)}
                          placeholder={t('apply.placeholders.documentName')}
                          className="flex-1 h-11 rounded-xl border-slate-200 bg-white focus:border-blue-400 focus:ring-blue-400/20 focus:ring-4"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddDocumentClick}
                          className="h-11 rounded-xl border-slate-200 hover:bg-slate-50"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {t('apply.documents.add')}
                        </Button>
                      </div>

                      {/* Document List */}
                      {documents.length > 0 && (
                        <div className="space-y-2.5">
                          {documents.map((doc) => (
                            <div
                              key={doc.id}
                              className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${doc.status === 'uploaded'
                                ? 'bg-emerald-50/50 border-emerald-100'
                                : doc.status === 'failed'
                                  ? 'bg-red-50/50 border-red-100'
                                  : 'bg-white border-slate-100'
                                }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {doc.status === 'uploading' && <Loader2 className="h-5 w-5 text-blue-500 animate-spin flex-shrink-0" />}
                                {doc.status === 'uploaded' && <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />}
                                {doc.status === 'failed' && <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />}
                                {doc.status === 'ready' && <FileText className="h-5 w-5 text-slate-400 flex-shrink-0" />}
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-slate-800 truncate">{doc.name}</p>
                                  <p className="text-xs text-slate-400">
                                    {(doc.size / 1024 / 1024).toFixed(2)} MB •{' '}
                                    <span className={
                                      doc.status === 'uploaded'
                                        ? 'text-emerald-500'
                                        : doc.status === 'uploading'
                                          ? 'text-blue-500'
                                          : doc.status === 'failed'
                                            ? 'text-red-500'
                                            : 'text-slate-400'
                                    }>
                                      {doc.status === 'uploaded'
                                        ? t('apply.documents.status.uploaded')
                                        : doc.status === 'uploading'
                                          ? t('apply.documents.status.uploading')
                                          : t('apply.documents.status.failed')}
                                    </span>
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveDocument(doc.id)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Navigation Buttons — outside form, pure onClick ── */}
                  <div className="border-t border-slate-100 px-6 sm:px-8 py-5 flex items-center justify-between bg-slate-50/50">
                    <div>
                      {currentStep > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={prevStep}
                          className="h-11 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        >
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Geri
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 hidden sm:block">
                        Adım {currentStep}/{STEPS.length}
                      </span>
                      {currentStep < 4 ? (
                        <Button
                          type="button"
                          onClick={nextStep}
                          className="h-11 px-7 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 font-semibold"
                        >
                          Devam Et
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          disabled={loading || submitted}
                          onClick={handleSubmit}
                          className="h-11 px-8 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 font-semibold disabled:opacity-50"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Gönderiliyor...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-2" />
                              {t('apply.submit.default')}
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ──── RIGHT: Sidebar ──── */}
              <div className="lg:w-[35%] space-y-6">

                {/* Process Card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-amber-500" />
                    Başvuru Süreci
                  </h3>
                  <div className="space-y-4">
                    {[
                      { num: 1, label: 'Formu doldurun', desc: 'Bilgilerinizi ve ihtiyaçlarınızı paylaşın', color: 'bg-blue-500' },
                      { num: 2, label: 'Belgelerinizi yükleyin', desc: 'Kimlik ve öğrenim belgelerinizi ekleyin', color: 'bg-emerald-500' },
                      { num: 3, label: 'Doğrulama', desc: 'Ekibimiz başvurunuzu inceleyecek', color: 'bg-purple-500' },
                      { num: 4, label: 'Bağışçılarla buluşun', desc: 'Profiliniz yayınlanır, destek başlar', color: 'bg-amber-500' },
                    ].map((item) => (
                      <div key={item.num} className="flex gap-3">
                        <div className={`w-7 h-7 rounded-lg ${item.color} flex items-center justify-center flex-shrink-0 text-white text-xs font-bold`}>
                          {item.num}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                          <p className="text-xs text-slate-400">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-500" />
                    Güvenlik & Gizlilik
                  </h3>
                  <div className="space-y-3.5">
                    {[
                      { icon: Shield, text: 'Bilgileriniz 256-bit SSL ile şifrelenir', color: 'text-blue-500', bg: 'bg-blue-50' },
                      { icon: Eye, text: 'Kişisel bilgileriniz gizli tutulur', color: 'text-purple-500', bg: 'bg-purple-50' },
                      { icon: Clock, text: 'Başvurular 48 saat içinde incelenir', color: 'text-amber-500', bg: 'bg-amber-50' },
                      { icon: Heart, text: 'Tüm süreç tamamen ücretsizdir', color: 'text-rose-500', bg: 'bg-rose-50' },
                    ].map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`h-4 w-4 ${item.color}`} />
                          </div>
                          <span className="text-sm text-slate-600">{item.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Stats Card */}
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[40px]" />
                  <div className="relative z-10">
                    <Star className="h-8 w-8 mb-4 text-yellow-300" />
                    <h3 className="text-lg font-bold mb-2">İlk Adımlar</h3>
                    <p className="text-sm text-emerald-100 leading-relaxed mb-5">
                      FundEd ile eğitim hayallerine ulaşacak öğrenci topluluğunun ilk üyesi siz olun.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold">0</p>
                        <p className="text-xs text-emerald-200">Desteklenen Öğrenci</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold">Beta</p>
                        <p className="text-xs text-emerald-200">Aşama</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Help Card */}
                <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 text-center">
                  <HelpCircle className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                  <h4 className="text-sm font-semibold text-slate-800 mb-1">Yardıma mı ihtiyacınız var?</h4>
                  <p className="text-xs text-slate-500 mb-4">
                    Başvuru sürecinde herhangi bir sorunuz varsa bize ulaşın.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-slate-200 text-slate-600 hover:bg-white"
                    onClick={() => router.push('/contact')}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    İletişime Geç
                  </Button>
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
