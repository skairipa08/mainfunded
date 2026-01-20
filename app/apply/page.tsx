'use client';

import { useState } from 'react';
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
import { createStudentApplication } from '@/lib/mockDb';
import { validateEmail, sanitizeInput } from '@/lib/validation';
import { toast } from 'sonner';
import { useTranslation } from '@/lib/i18n';

export default function ApplyPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    country: '',
    educationLevel: '',
    needSummary: '',
    documents: [] as string[],
  });
  const [newDocument, setNewDocument] = useState('');

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = t('common.error');
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = t('common.error');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('common.error');
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t('common.error');
    }

    if (!formData.country.trim()) {
      newErrors.country = t('common.error');
    }

    if (!formData.educationLevel) {
      newErrors.educationLevel = t('common.error');
    }

    if (!formData.needSummary.trim()) {
      newErrors.needSummary = t('common.error');
    } else if (formData.needSummary.trim().length < 10) {
      newErrors.needSummary = t('common.error');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading || submitted) {
      return;
    }

    if (!validateForm()) {
      toast.error(t('common.error'));
      return;
    }

    setLoading(true);
    setSubmitted(true);

    try {
      const application = createStudentApplication({
        fullName: sanitizeInput(formData.fullName),
        email: formData.email.trim().toLowerCase(),
        country: sanitizeInput(formData.country),
        educationLevel: formData.educationLevel,
        needSummary: sanitizeInput(formData.needSummary),
        documents: formData.documents,
      });

      toast.success(t('common.success'));

      setTimeout(() => {
        router.push(`/student/status?id=${application.id}`);
      }, 500);
    } catch (error) {
      console.error('Failed to submit application:', error);
      toast.error(t('common.error'));
      setSubmitted(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">{t('nav.apply')}</h1>
          <p className="text-gray-600 mb-8">
            {t('home.howItWorks.step1Desc')}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">{t('verification.form.firstName')} {t('verification.form.lastName')} *</Label>
              <Input
                id="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => {
                  setFormData({ ...formData, fullName: e.target.value });
                  if (errors.fullName) setErrors({ ...errors, fullName: '' });
                }}
                placeholder={t('verification.form.firstName')}
                className={errors.fullName ? 'border-red-500' : ''}
              />
              {errors.fullName && (
                <p className="text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                placeholder="Email"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">{t('verification.form.country')} *</Label>
              <Input
                id="country"
                type="text"
                required
                value={formData.country}
                onChange={(e) => {
                  setFormData({ ...formData, country: e.target.value });
                  if (errors.country) setErrors({ ...errors, country: '' });
                }}
                placeholder={t('verification.form.country')}
                className={errors.country ? 'border-red-500' : ''}
              />
              {errors.country && (
                <p className="text-sm text-red-600">{errors.country}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="educationLevel">{t('verification.form.degreeLevel')} *</Label>
              <Select
                required
                value={formData.educationLevel}
                onValueChange={(value) => {
                  setFormData({ ...formData, educationLevel: value });
                  if (errors.educationLevel) setErrors({ ...errors, educationLevel: '' });
                }}
              >
                <SelectTrigger id="educationLevel" className={errors.educationLevel ? 'border-red-500' : ''}>
                  <SelectValue placeholder={t('verification.form.degreeLevel')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High School">High School</SelectItem>
                  <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                  <SelectItem value="Graduate">Graduate</SelectItem>
                  <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                  <SelectItem value="Vocational">Vocational</SelectItem>
                </SelectContent>
              </Select>
              {errors.educationLevel && (
                <p className="text-sm text-red-600">{errors.educationLevel}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="needSummary">{t('campaign.about')} *</Label>
              <Textarea
                id="needSummary"
                required
                value={formData.needSummary}
                onChange={(e) => {
                  setFormData({ ...formData, needSummary: e.target.value });
                  if (errors.needSummary) setErrors({ ...errors, needSummary: '' });
                }}
                placeholder={t('donation.message')}
                rows={6}
                className={errors.needSummary ? 'border-red-500' : ''}
              />
              {errors.needSummary && (
                <p className="text-sm text-red-600">{errors.needSummary}</p>
              )}
            </div>

            {/* Document Upload Section */}
            <div className="space-y-4 border-t pt-6">
              <div>
                <Label>{t('verification.form.uploadDocuments')}</Label>
                <p className="text-sm text-gray-500 mt-1">{t('verification.form.documentHelp')}</p>
              </div>

              <div className="flex gap-2">
                <Input
                  type="text"
                  value={newDocument}
                  onChange={(e) => setNewDocument(e.target.value)}
                  placeholder={t('verification.form.documentName')}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (newDocument.trim()) {
                      setFormData({
                        ...formData,
                        documents: [...formData.documents, newDocument.trim()]
                      });
                      setNewDocument('');
                    }
                  }}
                >
                  {t('verification.form.addDocument')}
                </Button>
              </div>

              {formData.documents.length > 0 && (
                <div className="space-y-2">
                  {formData.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">{doc}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            documents: formData.documents.filter((_, i) => i !== index)
                          });
                        }}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        {t('verification.form.removeDocument')}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button type="submit" disabled={loading || submitted} className="w-full">
              {loading ? t('common.loading') : t('common.submit')}
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
