'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, XCircle, Clock, Plus, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CampaignCard from '@/components/CampaignCard';
import { useCurrency } from '@/lib/currency-context';
import { useTranslation } from "@/lib/i18n/context";

interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
  accountType?: string;
  student_profile?: {
    verificationStatus: string;
    country?: string;
    fieldOfStudy?: string;
    university?: string;
  };
}

interface Campaign {
  campaign_id: string;
  title: string;
  status: string;
  goal_amount: number;
  raised_amount: number;
  created_at: string;
}

export default function DashboardPage() {
    const { t } = useTranslation();
  const { data: session, status } = useSession();
  const router = useRouter();
  const { formatAmount } = useCurrency();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.replace('/login');
      return;
    }

    const loadData = async () => {
      try {
        const [userRes, campaignsRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/campaigns/my'),
        ]);

        if (userRes.ok) {
          const userResult = await userRes.json();
          if (userResult.success) {
            setUserData(userResult.data);
          }
        }

        if (campaignsRes.ok) {
          const campaignsResult = await campaignsRes.json();
          if (campaignsResult.success) {
            setCampaigns(campaignsResult.data || []);
          }
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [session, status, router]);

  // Redirect students to the dedicated student panel
  useEffect(() => {
    if (userData?.accountType === 'student' || (!userData?.accountType && userData?.student_profile)) {
      router.replace('/student/panel');
    }
  }, [userData, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const verificationStatus = userData?.student_profile?.verificationStatus || 'none';
  const isVerified = verificationStatus === 'verified';
  const isPending = verificationStatus === 'pending';
  const isRejected = verificationStatus === 'rejected';

  const accountTypeLabels: Record<string, { label: string; icon: string; color: string }> = {
    student: { label: 'Öğrenci / Student', icon: '🎓', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    donor: { label: 'Bağışçı / Donor', icon: '💝', color: 'bg-pink-100 text-pink-800 border-pink-200' },
    mentor: { label: 'Mentör / Mentor', icon: '🧭', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    parent: { label: 'Veli / Parent', icon: '👨‍👩‍👧', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    teacher: { label: 'Öğretmen / Teacher', icon: '📚', color: 'bg-green-100 text-green-800 border-green-200' },
    school: { label: 'Okul / School', icon: '🏫', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  };

  const currentAccountType = userData?.accountType || 'student';
  const accountInfo = accountTypeLabels[currentAccountType] || accountTypeLabels.student;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{t('app.page.dashboard')}</h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${accountInfo.color}`}>
                <span>{accountInfo.icon}</span>
                {accountInfo.label}
              </span>
            </div>
            <p className="text-gray-600">{t('app.page.manage_your_profile_and_campai')}</p>
          </div>

          {/* Verification Status */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('app.page.verification_status')}</h2>

            {verificationStatus === 'none' && (
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <Clock className="h-6 w-6 text-gray-400 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {t('app.page.not_verified')}</h3>
                    <p className="text-gray-600 mb-4">
                      {t('app.page.create_a_student_profile_and_g')}</p>
                    <Button onClick={() => router.push('/onboarding')}>
                      {t('app.page.get_verified')}</Button>
                  </div>
                </div>
              </div>
            )}

            {isPending && (
              <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <Clock className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {t('app.page.verification_pending')}</h3>
                    <p className="text-gray-600">
                      {t('app.page.your_student_profile_is_under_')}</p>
                  </div>
                </div>
              </div>
            )}

            {isVerified && (
              <div className="border border-green-200 bg-green-50 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {t('app.page.verified_student')}</h3>
                    <p className="text-gray-600 mb-4">
                      {t('app.page.you_apos_re_verified_and_can_c')}</p>
                    {userData?.student_profile && (
                      <div className="text-sm text-gray-600 space-y-1">
                        {userData.student_profile.university && (
                          <p><strong>{t('app.page.university')}</strong> {userData.student_profile.university}</p>
                        )}
                        {userData.student_profile.fieldOfStudy && (
                          <p><strong>{t('app.page.field_of_study')}</strong> {userData.student_profile.fieldOfStudy}</p>
                        )}
                        {userData.student_profile.country && (
                          <p><strong>{t('app.page.country')}</strong> {userData.student_profile.country}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {isRejected && (
              <div className="border border-red-200 bg-red-50 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {t('app.page.verification_rejected')}</h3>
                    <p className="text-gray-600 mb-4">
                      {t('app.page.your_verification_request_was_')}</p>
                    <Button variant="outline" onClick={() => router.push('/onboarding')}>
                      {t('app.page.view_requirements')}</Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Campaigns Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {t('app.page.your_campaigns')}</h2>
              {isVerified && (
                <Button onClick={() => router.push('/campaigns/new')}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('app.page.create_campaign')}</Button>
              )}
            </div>

            {campaigns.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">
                  {isVerified
                    ? "You haven't created any campaigns yet. Start your first fundraising campaign to share your story with supporters."
                    : "Get verified to start creating campaigns and raising funds for your education."}
                </p>
                {isVerified && (
                  <Button onClick={() => router.push('/campaigns/new')}>
                    {t('app.page.create_your_first_campaign')}</Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map((campaign) => (
                  <div key={campaign.campaign_id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{campaign.title}</h3>
                    <div className="text-sm text-gray-600 mb-4">
                      <p>{t('app.page.status')}<span className="font-medium">{campaign.status}</span></p>
                      <p>
                        {t('app.page.progress')}{formatAmount(campaign.raised_amount)} / {formatAmount(campaign.goal_amount)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/campaign/${campaign.campaign_id}`)}
                      >
                        {t('app.page.view')}<ExternalLink className="ml-2 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
