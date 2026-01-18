// @ts-nocheck
'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getInstitutionMetrics } from '@/lib/mockDb';
import type { InstitutionMetrics } from '@/lib/mockDb';
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
import { TrendingUp, Users, DollarSign, FileCheck } from 'lucide-react';

export default function InstitutionDashboardPage() {
  const [metrics, setMetrics] = useState<InstitutionMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
    
    // Listen for updates
    const handleUpdate = () => {
      loadMetrics();
    };
    
    window.addEventListener('applicationUpdated', handleUpdate);
    window.addEventListener('donationCreated', handleUpdate);
    
    return () => {
      window.removeEventListener('applicationUpdated', handleUpdate);
      window.removeEventListener('donationCreated', handleUpdate);
    };
  }, []);

  const loadMetrics = () => {
    const m = getInstitutionMetrics();
    setMetrics(m);
    setLoading(false);
  };

  const metricCards = metrics
    ? [
        {
          title: 'Total Donations',
          value: `$${metrics.totalDonations.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
          icon: DollarSign,
          description: 'Cumulative contribution amount',
        },
        {
          title: 'Supported Students',
          value: metrics.supportedStudents.toString(),
          icon: Users,
          description: 'Approved applications',
        },
        {
          title: 'Applications Received',
          value: metrics.applicationsReceived.toString(),
          icon: FileCheck,
          description: 'Total applications submitted',
        },
        {
          title: 'Approval Rate',
          value: `${metrics.approvalRate.toFixed(1)}%`,
          icon: TrendingUp,
          description: 'Percentage of approved applications',
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
              Pilot metrics and impact indicators for education funding infrastructure
            </p>
            <p className="text-sm text-gray-500 mt-2">
              These metrics are for demonstration purposes and reflect pilot/demo data.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading metrics...</p>
            </div>
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

              {/* Distribution Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Distribution by Country */}
                <Card>
                  <CardHeader>
                    <CardTitle>Distribution by Country</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Object.keys(metrics.distributionByCountry).length === 0 ? (
                      <p className="text-gray-500 text-sm">No data available</p>
                    ) : (
                      <TableComponent>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Country</TableHead>
                            <TableHead className="text-right">Applications</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(metrics.distributionByCountry)
                            .sort(([, a], [, b]) => b - a)
                            .map(([country, count]) => (
                              <TableRow key={country}>
                                <TableCell className="font-medium">{country}</TableCell>
                                <TableCell className="text-right">{count}</TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </TableComponent>
                    )}
                  </CardContent>
                </Card>

                {/* Distribution by Education Level */}
                <Card>
                  <CardHeader>
                    <CardTitle>Distribution by Education Level</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Object.keys(metrics.distributionByEducationLevel).length === 0 ? (
                      <p className="text-gray-500 text-sm">No data available</p>
                    ) : (
                      <TableComponent>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Education Level</TableHead>
                            <TableHead className="text-right">Applications</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(metrics.distributionByEducationLevel)
                            .sort(([, a], [, b]) => b - a)
                            .map(([level, count]) => (
                              <TableRow key={level}>
                                <TableCell className="font-medium">{level}</TableCell>
                                <TableCell className="text-right">{count}</TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </TableComponent>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Notes Section */}
              <Card className="bg-gray-50 border-gray-200">
                <CardHeader>
                  <CardTitle>Pilot Metrics Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-700">
                  <p>
                    <strong>Data Source:</strong> These metrics are derived from pilot/demo
                    applications and donations processed through the FundEd infrastructure.
                  </p>
                  <p>
                    <strong>Calculation Method:</strong> Metrics are calculated from verified
                    student applications and recorded donations. Supported students reflect
                    approved applications. Approval rate is calculated as (approved applications /
                    total applications) × 100.
                  </p>
                  <p>
                    <strong>Reporting Period:</strong> All-time cumulative data for the pilot
                    period.
                  </p>
                  <p>
                    <strong>Audit-Ready:</strong> All data points are traceable to source
                    applications and donations. Detailed reports and audit trails are available
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
