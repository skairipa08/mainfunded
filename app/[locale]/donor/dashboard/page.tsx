'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';
import { DashboardSkeleton } from '@/components/ui/PageSkeleton';
import { useCurrency } from '@/lib/currency-context';
import { useTranslation } from "@/lib/i18n/context";

interface DonationItem {
  donation_id?: string;
  amount: number;
  campaign?: { title: string; category: string } | null;
  payment_status: string;
  created_at: string;
  anonymous?: boolean;
}

function DonorDashboardContent() {
    const { t } = useTranslation();
  const searchParams = useSearchParams();
  const { formatAmount } = useCurrency();
  const [donations, setDonations] = useState<DonationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<{
    totalAmount: number;
    totalDonations: number;
    supportedStudents: number;
  } | null>(null);
  const donationId = searchParams.get('donation');

  useEffect(() => {
    loadDonations();
  }, []);

  const loadDonations = async () => {
    try {
      const res = await fetch('/api/donations/my');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setDonations(data.data?.donations || []);
          setSummary(data.data?.summary || null);
        }
      }
    } catch (err) {
      console.error('Failed to load donations:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {donationId && (
        <Card className="mb-8 bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>{t('app.page.donation_successful')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              {t('app.page.your_donation_has_been_process')}</p>
            <p className="text-sm text-gray-600 mt-2">
              {t('app.page.donation_id')}<span className="font-mono">{donationId}</span>
            </p>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <DashboardSkeleton />
      ) : donations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 mb-4">{t('app.page.no_donations_found')}</p>
            <p className="text-sm text-gray-500 mb-6">
              {t('app.page.start_making_a_difference_by_m')}</p>
            <a
              href="/donate"
              className="text-blue-600 hover:text-blue-800 font-medium inline-block"
            >
              {t('app.page.make_a_donation')}</a>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">{t('app.page.your_donations')}</h2>
            <p className="text-gray-600">
              {t('app.page.total_donations')}{summary?.totalDonations || donations.length} {t('app.page.total_amount')}{' '}
              {formatAmount(summary?.totalAmount || donations.reduce((sum, d) => sum + d.amount, 0))}
              {summary?.supportedStudents ? ` | Students supported: ${summary.supportedStudents}` : ''}
            </p>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('app.page.campaign')}</TableHead>
                      <TableHead>{t('app.page.amount')}</TableHead>
                      <TableHead>{t('app.page.status')}</TableHead>
                      <TableHead>{t('app.page.date')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {donations.map((donation, idx) => (
                      <TableRow key={donation.donation_id || idx}>
                        <TableCell className="font-medium">
                          {donation.campaign?.title || 'General Fund'}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatAmount(donation.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            donation.payment_status === 'paid' || donation.payment_status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }>
                            {donation.payment_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(donation.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>{t('app.page.impact_note')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                {t('app.page.your_contributions_support_ver')}</p>
              <p className="text-sm text-gray-600 mt-4">
                {t('app.page.detailed_impact_reports_and_st')}</p>
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}

export default function DonorDashboardPage() {
    const { t } = useTranslation();
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">{t('app.page.donor_dashboard')}</h1>
          <p className="text-gray-600 mb-8">
            {t('app.page.view_your_donations_and_track_')}</p>
          <Suspense fallback={
            <DashboardSkeleton />
          }>
            <DonorDashboardContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
