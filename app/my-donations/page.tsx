'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useTranslation } from '@/lib/i18n';
import { useCurrency } from '@/lib/currency-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  Users,
  Calendar,
  Search,
  Download,
  FileText,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  TrendingUp,
  DollarSign,
  Eye,
  FileSpreadsheet,
  Receipt,
  Loader2,
  ArrowUpDown,
} from 'lucide-react';

interface Donation {
  donation_id: string;
  campaign_id: string;
  amount: number;
  currency: string;
  created_at: string;
  payment_status: string;
  donor_name: string;
  campaign: {
    campaign_id: string;
    title: string;
    category: string;
    status: string;
  } | null;
  student: {
    name: string;
    image: string | null;
    university: string;
    department: string;
  } | null;
}

interface Summary {
  totalAmount: number;
  totalDonations: number;
  supportedStudents: number;
  lastDonationDate: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function MyDonationsContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const { formatAmount } = useCurrency();

  const [donations, setDonations] = useState<Donation[]>([]);
  const [summary, setSummary] = useState<Summary>({ totalAmount: 0, totalDonations: 0, supportedStudents: 0, lastDonationDate: null });
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [amountMin, setAmountMin] = useState('');
  const [amountMax, setAmountMax] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const currentPage = parseInt(searchParams.get('page') || '1');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login?callbackUrl=/my-donations');
    }
  }, [status, router]);

  const fetchDonations = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '20');
      if (searchQuery) params.set('search', searchQuery);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);
      if (amountMin) params.set('amountMin', amountMin);
      if (amountMax) params.set('amountMax', amountMax);

      const res = await fetch(`/api/donations/my?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setDonations(data.data.donations || []);
        setSummary(data.data.summary || { totalAmount: 0, totalDonations: 0, supportedStudents: 0, lastDonationDate: null });
        setPagination(data.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
      }
    } catch (error) {
      console.error('Failed to fetch donations:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, dateFrom, dateTo, amountMin, amountMax]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDonations(currentPage);
    }
  }, [status, currentPage, fetchDonations]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDonations(1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDateFrom('');
    setDateTo('');
    setAmountMin('');
    setAmountMax('');
    setShowFilters(false);
    fetchDonations(1);
  };

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    setExporting(true);
    try {
      if (format === 'csv') {
        const res = await fetch('/api/donations/my/export?format=csv');
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bagislarim_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else if (format === 'excel') {
        const res = await fetch('/api/donations/my/export?format=json');
        const data = await res.json();
        if (data.success && data.data) {
          const XLSX = (await import('xlsx')).default;
          const ws = XLSX.utils.json_to_sheet(data.data.map((d: any) => ({
            [t('myDonationsPage.detail.donationId')]: d.donation_id,
            [t('myDonationsPage.campaign')]: d.campaign_title,
            [t('myDonationsPage.amount')]: d.amount,
            [t('myDonationsPage.detail.donationDate')]: d.date,
            [t('myDonationsPage.status')]: d.status,
          })));
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, t('myDonationsPage.title'));
          XLSX.writeFile(wb, `bagislarim_${new Date().toISOString().split('T')[0]}.xlsx`);
        }
      } else if (format === 'pdf') {
        const res = await fetch('/api/donations/my/export?format=json');
        const data = await res.json();
        if (data.success && data.data) {
          const { jsPDF } = await import('jspdf');
          const doc = new jsPDF();

          // Header
          doc.setFontSize(20);
          doc.setTextColor(37, 99, 235);
          doc.text(`FundEd - ${t('myDonationsPage.title')}`, 14, 22);

          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100);
          doc.text(`${t('myDonationsPage.date')}: ${new Date().toLocaleDateString('tr-TR')}`, 14, 32);
          doc.text(`${t('myDonationsPage.totalDonation')}: ${formatAmount(summary.totalAmount)}`, 14, 38);
          doc.text(`${t('myDonationsPage.donationCount')}: ${summary.totalDonations}`, 14, 44);

          // Table Header
          let y = 56;
          doc.setFontSize(9);
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'bold');
          doc.text(t('myDonationsPage.campaign'), 14, y);
          doc.text(t('myDonationsPage.amount'), 100, y);
          doc.text(t('myDonationsPage.date'), 130, y);
          doc.text(t('myDonationsPage.status'), 170, y);

          doc.setDrawColor(200, 200, 200);
          doc.line(14, y + 2, 196, y + 2);

          // Table Rows
          doc.setFont('helvetica', 'normal');
          y += 10;
          data.data.forEach((d: any) => {
            if (y > 270) {
              doc.addPage();
              y = 20;
            }
            const title = d.campaign_title.length > 40 ? d.campaign_title.substring(0, 40) + '...' : d.campaign_title;
            doc.text(title, 14, y);
            doc.text(formatAmount(d.amount), 100, y);
            doc.text(new Date(d.date).toLocaleDateString('tr-TR'), 130, y);
            doc.text(d.status === 'paid' || d.status === 'completed' ? t('myDonationsPage.completed') : d.status, 170, y);
            y += 7;
          });

          doc.save(`bagislarim_${new Date().toISOString().split('T')[0]}.pdf`);
        }
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleReceiptDownload = async (donationId: string) => {
    try {
      const res = await fetch(`/api/donations/my/${donationId}/receipt`);
      const data = await res.json();
      if (data.success && data.data.receipt) {
        const receipt = data.data.receipt;
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();

        // Receipt PDF
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
          [`${t('myDonationsPage.amount')}:`, formatAmount(receipt.amount)],
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
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    if (status === 'paid' || status === 'completed') {
      return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">{t('myDonationsPage.completed')}</Badge>;
    }
    if (status === 'pending' || status === 'initiated') {
      return <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">{t('myDonationsPage.pending')}</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-100">{status}</Badge>;
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin mx-auto text-blue-600 mb-4 border-4 border-blue-200 border-t-blue-600 rounded-full" />
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!session?.user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Header */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('myDonationsPage.title')}</h1>
                <p className="text-blue-200 text-lg">
                  {t('myDonationsPage.subtitle')}
                </p>
              </div>
              <div className="hidden md:flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                  onClick={() => handleExport('csv')}
                  disabled={exporting}
                >
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                  onClick={() => handleExport('excel')}
                  disabled={exporting}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Excel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                  onClick={() => handleExport('pdf')}
                  disabled={exporting}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  PDF
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">{t('myDonationsPage.totalDonation')}</p>
                  <p className="text-2xl font-bold text-gray-900">{formatAmount(summary.totalAmount)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-100 p-3 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">{t('myDonationsPage.donationCount')}</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.totalDonations}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-xl">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">{t('myDonationsPage.supportedStudents')}</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.supportedStudents}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-4">
                <div className="bg-amber-100 p-3 rounded-xl">
                  <Calendar className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">{t('myDonationsPage.lastDonation')}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {summary.lastDonationDate ? formatDate(summary.lastDonationDate) : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Donations Table */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-12">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Search & Filters Bar */}
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <form onSubmit={handleSearch} className="flex-1 w-full sm:max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder={t('myDonationsPage.searchPlaceholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4"
                    />
                  </div>
                </form>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className={showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    {t('myDonationsPage.filter')}
                  </Button>

                  {/* Mobile export buttons */}
                  <div className="md:hidden flex items-center gap-1">
                    <Button variant="outline" size="sm" onClick={() => handleExport('csv')} disabled={exporting}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Expanded Filters */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">{t('myDonationsPage.startDate')}</label>
                      <Input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">{t('myDonationsPage.endDate')}</label>
                      <Input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">{t('myDonationsPage.minAmount')}</label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={amountMin}
                        onChange={(e) => setAmountMin(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">{t('myDonationsPage.maxAmount')}</label>
                      <Input
                        type="number"
                        placeholder="10000"
                        value={amountMax}
                        onChange={(e) => setAmountMax(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <Button size="sm" onClick={() => fetchDonations(1)}>
                      <Search className="h-4 w-4 mr-2" />
                      {t('myDonationsPage.apply')}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-2" />
                      {t('myDonationsPage.clear')}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Table */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : donations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4">
                <div className="bg-gray-100 p-6 rounded-full mb-6">
                  <Heart className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('myDonationsPage.noDonations')}</h3>
                <p className="text-gray-500 text-center max-w-md mb-6">
                  {t('myDonationsPage.noDonationsDesc')}
                </p>
                <Button onClick={() => router.push('/browse')}>
                  {t('myDonationsPage.exploreCampaigns')}
                </Button>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-1">
                            {t('myDonationsPage.campaign')}
                            <ArrowUpDown className="h-3 w-3" />
                          </div>
                        </th>
                        <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {t('myDonationsPage.student')}
                        </th>
                        <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-1">
                            {t('myDonationsPage.date')}
                            <ArrowUpDown className="h-3 w-3" />
                          </div>
                        </th>
                        <th className="text-right py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {t('myDonationsPage.amount')}
                        </th>
                        <th className="text-center py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {t('myDonationsPage.status')}
                        </th>
                        <th className="text-center py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {t('myDonationsPage.actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {donations.map((donation) => (
                        <tr
                          key={donation.donation_id}
                          className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                          onClick={() => router.push(`/my-donations/${donation.donation_id}`)}
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition-colors">
                                <Heart className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 flex items-center gap-2">
                                  {donation.campaign?.title || t('myDonationsPage.campaign')}
                                  {(donation as any).is_recurring && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-purple-50 text-purple-700 border-purple-200">
                                      {(donation as any).interval === 'week' ? 'Haftalık' : 'Aylık'}
                                    </Badge>
                                  )}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {donation.campaign?.category || ''}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-sm text-gray-700">{donation.student?.name || '-'}</p>
                            <p className="text-xs text-gray-500">{donation.student?.university || ''}</p>
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-sm text-gray-700">{formatDate(donation.created_at)}</p>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <p className="text-sm font-semibold text-gray-900">
                              {formatAmount(donation.amount || 0)}
                            </p>
                          </td>
                          <td className="py-4 px-6 text-center">
                            {getStatusBadge(donation.payment_status)}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <Link
                                href={`/my-donations/${donation.donation_id}`}
                                className="p-2 rounded-lg hover:bg-blue-100 text-gray-500 hover:text-blue-600 transition-colors"
                                title={t('myDonationsPage.detail.title')}
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                              <button
                                onClick={() => handleReceiptDownload(donation.donation_id)}
                                className="p-2 rounded-lg hover:bg-green-100 text-gray-500 hover:text-green-600 transition-colors"
                                title={t('myDonationsPage.detail.downloadReceipt')}
                              >
                                <Receipt className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-gray-100">
                  {donations.map((donation) => (
                    <Link
                      key={donation.donation_id}
                      href={`/my-donations/${donation.donation_id}`}
                      className="block p-4 hover:bg-blue-50/30 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 mr-3">
                          <p className="font-medium text-gray-900 line-clamp-1">
                            {donation.campaign?.title || t('myDonationsPage.campaign')}
                            {(donation as any).is_recurring && (
                              <Badge variant="outline" className="ml-2 text-[10px] px-1.5 py-0 h-4 bg-purple-50 text-purple-700 border-purple-200">
                                {(donation as any).interval === 'week' ? 'Haftalık' : 'Aylık'}
                              </Badge>
                            )}
                          </p>
                          <p className="text-sm text-gray-500">{donation.student?.name || '-'}</p>
                        </div>
                        <p className="text-lg font-bold text-gray-900">{formatAmount(donation.amount || 0)}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">{formatDate(donation.created_at)}</p>
                        {getStatusBadge(donation.payment_status)}
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                      {pagination.total} {t('myDonationsPage.of')} {(pagination.page - 1) * pagination.limit + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} {t('myDonationsPage.showing')}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.page <= 1}
                        onClick={() => router.push(`/my-donations?page=${pagination.page - 1}`)}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const start = Math.max(1, pagination.page - 2);
                        const pageNum = start + i;
                        if (pageNum > pagination.totalPages) return null;
                        return (
                          <Button
                            key={pageNum}
                            variant={pageNum === pagination.page ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => router.push(`/my-donations?page=${pageNum}`)}
                            className="min-w-[36px]"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.page >= pagination.totalPages}
                        onClick={() => router.push(`/my-donations?page=${pagination.page + 1}`)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function MyDonationsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin mx-auto text-blue-600 mb-4 border-4 border-blue-200 border-t-blue-600 rounded-full" />
          <p className="text-gray-600">...</p>
        </div>
      </div>
    }>
      <MyDonationsContent />
    </Suspense>
  );
}
