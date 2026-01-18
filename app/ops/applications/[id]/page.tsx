'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getApplication, updateApplicationStatus } from '@/lib/mockDb';
import type { StudentApplication } from '@/lib/mockDb';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, XCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [application, setApplication] = useState<StudentApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const id = params?.id as string;

  useEffect(() => {
    if (id) {
      const app = getApplication(id);
      setApplication(app);
      if (app) {
        setNewStatus(app.status);
      }
      setLoading(false);
    }
  }, [id]);

  const handleStatusUpdate = async () => {
    if (!application || !newStatus || newStatus === application.status) return;

    setUpdating(true);
    try {
      const updated = updateApplicationStatus(id, newStatus as StudentApplication['status']);
      if (updated) {
        setApplication(updated);
        toast.success(`Application status updated to "${newStatus}"`);
        // Refresh parent list after a short delay
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('applicationUpdated'));
        }, 100);
      } else {
        toast.error('Failed to update application status');
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      Received: 'bg-blue-100 text-blue-800',
      'Under Review': 'bg-yellow-100 text-yellow-800',
      Approved: 'bg-green-100 text-green-800',
      Rejected: 'bg-red-100 text-red-800',
    };
    return variants[status] || 'bg-gray-100 text-gray-800';
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

  if (!application) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-grow">
          <div className="max-w-4xl mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Application Not Found</h1>
            <p className="text-gray-600 mb-8">The application ID you provided is invalid or not found.</p>
            <Button onClick={() => router.push('/ops/applications')}>Back to Applications</Button>
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
        <div className="max-w-4xl mx-auto px-4 py-16">
          <Button
            variant="outline"
            onClick={() => router.push('/ops/applications')}
            className="mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Applications
          </Button>

          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Application Details</h1>
                <p className="text-gray-600 font-mono text-sm">{application.id}</p>
              </div>
              <div className="flex items-center space-x-3">
                {getStatusIcon(application.status)}
                <Badge className={getStatusBadge(application.status)}>{application.status}</Badge>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Application Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                  <dd className="text-gray-900 mt-1 text-lg">{application.fullName}</dd>
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
                  <dd className="text-gray-900 mt-1 whitespace-pre-wrap bg-gray-50 p-4 rounded-md">
                    {application.needSummary}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Submitted</dt>
                  <dd className="text-gray-900 mt-1">
                    {new Date(application.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </dd>
                </div>
                {application.updatedAt !== application.createdAt && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                    <dd className="text-gray-900 mt-1">
                      {new Date(application.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </dd>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Update Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Application Status
                    </label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Received">Received</SelectItem>
                        <SelectItem value="Under Review">Under Review</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleStatusUpdate}
                    disabled={updating || newStatus === application.status}
                    className="w-full sm:w-auto"
                  >
                    {updating ? 'Updating...' : 'Update Status'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
