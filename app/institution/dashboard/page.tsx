'use client';

import React, { useEffect, useState } from 'react';
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
import { TrendingUp, Users, DollarSign, FileCheck } from 'lucide-react';
import { DashboardSkeleton } from '@/components/ui/PageSkeleton';
import { useCurrency } from '@/lib/currency-context';

interface InstitutionMetrics {
  studentsHelped: number;
  totalRaised: number;
  campaigns: number;
  donors: number;
}

export default function InstitutionDashboardPage() {
  const [metrics, setMetrics] = useState<InstitutionMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const { formatAmount } = useCurrency();

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setMetrics(data.data);
        }
      }
    } catch (err) {
      console.error('Failed to load metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const metricCards = metrics
    ? [
      {
        title: 'Total Raised',
        value: formatAmount(metrics.totalRaised),
        icon: DollarSign,
        description: 'Cumulative contribution amount',
      },
      {
        title: 'Students Helped',
        value: metrics.studentsHelped.toString(),
        icon: Users,
        description: 'Verified student profiles',
      },
      {
        title: 'Active Campaigns',
        value: metrics.campaigns.toString(),
        icon: FileCheck,
        description: 'Published campaigns on platform',
      },
      {
        title: 'Total Donors',
        value: metrics.donors.toString(),
        icon: TrendingUp,
        description: 'Unique donors who contributed',
      },
    ]
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Institution Dashboard</h1>
            <p className="text-gray-600">
              Platform metrics and impact indicators for education funding infrastructure
            </p>
          </div>

          {loading ? (
            <DashboardSkeleton />
          ) : !metrics ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-600">No metrics available yet.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {metricCards.map((card, index) => {
                  const Icon = card.icon;
                  return (
                    <Card key={index}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                          {card.title}
                        </CardTitle>
                        <Icon className="h-4 w-4 text-gray-400" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                        <p className="text-xs text-gray-500 mt-1">{card.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Notes Section */}
              <Card className="bg-gray-50 border-gray-200">
                <CardHeader>
                  <CardTitle>Platform Metrics Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-700">
                  <p>
                    <strong>Data Source:</strong> These metrics are derived from the live platform
                    database including verified student profiles, published campaigns, and processed donations.
                  </p>
                  <p>
                    <strong>Calculation Method:</strong> Students helped reflects verified profiles.
                    Total raised is the sum of all completed/paid donations. Campaign count includes
                    active and published campaigns.
                  </p>
                  <p>
                    <strong>Reporting Period:</strong> All-time cumulative data.
                  </p>
                  <p>
                    <strong>Audit-Ready:</strong> All data points are traceable to source
                    records. Detailed reports and audit trails are available
                    for institutional review.
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
