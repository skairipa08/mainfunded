// @ts-nocheck
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { listApplications, updateApplicationStatus, resetDemoData } from '@/lib/mockDb';
import type { StudentApplication } from '@/lib/mockDb';
import { toast } from 'sonner';
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
import { Button } from '@/components/ui/button';

export default function OperationsApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [loading, setLoading] = useState(true);

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

  const loadApplications = () => {
    const apps = listApplications();
    // Sort by created date, newest first
    apps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setApplications(apps);
    setLoading(false);
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
              <p className="text-gray-600 mt-2">Review and manage student applications</p>
            </div>
            <div className="flex gap-4">
              {/* Demo Tools Section */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <p className="text-xs text-gray-500 mb-2">Demo Tools</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm('Are you sure you want to reset all demo data? This cannot be undone.')) {
                      try {
                        resetDemoData();
                        loadApplications();
                        toast.success('Demo data reset successfully');
                      } catch (error) {
                        toast.error('Failed to reset demo data');
                      }
                    }
                  }}
                >
                  Reset Demo Data
                </Button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-4">No applications found.</p>
              <p className="text-sm text-gray-500">Applications will appear here once students submit them.</p>
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
                      <TableCell className="font-mono text-sm">{app.id}</TableCell>
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
