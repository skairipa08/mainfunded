'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  ArrowLeft, MapPin, GraduationCap, Calendar, Share2, Heart,
  CheckCircle2, Loader2, Clock, ImageIcon, X, ChevronLeft, ChevronRight,
  FileCheck, Mail, FileText, Shield, TrendingUp, Users, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { getCampaign, createCheckout, getPaymentStatus } from '@/lib/api';
import { verificationStatuses } from '@/lib/api';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { censorSurname } from '@/lib/privacy';

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [donationAmount, setDonationAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [donationError, setDonationError] = useState<string | null>(null);
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

  // Load campaign data
  useEffect(() => {
    const loadCampaign = async () => {
      try {
        const response = await getCampaign(campaignId);
        if (response.success) {
          setCampaign(response.data);
        }
      } catch (error) {
        // Error handled by UI
      } finally {
        setLoading(false);
      }
    };
    loadCampaign();
  }, [campaignId]);

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

  const handleDonate = async () => {
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      setDonationError('Please enter a valid donation amount');
      return;
    }

    setDonationError(null);
    setProcessingPayment(true);

    try {
      const originUrl = window.location.origin;
      const response = await createCheckout({
        campaign_id: campaignId,
        amount: parseFloat(donationAmount) * 100,
        donor_name: isAnonymous ? undefined : (donorName || session?.user?.name),
        donor_email: isAnonymous ? undefined : (donorEmail || session?.user?.email),
        anonymous: isAnonymous,
        origin_url: originUrl,
      });

      if (response.data?.checkout_url || response.data?.url) {
        window.location.href = response.data.checkout_url || response.data.url;
      } else {
        setDonationError('Unable to start payment. Please try again.');
        setProcessingPayment(false);
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message ||
        error?.message ||
        'Payment could not be processed. Please try again.';
      setDonationError(errorMessage);
      setProcessingPayment(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: campaign?.title,
          text: `Support ${campaign?.student?.name}'s education`,
          url: url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
      } catch {
        toast.error('Could not copy link');
      }
    }
  };

  // Image carousel handlers
  const nextImage = () => {
    const photos = campaign?.studentPhotos || [];
    if (photos.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % photos.length);
    }
  };

  const prevImage = () => {
    const photos = campaign?.studentPhotos || [];
    if (photos.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + photos.length) % photos.length);
    }
  };

  // Lightbox handlers
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Campaign not found</h2>
            <Button onClick={() => router.push('/browse')}>Browse Campaigns</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const student = campaign.student || {};
  const studentPhotos: string[] = campaign.studentPhotos || [];
  const allPhotos = campaign.cover_image ? [campaign.cover_image, ...studentPhotos] : studentPhotos;
  const progress = campaign.goal_amount > 0
    ? (campaign.raised_amount / campaign.goal_amount) * 100
    : 0;
  const verificationStatus = student.verification_status || 'pending';
  const status = verificationStatuses[verificationStatus as keyof typeof verificationStatuses] || verificationStatuses.pending;

  // Mock recent donors for demo
  const recentDonors = campaign.donors || [
    { name: 'Anonymous', amount: 300, time: '20 hrs', isTop: true },
    { name: 'Ahmet K.', amount: 200, time: '2 d' },
    { name: 'Fatma Y.', amount: 120, time: '2 d' },
    { name: 'Mehmet D.', amount: 100, time: '2 hrs' },
    { name: 'Ayse B.', amount: 50, time: '2 hrs' },
  ];

  const filteredDonors = donorFilter === 'top'
    ? [...recentDonors].sort((a, b) => b.amount - a.amount)
    : recentDonors;

  // Progress Circle Component
  const ProgressCircle = ({ percentage }: { percentage: number }) => {
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (Math.min(percentage, 100) / 100) * circumference;

    return (
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90">
          <circle
            cx="40"
            cy="40"
            r="35"
            stroke="#e5e7eb"
            strokeWidth="6"
            fill="none"
          />
          <circle
            cx="40"
            cy="40"
            r="35"
            stroke="#3b82f6"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 35}
            strokeDashoffset={2 * Math.PI * 35 - (Math.min(percentage, 100) / 100) * 2 * Math.PI * 35}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-gray-900">{Math.round(percentage)}%</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-grow">
        {/* Payment checking overlay */}
        {checkingPayment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 text-center shadow-xl">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-lg font-medium">Verifying your payment...</p>
              <p className="text-gray-600">Please wait</p>
            </div>
          </div>
        )}

        {/* Lightbox Modal */}
        {lightboxOpen && allPhotos.length > 0 && (
          <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50" onClick={closeLightbox}>
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
              onClick={closeLightbox}
            >
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
                  <h3 className="text-xl font-bold">Donations</h3>
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-sm">
                    {campaign.donor_count || recentDonors.length}
                  </span>
                </div>
                <button onClick={() => setShowAllDonors(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="px-6 py-3 border-b flex gap-2">
                <button
                  onClick={() => setDonorFilter('all')}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${donorFilter === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  All
                </button>
                <button
                  onClick={() => setDonorFilter('top')}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${donorFilter === 'top'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  Top
                </button>
              </div>

              {donorFilter === 'top' && (
                <div className="px-6 py-3 bg-blue-50 text-sm text-blue-700">
                  Be a top donor for {censorSurname(student.name || 'this student')} with $110 or more.
                </div>
              )}

              {/* Donor List */}
              <div className="overflow-y-auto max-h-[50vh] p-4 space-y-3">
                {filteredDonors.map((donor: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-semibold">
                      {donor.name === 'Anonymous' ? '🤍' : donor.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{donor.name}</p>
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold text-gray-700">${donor.amount}</span>
                        {donor.isTop && <span className="text-blue-600 ml-1">· Top donation</span>}
                        {donor.time && !donor.isTop && <span> · {donor.time}</span>}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Banner */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Heart className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-sm text-gray-700">
                      Each gift brings hope — together, we create change.
                    </p>
                  </div>
                  <Button size="sm" onClick={() => { setShowAllDonors(false); }}>
                    Donate
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
            Back
          </Button>

          {/* Campaign Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            {campaign.title}
          </h1>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Main Content - Left Side */}
            <div className="lg:col-span-3 space-y-6">
              {/* Main Image with Carousel */}
              <div className="relative rounded-2xl overflow-hidden bg-gray-100">
                {allPhotos.length > 0 ? (
                  <>
                    <div
                      className="aspect-[4/3] relative cursor-pointer"
                      onClick={() => openLightbox(currentImageIndex)}
                    >
                      <Image
                        src={allPhotos[currentImageIndex]}
                        alt={campaign.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    {allPhotos.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                        {/* Dots */}
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

              {/* Protection Badge */}
              <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Donation protected</span>
              </div>

              {/* Story */}
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {campaign.story}
                </p>
              </div>

              {/* Organizer Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Campaign Student</h3>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg">
                    {(student.name || 'S').charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{censorSurname(student.name || 'Student')}</p>
                    <p className="text-sm text-gray-500">Student</p>
                    {student.country && (
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {student.country}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Student Details */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">About This Campaign</h3>
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
                    <span>Created {new Date(campaign.created_at || Date.now()).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span>Education</span>
                  </div>
                </div>
              </div>

              {/* Verified Documents */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Verified Student
                </h4>
                <div className="grid gap-2">
                  {[
                    { label: 'ID verified', icon: FileCheck },
                    { label: 'School email verified', icon: Mail },
                    { label: 'Transcript verified', icon: FileText },
                  ].map((doc, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-green-700">
                      <doc.icon className="h-4 w-4" />
                      <span>{doc.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar - Right Side */}
            <div className="lg:col-span-2">
              <div className="lg:sticky lg:top-20 space-y-4">
                {/* Progress Card */}
                <div className="bg-white border rounded-2xl p-6 shadow-sm">
                  {/* Progress Header */}
                  <div className="flex items-center gap-4 mb-4">
                    <ProgressCircle percentage={progress} />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        ${(campaign.raised_amount || 0).toLocaleString()} raised
                        <span className="text-base font-normal text-gray-500 ml-1">
                          of ${(campaign.goal_amount || 0).toLocaleString()}
                        </span>
                      </p>
                      <p className="text-sm text-gray-500">
                        {campaign.donor_count || 0} donations
                      </p>
                    </div>
                  </div>

                  {/* Donate Button */}
                  <Button
                    className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 mb-3"
                    onClick={() => document.getElementById('donation-form')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Donate now
                  </Button>

                  {/* Share Button */}
                  <Button
                    variant="outline"
                    className="w-full h-12 text-base font-semibold"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>

                  {/* Trending Indicator */}
                  <div className="flex items-center gap-2 mt-4 text-blue-600">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {campaign.donor_count || recentDonors.length} people just donated
                    </span>
                  </div>

                  {/* Recent Donors */}
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
                            {donor.isTop && <span className="text-blue-600"> · Top donation</span>}
                            {donor.time && !donor.isTop && <span> · {donor.time}</span>}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* See All / See Top Buttons */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => { setDonorFilter('all'); setShowAllDonors(true); }}
                      className="flex-1 py-2 text-sm font-medium text-gray-700 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      See all
                    </button>
                    <button
                      onClick={() => { setDonorFilter('top'); setShowAllDonors(true); }}
                      className="flex-1 py-2 text-sm font-medium text-gray-700 border rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                    >
                      Top donors
                    </button>
                  </div>
                </div>

                {/* Donation Form Card */}
                <div id="donation-form" className="bg-white border rounded-2xl p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">Make a Donation</h3>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="amount">Amount ($)</Label>
                      <Input
                        id="amount"
                        type="number"
                        min="1"
                        step="0.01"
                        placeholder="Enter amount"
                        value={donationAmount}
                        onChange={(e) => {
                          setDonationAmount(e.target.value);
                          setDonationError(null);
                        }}
                        className="mt-1"
                      />
                    </div>

                    {/* Quick Amount Buttons */}
                    <div className="grid grid-cols-4 gap-2">
                      {[25, 50, 100, 250].map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setDonationAmount(amount.toString())}
                          className={`py-2 text-sm font-medium border rounded-lg transition-colors ${donationAmount === amount.toString()
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 hover:border-blue-300'
                            }`}
                        >
                          ${amount}
                        </button>
                      ))}
                    </div>

                    {!session && (
                      <>
                        <div>
                          <Label htmlFor="name">Your Name</Label>
                          <Input
                            id="name"
                            type="text"
                            placeholder="Your name"
                            value={donorName}
                            onChange={(e) => setDonorName(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            value={donorEmail}
                            onChange={(e) => setDonorEmail(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </>
                    )}

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="anonymous"
                        checked={isAnonymous}
                        onCheckedChange={(checked) => setIsAnonymous(checked === true)}
                      />
                      <Label htmlFor="anonymous" className="text-sm">
                        Donate anonymously
                      </Label>
                    </div>

                    {donationError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                        {donationError}
                      </div>
                    )}

                    <Button
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700"
                      onClick={handleDonate}
                      disabled={processingPayment || !donationAmount || parseFloat(donationAmount) <= 0}
                    >
                      {processingPayment ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Heart className="h-4 w-4 mr-2" />
                          Donate ${donationAmount || '0'}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
