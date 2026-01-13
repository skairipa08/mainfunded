'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { showToast } from '@/lib/toast';

interface StudentProfile {
  user_id: string;
  verificationStatus?: string;
  verification_status?: string;
  country?: string;
  fieldOfStudy?: string;
  field_of_study?: string;
  university?: string;
  department?: string;
  docs?: Array<{ type: string; url: string; verified?: boolean }>;
  verification_documents?: Array<{ type: string; url: string; verified?: boolean }>;
  user?: {
    _id: string;
    email: string;
    name: string;
    image?: string;
  };
}

export default function StudentDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await fetch(`/api/admin/students/${id}`, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Failed to fetch student');
        }
        const data = await response.json();
        if (data.success) {
          setStudent(data.data);
        } else {
          throw new Error(data.error?.message || 'Failed to fetch student');
        }
      } catch (err: any) {
        setError(err.message || 'Error loading student');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStudent();
    }
  }, [id]);

  const handleVerify = async () => {
    if (!id || processing) return;

    setProcessing(true);
    try {
      const response = await fetch(`/api/admin/students/${id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Failed to verify student');
      }

      // Refresh student data from single-student endpoint
      const refreshResponse = await fetch(`/api/admin/students/${id}`, { cache: 'no-store' });
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        if (refreshData.success) {
          setStudent(refreshData.data);
          showToast('Student verified successfully', 'success');
        }
      }
    } catch (err: any) {
      const message = err.message || 'Error verifying student';
      setError(message);
      showToast(message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!id || processing) return;

    setProcessing(true);
    setRejectDialogOpen(false);
    
    try {
      const response = await fetch(`/api/admin/students/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason || '' }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Failed to reject student');
      }

      // Refresh student data from single-student endpoint
      const refreshResponse = await fetch(`/api/admin/students/${id}`, { cache: 'no-store' });
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        if (refreshData.success) {
          setStudent(refreshData.data);
          showToast('Student rejected successfully', 'success');
        }
      }
      setRejectReason('');
    } catch (err: any) {
      const message = err.message || 'Error rejecting student';
      setError(message);
      showToast(message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !student) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">{error}</p>
        <Link
          href="/admin/students"
          className="mt-4 inline-block text-sm text-red-600 hover:text-red-800"
        >
          ← Back to Students
        </Link>
      </div>
    );
  }

  if (!student) {
    return null;
  }

  const documents = student.docs || student.verification_documents || [];
  const status = student.verificationStatus || student.verification_status || 'pending';

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/students"
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          ← Back to Students
        </Link>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Student Profile</h2>
        <div className="flex gap-3">
          {status === 'pending' && (
            <>
              <button
                onClick={handleVerify}
                disabled={processing}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Processing...' : 'Verify'}
              </button>
              <button
                onClick={() => setRejectDialogOpen(true)}
                disabled={processing}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Processing...' : 'Reject'}
              </button>
            </>
          )}
          {status === 'verified' && (
            <span className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md bg-green-100 text-green-800">
              Verified
            </span>
          )}
          {status === 'rejected' && (
            <span className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md bg-red-100 text-red-800">
              Rejected
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
        </div>
        <dl className="px-6 py-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{student.user?.name || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Email</dt>
            <dd className="mt-1 text-sm text-gray-900">{student.user?.email || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">University</dt>
            <dd className="mt-1 text-sm text-gray-900">{student.university || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Department</dt>
            <dd className="mt-1 text-sm text-gray-900">{student.department || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Country</dt>
            <dd className="mt-1 text-sm text-gray-900">{student.country || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Field of Study</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {student.fieldOfStudy || student.field_of_study || '-'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Verification Status</dt>
            <dd className="mt-1">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  status === 'verified'
                    ? 'bg-green-100 text-green-800'
                    : status === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </dd>
          </div>
        </dl>
      </div>

      {documents.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Verification Documents</h3>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-4">
              {documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{doc.type}</p>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View Document
                    </a>
                  </div>
                  {doc.verified && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Verified
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Student Verification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this student&apos;s verification? You can optionally provide a reason below.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <label htmlFor="reject-reason" className="block text-sm font-medium text-gray-700 mb-2">
              Reason (optional)
            </label>
            <textarea
              id="reject-reason"
              value={rejectReason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRejectConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
