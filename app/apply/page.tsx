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

type DocStatus = 'ready' | 'uploading' | 'uploaded' | 'failed';

interface DocumentItem {
  id: string;
  name: string;
  file: File;
  status: DocStatus;
  size: number;
  uploadedUrl?: string;
}

const CLASS_YEAR_KEYS = [
  'prep', '1', '2', '3', '4', '5', '6', 'grad', 'master', 'phd'
];

const EDUCATION_LEVEL_KEYS = [
  'highSchool', 'undergrad', 'master', 'phd', 'vocational'
];

const MIN_DESCRIPTION_LENGTH = 100;

export default function ApplyPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form State - with new fields
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    country: '',
    educationLevel: '',
    needSummary: '',
    // New fields
    targetAmount: '',
    classYear: '',
    faculty: '',
    department: '',
  });

  // Document State
  const [documentNameInput, setDocumentNameInput] = useState('');
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = t('apply.validation.fullName'); // 'Ad soyad gerekli'
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = t('apply.validation.invalidName'); // 'Geçersiz isim'
    }

    if (!formData.email.trim()) {
      newErrors.email = t('apply.validation.email'); // 'Email gerekli'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t('apply.validation.invalidEmail'); // 'Geçersiz email'
    }

    if (!formData.country.trim()) {
      newErrors.country = t('apply.validation.country'); // 'Ülke gerekli'
    }

    if (!formData.educationLevel) {
      newErrors.educationLevel = t('apply.validation.educationLevel'); // 'Eğitim seviyesi gerekli'
    }

    // New field validations
    if (!formData.targetAmount || parseInt(formData.targetAmount) < 1) {
      newErrors.targetAmount = t('apply.validation.targetAmount'); // 'Hedef miktar en az 1 USD olmalı'
    }

    if (!formData.classYear) {
      newErrors.classYear = t('apply.validation.classYear'); // 'Sınıf seçimi gerekli'
    }

    if (!formData.faculty.trim()) {
      newErrors.faculty = t('apply.validation.faculty'); // 'Fakülte gerekli'
    }

    if (!formData.department.trim()) {
      newErrors.department = t('apply.validation.department'); // 'Bölüm gerekli'
    }

    // Description with 100 char minimum
    if (!formData.needSummary.trim()) {
      newErrors.needSummary = t('apply.validation.needSummary'); // 'Açıklama gerekli'
    } else if (formData.needSummary.trim().length < MIN_DESCRIPTION_LENGTH) {
      const remaining = MIN_DESCRIPTION_LENGTH - formData.needSummary.trim().length;
      newErrors.needSummary = t('apply.validation.needSummaryMin', {
        min: MIN_DESCRIPTION_LENGTH,
        remaining: remaining
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddDocumentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = '';

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    const maxSize = 10 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      toast.error(t('apply.validation.fileType')); // 'Geçersiz dosya türü...'
      return;
    }

    if (file.size > maxSize) {
      toast.error(t('apply.validation.fileSize')); // 'Dosya boyutu...'
      return;
    }

    const name = documentNameInput.trim() || file.name;

    const newDoc: DocumentItem = {
      id: Math.random().toString(36).substring(7),
      name: name,
      file: file,
      size: file.size,
      status: 'ready'
    };

    const updatedDocs = [...documents, newDoc];
    setDocuments(updatedDocs);
    setDocumentNameInput('');

    await simulateUpload(newDoc.id!);
  };

  const simulateUpload = async (docId: string) => {
    setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: 'uploading' } : d));

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: 'uploaded', uploadedUrl: `mock_url_${d.name}` } : d));
      toast.success(t('apply.documents.status.uploaded')); // 'Belge yüklendi'
    } catch {
      setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: 'failed' } : d));
      toast.error(t('apply.documents.status.failed')); // 'Yükleme başarısız'
    }
  };

  const handleRemoveDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading || submitted) return;

    if (!validateForm()) {
      toast.error(t('apply.validation.fixErrors')); // 'Lütfen tüm alanları doğru doldurun'
      return;
    }

    const pendingDocs = documents.some(d => d.status === 'uploading');
    const failedDocs = documents.some(d => d.status === 'failed');

    if (pendingDocs) {
      toast.warning(t('apply.validation.waitUpload')); // 'Dosyaların yüklenmesini bekleyin.'
      return;
    }

    if (failedDocs) {
      toast.error(t('apply.validation.removeFailed')); // 'Başarısız yüklemeleri kaldırın...'
      return;
    }

    setLoading(true);
    setSubmitted(true);

    try {
      const documentNames = documents.map(d => d.name);

      const response = await fetch('/api/ops/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: sanitizeInput(formData.fullName),
          email: formData.email.trim().toLowerCase(),
          country: sanitizeInput(formData.country),
          educationLevel: formData.educationLevel,
          needSummary: sanitizeInput(formData.needSummary),
          documents: documentNames,
          // New fields
          targetAmount: parseInt(formData.targetAmount) || 0,
          classYear: formData.classYear,
          faculty: sanitizeInput(formData.faculty),
          department: sanitizeInput(formData.department),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || t('apply.validation.error'));
      }

      toast.success(t('apply.validation.success')); // 'Başvurunuz başarıyla gönderildi!'

      setTimeout(() => {
        router.push(`/student/status?id=${result.data.id}`);
      }, 500);
    } catch (error: any) {
      console.error('Failed to submit application:', error);
      toast.error(error.message || t('apply.validation.error'));
      setSubmitted(false);
    } finally {
      setLoading(false);
    }
  };

  const descriptionLength = formData.needSummary.trim().length;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('apply.title')}</h1>
          <p className="text-gray-600 mb-8">
            {t('apply.subtitle')}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 2-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="fullName">{t('apply.labels.fullName')} *</Label>
                <Input
                  id="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => {
                    setFormData({ ...formData, fullName: e.target.value });
                    if (errors.fullName) setErrors({ ...errors, fullName: '' });
                  }}
                  placeholder={t('apply.placeholders.fullName')}
                  className={`h-11 rounded-md ${errors.fullName ? 'border-red-500' : ''}`}
                />
                {errors.fullName && <p className="text-xs text-red-600">{errors.fullName}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email">{t('apply.labels.email')} *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  placeholder={t('apply.placeholders.email')}
                  className={`h-11 rounded-md ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
              </div>

              {/* Country */}
              <div className="space-y-1.5">
                <Label htmlFor="country">{t('apply.labels.country')} *</Label>
                <Input
                  id="country"
                  type="text"
                  required
                  value={formData.country}
                  onChange={(e) => {
                    setFormData({ ...formData, country: e.target.value });
                    if (errors.country) setErrors({ ...errors, country: '' });
                  }}
                  placeholder={t('apply.placeholders.country')}
                  className={`h-11 rounded-md ${errors.country ? 'border-red-500' : ''}`}
                />
                {errors.country && <p className="text-xs text-red-600">{errors.country}</p>}
              </div>

              {/* Target Amount */}
              <div className="space-y-1.5">
                <Label htmlFor="targetAmount">{t('apply.labels.targetAmount')} *</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  required
                  min={1}
                  value={formData.targetAmount}
                  onChange={(e) => {
                    setFormData({ ...formData, targetAmount: e.target.value });
                    if (errors.targetAmount) setErrors({ ...errors, targetAmount: '' });
                  }}
                  placeholder={t('apply.placeholders.targetAmount')}
                  className={`h-11 rounded-md ${errors.targetAmount ? 'border-red-500' : ''}`}
                />
                {errors.targetAmount && <p className="text-xs text-red-600">{errors.targetAmount}</p>}
              </div>

              {/* Education Level */}
              <div className="space-y-1.5">
                <Label htmlFor="educationLevel">{t('apply.labels.educationLevel')} *</Label>
                <Select
                  required
                  value={formData.educationLevel}
                  onValueChange={(value) => {
                    setFormData({ ...formData, educationLevel: value });
                    if (errors.educationLevel) setErrors({ ...errors, educationLevel: '' });
                  }}
                >
                  <SelectTrigger id="educationLevel" className={`h-11 rounded-md ${errors.educationLevel ? 'border-red-500' : ''}`}>
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
                {errors.educationLevel && <p className="text-xs text-red-600">{errors.educationLevel}</p>}
              </div>

              {/* Class Year */}
              <div className="space-y-1.5">
                <Label htmlFor="classYear">{t('apply.labels.classYear')} *</Label>
                <Select
                  required
                  value={formData.classYear}
                  onValueChange={(value) => {
                    setFormData({ ...formData, classYear: value });
                    if (errors.classYear) setErrors({ ...errors, classYear: '' });
                  }}
                >
                  <SelectTrigger id="classYear" className={`h-11 rounded-md ${errors.classYear ? 'border-red-500' : ''}`}>
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
                {errors.classYear && <p className="text-xs text-red-600">{errors.classYear}</p>}
              </div>

              {/* Faculty */}
              <div className="space-y-1.5">
                <Label htmlFor="faculty">{t('apply.labels.faculty')} *</Label>
                <Input
                  id="faculty"
                  type="text"
                  required
                  value={formData.faculty}
                  onChange={(e) => {
                    setFormData({ ...formData, faculty: e.target.value });
                    if (errors.faculty) setErrors({ ...errors, faculty: '' });
                  }}
                  placeholder={t('apply.placeholders.faculty')}
                  className={`h-11 rounded-md ${errors.faculty ? 'border-red-500' : ''}`}
                />
                {errors.faculty && <p className="text-xs text-red-600">{errors.faculty}</p>}
              </div>

              {/* Department */}
              <div className="space-y-1.5">
                <Label htmlFor="department">{t('apply.labels.department')} *</Label>
                <Input
                  id="department"
                  type="text"
                  required
                  value={formData.department}
                  onChange={(e) => {
                    setFormData({ ...formData, department: e.target.value });
                    if (errors.department) setErrors({ ...errors, department: '' });
                  }}
                  placeholder={t('apply.placeholders.department')}
                  className={`h-11 rounded-md ${errors.department ? 'border-red-500' : ''}`}
                />
                {errors.department && <p className="text-xs text-red-600">{errors.department}</p>}
              </div>
            </div>

            {/* Description - Full Width */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="needSummary">{t('apply.labels.needSummary', { min: MIN_DESCRIPTION_LENGTH })} *</Label>
                <span className={`text-xs ${descriptionLength < MIN_DESCRIPTION_LENGTH ? 'text-orange-600' : 'text-green-600'}`}>
                  {descriptionLength}/{MIN_DESCRIPTION_LENGTH}
                </span>
              </div>
              <Textarea
                id="needSummary"
                required
                value={formData.needSummary}
                onChange={(e) => {
                  setFormData({ ...formData, needSummary: e.target.value });
                  if (errors.needSummary) setErrors({ ...errors, needSummary: '' });
                }}
                placeholder={t('apply.placeholders.needSummary')}
                rows={6}
                className={`rounded-md ${errors.needSummary ? 'border-red-500' : ''}`}
              />
              {errors.needSummary && <p className="text-xs text-red-600">{errors.needSummary}</p>}
            </div>

            {/* Document Upload Section */}
            <div className="space-y-4 border-t pt-6">
              <div>
                <Label>{t('apply.labels.documents')}</Label>
                <p className="text-sm text-gray-500 mt-1">{t('apply.documents.help')}</p>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="application/pdf,image/jpeg,image/png"
                onChange={handleFileSelect}
              />

              <div className="flex gap-2">
                <Input
                  type="text"
                  value={documentNameInput}
                  onChange={(e) => setDocumentNameInput(e.target.value)}
                  placeholder={t('apply.placeholders.documentName')}
                  className="flex-1 h-11 rounded-md"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddDocumentClick}
                  className="h-11 rounded-md"
                >
                  {t('apply.documents.add')}
                </Button>
              </div>

              {documents.length > 0 && (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md border">
                      <div className="flex items-center gap-3">
                        {doc.status === 'uploading' && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
                        )}
                        {doc.status === 'uploaded' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {doc.status === 'failed' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                          <p className="text-xs text-gray-500">
                            {(doc.size / 1024 / 1024).toFixed(2)} MB • {
                              doc.status === 'uploaded' ? t('apply.documents.status.uploaded') :
                                doc.status === 'uploading' ? t('apply.documents.status.uploading') :
                                  t('apply.documents.status.failed')
                            }
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDocument(doc.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium p-1 hover:bg-red-50 rounded"
                      >
                        {t('apply.documents.remove')}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button type="submit" disabled={loading || submitted} className="w-full h-12 rounded-md text-base font-semibold">
              {loading ? t('apply.submit.submitting') : t('apply.submit.default')}
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
