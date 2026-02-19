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

interface DonationItem {
  donation_id?: string;
  amount: number;
  campaign?: { title: string; category: string } | null;
  payment_status: string;
  created_at: string;
  anonymous?: boolean;
}

function DonorDashboardContent() {
  const searchParams = useSearchParams();
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
              <span>Donation Successful</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              Your donation has been processed successfully. Thank you for supporting education!
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Donation ID: <span className="font-mono">{donationId}</span>
            </p>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <DashboardSkeleton />
      ) : donations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 mb-4">No donations found.</p>
            <p className="text-sm text-gray-500 mb-6">
              Start making a difference by making your first donation.
            </p>
            <a
              href="/donate"
              className="text-blue-600 hover:text-blue-800 font-medium inline-block"
            >
              Make a Donation →
            </a>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your Donations</h2>
            <p className="text-gray-600">
              Total donations: {summary?.totalDonations || donations.length} | Total amount: $
              {(summary?.totalAmount || donations.reduce((sum, d) => sum + d.amount, 0)).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              {summary?.supportedStudents ? ` | Students supported: ${summary.supportedStudents}` : ''}
            </p>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {donations.map((donation, idx) => (
                      <TableRow key={donation.donation_id || idx}>
                        <TableCell className="font-medium">
                          {donation.campaign?.title || 'General Fund'}
                        </TableCell>
                        <TableCell className="font-semibold">
                          ${donation.amount.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
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
              <CardTitle>Impact Note</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Your contributions support verified students and education impact initiatives.
                Each donation is linked to measurable educational outcomes and contributes to
                transparent, reportable impact metrics.
              </p>
              <p className="text-sm text-gray-600 mt-4">
                Detailed impact reports and student progress updates are available for
                institutional donors and large contributors upon request.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}

export default function DonorDashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Donor Dashboard</h1>
          <p className="text-gray-600 mb-8">
            View your donations and track your impact on education funding.
          </p>
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
