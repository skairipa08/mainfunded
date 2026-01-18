'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { getApplication } from '@/lib/mockDb';
import type { StudentApplication } from '@/lib/mockDb';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

export default function StudentStatusPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [application, setApplication] = useState<StudentApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const applicationId = searchParams.get('id');

  useEffect(() => {
    if (applicationId) {
      const app = getApplication(applicationId);
      setApplication(app);
      setLoading(false);
    } else {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!applicationId || !application) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-grow">
          <div className="max-w-2xl mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Application Not Found</h1>
            <p className="text-gray-600 mb-8">The application ID you provided is invalid or not found.</p>
            <Button onClick={() => router.push('/apply')}>Apply Now</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Application Status</h1>

          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Application ID</h2>
                <span className="font-mono text-sm text-gray-600">{application.id}</span>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Status</h2>
              <div className="flex items-center space-x-3">
                {getStatusIcon(application.status)}
                <span
                  className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(
                    application.status
                  )}`}
                >
                  {application.status}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Application Details</h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                  <dd className="text-gray-900 mt-1">{application.fullName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="text-gray-900 mt-1">{application.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Country</dt>
                  <dd className="text-gray-900 mt-1">{application.country}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Education Level</dt>
                  <dd className="text-gray-900 mt-1">{application.educationLevel}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Need Summary</dt>
                  <dd className="text-gray-900 mt-1 whitespace-pre-wrap">{application.needSummary}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Submitted</dt>
                  <dd className="text-gray-900 mt-1">
                    {new Date(application.createdAt).toLocaleDateString('en-US', {
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
              Return to Home
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
