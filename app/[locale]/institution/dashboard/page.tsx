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
import { useTranslation } from "@/lib/i18n/context";

interface InstitutionMetrics {
  studentsHelped: number;
  totalRaised: number;
  campaigns: number;
  donors: number;
}

export default function InstitutionDashboardPage() {
    const { t } = useTranslation();
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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('app.page.institution_dashboard')}</h1>
            <p className="text-gray-600">
              {t('app.page.platform_metrics_and_impact_in')}</p>
          </div>

          {loading ? (
            <DashboardSkeleton />
          ) : !metrics ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-600">{t('app.page.no_metrics_available_yet')}</p>
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
                  <CardTitle>{t('app.page.platform_metrics_notes')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-700">
                  <p>
                    <strong>{t('app.page.data_source')}</strong> {t('app.page.these_metrics_are_derived_from')}</p>
                  <p>
                    <strong>{t('app.page.calculation_method')}</strong> {t('app.page.students_helped_reflects_verif')}</p>
                  <p>
                    <strong>{t('app.page.reporting_period')}</strong> {t('app.page.all_time_cumulative_data')}</p>
                  <p>
                    <strong>{t('app.page.audit_ready')}</strong> {t('app.page.all_data_points_are_traceable_')}</p>
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
