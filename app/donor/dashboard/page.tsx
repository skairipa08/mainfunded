// @ts-nocheck
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { listDonations, getDonation } from '@/lib/mockDb';
import type { Donation } from '@/lib/mockDb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Type fix for Table component from JSX file
const TableComponent = Table as React.ComponentType<any>;
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';

function DonorDashboardContent() {
  const searchParams = useSearchParams();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const donationId = searchParams.get('donation');

  useEffect(() => {
    loadDonations();

    // Listen for updates
    const handleUpdate = () => {
      loadDonations();
    };

    window.addEventListener('donationCreated', handleUpdate);
    return () => {
      window.removeEventListener('donationCreated', handleUpdate);
    };
  }, []);

  const loadDonations = () => {
    const don = listDonations();
    // Sort by created date, newest first
    don.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setDonations(don);
    setLoading(false);
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
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading donations...</p>
        </div>
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
              Total donations: {donations.length} | Total amount: $
              {donations.reduce((sum, don) => sum + don.amount, 0).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <TableComponent className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Donation ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {donations.map((donation) => (
                      <TableRow key={donation.id}>
                        <TableCell className="font-mono text-sm">{donation.id}</TableCell>
                        <TableCell className="font-semibold">
                          ${donation.amount.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell>{donation.target}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">
                            {donation.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(donation.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </TableComponent>
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
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          }>
            <DonorDashboardContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
