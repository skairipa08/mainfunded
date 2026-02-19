'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Heart,
  ArrowLeft,
  Calendar,
  DollarSign,
  GraduationCap,
  MapPin,
  Receipt,
  Send,
  FileText,
  Download,
  Play,
  MessageSquare,
  BookOpen,
  Award,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';

// Recharts for allocation chart
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const ALLOCATION_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

interface DonationDetail {
  donation: {
    donation_id: string;
    campaign_id: string;
    amount: number;
    currency: string;
    created_at: string;
    payment_status: string;
    donor_name: string;
    receipt_url?: string;
    allocation_breakdown?: AllocationItem[];
  };
  campaign: {
    campaign_id: string;
    title: string;
    category: string;
    story: string;
    status: string;
    goal_amount: number;
    raised_amount: number;
    owner_id: string;
    created_at: string;
  } | null;
  student: {
    name: string;
    image: string | null;
    university: string;
    department: string;
    country: string;
  } | null;
  updates: CampaignUpdate[];
  messages: Message[];
}

interface AllocationItem {
  label: string;
  percentage: number;
  amount?: number;
}

interface CampaignUpdate {
  update_id?: string;
  content: string;
  media_url?: string;
  media_type?: string;
  created_at: string;
  type?: string;
}

interface Message {
  message_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  created_at: string;
  type: string;
}

function DonationDetailContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const donationId = params.donation_id as string;
  const { t } = useTranslation();

  const [data, setData] = useState<DonationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'updates' | 'messages'>('overview');
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login?callbackUrl=/my-donations');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated' && donationId) {
      fetchDonationDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, donationId]);

  async function fetchDonationDetail() {
    setLoading(true);
    try {
      const res = await fetch(`/api/donations/my/${donationId}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (error) {
      console.error('Failed to fetch donation detail:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !data?.donation?.campaign_id) return;

    setSendingMessage(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: data.donation.campaign_id,
          donation_id: donationId,
          content: newMessage.trim(),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setNewMessage('');
        setMessageSent(true);
        setTimeout(() => setMessageSent(false), 3000);
        fetchDonationDetail();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSendingMessage(false);
    }
  }

  async function handleReceiptDownload() {
    try {
      const res = await fetch(`/api/donations/my/${donationId}/receipt`);
      const json = await res.json();
      if (json.success && json.data.receipt) {
        const receipt = json.data.receipt;
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();

        doc.setFontSize(24);
        doc.setTextColor(37, 99, 235);
        doc.text('FundEd', 14, 25);

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Educational Crowdfunding Platform', 14, 32);

        doc.setDrawColor(37, 99, 235);
        doc.setLineWidth(0.5);
        doc.line(14, 36, 196, 36);

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text(t('myDonationsPage.detail.receiptTitle'), 14, 48);

        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);

        const fields = [
          [`${t('myDonationsPage.detail.receiptNo')}:`, receipt.receipt_number],
          [`${t('myDonationsPage.detail.donor')}:`, receipt.donor_name],
          ['E-posta:', receipt.donor_email],
          [`${t('myDonationsPage.campaign')}:`, receipt.campaign_title],
          [`${t('myDonationsPage.amount')}:`, `$${receipt.amount} ${receipt.currency}`],
          [`${t('myDonationsPage.date')}:`, new Date(receipt.date).toLocaleDateString('tr-TR')],
          [`${t('myDonationsPage.status')}:`, receipt.payment_status === 'paid' || receipt.payment_status === 'completed' ? t('myDonationsPage.completed') : receipt.payment_status],
        ];

        let y = 58;
        fields.forEach(([label, value]) => {
          doc.setFont('helvetica', 'bold');
          doc.text(label, 14, y);
          doc.setFont('helvetica', 'normal');
          doc.text(String(value), 60, y);
          y += 8;
        });

        // Allocation breakdown if available
        if (data?.donation?.allocation_breakdown?.length) {
          y += 10;
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.text(`${t('myDonationsPage.detail.allocationTitle')}:`, 14, y);
          y += 8;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          data.donation.allocation_breakdown.forEach((item) => {
            doc.text(`- ${item.label}: %${item.percentage}${item.amount ? ` ($${item.amount})` : ''}`, 14, y);
            y += 6;
          });
        }

        doc.setDrawColor(200, 200, 200);
        doc.line(14, y + 4, 196, y + 4);

        y += 14;
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.text(t('myDonationsPage.detail.receiptFooter'), 14, y);
        doc.text(t('myDonationsPage.detail.receiptTax'), 14, y + 6);

        doc.save(`makbuz_${receipt.receipt_number}.pdf`);
      }
    } catch (error) {
      console.error('Receipt download failed:', error);
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin mx-auto text-blue-600 mb-4 border-4 border-blue-200 border-t-blue-600 rounded-full" />
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!session?.user || !data) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('myDonationsPage.noDonations')}</h2>
            <p className="text-gray-500 mb-6">{t('myDonationsPage.noDonationsDesc')}</p>
            <Button onClick={() => router.push('/my-donations')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('myDonationsPage.detail.backToList')}
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { donation, campaign, student, updates, messages } = data;

  // Prepare allocation data for chart
  const allocationData = donation.allocation_breakdown?.length
    ? donation.allocation_breakdown.map((item, index) => ({
      name: item.label,
      value: item.percentage,
      amount: item.amount || (donation.amount * item.percentage / 100),
      color: ALLOCATION_COLORS[index % ALLOCATION_COLORS.length],
    }))
    : null;

  const progressPercentage = campaign
    ? Math.min(100, (campaign.raised_amount / campaign.goal_amount) * 100)
    : 0;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow">
        {/* Hero */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href="/my-donations"
              className="inline-flex items-center text-blue-200 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('myDonationsPage.detail.backToList')}
            </Link>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-start gap-5">
                {/* Student Avatar */}
                <div className="flex-shrink-0">
                  {student?.image ? (
                    <div className="relative w-20 h-20">
                      <Image
                        src={student.image}
                        alt={student.name}
                        fill
                        className="rounded-xl border-3 border-white/50 object-cover shadow-lg"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-white/20 flex items-center justify-center text-3xl font-bold shadow-lg">
                      {student?.name?.charAt(0) || <GraduationCap className="h-8 w-8" />}
                    </div>
                  )}
                </div>

                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-1 line-clamp-2">
                    {campaign?.title || t('myDonationsPage.campaign')}
                  </h1>
                  {student && (
                    <div className="flex flex-wrap items-center gap-3 text-blue-200 text-sm">
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {student.name}
                      </span>
                      {student.university && (
                        <span className="flex items-center gap-1">
                          <GraduationCap className="h-4 w-4" />
                          {student.university}
                        </span>
                      )}
                      {student.department && (
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {student.department}
                        </span>
                      )}
                      {student.country && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {student.country}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="bg-white/15 backdrop-blur-sm rounded-xl px-5 py-3 text-center">
                  <p className="text-xs text-blue-200 mb-0.5">{t('myDonationsPage.detail.donationAmount')}</p>
                  <p className="text-2xl font-bold">${donation.amount?.toLocaleString()}</p>
                </div>
                <div className="bg-white/15 backdrop-blur-sm rounded-xl px-5 py-3 text-center">
                  <p className="text-xs text-blue-200 mb-0.5">{t('myDonationsPage.detail.donationDate')}</p>
                  <p className="text-sm font-semibold">{formatDate(donation.created_at)}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                  onClick={handleReceiptDownload}
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  {t('myDonationsPage.detail.downloadReceipt')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Progress */}
        {campaign && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">{t('myDonationsPage.detail.campaignProgress')}</span>
                <span className="text-sm font-semibold text-gray-700">
                  ${campaign.raised_amount?.toLocaleString()} / ${campaign.goal_amount?.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">%{progressPercentage.toFixed(1)} {t('myDonationsPage.detail.completedPercent')}</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="flex border-b border-gray-200 bg-white rounded-t-xl overflow-hidden">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-6 py-3.5 text-center text-sm font-medium transition-colors ${activeTab === 'overview'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
            >
              <DollarSign className="h-4 w-4 inline mr-2" />
              {t('myDonationsPage.detail.overview')}
            </button>
            <button
              onClick={() => setActiveTab('updates')}
              className={`flex-1 px-6 py-3.5 text-center text-sm font-medium transition-colors ${activeTab === 'updates'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
            >
              <FileText className="h-4 w-4 inline mr-2" />
              {t('myDonationsPage.detail.studentUpdates')}
              {updates.length > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                  {updates.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex-1 px-6 py-3.5 text-center text-sm font-medium transition-colors ${activeTab === 'messages'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
            >
              <MessageSquare className="h-4 w-4 inline mr-2" />
              {t('myDonationsPage.detail.messages')}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              {/* Left: Allocation Chart */}
              <div className="lg:col-span-2 space-y-6">
                {/* Allocation Breakdown */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    {t('myDonationsPage.detail.allocationTitle')}
                  </h3>

                  {allocationData ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Pie Chart */}
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={allocationData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {allocationData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value: any, name: any) => [`%${value}`, name]}
                              contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
                            />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Bar Chart */}
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={allocationData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" tickFormatter={(v) => `$${v}`} />
                            <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                            <Tooltip
                              formatter={(value: any) => [`$${Number(value).toLocaleString()}`, t('myDonationsPage.amount')]}
                              contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
                            />
                            <Bar dataKey="amount" fill="#3B82F6" radius={[0, 6, 6, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Breakdown list */}
                      <div className="md:col-span-2">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {allocationData.map((item, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: item.color }}
                              />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                <p className="text-xs text-gray-500">
                                  %{item.value} · ${item.amount.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="bg-amber-50 p-4 rounded-full mb-4">
                        <AlertCircle className="h-8 w-8 text-amber-500" />
                      </div>
                      <p className="text-gray-700 font-medium mb-1">{t('myDonationsPage.detail.noAllocation')}</p>
                      <p className="text-sm text-gray-500 max-w-md">
                        {t('myDonationsPage.detail.noAllocationDesc')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Campaign Info */}
                {campaign?.story && (
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      {t('myDonationsPage.detail.campaignStory')}
                    </h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">
                      {campaign.story.length > 600
                        ? campaign.story.substring(0, 600) + '...'
                        : campaign.story}
                    </p>
                    {campaign.story.length > 600 && (
                      <Link
                        href={`/campaign/${campaign.campaign_id}`}
                        className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        {t('myDonationsPage.detail.readMore')}
                        <ExternalLink className="h-3.5 w-3.5 ml-1" />
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Right Sidebar */}
              <div className="space-y-6">
                {/* Donation Details Card */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('myDonationsPage.detail.donationDetails')}</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-500">{t('myDonationsPage.detail.donationId')}</span>
                      <span className="text-sm font-mono text-gray-700">{donation.donation_id}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-500">{t('myDonationsPage.amount')}</span>
                      <span className="text-lg font-bold text-gray-900">${donation.amount?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-500">{t('myDonationsPage.date')}</span>
                      <span className="text-sm text-gray-700">{formatDate(donation.created_at)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-500">{t('myDonationsPage.status')}</span>
                      {donation.payment_status === 'paid' || donation.payment_status === 'completed' ? (
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />
                          {t('myDonationsPage.completed')}
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200">{t('myDonationsPage.pending')}</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-500">{t('myDonationsPage.detail.campaignStatus')}</span>
                      <Badge className={
                        campaign?.status === 'published'
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : 'bg-gray-100 text-gray-700 border-gray-200'
                      }>
                        {campaign?.status === 'published' ? t('myDonationsPage.detail.ongoing') : campaign?.status || '-'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('myDonationsPage.detail.quickActions')}</h3>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={handleReceiptDownload}
                    >
                      <Receipt className="h-4 w-4 mr-3 text-green-600" />
                      {t('myDonationsPage.detail.receiptPdf')}
                    </Button>
                    {campaign && (
                      <Link href={`/campaign/${campaign.campaign_id}`} className="block">
                        <Button variant="outline" className="w-full justify-start">
                          <ExternalLink className="h-4 w-4 mr-3 text-blue-600" />
                          {t('myDonationsPage.detail.goToCampaign')}
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setActiveTab('messages')}
                    >
                      <MessageSquare className="h-4 w-4 mr-3 text-purple-600" />
                      {t('myDonationsPage.detail.sendMessage')}
                    </Button>
                  </div>
                </div>

                {/* Student Info */}
                {student && (
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('myDonationsPage.detail.studentInfo')}</h3>
                    <div className="flex items-center gap-4 mb-4">
                      {student.image ? (
                        <div className="relative w-14 h-14">
                          <Image
                            src={student.image}
                            alt={student.name}
                            fill
                            className="rounded-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-xl font-bold text-blue-600">
                          {student.name?.charAt(0) || 'O'}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-500">{student.university}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {student.department && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <BookOpen className="h-4 w-4 text-gray-400" />
                          {student.department}
                        </div>
                      )}
                      {student.country && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {student.country}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Updates Tab */}
          {activeTab === 'updates' && (
            <div className="bg-white rounded-b-xl shadow-lg border border-gray-100 border-t-0">
              {updates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <div className="bg-gray-100 p-6 rounded-full mb-4">
                    <FileText className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('myDonationsPage.detail.noUpdates')}</h3>
                  <p className="text-gray-500 text-center max-w-md text-sm">
                    {t('myDonationsPage.detail.noUpdatesDesc')}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {updates.map((update, index) => (
                    <div key={index} className="p-6 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <div className={`p-2 rounded-full ${update.type === 'grade' ? 'bg-green-100' :
                              update.type === 'thank_you' ? 'bg-pink-100' :
                                'bg-blue-100'
                            }`}>
                            {update.type === 'grade' ? (
                              <Award className="h-4 w-4 text-green-600" />
                            ) : update.type === 'thank_you' ? (
                              <Heart className="h-4 w-4 text-pink-600" />
                            ) : (
                              <FileText className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm font-medium text-gray-900">
                              {student?.name || t('myDonationsPage.student')}
                            </span>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDateTime(update.created_at)}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                            {update.content}
                          </p>
                          {update.media_url && (
                            <div className="mt-3">
                              {update.media_type === 'video' ? (
                                <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium bg-blue-50 px-4 py-2 rounded-lg">
                                  <Play className="h-4 w-4" />
                                  {t('myDonationsPage.detail.watchVideo')}
                                </button>
                              ) : (
                                <a
                                  href={update.media_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium bg-blue-50 px-4 py-2 rounded-lg"
                                >
                                  <Download className="h-4 w-4" />
                                  {t('myDonationsPage.detail.downloadDocument')}
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className="bg-white rounded-b-xl shadow-lg border border-gray-100 border-t-0">
              {/* Messages List */}
              <div className="max-h-[400px] overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">{t('myDonationsPage.detail.noMessages')}</p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isOwn = msg.sender_id === (session?.user as any)?.id;
                    return (
                      <div
                        key={index}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-3 ${isOwn
                              ? 'bg-blue-600 text-white rounded-br-md'
                              : 'bg-gray-100 text-gray-900 rounded-bl-md'
                            }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-xs mt-1 ${isOwn ? 'text-blue-200' : 'text-gray-400'}`}>
                            {msg.sender_name} · {formatDateTime(msg.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Send Message */}
              <div className="border-t border-gray-100 p-4">
                {messageSent && (
                  <div className="flex items-center gap-2 text-green-600 text-sm mb-3 bg-green-50 p-2 rounded-lg">
                    <CheckCircle className="h-4 w-4" />
                    {t('myDonationsPage.detail.messageSent')}
                  </div>
                )}
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={t('myDonationsPage.detail.messagePlaceholder')}
                    className="flex-1"
                    maxLength={1000}
                  />
                  <Button
                    type="submit"
                    disabled={!newMessage.trim() || sendingMessage}
                    className="flex-shrink-0"
                  >
                    {sendingMessage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
                <p className="text-xs text-gray-400 mt-2">
                  {t('myDonationsPage.detail.messageHint')}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function DonationDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin mx-auto text-blue-600 mb-4 border-4 border-blue-200 border-t-blue-600 rounded-full" />
          <p className="text-gray-600">...</p>
        </div>
      </div>
    }>
      <DonationDetailContent />
    </Suspense>
  );
}
