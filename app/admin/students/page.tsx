'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Eye, RefreshCw } from 'lucide-react';

interface StudentProfile {
  user_id: string;
  verificationStatus: string;
  country?: string;
  fieldOfStudy?: string;
  field_of_study?: string;
  university?: string;
  department?: string;
  user?: {
    _id: string;
    email: string;
    name: string;
    image?: string;
  };
}

export default function AdminStudentsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = statusFilter
        ? `/api/admin/students?status=${statusFilter}`
        : '/api/admin/students';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Öğrenciler yüklenemedi');
      const data = await response.json();
      if (data.success) {
        setStudents(data.data || []);
      } else {
        throw new Error(data.error?.message || 'Öğrenciler yüklenemedi');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Hata oluştu';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleVerify = async (userId: string, action: 'verified' | 'rejected', reason?: string) => {
    setProcessingId(userId);
    try {
      const res = await fetch(`/api/admin/students/${userId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: action,
          reason: reason || (action === 'verified' ? 'Admin onayı' : 'Yetersiz belgeler'),
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error?.message ?? 'İşlem başarısız');
      }
      toast.success(action === 'verified' ? 'Öğrenci doğrulandı' : 'Başvuru reddedildi');
      // Optimistic update: remove from the list if viewing pending
      setStudents((prev) => prev.filter((s) => s.user_id !== userId));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Hata oluştu');
    } finally {
      setProcessingId(null);
    }
  };

  const statusBadge: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    verified: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  const filterBtns = [
    { key: 'pending', label: 'Bekleyen' },
    { key: 'verified', label: 'Doğrulanmış' },
    { key: 'rejected', label: 'Reddedilen' },
    { key: '', label: 'Tümü' },
  ];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-red-600 font-medium mb-4">{error}</p>
        <Button onClick={fetchStudents}><RefreshCw className="h-4 w-4 mr-2" /> Yeniden Dene</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold text-gray-900">Öğrenciler</h2>
        <div className="flex gap-2 flex-wrap">
          {filterBtns.map((f) => (
            <Button
              key={f.key}
              variant={statusFilter === f.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(f.key)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-44" />
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-8 w-24 ml-auto" />
              </div>
            ))}
          </div>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">Bu filtrede öğrenci bulunamadı</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-posta</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Üniversite</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ülke</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.user_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {student.user?.name || 'Bilinmiyor'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{student.user?.email || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{student.university || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{student.country || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {student.fieldOfStudy || student.field_of_study || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={statusBadge[student.verificationStatus] ?? statusBadge.pending}>
                      {student.verificationStatus === 'verified' ? 'Doğrulanmış' :
                       student.verificationStatus === 'rejected' ? 'Reddedildi' : 'Bekliyor'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/students/${student.user_id}`}>
                        <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                      </Link>
                      {student.verificationStatus === 'pending' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleVerify(student.user_id, 'verified')}
                            disabled={processingId === student.user_id}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleVerify(student.user_id, 'rejected')}
                            disabled={processingId === student.user_id}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
