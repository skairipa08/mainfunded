'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import { getTierBadgeInfo, TIER_CONFIG } from '@/lib/verification/tiers';
import type { VerificationStatusType, VerificationTier } from '@/types/verification';

interface VerificationStatus {
    verification_id: string;
    status: VerificationStatusType;
    tier_requested: VerificationTier;
    tier_approved?: VerificationTier;
    first_name: string;
    last_name: string;
    institution_name: string;
    submitted_at?: string;
    reviewed_at?: string;
    created_at: string;
    reapply_eligible_at?: string;
}

const STATUS_CONFIG: Record<VerificationStatusType, { color: string; icon: string; bgColor: string }> = {
    'DRAFT': { color: 'text-gray-600', icon: '📝', bgColor: 'bg-gray-100' },
    'PENDING_REVIEW': { color: 'text-yellow-600', icon: '⏳', bgColor: 'bg-yellow-100' },
    'APPROVED': { color: 'text-emerald-600', icon: '✓', bgColor: 'bg-emerald-100' },
    'REJECTED': { color: 'text-red-600', icon: '✗', bgColor: 'bg-red-100' },
    'NEEDS_MORE_INFO': { color: 'text-orange-600', icon: '❓', bgColor: 'bg-orange-100' },
    'UNDER_INVESTIGATION': { color: 'text-purple-600', icon: '🔍', bgColor: 'bg-purple-100' },
    'SUSPENDED': { color: 'text-red-600', icon: '⏸', bgColor: 'bg-red-100' },
    'EXPIRED': { color: 'text-gray-600', icon: '⌛', bgColor: 'bg-gray-100' },
    'REVOKED': { color: 'text-red-600', icon: '🚫', bgColor: 'bg-red-100' },
    'PERMANENTLY_BANNED': { color: 'text-red-800', icon: '⛔', bgColor: 'bg-red-200' },
    'ABANDONED': { color: 'text-gray-500', icon: '📦', bgColor: 'bg-gray-100' },
};

function VerifyStatusPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session, status: authStatus } = useSession();
    const { t } = useTranslation();

    const [verification, setVerification] = useState<VerificationStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const verificationId = searchParams.get('id');

    const fetchVerificationStatus = useCallback(async () => {
        try {
            const url = verificationId
                ? `/api/verification?id=${verificationId}`
                : '/api/verification';

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch verification status');
            }

            const data = await response.json();
            setVerification(data.verification);
        } catch (err) {
            setError('Could not load verification status');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [verificationId]);

    useEffect(() => {
        if (authStatus === 'unauthenticated') {
            router.replace('/login?callbackUrl=/verify/status');
            return;
        }

        if (authStatus === 'authenticated') {
            fetchVerificationStatus();
        }
    }, [authStatus, verificationId, router, fetchVerificationStatus]);

    if (authStatus === 'loading' || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    if (error || !verification) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                <main className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            {t('verification.noVerification') || 'No Verification Found'}
                        </h2>
                        <p className="text-gray-600 mb-6">
                            {t('verification.startVerification') || 'Start your verification process to create campaigns.'}
                        </p>
                        <Button onClick={() => router.push('/verify')}>
                            {t('verification.startNow') || 'Start Verification'}
                        </Button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const statusConfig = STATUS_CONFIG[verification.status];
    const tierBadge = verification.tier_approved !== undefined
        ? getTierBadgeInfo(verification.tier_approved)
        : getTierBadgeInfo(verification.tier_requested);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow py-12">
                <div className="max-w-2xl mx-auto px-4">
                    {/* Status Card */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        {/* Header */}
                        <div className={`${statusConfig.bgColor} px-6 py-8 text-center`}>
                            <div className="text-4xl mb-4">{statusConfig.icon}</div>
                            <h1 className={`text-2xl font-bold ${statusConfig.color}`}>
                                {t(`verification.status.${verification.status.toLowerCase()}`) || verification.status.replace(/_/g, ' ')}
                            </h1>
                            {verification.status === 'APPROVED' && verification.tier_approved !== undefined && (
                                <div className={`inline-block mt-3 px-4 py-2 rounded-full text-sm font-medium ${tierBadge.color}`}>
                                    {tierBadge.label}
                                </div>
                            )}
                        </div>

                        {/* Details */}
                        <div className="px-6 py-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500">{t('verification.applicant') || 'Applicant'}:</span>
                                    <p className="font-medium text-gray-900">{verification.first_name} {verification.last_name}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500">{t('verification.institution') || 'Institution'}:</span>
                                    <p className="font-medium text-gray-900">{verification.institution_name}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500">{t('verification.tierRequested') || 'Tier Requested'}:</span>
                                    <p className="font-medium text-gray-900">Tier {verification.tier_requested}</p>
                                </div>
                                {verification.tier_approved !== undefined && (
                                    <div>
                                        <span className="text-gray-500">{t('verification.tierApproved') || 'Tier Approved'}:</span>
                                        <p className="font-medium text-emerald-600">Tier {verification.tier_approved}</p>
                                    </div>
                                )}
                                <div>
                                    <span className="text-gray-500">{t('verification.submittedAt') || 'Submitted'}:</span>
                                    <p className="font-medium text-gray-900">
                                        {verification.submitted_at
                                            ? new Date(verification.submitted_at).toLocaleDateString()
                                            : '-'}
                                    </p>
                                </div>
                                {verification.reviewed_at && (
                                    <div>
                                        <span className="text-gray-500">{t('verification.reviewedAt') || 'Reviewed'}:</span>
                                        <p className="font-medium text-gray-900">
                                            {new Date(verification.reviewed_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Status-specific messages */}
                            {verification.status === 'PENDING_REVIEW' && (
                                <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                    <h4 className="font-medium text-yellow-800 mb-1">
                                        {t('verification.pendingTitle') || 'Under Review'}
                                    </h4>
                                    <p className="text-sm text-yellow-700">
                                        {t('verification.pendingMessage') || 'Your verification is being reviewed by our team. This usually takes 1-3 business days.'}
                                    </p>
                                </div>
                            )}

                            {verification.status === 'APPROVED' && (
                                <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                                    <h4 className="font-medium text-emerald-800 mb-1">
                                        {t('verification.approvedTitle') || 'Verification Approved!'}
                                    </h4>
                                    <p className="text-sm text-emerald-700 mb-3">
                                        {t('verification.approvedMessage') || 'You can now create campaigns to receive donations.'}
                                    </p>
                                    <Button onClick={() => router.push('/campaigns/new')} size="sm">
                                        {t('campaign.createCampaign') || 'Create Campaign'}
                                    </Button>
                                </div>
                            )}

                            {verification.status === 'REJECTED' && (
                                <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
                                    <h4 className="font-medium text-red-800 mb-1">
                                        {t('verification.rejectedTitle') || 'Verification Rejected'}
                                    </h4>
                                    <p className="text-sm text-red-700 mb-3">
                                        {t('verification.rejectedMessage') || 'Unfortunately, your verification was not approved. Please check the reason and try again.'}
                                    </p>
                                    {verification.reapply_eligible_at && (
                                        <p className="text-xs text-red-600">
                                            {t('verification.reapplyAfter') || 'You can reapply after'}: {new Date(verification.reapply_eligible_at).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            )}

                            {verification.status === 'NEEDS_MORE_INFO' && (
                                <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                                    <h4 className="font-medium text-orange-800 mb-1">
                                        {t('verification.needsInfoTitle') || 'Additional Information Required'}
                                    </h4>
                                    <p className="text-sm text-orange-700 mb-3">
                                        {t('verification.needsInfoMessage') || 'Please provide additional documents or information to complete your verification.'}
                                    </p>
                                    <Button onClick={() => router.push('/verify')} size="sm" variant="outline">
                                        {t('verification.updateApplication') || 'Update Application'}
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t text-center">
                            <p className="text-xs text-gray-500">
                                {t('verification.id') || 'Verification ID'}: {verification.verification_id}
                            </p>
                        </div>
                    </div>

                    {/* Back button */}
                    <div className="mt-6 text-center">
                        <Button variant="outline" onClick={() => router.push('/')}>
                            {t('common.back')} {t('nav.home')}
                        </Button>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default function VerifyStatusPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>}>
            <VerifyStatusPageContent />
        </Suspense>
    );
}
