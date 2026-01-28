'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { useTranslation, useLocale } from '@/lib/i18n';

interface StudentApplication {
  id: string;
  fullName: string;
  email: string;
  country: string;
  educationLevel: string;
  needSummary: string;
  documents: string[];
  // New fields
  targetAmount?: number;
  classYear?: string;
  faculty?: string;
  department?: string;

  status: 'Received' | 'Under Review' | 'Approved' | 'Rejected';
  createdAt: string;
  updatedAt: string;
}

function StudentStatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const { locale } = useLocale();
  const [application, setApplication] = useState<StudentApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const applicationId = searchParams.get('id');

  useEffect(() => {
    const fetchApplication = async () => {
      if (!applicationId) {
        setLoading(false);
        return;
      }

      try {
        // Fetch from public MongoDB API (no auth required)
        const response = await fetch(`/api/applications/${applicationId}/status`, {
          cache: 'no-store',
        });

        const data = await response.json();

        if (data.success && data.data) {
          setApplication(data.data);
        } else {
          setError(data.error || 'Application not found');
        }
      } catch (err: any) {
        console.error('Failed to fetch application:', err);
        setError(err.message || 'Failed to fetch application');
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [applicationId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Received':
        return <Clock className="h-6 w-6 text-blue-600" />;
      case 'Under Review':
        return <Clock className="h-6 w-6 text-yellow-600" />;
      case 'Approved':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'Rejected':
        return <XCircle className="h-6 w-6 text-red-600" />;
      default:
        return <Clock className="h-6 w-6 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Received':
        return 'bg-blue-100 text-blue-800';
      case 'Under Review':
        return 'bg-yellow-100 text-yellow-800';
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTranslatedStatus = (status: string) => {
    switch (status) {
      case 'Received':
        return t('applicationStatus.statuses.received');
      case 'Under Review':
        return t('applicationStatus.statuses.underReview');
      case 'Approved':
        return t('applicationStatus.statuses.approved');
      case 'Rejected':
        return t('applicationStatus.statuses.rejected');
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{t('common.loading')}</p>
      </div>
    );
  }

  if (!applicationId || !application) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {t('applicationStatus.notFound')}
        </h2>
        <p className="text-gray-600 mb-8">
          {t('applicationStatus.notFoundDesc')}
        </p>
        <Button onClick={() => router.push('/apply')}>
          {t('applicationStatus.applyNow')}
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {t('applicationStatus.applicationId')}
            </h2>
            <span className="font-mono text-sm text-gray-600">{application.id}</span>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {t('applicationStatus.status')}
          </h2>
          <div className="flex items-center space-x-3">
            {getStatusIcon(application.status)}
            <span
              className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(
                application.status
              )}`}
            >
              {getTranslatedStatus(application.status)}
            </span>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {t('applicationStatus.details')}
          </h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">
                {t('applicationStatus.fullName')}
              </dt>
              <dd className="text-gray-900 mt-1">{application.fullName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                {t('applicationStatus.email')}
              </dt>
              <dd className="text-gray-900 mt-1">{application.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                {t('applicationStatus.country')}
              </dt>
              <dd className="text-gray-900 mt-1">{application.country}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                {t('applicationStatus.educationLevel')}
              </dt>
              <dd className="text-gray-900 mt-1">{application.educationLevel}</dd>
            </div>
            {application.faculty && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Fakülte</dt>
                <dd className="text-gray-900 mt-1">{application.faculty}</dd>
              </div>
            )}
            {application.department && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Bölüm</dt>
                <dd className="text-gray-900 mt-1">{application.department}</dd>
              </div>
            )}
            {application.classYear && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Sınıf</dt>
                <dd className="text-gray-900 mt-1">{application.classYear}</dd>
              </div>
            )}
            {application.targetAmount && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Hedeflenen Miktar</dt>
                <dd className="text-gray-900 mt-1">${application.targetAmount}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500">
                {t('applicationStatus.needSummary')}
              </dt>
              <dd className="text-gray-900 mt-1 whitespace-pre-wrap">{application.needSummary}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                {t('applicationStatus.submitted')}
              </dt>
              <dd className="text-gray-900 mt-1">
                {new Date(application.createdAt).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-8">
        <Button onClick={() => router.push('/')} variant="outline">
          {t('applicationStatus.returnHome')}
        </Button>
      </div>
    </>
  );
}

export default function StudentStatusPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            {t('applicationStatus.title')}
          </h1>
          <Suspense fallback={
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          }>
            <StudentStatusContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
