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

interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
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
  const { data: session, status } = useSession();
  const router = useRouter();
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Manage your profile and campaigns</p>
          </div>

          {/* Verification Status */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Verification Status
            </h2>

            {verificationStatus === 'none' && (
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <Clock className="h-6 w-6 text-gray-400 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Not Verified
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Create a student profile and get verified to start fundraising for your education.
                    </p>
                    <Button onClick={() => router.push('/onboarding')}>
                      Get Verified
                    </Button>
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
                      Verification Pending
                    </h3>
                    <p className="text-gray-600">
                      Your student profile is under review. We&apos;ll notify you by email once verification is complete, usually within 24-48 hours.
                    </p>
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
                      Verified Student
                    </h3>
                    <p className="text-gray-600 mb-4">
                      You&apos;re verified and can create campaigns!
                    </p>
                    {userData?.student_profile && (
                      <div className="text-sm text-gray-600 space-y-1">
                        {userData.student_profile.university && (
                          <p><strong>University:</strong> {userData.student_profile.university}</p>
                        )}
                        {userData.student_profile.fieldOfStudy && (
                          <p><strong>Field of Study:</strong> {userData.student_profile.fieldOfStudy}</p>
                        )}
                        {userData.student_profile.country && (
                          <p><strong>Country:</strong> {userData.student_profile.country}</p>
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
                      Verification Rejected
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Your verification request was not approved. Please review your submission and ensure all information is accurate. Contact support if you have questions.
                    </p>
                    <Button variant="outline" onClick={() => router.push('/onboarding')}>
                      View Requirements
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Campaigns Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Your Campaigns
              </h2>
              {isVerified && (
                <Button onClick={() => router.push('/campaigns/new')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Campaign
                </Button>
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
                    Create Your First Campaign
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map((campaign) => (
                  <div key={campaign.campaign_id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{campaign.title}</h3>
                    <div className="text-sm text-gray-600 mb-4">
                      <p>Status: <span className="font-medium">{campaign.status}</span></p>
                      <p>
                        Progress: ${campaign.raised_amount.toLocaleString()} / ${campaign.goal_amount.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/campaign/${campaign.campaign_id}`)}
                      >
                        View
                        <ExternalLink className="ml-2 h-3 w-3" />
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
