'use client';

import { useState, useEffect } from 'react';
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
    getEmailDomain,
    getTierBadgeInfo
} from '@/lib/verification/tiers';
import type { VerificationTier } from '@/types/verification';

// Multi-step form stages
type FormStep = 'tier-select' | 'personal-info' | 'education-info' | 'documents' | 'review';

interface FormData {
    // Tier
    tierRequested: VerificationTier;

    // Email verification (Tier 0)
    institutionEmail: string;

    // Personal info
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    phone: string;
    country: string;
    city: string;

    // Education info
    institutionName: string;
    institutionCountry: string;
    institutionType: 'university' | 'college' | 'vocational' | 'high_school';
    studentId: string;
    enrollmentYear: number;
    expectedGraduation: number;
    degreeProgram: string;
    degreeLevel: 'bachelor' | 'master' | 'phd' | 'associate' | 'certificate';
    isFullTime: boolean;

    // Financial context (optional)
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

export default function VerifyPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session, status } = useSession();
    const { t } = useTranslation();

    // Preview mode for demo - skip auth
    const isPreviewMode = searchParams.get('preview') === 'true';

    const [currentStep, setCurrentStep] = useState<FormStep>('tier-select');
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [loading, setLoading] = useState(false);
    const [existingVerification, setExistingVerification] = useState<any>(null);

    // Redirect if not authenticated (skip in preview mode)
    useEffect(() => {
        if (!isPreviewMode && status === 'unauthenticated') {
            router.push('/login?callbackUrl=/verify');
        }
    }, [status, router, isPreviewMode]);

    // Check for existing verification
    useEffect(() => {
        if (session?.user) {
            fetch('/api/verification')
                .then(res => res.json())
                .then(data => {
                    if (data.verification) {
                        setExistingVerification(data.verification);
                    }
                })
                .catch(console.error);
        }
    }, [session]);

    const steps: { id: FormStep; title: string }[] = [
        { id: 'tier-select', title: t('verification.steps.tierSelect') || 'Select Verification Level' },
        { id: 'personal-info', title: t('verification.steps.personalInfo') || 'Personal Information' },
        { id: 'education-info', title: t('verification.steps.educationInfo') || 'Education Details' },
        { id: 'documents', title: t('verification.steps.documents') || 'Upload Documents' },
        { id: 'review', title: t('verification.steps.review') || 'Review & Submit' },
    ];

    const currentStepIndex = steps.findIndex(s => s.id === currentStep);

    const nextStep = () => {
        const nextIndex = currentStepIndex + 1;
        if (nextIndex < steps.length) {
            setCurrentStep(steps[nextIndex].id);
        }
    };

    const prevStep = () => {
        const prevIndex = currentStepIndex - 1;
        if (prevIndex >= 0) {
            setCurrentStep(steps[prevIndex].id);
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

            if (!response.ok) {
                throw new Error('Failed to submit verification');
            }

            const data = await response.json();
            toast.success(t('verification.submitSuccess') || 'Verification submitted successfully!');
            router.push(`/verify/status?id=${data.verification.verification_id}`);
        } catch (error) {
            console.error('Verification error:', error);
            toast.error(t('verification.submitError') || 'Failed to submit verification');
        } finally {
            setLoading(false);
        }
    };

    // If already has verification, redirect to status
    if (existingVerification && existingVerification.status !== 'REJECTED') {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                <main className="flex-grow flex items-center justify-center">
                    <div className="max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg text-center">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            {t('verification.alreadySubmitted') || 'Verification Already Submitted'}
                        </h2>
                        <p className="text-gray-600 mb-6">
                            {t('verification.checkStatus') || 'Check your verification status.'}
                        </p>
                        <Button onClick={() => router.push(`/verify/status?id=${existingVerification.verification_id}`)}>
                            {t('verification.viewStatus') || 'View Status'}
                        </Button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow py-12">
                <div className="max-w-3xl mx-auto px-4">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {t('verification.title') || 'Student Verification'}
                        </h1>
                        <p className="text-gray-600">
                            {t('verification.subtitle') || 'Verify your student status to create campaigns'}
                        </p>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-between mb-8">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${index <= currentStepIndex
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-gray-200 text-gray-600'
                                    }`}>
                                    {index + 1}
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`w-12 h-1 mx-2 ${index < currentStepIndex ? 'bg-emerald-600' : 'bg-gray-200'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">
                            {steps[currentStepIndex].title}
                        </h2>

                        {/* Step 1: Tier Selection */}
                        {currentStep === 'tier-select' && (
                            <div className="space-y-6">
                                <p className="text-gray-600 mb-4">
                                    {t('verification.tierSelectDescription') || 'Choose your verification level based on available documents.'}
                                </p>

                                <div className="grid gap-4">
                                    {TIER_CONFIG.filter(tier => tier.tier >= 1 && tier.tier <= 2).map((tier) => {
                                        const badge = getTierBadgeInfo(tier.tier);
                                        return (
                                            <div
                                                key={tier.tier}
                                                onClick={() => setFormData({ ...formData, tierRequested: tier.tier })}
                                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.tierRequested === tier.tier
                                                    ? 'border-emerald-500 bg-emerald-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
                                                        Tier {tier.tier}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-900">{tier.name}</h3>
                                                        <p className="text-sm text-gray-600 mt-1">{tier.description}</p>
                                                        <div className="mt-2 text-xs text-gray-500">
                                                            <strong>{t('verification.required') || 'Required'}:</strong> {tier.required.join(', ')}
                                                        </div>
                                                    </div>
                                                    {formData.tierRequested === tier.tier && (
                                                        <svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Tier 0 option */}
                                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <h4 className="font-medium text-blue-900 mb-2">
                                        {t('verification.tier0Option') || 'Quick Verification (Tier 0)'}
                                    </h4>
                                    <p className="text-sm text-blue-700 mb-3">
                                        {t('verification.tier0Description') || 'If you have an institutional email (e.g., @edu.tr, @harvard.edu), you can get basic verification faster.'}
                                    </p>
                                    <div className="flex gap-2">
                                        <Input
                                            type="email"
                                            placeholder="student@university.edu"
                                            value={formData.institutionEmail}
                                            onChange={(e) => setFormData({ ...formData, institutionEmail: e.target.value })}
                                            className="flex-1"
                                        />
                                        {formData.institutionEmail && isEducationalEmail(formData.institutionEmail) && (
                                            <span className="text-emerald-600 text-sm flex items-center">✓ Valid</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Personal Information */}
                        {currentStep === 'personal-info' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">{t('verification.form.firstName')} *</Label>
                                        <Input
                                            id="firstName"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">{t('verification.form.lastName')} *</Label>
                                        <Input
                                            id="lastName"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="dateOfBirth">{t('verification.form.dateOfBirth')} *</Label>
                                    <Input
                                        id="dateOfBirth"
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">{t('verification.form.phone')} *</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="country">{t('verification.form.country')} *</Label>
                                        <Input
                                            id="country"
                                            value={formData.country}
                                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="city">{t('verification.form.city')}</Label>
                                        <Input
                                            id="city"
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Education Information */}
                        {currentStep === 'education-info' && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="institutionName">{t('verification.form.institution')} *</Label>
                                    <Input
                                        id="institutionName"
                                        value={formData.institutionName}
                                        onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                                        placeholder="e.g., Harvard University"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="institutionCountry">{t('verification.form.institutionCountry') || 'Institution Country'} *</Label>
                                        <Input
                                            id="institutionCountry"
                                            value={formData.institutionCountry}
                                            onChange={(e) => setFormData({ ...formData, institutionCountry: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="institutionType">{t('verification.form.institutionType') || 'Institution Type'} *</Label>
                                        <Select
                                            value={formData.institutionType}
                                            onValueChange={(value: any) => setFormData({ ...formData, institutionType: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="university">University</SelectItem>
                                                <SelectItem value="college">College</SelectItem>
                                                <SelectItem value="vocational">Vocational School</SelectItem>
                                                <SelectItem value="high_school">High School</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="degreeProgram">{t('verification.form.program')} *</Label>
                                    <Input
                                        id="degreeProgram"
                                        value={formData.degreeProgram}
                                        onChange={(e) => setFormData({ ...formData, degreeProgram: e.target.value })}
                                        placeholder="e.g., Computer Science"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="degreeLevel">{t('verification.form.degreeLevel')} *</Label>
                                        <Select
                                            value={formData.degreeLevel}
                                            onValueChange={(value: any) => setFormData({ ...formData, degreeLevel: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="associate">Associate</SelectItem>
                                                <SelectItem value="bachelor">Bachelor's</SelectItem>
                                                <SelectItem value="master">Master's</SelectItem>
                                                <SelectItem value="phd">PhD</SelectItem>
                                                <SelectItem value="certificate">Certificate</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="studentId">{t('verification.form.studentId') || 'Student ID'}</Label>
                                        <Input
                                            id="studentId"
                                            value={formData.studentId}
                                            onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                                            placeholder="Optional - will be encrypted"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="enrollmentYear">{t('verification.form.enrollmentYear')} *</Label>
                                        <Input
                                            id="enrollmentYear"
                                            type="number"
                                            min={2000}
                                            max={new Date().getFullYear()}
                                            value={formData.enrollmentYear}
                                            onChange={(e) => setFormData({ ...formData, enrollmentYear: parseInt(e.target.value) })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="expectedGraduation">{t('verification.form.graduationYear')} *</Label>
                                        <Input
                                            id="expectedGraduation"
                                            type="number"
                                            min={new Date().getFullYear()}
                                            max={new Date().getFullYear() + 10}
                                            value={formData.expectedGraduation}
                                            onChange={(e) => setFormData({ ...formData, expectedGraduation: parseInt(e.target.value) })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isFullTime"
                                        checked={formData.isFullTime}
                                        onChange={(e) => setFormData({ ...formData, isFullTime: e.target.checked })}
                                        className="rounded border-gray-300"
                                    />
                                    <Label htmlFor="isFullTime">{t('verification.form.fullTime')}</Label>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Documents */}
                        {currentStep === 'documents' && (
                            <div className="space-y-6">
                                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                                    <h4 className="font-medium text-amber-900 mb-2">
                                        {t('verification.documentGuidance') || 'Document Guidance'}
                                    </h4>
                                    <p className="text-sm text-amber-700 mb-3">
                                        {t('verification.documentMaskingHint') || 'You may mask sensitive fields (ID number, student number, address) if you want. We only need to verify: name, institution, active status, and date.'}
                                    </p>
                                    <ul className="text-sm text-amber-700 space-y-1">
                                        <li>✓ {t('verification.acceptedDocs.enrollment') || 'Enrollment/Student Status Certificate'}</li>
                                        <li>✓ {t('verification.acceptedDocs.studentId') || 'Student ID Card'}</li>
                                        <li>✓ {t('verification.acceptedDocs.transcript') || 'Official Transcript'}</li>
                                        {formData.tierRequested >= 2 && (
                                            <li>✓ {t('verification.acceptedDocs.portalScreenshot') || 'School Portal Screenshot'}</li>
                                        )}
                                    </ul>
                                </div>

                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <p className="text-gray-600 mb-2">
                                        {t('verification.dragDrop') || 'Drag and drop files here, or click to browse'}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {t('verification.fileTypes') || 'PDF, JPG, or PNG (max 10MB)'}
                                    </p>
                                    <Button variant="outline" className="mt-4">
                                        {t('verification.form.uploadDocuments')}
                                    </Button>
                                </div>

                                <p className="text-sm text-gray-500 text-center">
                                    {t('verification.documentsNote') || 'Documents will be securely stored and only accessible to our verification team.'}
                                </p>
                            </div>
                        )}

                        {/* Step 5: Review */}
                        {currentStep === 'review' && (
                            <div className="space-y-6">
                                <div className="grid gap-4">
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <h4 className="font-medium text-gray-900 mb-2">{t('verification.review.tier') || 'Verification Tier'}</h4>
                                        <p className="text-gray-600">Tier {formData.tierRequested} - {TIER_CONFIG[formData.tierRequested].name}</p>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <h4 className="font-medium text-gray-900 mb-2">{t('verification.review.personal') || 'Personal Information'}</h4>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <span className="text-gray-500">Name:</span>
                                            <span className="text-gray-900">{formData.firstName} {formData.lastName}</span>
                                            <span className="text-gray-500">Country:</span>
                                            <span className="text-gray-900">{formData.country}</span>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <h4 className="font-medium text-gray-900 mb-2">{t('verification.review.education') || 'Education'}</h4>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <span className="text-gray-500">Institution:</span>
                                            <span className="text-gray-900">{formData.institutionName}</span>
                                            <span className="text-gray-500">Program:</span>
                                            <span className="text-gray-900">{formData.degreeProgram}</span>
                                            <span className="text-gray-500">Expected Graduation:</span>
                                            <span className="text-gray-900">{formData.expectedGraduation}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                                    <p className="text-sm text-emerald-700">
                                        {t('verification.reviewNote') || 'By submitting, you confirm that all information provided is accurate. Our team will review your application within 1-3 business days.'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-8 pt-6 border-t">
                            <Button
                                variant="outline"
                                onClick={prevStep}
                                disabled={currentStepIndex === 0}
                            >
                                {t('common.back')}
                            </Button>

                            {currentStep === 'review' ? (
                                <Button onClick={handleSubmit} disabled={loading}>
                                    {loading ? t('common.loading') : t('verification.form.submit')}
                                </Button>
                            ) : (
                                <Button onClick={nextStep}>
                                    {t('common.next')}
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
