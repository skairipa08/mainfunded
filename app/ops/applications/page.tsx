'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface StudentApplication {
  id: string;
  fullName: string;
  email: string;
  country: string;
  educationLevel: string;
  needSummary: string;
  documents: string[];
  status: 'Received' | 'Under Review' | 'Approved' | 'Rejected';
  createdAt: string;
  updatedAt: string;
}

// Type fix for Table component from JSX file
const TableComponent = Table as React.ComponentType<any>;

export default function OperationsApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadApplications();

    // Listen for updates from detail page
    const handleUpdate = () => {
      loadApplications();
    };

    window.addEventListener('applicationUpdated', handleUpdate);
    return () => {
      window.removeEventListener('applicationUpdated', handleUpdate);
    };
  }, []);

  const loadApplications = async () => {
    try {
      const response = await fetch('/api/ops/applications', { cache: 'no-store' });
      const data = await response.json();

      if (data.success) {
        // Sort by created date, newest first
        const apps = data.data || [];
        apps.sort((a: StudentApplication, b: StudentApplication) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setApplications(apps);
        setError(null);
      } else {
        setError(data.error || 'Failed to load applications');
      }
    } catch (err: any) {
      console.error('Failed to load applications:', err);
      setError(err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Student Applications</h1>
              <p className="text-gray-600 mt-2">Review and manage student applications (stored in MongoDB)</p>
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => loadApplications()}
              >
                Refresh
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading applications...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
              <p className="text-red-800 mb-4">{error}</p>
              <Button onClick={() => loadApplications()}>Try Again</Button>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-4">No applications found in database.</p>
              <p className="text-sm text-gray-500">Applications will appear here once students submit them via /apply.</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <TableComponent>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Education Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow
                      key={app.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => router.push(`/ops/applications/${app.id}`)}
                    >
                      <TableCell className="font-mono text-sm text-xs">{app.id.slice(0, 12)}...</TableCell>
                      <TableCell className="font-medium">{app.fullName}</TableCell>
                      <TableCell>{app.country}</TableCell>
                      <TableCell>{app.educationLevel}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(app.status)}>{app.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(app.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/ops/applications/${app.id}`);
                          }}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          View Details
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </TableComponent>
            </div>
          )}

          <div className="mt-8 text-sm text-gray-500">
            <p>Total applications: {applications.length}</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
