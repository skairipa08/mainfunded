'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
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
import { StatusBadge } from '@/components/ui/status-badge';
import { CheckCircle, XCircle, RefreshCw, Filter, Users, GraduationCap, BookOpen, Heart, MessageSquare, Clock, Eye, Briefcase, School } from 'lucide-react';

interface StudentApplication {
  id: string;
  type?: 'student' | 'teacher' | 'parent';
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

type TypeFilter = 'all' | 'student' | 'teacher' | 'parent';
type ActivityFilter = 'all' | 'active' | 'inactive';
type MainTab = 'applications' | 'stories' | 'mentors' | 'schools';

interface SchoolApplication {
  id: string;
  type: 'school';
  fullName: string;
  email: string;
  country: string;
  schoolName: string;
  schoolCity: string;
  schoolDistrict: string;
  schoolType: string;
  studentTotal: number;
  applicantRole: string;
  projectTitle: string;
  projectCategory: string;
  needSummary: string;
  targetAmount: number;
  beneficiaryCount: number;
  documents: string[];
  status: 'Received' | 'Under Review' | 'Approved' | 'Rejected';
  createdAt: string;
  updatedAt: string;
}

interface MentorApplication {
  application_id: string;
  full_name: string;
  email: string;
  phone: string;
  country: string;
  job_title: string;
  experience_years: string;
  mentor_type: 'corporate' | 'individual';
  why_text: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_note?: string;
  created_at: string;
}

interface SuccessStory {
  story_id: string;
  user_name: string;
  user_email: string;
  title: string;
  quote: string;
  university: string;
  field: string;
  funded_amount: number;
  status: 'pending' | 'approved' | 'rejected';
  admin_note?: string;
  created_at: string;
}

const storyStatusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Bekliyor', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  approved: { label: 'Onaylandı', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  rejected: { label: 'Reddedildi', color: 'bg-red-100 text-red-800', icon: XCircle },
};

// Type fix for Table component from JSX file
const TableComponent = Table as React.ComponentType<any>;

export default function OperationsApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Main tab
  const [mainTab, setMainTab] = useState<MainTab>('applications');

  // Stories state
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [storiesLoading, setStoriesLoading] = useState(false);
  const [storyStatusFilter, setStoryStatusFilter] = useState('pending');
  const [storyActionLoading, setStoryActionLoading] = useState<string | null>(null);

  // Mentors state
  const [mentors, setMentors] = useState<MentorApplication[]>([]);
  const [mentorsLoading, setMentorsLoading] = useState(false);
  const [mentorStatusFilter, setMentorStatusFilter] = useState('pending');
  const [mentorActionLoading, setMentorActionLoading] = useState<string | null>(null);

  // Schools state
  const [schoolApps, setSchoolApps] = useState<SchoolApplication[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(false);
  const [schoolStatusFilter, setSchoolStatusFilter] = useState('all');
  const [schoolActionLoading, setSchoolActionLoading] = useState<string | null>(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const loadStories = useCallback(async () => {
    setStoriesLoading(true);
    try {
      const res = await fetch(`/api/admin/stories?status=${storyStatusFilter}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setStories(data.data?.stories || []);
        }
      }
    } catch {
      toast.error('Hikayeler yüklenemedi');
    } finally {
      setStoriesLoading(false);
    }
  }, [storyStatusFilter]);

  const handleStoryAction = async (storyId: string, status: 'approved' | 'rejected') => {
    setStoryActionLoading(storyId);
    try {
      const res = await fetch(`/api/admin/stories/${storyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(status === 'approved' ? 'Hikaye onaylandı' : 'Hikaye reddedildi');
        loadStories();
      } else {
        toast.error(data.error?.message || 'İşlem başarısız');
      }
    } catch {
      toast.error('Bir hata oluştu');
    } finally {
      setStoryActionLoading(null);
    }
  };

  useEffect(() => {
    loadApplications();

    const handleUpdate = () => loadApplications();
    window.addEventListener('applicationUpdated', handleUpdate);
    return () => window.removeEventListener('applicationUpdated', handleUpdate);
  }, []);

  const loadSchools = useCallback(async () => {
    setSchoolsLoading(true);
    try {
      const url = schoolStatusFilter === 'all'
        ? '/api/ops/applications?type=school'
        : `/api/ops/applications?type=school&status=${schoolStatusFilter}`;
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSchoolApps(data.data || []);
        }
      }
    } catch {
      toast.error('Okul başvuruları yüklenemedi');
    } finally {
      setSchoolsLoading(false);
    }
  }, [schoolStatusFilter]);

  const handleSchoolAction = async (appId: string, newStatus: 'Approved' | 'Rejected') => {
    setSchoolActionLoading(appId);
    try {
      const res = await fetch(`/api/ops/applications/${appId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          newStatus === 'Approved'
            ? 'Okul başvurusu onaylandı!'
            : 'Okul başvurusu reddedildi.'
        );
        loadSchools();
      } else {
        toast.error(data.error || 'İşlem başarısız');
      }
    } catch {
      toast.error('Sunucu hatası, tekrar deneyin.');
    } finally {
      setSchoolActionLoading(null);
    }
  };

  const loadMentors = useCallback(async () => {
    setMentorsLoading(true);
    try {
      const res = await fetch(`/api/admin/mentors?status=${mentorStatusFilter}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setMentors(data.data?.applications || []);
        }
      }
    } catch {
      toast.error('Mentör başvuruları yüklenemedi');
    } finally {
      setMentorsLoading(false);
    }
  }, [mentorStatusFilter]);

  const handleMentorAction = async (appId: string, status: 'approved' | 'rejected') => {
    setMentorActionLoading(appId);
    try {
      const res = await fetch(`/api/admin/mentors/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(status === 'approved' ? 'Başvuru onaylandı' : 'Başvuru reddedildi');
        loadMentors();
      } else {
        toast.error(data.error?.message || 'İşlem başarısız');
      }
    } catch {
      toast.error('Bir hata oluştu');
    } finally {
      setMentorActionLoading(null);
    }
  };

  useEffect(() => {
    if (mainTab === 'stories') {
      loadStories();
    } else if (mainTab === 'mentors') {
      loadMentors();
    } else if (mainTab === 'schools') {
      loadSchools();
    }
  }, [mainTab, loadStories, loadMentors, loadSchools]);

  useEffect(() => {
    if (mainTab === 'schools') {
      loadSchools();
    }
  }, [schoolStatusFilter, loadSchools]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ops/applications', { cache: 'no-store' });
      const data = await response.json();

      if (data.success) {
        const apps = data.data || [];
        apps.sort((a: StudentApplication, b: StudentApplication) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setApplications(apps);
        setError(null);
      } else {
        setError(data.error || 'Başvurular yüklenemedi');
      }
    } catch (err: any) {
      console.error('Failed to load applications:', err);
      setError(err.message || 'Başvurular yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  // ---------- Inline approve / reject ----------
  const handleQuickAction = async (appId: string, newStatus: 'Approved' | 'Rejected') => {
    setActionLoading(appId);
    try {
      const res = await fetch(`/api/ops/applications/${appId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          newStatus === 'Approved'
            ? 'Başvuru onaylandı – kampanya yayınlandı!'
            : 'Başvuru reddedildi – kampanya kaldırıldı.'
        );
        loadApplications();
      } else {
        toast.error(data.error || 'İşlem başarısız');
      }
    } catch {
      toast.error('Sunucu hatası, tekrar deneyin.');
    } finally {
      setActionLoading(null);
    }
  };

  // ---------- Filtering ----------
  const filtered = useMemo(() => {
    return applications.filter((app) => {
      // Type filter
      if (typeFilter !== 'all') {
        const appType = app.type || 'student';
        if (appType !== typeFilter) return false;
      }
      // Status filter
      if (statusFilter !== 'all' && app.status !== statusFilter) return false;
      // Activity filter
      if (activityFilter === 'active' && (app.status === 'Rejected')) return false;
      if (activityFilter === 'inactive' && app.status !== 'Rejected') return false;
      return true;
    });
  }, [applications, typeFilter, activityFilter, statusFilter]);

  // ---------- Stats ----------
  const stats = useMemo(() => {
    const total = applications.length;
    const approved = applications.filter(a => a.status === 'Approved').length;
    const rejected = applications.filter(a => a.status === 'Rejected').length;
    const pending = applications.filter(a => a.status === 'Received' || a.status === 'Under Review').length;
    return { total, approved, rejected, pending };
  }, [applications]);

  const typeLabel = (t?: string) => {
    if (t === 'teacher') return 'Öğretmen';
    if (t === 'parent') return 'Veli';
    return 'Öğrenci';
  };
  const typeBadgeClass = (t?: string) => {
    if (t === 'teacher') return 'bg-blue-100 text-blue-800 border-blue-200';
    if (t === 'parent') return 'bg-purple-100 text-purple-800 border-purple-200';
    return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 py-10">
          {/* ---------- Header ---------- */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Başvuru Yönetimi</h1>
              <p className="text-gray-500 mt-1 text-sm">Öğrenci, öğretmen ve veli başvurularını inceleyin, onaylayın veya reddedin.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => mainTab === 'stories' ? loadStories() : mainTab === 'mentors' ? loadMentors() : mainTab === 'schools' ? loadSchools() : loadApplications()} className="gap-2 self-start md:self-auto">
              <RefreshCw className="h-4 w-4" /> Yenile
            </Button>
          </div>

          {/* ---------- Main Tabs ---------- */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMainTab('applications')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${mainTab === 'applications'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
            >
              <Users className="h-4 w-4" />
              Başvurular
            </button>
            <button
              onClick={() => setMainTab('stories')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${mainTab === 'stories'
                ? 'bg-pink-600 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
            >
              <MessageSquare className="h-4 w-4" />
              Başarı Hikayeleri
            </button>
            <button
              onClick={() => setMainTab('mentors')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${mainTab === 'mentors'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
            >
              <Briefcase className="h-4 w-4" />
              Mentör Başvuruları
            </button>
            <button
              onClick={() => setMainTab('schools')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${mainTab === 'schools'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
            >
              <School className="h-4 w-4" />
              Okul Başvuruları
            </button>
          </div>

          {mainTab === 'applications' && (
            <>
              {/* ---------- Stat cards ---------- */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Toplam', value: stats.total, color: 'bg-white', icon: <Users className="h-5 w-5 text-gray-400" /> },
                  { label: 'Bekleyen', value: stats.pending, color: 'bg-amber-50 border-amber-100', icon: <Filter className="h-5 w-5 text-amber-500" /> },
                  { label: 'Onaylanan', value: stats.approved, color: 'bg-green-50 border-green-100', icon: <CheckCircle className="h-5 w-5 text-green-600" /> },
                  { label: 'Reddedilen', value: stats.rejected, color: 'bg-red-50 border-red-100', icon: <XCircle className="h-5 w-5 text-red-500" /> },
                ].map(s => (
                  <div key={s.label} className={`rounded-xl border p-4 flex items-center gap-3 ${s.color}`}>
                    {s.icon}
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                      <p className="text-xs text-gray-500">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* ---------- Filters ---------- */}
              <div className="flex flex-wrap gap-3 mb-6">
                {/* Type */}
                <div className="flex items-center gap-1 bg-white border rounded-lg px-1 py-1">
                  {([
                    { key: 'all', label: 'Tümü', icon: <Users className="h-3.5 w-3.5" /> },
                    { key: 'student', label: 'Öğrenci', icon: <GraduationCap className="h-3.5 w-3.5" /> },
                    { key: 'teacher', label: 'Öğretmen', icon: <BookOpen className="h-3.5 w-3.5" /> },
                    { key: 'parent', label: 'Veli', icon: <Heart className="h-3.5 w-3.5" /> },
                  ] as const).map(f => (
                    <button
                      key={f.key}
                      onClick={() => setTypeFilter(f.key)}
                      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${typeFilter === f.key ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                      {f.icon} {f.label}
                    </button>
                  ))}
                </div>

                {/* Activity */}
                <div className="flex items-center gap-1 bg-white border rounded-lg px-1 py-1">
                  {([
                    { key: 'all', label: 'Hepsi' },
                    { key: 'active', label: 'Aktif' },
                    { key: 'inactive', label: 'İnaktif' },
                  ] as const).map(f => (
                    <button
                      key={f.key}
                      onClick={() => setActivityFilter(f.key)}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${activityFilter === f.key ? 'bg-slate-800 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Status */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border bg-white px-3 py-1.5 text-xs font-medium text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tüm Durumlar</option>
                  <option value="Received">Alındı</option>
                  <option value="Under Review">İnceleniyor</option>
                  <option value="Approved">Onaylandı</option>
                  <option value="Rejected">Reddedildi</option>
                </select>
              </div>

              {/* ---------- Content ---------- */}
              {loading ? (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">Başvurular yükleniyor…</p>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
                  <p className="text-red-800 mb-4">{error}</p>
                  <Button size="sm" onClick={() => loadApplications()}>Tekrar Dene</Button>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border">
                  <p className="text-gray-500 mb-2">Filtrelere uygun başvuru bulunamadı.</p>
                  <p className="text-xs text-gray-400">Filtreleri değiştirmeyi veya sayfayı yenilemeyi deneyin.</p>
                </div>
              ) : (
                <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                  <TableComponent>
                    <TableHeader>
                      <TableRow className="bg-gray-50/80">
                        <TableHead className="text-xs">ID</TableHead>
                        <TableHead className="text-xs">Tür</TableHead>
                        <TableHead className="text-xs">İsim</TableHead>
                        <TableHead className="text-xs">Ülke</TableHead>
                        <TableHead className="text-xs">Eğitim</TableHead>
                        <TableHead className="text-xs">Durum</TableHead>
                        <TableHead className="text-xs">Tarih</TableHead>
                        <TableHead className="text-xs text-right">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((app) => {
                        const isPending = app.status === 'Received' || app.status === 'Under Review';
                        const isBusy = actionLoading === app.id;

                        return (
                          <TableRow
                            key={app.id}
                            className="cursor-pointer hover:bg-blue-50/40 transition-colors"
                            onClick={() => router.push(`/ops/applications/${app.id}`)}
                          >
                            <TableCell className="font-mono text-[11px] text-gray-400">{app.id.slice(0, 10)}…</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={typeBadgeClass(app.type)}>
                                {typeLabel(app.type)}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium text-gray-900">{app.fullName}</TableCell>
                            <TableCell className="text-gray-600 text-sm">{app.country}</TableCell>
                            <TableCell className="text-gray-600 text-sm">{app.educationLevel}</TableCell>
                            <TableCell><StatusBadge status={app.status} /></TableCell>
                            <TableCell className="text-gray-500 text-sm">
                              {new Date(app.createdAt).toLocaleDateString('tr-TR', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                                {isPending && (
                                  <>
                                    <button
                                      disabled={isBusy}
                                      onClick={() => handleQuickAction(app.id, 'Approved')}
                                      className="inline-flex items-center gap-1 rounded-md bg-green-600 hover:bg-green-700 text-white px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50"
                                      title="Onayla ve yayınla"
                                    >
                                      <CheckCircle className="h-3.5 w-3.5" />
                                      Onayla
                                    </button>
                                    <button
                                      disabled={isBusy}
                                      onClick={() => handleQuickAction(app.id, 'Rejected')}
                                      className="inline-flex items-center gap-1 rounded-md bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50"
                                      title="Reddet ve kaldır"
                                    >
                                      <XCircle className="h-3.5 w-3.5" />
                                      Reddet
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => router.push(`/ops/applications/${app.id}`)}
                                  className="text-blue-600 hover:text-blue-800 text-xs font-medium underline underline-offset-2"
                                >
                                  Detay
                                </button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </TableComponent>
                </div>
              )}

              {/* ---------- Footer info ---------- */}
              <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                <span>Gösterilen: {filtered.length} / {applications.length} başvuru</span>
                <span>Son güncelleme: {new Date().toLocaleTimeString('tr-TR')}</span>
              </div>
            </>
          )}

          {/* ============================================ */}
          {/* ========== STORIES TAB CONTENT ============= */}
          {/* ============================================ */}
          {mainTab === 'stories' && (
            <>
              {/* Story Status Filter */}
              <div className="flex gap-2 mb-6 flex-wrap">
                {[
                  { key: 'pending', label: 'Bekleyenler', icon: Clock },
                  { key: 'approved', label: 'Onaylananlar', icon: CheckCircle },
                  { key: 'rejected', label: 'Reddedilenler', icon: XCircle },
                  { key: 'all', label: 'Tümü', icon: Eye },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setStoryStatusFilter(tab.key)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${storyStatusFilter === tab.key
                        ? 'bg-pink-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Stories Table */}
              {storiesLoading ? (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">Hikayeler yükleniyor…</p>
                </div>
              ) : stories.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">Bu kategoride hikaye bulunamadı.</p>
                  <p className="text-xs text-gray-400">Kullanıcılar /stories sayfasından hikaye gönderebilir.</p>
                </div>
              ) : (
                <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                  <TableComponent>
                    <TableHeader>
                      <TableRow className="bg-gray-50/80">
                        <TableHead className="text-xs">İsim</TableHead>
                        <TableHead className="text-xs">Üniversite</TableHead>
                        <TableHead className="text-xs">Bölüm</TableHead>
                        <TableHead className="text-xs">Hikaye</TableHead>
                        <TableHead className="text-xs">Durum</TableHead>
                        <TableHead className="text-xs">Tarih</TableHead>
                        <TableHead className="text-xs text-right">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stories.map((story) => {
                        const config = storyStatusConfig[story.status] || storyStatusConfig.pending;
                        const isPending = story.status === 'pending';
                        const isBusy = storyActionLoading === story.story_id;

                        return (
                          <TableRow key={story.story_id} className="hover:bg-pink-50/40 transition-colors">
                            <TableCell className="font-medium text-gray-900">
                              <div>{story.user_name}</div>
                              <div className="text-xs text-gray-400">{story.user_email}</div>
                            </TableCell>
                            <TableCell className="text-gray-600 text-sm">{story.university}</TableCell>
                            <TableCell className="text-gray-600 text-sm">{story.field}</TableCell>
                            <TableCell className="text-gray-700 text-sm max-w-xs">
                              <p className="line-clamp-2 italic">&ldquo;{story.quote}&rdquo;</p>
                            </TableCell>
                            <TableCell>
                              <Badge className={config.color}>{config.label}</Badge>
                            </TableCell>
                            <TableCell className="text-gray-500 text-sm">
                              {new Date(story.created_at).toLocaleDateString('tr-TR', {
                                year: 'numeric', month: 'short', day: 'numeric',
                              })}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {isPending && (
                                  <>
                                    <button
                                      disabled={isBusy}
                                      onClick={() => handleStoryAction(story.story_id, 'approved')}
                                      className="inline-flex items-center gap-1 rounded-md bg-green-600 hover:bg-green-700 text-white px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50"
                                    >
                                      <CheckCircle className="h-3.5 w-3.5" />
                                      Onayla
                                    </button>
                                    <button
                                      disabled={isBusy}
                                      onClick={() => handleStoryAction(story.story_id, 'rejected')}
                                      className="inline-flex items-center gap-1 rounded-md bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50"
                                    >
                                      <XCircle className="h-3.5 w-3.5" />
                                      Reddet
                                    </button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </TableComponent>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                <span>Gösterilen: {stories.length} hikaye</span>
                <span>Son güncelleme: {new Date().toLocaleTimeString('tr-TR')}</span>
              </div>
            </>
          )}

          {/* ============================================ */}
          {/* ========== MENTORS TAB CONTENT ============= */}
          {/* ============================================ */}
          {mainTab === 'mentors' && (
            <>
              {/* Mentor Status Filter */}
              <div className="flex gap-2 mb-6 flex-wrap">
                {[
                  { key: 'pending', label: 'Bekleyenler', icon: Clock },
                  { key: 'approved', label: 'Onaylananlar', icon: CheckCircle },
                  { key: 'rejected', label: 'Reddedilenler', icon: XCircle },
                  { key: 'all', label: 'Tümü', icon: Eye },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setMentorStatusFilter(tab.key)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mentorStatusFilter === tab.key
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Mentors Table */}
              {mentorsLoading ? (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">Mentör başvuruları yükleniyor…</p>
                </div>
              ) : mentors.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border">
                  <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">Bu kategoride mentör başvurusu bulunamadı.</p>
                  <p className="text-xs text-gray-400">Kullanıcılar /mentors/apply sayfasından başvuru yapabilir.</p>
                </div>
              ) : (
                <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                  <TableComponent>
                    <TableHeader>
                      <TableRow className="bg-gray-50/80">
                        <TableHead className="text-xs">İsim</TableHead>
                        <TableHead className="text-xs">E-posta</TableHead>
                        <TableHead className="text-xs">Ülke</TableHead>
                        <TableHead className="text-xs">Pozisyon</TableHead>
                        <TableHead className="text-xs">Tür</TableHead>
                        <TableHead className="text-xs">Durum</TableHead>
                        <TableHead className="text-xs">Tarih</TableHead>
                        <TableHead className="text-xs text-right">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mentors.map((mentor) => {
                        const config = storyStatusConfig[mentor.status] || storyStatusConfig.pending;
                        const isPending = mentor.status === 'pending';
                        const isBusy = mentorActionLoading === mentor.application_id;

                        return (
                          <TableRow key={mentor.application_id} className="hover:bg-indigo-50/40 transition-colors">
                            <TableCell className="font-medium text-gray-900">
                              <div>{mentor.full_name}</div>
                              <div className="text-xs text-gray-400">{mentor.phone}</div>
                            </TableCell>
                            <TableCell className="text-gray-600 text-sm">{mentor.email}</TableCell>
                            <TableCell className="text-gray-600 text-sm">{mentor.country}</TableCell>
                            <TableCell className="text-gray-600 text-sm">
                              <div>{mentor.job_title}</div>
                              <div className="text-xs text-gray-400">{mentor.experience_years} yıl</div>
                            </TableCell>
                            <TableCell>
                              <Badge className={mentor.mentor_type === 'corporate' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}>
                                {mentor.mentor_type === 'corporate' ? 'Kurumsal' : 'Bireysel'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={config.color}>{config.label}</Badge>
                            </TableCell>
                            <TableCell className="text-gray-500 text-sm">
                              {new Date(mentor.created_at).toLocaleDateString('tr-TR', {
                                year: 'numeric', month: 'short', day: 'numeric',
                              })}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {isPending && (
                                  <>
                                    <button
                                      disabled={isBusy}
                                      onClick={() => handleMentorAction(mentor.application_id, 'approved')}
                                      className="inline-flex items-center gap-1 rounded-md bg-green-600 hover:bg-green-700 text-white px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50"
                                    >
                                      <CheckCircle className="h-3.5 w-3.5" />
                                      Onayla
                                    </button>
                                    <button
                                      disabled={isBusy}
                                      onClick={() => handleMentorAction(mentor.application_id, 'rejected')}
                                      className="inline-flex items-center gap-1 rounded-md bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50"
                                    >
                                      <XCircle className="h-3.5 w-3.5" />
                                      Reddet
                                    </button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </TableComponent>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                <span>Gösterilen: {mentors.length} başvuru</span>
                <span>Son güncelleme: {new Date().toLocaleTimeString('tr-TR')}</span>
              </div>
            </>
          )}

          {/* ============================================ */}
          {/* ========== SCHOOLS TAB CONTENT ============= */}
          {/* ============================================ */}
          {mainTab === 'schools' && (
            <>
              {/* School Status Filter */}
              <div className="flex gap-2 mb-6 flex-wrap">
                {[
                  { key: 'all', label: 'Tümü', icon: Eye },
                  { key: 'Received', label: 'Alındı', icon: Clock },
                  { key: 'Under Review', label: 'İnceleniyor', icon: Clock },
                  { key: 'Approved', label: 'Onaylananlar', icon: CheckCircle },
                  { key: 'Rejected', label: 'Reddedilenler', icon: XCircle },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setSchoolStatusFilter(tab.key)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${schoolStatusFilter === tab.key
                        ? 'bg-amber-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Schools Table */}
              {schoolsLoading ? (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">Okul başvuruları yükleniyor…</p>
                </div>
              ) : schoolApps.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border">
                  <School className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">Bu kategoride okul başvurusu bulunamadı.</p>
                  <p className="text-xs text-gray-400">Okullar /apply/school sayfasından başvuru yapabilir.</p>
                </div>
              ) : (
                <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                  <TableComponent>
                    <TableHeader>
                      <TableRow className="bg-gray-50/80">
                        <TableHead className="text-xs">Okul Adı</TableHead>
                        <TableHead className="text-xs">Başvuran</TableHead>
                        <TableHead className="text-xs">Şehir / İlçe</TableHead>
                        <TableHead className="text-xs">Proje</TableHead>
                        <TableHead className="text-xs">Kategori</TableHead>
                        <TableHead className="text-xs">Durum</TableHead>
                        <TableHead className="text-xs">Tarih</TableHead>
                        <TableHead className="text-xs text-right">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {schoolApps.map((app) => {
                        const isPending = app.status === 'Received' || app.status === 'Under Review';
                        const isBusy = schoolActionLoading === app.id;

                        return (
                          <TableRow
                            key={app.id}
                            className="cursor-pointer hover:bg-amber-50/40 transition-colors"
                            onClick={() => router.push(`/ops/applications/${app.id}`)}
                          >
                            <TableCell className="font-medium text-gray-900">
                              <div>{app.schoolName}</div>
                              <div className="text-xs text-gray-400">{app.schoolType} • {app.studentTotal} öğrenci</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-gray-900 text-sm">{app.fullName}</div>
                              <div className="text-xs text-gray-400">{app.email}</div>
                            </TableCell>
                            <TableCell className="text-gray-600 text-sm">
                              <div>{app.schoolCity}</div>
                              <div className="text-xs text-gray-400">{app.schoolDistrict}</div>
                            </TableCell>
                            <TableCell className="text-gray-700 text-sm max-w-xs">
                              <p className="line-clamp-2">{app.projectTitle}</p>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                                {app.projectCategory || '—'}
                              </Badge>
                            </TableCell>
                            <TableCell><StatusBadge status={app.status} /></TableCell>
                            <TableCell className="text-gray-500 text-sm">
                              {new Date(app.createdAt).toLocaleDateString('tr-TR', {
                                year: 'numeric', month: 'short', day: 'numeric',
                              })}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                                {isPending && (
                                  <>
                                    <button
                                      disabled={isBusy}
                                      onClick={() => handleSchoolAction(app.id, 'Approved')}
                                      className="inline-flex items-center gap-1 rounded-md bg-green-600 hover:bg-green-700 text-white px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50"
                                      title="Onayla"
                                    >
                                      <CheckCircle className="h-3.5 w-3.5" />
                                      Onayla
                                    </button>
                                    <button
                                      disabled={isBusy}
                                      onClick={() => handleSchoolAction(app.id, 'Rejected')}
                                      className="inline-flex items-center gap-1 rounded-md bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50"
                                      title="Reddet"
                                    >
                                      <XCircle className="h-3.5 w-3.5" />
                                      Reddet
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => router.push(`/ops/applications/${app.id}`)}
                                  className="text-amber-600 hover:text-amber-800 text-xs font-medium underline underline-offset-2"
                                >
                                  Detay
                                </button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </TableComponent>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                <span>Gösterilen: {schoolApps.length} okul başvurusu</span>
                <span>Son güncelleme: {new Date().toLocaleTimeString('tr-TR')}</span>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
