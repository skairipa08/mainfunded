'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
    ArrowLeft, MapPin, GraduationCap, Calendar, Share2, Heart,
    CheckCircle2, Loader2, Clock, ImageIcon, X, ChevronLeft, ChevronRight,
    FileCheck, Mail, FileText, Shield, TrendingUp, Users, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCampaign, createCheckout, getPaymentStatus } from '@/lib/api';
import { verificationStatuses } from '@/lib/verification-statuses';
import { toast } from 'sonner';
import { censorSurname } from '@/lib/privacy';
import { useTranslation } from '@/lib/i18n';
import type { CampaignData } from './fetchCampaign';

// Progress Circle Component
const ProgressCircle = ({ percentage }: { percentage: number }) => {
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (Math.min(percentage, 100) / 100) * circumference;

    return (
        <div className="relative w-20 h-20">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r={radius} stroke="#e5e7eb" strokeWidth="6" fill="none" />
                <circle
                    cx="40" cy="40" r={radius}
                    stroke="#3b82f6" strokeWidth="6" fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-500"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-900">{Math.round(percentage)}%</span>
            </div>
        </div>
    );
};

interface CampaignDetailClientProps {
    initialCampaign: CampaignData;
}

export default function CampaignDetailClient({ initialCampaign }: CampaignDetailClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const { t } = useTranslation();
    const campaignId = initialCampaign.campaign_id;

    const [campaign, setCampaign] = useState<CampaignData>(initialCampaign);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [checkingPayment, setCheckingPayment] = useState(false);
    const [showAllDonors, setShowAllDonors] = useState(false);
    const [donorFilter, setDonorFilter] = useState<'all' | 'top'>('all');

    // Lightbox state
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Check for payment return
    useEffect(() => {
        const sessionId = searchParams.get('session_id');
        if (sessionId) {
            checkPaymentStatus(sessionId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const checkPaymentStatus = async (sessionId: string, attempts = 0) => {
        const maxAttempts = 5;
        const pollInterval = 2000;

        if (attempts >= maxAttempts) {
            setCheckingPayment(false);
            return;
        }

        setCheckingPayment(true);

        try {
            const response = await getPaymentStatus(sessionId);

            if (response.data?.payment_status === 'paid') {
                setCheckingPayment(false);
                const campaignRes = await getCampaign(campaignId);
                if (campaignRes.success) {
                    setCampaign(campaignRes.data);
                }
                router.push(`/campaign/${campaignId}`, { scroll: false });
                return;
            } else if (response.data?.status === 'expired') {
                setCheckingPayment(false);
                router.push(`/campaign/${campaignId}`, { scroll: false });
                return;
            }

            setTimeout(() => checkPaymentStatus(sessionId, attempts + 1), pollInterval);
        } catch (error) {
            if (attempts < maxAttempts - 1) {
                setTimeout(() => checkPaymentStatus(sessionId, attempts + 1), pollInterval);
            } else {
                setCheckingPayment(false);
            }
        }
    };

    const handleShare = async () => {
        const url = window.location.href;
        try {
            if (navigator.share) {
                await navigator.share({
                    title: campaign?.title,
                    text: t('campaign.supportTitle', { name: campaign?.student?.name }),
                    url: url,
                });
            } else {
                await navigator.clipboard.writeText(url);
                toast.success(t('campaign.shareSuccess'));
            }
        } catch (error) {
            try {
                await navigator.clipboard.writeText(url);
                toast.success(t('campaign.shareSuccess'));
            } catch {
                toast.error(t('campaign.shareError'));
            }
        }
    };

    // Image carousel handlers
    const studentPhotos: string[] = campaign?.studentPhotos || [];
    const studentVideos: string[] = campaign?.studentVideos || [];
    const allPhotos = campaign.cover_image ? [campaign.cover_image, ...studentPhotos] : studentPhotos;

    const nextImage = () => {
        if (allPhotos.length > 0) {
            setCurrentImageIndex((prev) => (prev + 1) % allPhotos.length);
        }
    };
    const prevImage = () => {
        if (allPhotos.length > 0) {
            setCurrentImageIndex((prev) => (prev - 1 + allPhotos.length) % allPhotos.length);
        }
    };
    const openLightbox = (index: number) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    };
    const closeLightbox = () => {
        setLightboxOpen(false);
    };

    const student = campaign.student || {} as any;
    const progress = campaign.goal_amount > 0
        ? (campaign.raised_amount / campaign.goal_amount) * 100
        : 0;
    const verificationStatus = student.verification_status || 'pending';
    const status = verificationStatuses[verificationStatus as keyof typeof verificationStatuses] || verificationStatuses.pending;

    // Real donors from API
    const recentDonors = campaign.donors || [];

    const filteredDonors = donorFilter === 'top'
        ? [...recentDonors].sort((a, b) => b.amount - a.amount)
        : recentDonors;

    // Verified Documents
    const docTypes: string[] = campaign.documentTypes || [];
    const docStatuses: string[] = campaign.documentStatuses || [];

    const verificationMap: Record<string, string> = {};
    docTypes.forEach((type: string, i: number) => {
        if (type) {
            const currentStatus = verificationMap[type];
            const newStatus = docStatuses[i] || 'pending';
            if (!currentStatus || newStatus === 'approved') {
                verificationMap[type] = newStatus;
            }
        }
    });

    const verificationItems = [
        { type: 'id', label: t('campaign.verificationLabels.id'), icon: FileCheck },
        { type: 'school_email', label: t('campaign.verificationLabels.school_email'), icon: Mail },
        { type: 'transcript', label: t('campaign.verificationLabels.transcript'), icon: FileText },
    ];
    const hasAnyVerification = Object.keys(verificationMap).length > 0;

    return (
        <>
            {/* Payment checking overlay */}
            {checkingPayment && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 text-center shadow-xl">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                        <p className="text-lg font-medium">{t('campaign.verifyingPayment')}</p>
                        <p className="text-gray-600">{t('campaign.pleaseWait')}</p>
                    </div>
                </div>
            )}

            {/* Lightbox Modal */}
            {lightboxOpen && allPhotos.length > 0 && (
                <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50" onClick={closeLightbox}>
                    <button className="absolute top-4 right-4 text-white hover:text-gray-300 z-10" onClick={closeLightbox}>
                        <X className="h-8 w-8" />
                    </button>
                    {allPhotos.length > 1 && (
                        <>
                            <button
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-10 bg-black/50 rounded-full p-3"
                                onClick={(e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev - 1 + allPhotos.length) % allPhotos.length); }}
                            >
                                <ChevronLeft className="h-8 w-8" />
                            </button>
                            <button
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-10 bg-black/50 rounded-full p-3"
                                onClick={(e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev + 1) % allPhotos.length); }}
                            >
                                <ChevronRight className="h-8 w-8" />
                            </button>
                        </>
                    )}
                    <div className="max-w-5xl max-h-[85vh] relative" onClick={(e) => e.stopPropagation()}>
                        <Image
                            src={allPhotos[lightboxIndex]}
                            alt={`Photo ${lightboxIndex + 1}`}
                            width={1000}
                            height={750}
                            className="object-contain max-h-[85vh] rounded-lg"
                        />
                        <p className="text-white text-center mt-4 text-sm">
                            {lightboxIndex + 1} / {allPhotos.length}
                        </p>
                    </div>
                </div>
            )}

            {/* Donors Modal */}
            {showAllDonors && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAllDonors(false)}>
                    <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h3 className="text-xl font-bold">{t('campaign.donations')}</h3>
                                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-sm">
                                    {campaign.donor_count || recentDonors.length}
                                </span>
                            </div>
                            <button onClick={() => setShowAllDonors(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="px-6 py-3 border-b flex gap-2">
                            <button
                                onClick={() => setDonorFilter('all')}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${donorFilter === 'all'
                                    ? 'bg-gray-900 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {t('campaign.seeAll')}
                            </button>
                            <button
                                onClick={() => setDonorFilter('top')}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${donorFilter === 'top'
                                    ? 'bg-gray-900 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {t('campaign.topDonors')}
                            </button>
                        </div>

                        {donorFilter === 'top' && (
                            <div className="px-6 py-3 bg-blue-50 text-sm text-blue-700">
                                {t('campaign.beTopDonor', { name: censorSurname(student.name || 'this student'), amount: 110 })}
                            </div>
                        )}

                        <div className="overflow-y-auto max-h-[50vh] p-4 space-y-3">
                            {filteredDonors.length === 0 ? (
                                <div className="text-center py-8">
                                    <Heart className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">{t('campaign.noDonationsYet')}</p>
                                </div>
                            ) : (
                                filteredDonors.map((donor: any, index: number) => (
                                    <div key={index} className="flex items-center gap-3 p-2">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-semibold">
                                            {donor.name === 'Anonymous' ? '🤍' : donor.name.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{donor.name}</p>
                                            <p className="text-sm text-gray-500">
                                                <span className="font-semibold text-gray-700">${donor.amount}</span>
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-t">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Heart className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <p className="text-sm text-gray-700">{t('campaign.eachGift')}</p>
                                </div>
                                <Button size="sm" onClick={() => { setShowAllDonors(false); }}>
                                    {t('campaign.donate')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto px-4 py-6">
                {/* Back Button */}
                <Button variant="ghost" onClick={() => router.push('/browse')} className="mb-4 -ml-2">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t('campaign.back')}
                </Button>

                {/* Campaign Title */}
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">{campaign.title}</h1>

                <div className="grid lg:grid-cols-5 gap-8">
                    {/* Main Content - Left Side */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Image Carousel */}
                        <div className="relative rounded-2xl overflow-hidden bg-gray-100">
                            {allPhotos.length > 0 ? (
                                <>
                                    <div className="aspect-[4/3] relative cursor-pointer" onClick={() => openLightbox(currentImageIndex)}>
                                        <Image
                                            src={allPhotos[currentImageIndex]}
                                            alt={campaign.title}
                                            fill
                                            priority
                                            sizes="(max-width: 1024px) 100vw, 60vw"
                                            className="object-cover"
                                        />
                                    </div>
                                    {allPhotos.length > 1 && (
                                        <>
                                            <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all">
                                                <ChevronLeft className="h-5 w-5" />
                                            </button>
                                            <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all">
                                                <ChevronRight className="h-5 w-5" />
                                            </button>
                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                                {allPhotos.map((_, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => setCurrentImageIndex(idx)}
                                                        className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex
                                                            ? 'bg-white w-6'
                                                            : 'bg-white/60 hover:bg-white/80'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="aspect-[4/3] flex items-center justify-center">
                                    <ImageIcon className="h-16 w-16 text-gray-300" />
                                </div>
                            )}
                        </div>

                        {/* Student Name & Protection Badge */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                                {(student.name || 'S').charAt(0)}
                            </div>
                            <span className="font-medium text-gray-900">{censorSurname(student.name || 'Student')}</span>
                        </div>

                        <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
                            <Shield className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-700">{t('campaign.donationProtected')}</span>
                        </div>

                        {/* Videos */}
                        {studentVideos.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold text-gray-900">{t('campaign.videos')}</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {studentVideos.map((url, index) => (
                                        <div key={index} className="rounded-xl overflow-hidden bg-black">
                                            <div className="aspect-video relative">
                                                <video src={url} className="w-full h-full object-contain bg-black" controls />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Story */}
                        <div className="prose prose-gray max-w-none">
                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{campaign.story}</p>
                        </div>

                        {/* Organizer Section */}
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold mb-4">{t('campaign.campaignStudent')}</h3>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg">
                                    {(student.name || 'S').charAt(0)}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{censorSurname(student.name || 'Student')}</p>
                                    <p className="text-sm text-gray-500">{t('campaign.student')}</p>
                                    {student.country && (
                                        <p className="text-sm text-gray-500 flex items-center gap-1">
                                            <MapPin className="h-3 w-3" /> {student.country}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Student Details */}
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold mb-4">{t('campaign.about')}</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                {student.university && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <GraduationCap className="h-4 w-4 text-blue-500" />
                                        <span>{student.university}</span>
                                    </div>
                                )}
                                {student.field_of_study && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <GraduationCap className="h-4 w-4 text-blue-500" />
                                        <span>{student.field_of_study}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Calendar className="h-4 w-4 text-blue-500" />
                                    <span>{t('campaign.createdOn', { date: new Date(campaign.created_at || Date.now()).toLocaleDateString() })}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Users className="h-4 w-4 text-blue-500" />
                                    <span>{t('campaign.education')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Verified Documents */}
                        {hasAnyVerification && (
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    {t('campaign.studentVerification')}
                                </h4>
                                <div className="grid gap-2">
                                    {verificationItems.map((item) => {
                                        const docStatus = verificationMap[item.type];
                                        if (!docStatus) return null;
                                        const isApproved = docStatus === 'approved';
                                        const isRejected = docStatus === 'rejected';
                                        const isPending = !isApproved && !isRejected;

                                        return (
                                            <div
                                                key={item.type}
                                                className={`flex items-center gap-2 text-sm rounded-lg px-2 py-1.5 ${isApproved
                                                    ? 'text-green-700 bg-green-50'
                                                    : isRejected
                                                        ? 'text-red-600 bg-red-50'
                                                        : 'text-amber-700 bg-amber-50'
                                                    }`}
                                            >
                                                {isApproved && <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />}
                                                {isRejected && <X className="h-4 w-4 text-red-500 flex-shrink-0" />}
                                                {isPending && <Clock className="h-4 w-4 text-amber-500 flex-shrink-0" />}
                                                <item.icon className="h-4 w-4 flex-shrink-0" />
                                                <span>{item.label}</span>
                                                <span className="ml-auto text-xs font-medium">
                                                    {isApproved ? t('campaign.verificationLabels.approved') : isRejected ? t('campaign.verificationLabels.rejected') : t('campaign.verificationLabels.pending')}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Right Side */}
                    <div className="lg:col-span-2">
                        <div className="lg:sticky lg:top-20 space-y-4">
                            {/* Progress Card */}
                            <div className="bg-white border rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center gap-4 mb-4">
                                    <ProgressCircle percentage={progress} />
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {t('campaign.raisedOf', { raised: `$${(campaign.raised_amount || 0).toLocaleString()}`, goal: `$${(campaign.goal_amount || 0).toLocaleString()}` })}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {t('campaign.donationCount', { count: campaign.donor_count || 0 })}
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 mb-3"
                                    onClick={() => router.push(`/campaign/${campaignId}/donate`)}
                                >
                                    {t('campaign.donate')}
                                </Button>

                                <Button variant="outline" className="w-full h-12 text-base font-semibold" onClick={handleShare}>
                                    <Share2 className="h-4 w-4 mr-2" />
                                    {t('campaign.share')}
                                </Button>

                                {/* Trending Indicator */}
                                {recentDonors.length > 0 && (
                                    <div className="flex items-center gap-2 mt-4 text-blue-600">
                                        <TrendingUp className="h-4 w-4" />
                                        <span className="text-sm font-medium">
                                            {t('campaign.justDonated', { count: campaign.donor_count || recentDonors.length })}
                                        </span>
                                    </div>
                                )}

                                {/* Recent Donors */}
                                {recentDonors.length > 0 ? (
                                    <div className="mt-4 space-y-3">
                                        {recentDonors.slice(0, 5).map((donor: any, index: number) => (
                                            <div key={index} className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 text-sm font-medium">
                                                    {donor.name === 'Anonymous' ? '🤍' : donor.name.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 text-sm truncate">{donor.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        <span className="font-semibold text-gray-700">${donor.amount}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="mt-4 text-center py-4">
                                        <Heart className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">{t('campaign.noDonationsYet')}</p>
                                    </div>
                                )}

                                {/* See All / See Top Buttons */}
                                {recentDonors.length > 0 && (
                                    <div className="flex gap-2 mt-4">
                                        <button
                                            onClick={() => { setDonorFilter('all'); setShowAllDonors(true); }}
                                            className="flex-1 py-2 text-sm font-medium text-gray-700 border rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            {t('campaign.seeAll')}
                                        </button>
                                        <button
                                            onClick={() => { setDonorFilter('top'); setShowAllDonors(true); }}
                                            className="flex-1 py-2 text-sm font-medium text-gray-700 border rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                                        >
                                            {t('campaign.topDonors')}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Donation CTA Card */}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 shadow-sm text-center">
                                <Heart className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                                <h3 className="font-semibold text-gray-900 mb-1">{t('campaign.supportCtaTitle')}</h3>
                                <p className="text-sm text-gray-600 mb-4">{t('campaign.supportCtaDesc')}</p>
                                <Button
                                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 font-semibold text-base"
                                    onClick={() => router.push(`/campaign/${campaignId}/donate`)}
                                >
                                    <Heart className="h-4 w-4 mr-2" />
                                    {t('campaign.donate')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
