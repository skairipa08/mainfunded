'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, MapPin, GraduationCap, Calendar, Target, Share2, Heart, CheckCircle2, Loader2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { getCampaign, createCheckout, getPaymentStatus } from '@/lib/api';
import { verificationStatuses } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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
        // Reload campaign to show updated amounts
        const campaignRes = await getCampaign(campaignId);
        if (campaignRes.success) {
          setCampaign(campaignRes.data);
        }
        // Clear the session_id from URL
        router.push(`/campaign/${campaignId}`, { scroll: false });
        return;
      } else if (response.data?.status === 'expired') {
        setCheckingPayment(false);
        router.push(`/campaign/${campaignId}`, { scroll: false });
        return;
      }

      // Continue polling
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
        amount: parseFloat(donationAmount) * 100, // Convert to cents
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
      await navigator.clipboard.writeText(url);
      // Could add a toast notification here if needed
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
  const progress = campaign.goal_amount > 0 
    ? (campaign.raised_amount / campaign.goal_amount) * 100 
    : 0;
  const remaining = Math.max(0, campaign.goal_amount - campaign.raised_amount);
  const verificationStatus = student.verification_status || 'pending';
  const status = verificationStatuses[verificationStatus as keyof typeof verificationStatuses] || verificationStatuses.pending;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50 py-8">
        {checkingPayment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-lg font-medium">Verifying your payment...</p>
              <p className="text-gray-600">Please wait</p>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4">
          {/* Back Button */}
          <Button variant="ghost" onClick={() => router.push('/browse')} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaigns
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Campaign Image */}
              {campaign.cover_image && (
                <div className="relative h-64 md:h-96 rounded-lg overflow-hidden">
                  <img
                    src={campaign.cover_image}
                    alt={campaign.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Campaign Info */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-3xl mb-2">{campaign.title}</CardTitle>
                      <div className="flex items-center gap-2 mb-4">
                        <Badge className={status.color}>
                          {verificationStatus === 'verified' ? (
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                          ) : (
                            <Clock className="h-3 w-3 mr-1" />
                          )}
                          {status.label}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Story</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{campaign.story}</p>
                  </div>

                  {/* Student Info */}
                  <div className="border-t pt-6">
                    <h3 className="text-xl font-semibold mb-4">About the Student</h3>
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-700">
                        <strong className="w-32">Name:</strong>
                        <span>{student.name || 'Not provided'}</span>
                      </div>
                      {student.university && (
                        <div className="flex items-center text-gray-700">
                          <strong className="w-32">University:</strong>
                          <span>{student.university}</span>
                        </div>
                      )}
                      {student.field_of_study && (
                        <div className="flex items-center text-gray-700">
                          <GraduationCap className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{student.field_of_study}</span>
                        </div>
                      )}
                      {student.country && (
                        <div className="flex items-center text-gray-700">
                          <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{student.country}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Donor Wall */}
                  {campaign.donors && campaign.donors.length > 0 && (
                    <div className="border-t pt-6">
                      <h3 className="text-xl font-semibold mb-4">Recent Donors</h3>
                      <div className="space-y-2">
                        {campaign.donors.slice(0, 10).map((donor: any, index: number) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-700">{donor.name}</span>
                            <span className="font-semibold">${donor.amount.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Donation */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Support This Campaign</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold">
                        ${(campaign.raised_amount || 0).toLocaleString()} raised
                      </span>
                      <span className="text-gray-600">
                        ${(campaign.goal_amount || 0).toLocaleString()} goal
                      </span>
                    </div>
                    <Progress value={Math.min(progress, 100)} className="h-3 mb-2" />
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{campaign.donor_count || 0} donors</span>
                      <span>{progress.toFixed(0)}% funded</span>
                    </div>
                    {remaining > 0 && (
                      <p className="text-sm text-gray-600 mt-2">
                        ${remaining.toLocaleString()} still needed
                      </p>
                    )}
                  </div>

                  {/* Donation Form */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="amount">Donation Amount ($)</Label>
                      <Input
                        id="amount"
                        type="number"
                        min="1"
                        step="0.01"
                        placeholder="Enter amount"
                        value={donationAmount}
                        onChange={(e) => {
                          setDonationAmount(e.target.value);
                          setDonationError(null); // Clear error when user types
                        }}
                      />
                    </div>

                    {!session && (
                      <>
                        <div>
                          <Label htmlFor="name">Your Name (Optional)</Label>
                          <Input
                            id="name"
                            type="text"
                            placeholder="Your name"
                            value={donorName}
                            onChange={(e) => setDonorName(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Your Email (Optional)</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            value={donorEmail}
                            onChange={(e) => setDonorEmail(e.target.value)}
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
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mb-4">
                        {donationError}
                      </div>
                    )}
                    <Button
                      className="w-full"
                      size="lg"
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
                          Donate Now
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
