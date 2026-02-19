'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CheckCircle,
  Clock,
  XCircle,
  ArrowLeft,
  FileText,
  Eye,
  Shield,
  AlertTriangle,
  Loader2,
  User,
  Mail,
  Globe,
  GraduationCap,
  Building,
  DollarSign,
  Calendar,
  Camera,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

interface DocumentData {
  name: string;
  url: string;
}

const DOC_TYPES = [
  { value: 'id', label: 'Kimlik (ID)' },
  { value: 'school_email', label: 'Okul E-postası' },
  { value: 'transcript', label: 'Transkript' },
] as const;

type DocType = typeof DOC_TYPES[number]['value'] | '';

interface StudentApplication {
  id: string;
  fullName: string;
  email: string;
  country: string;
  educationLevel: string;
  needSummary: string;
  documents: (string | DocumentData)[];
  documentStatuses?: string[];
  documentTypes?: string[];
  photos?: string[];
  targetAmount?: number;
  goalAmount?: number;
  classYear?: string;
  faculty?: string;
  department?: string;
  status: 'Received' | 'Under Review' | 'Approved' | 'Rejected';
  createdAt: string;
  updatedAt: string;
}

function formatDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '—';
  try {
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

function getDocName(doc: string | DocumentData, index: number): string {
  if (typeof doc === 'object' && doc.name) return doc.name;
  if (typeof doc === 'string' && !doc.startsWith('http') && !doc.startsWith('data:')) return doc;
  return `Belge #${index + 1}`;
}

function getDocUrl(doc: string | DocumentData): string | null {
  if (typeof doc === 'object' && doc.url) return doc.url;
  if (typeof doc === 'string' && (doc.startsWith('http') || doc.startsWith('data:'))) return doc;
  return null;
}

function isImageUrl(url: string): boolean {
  if (url.startsWith('data:image/')) return true;
  const lower = url.toLowerCase();
  return lower.includes('.jpg') || lower.includes('.jpeg') || lower.includes('.png') || lower.includes('.webp') || lower.includes('/image/');
}

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [application, setApplication] = useState<StudentApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [docUpdating, setDocUpdating] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [docTypes, setDocTypes] = useState<DocType[]>([]);
  const id = params?.id as string;

  useEffect(() => {
    if (id) fetchApplication();
  }, [id]);

  const fetchApplication = async () => {
    try {
      const response = await fetch(`/api/ops/applications/${id}`, { cache: 'no-store' });
      const data = await response.json();
      if (data.success && data.data) {
        setApplication(data.data);
        setNewStatus(data.data.status);
        // Initialize doc types from saved data
        const existingTypes = data.data.documentTypes || [];
        const docCount = (data.data.documents || []).length;
        setDocTypes(Array.from({ length: docCount }, (_, i) => existingTypes[i] || ''));
      } else {
        setApplication(null);
      }
    } catch (error) {
      console.error('Failed to fetch application:', error);
      setApplication(null);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!application || !newStatus || newStatus === application.status) return;
    setUpdating(true);
    try {
      const response = await fetch(`/api/ops/applications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (data.success) {
        setApplication(data.data);
        if (newStatus === 'Approved') {
          toast.success('Başvuru onaylandı! Kampanya oluşturuldu ve /browse sayfasında yayınlandı.');
        } else if (newStatus === 'Rejected') {
          toast.success('Başvuru reddedildi. Başvurana bilgi e-postası gönderildi.');
        } else {
          toast.success(`Başvuru durumu "${newStatus}" olarak güncellendi.`);
        }
        window.dispatchEvent(new CustomEvent('applicationUpdated'));
      } else {
        toast.error(data.error || 'Durum güncellenemedi.');
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Durum güncellenirken hata oluştu.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDocTypeChange = async (docIndex: number, type: string) => {
    const newTypes = [...docTypes];
    newTypes[docIndex] = type as DocType;
    setDocTypes(newTypes);

    // Save to backend
    try {
      await fetch(`/api/ops/applications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentTypeUpdate: {
            documentIndex: docIndex,
            documentType: type,
          },
        }),
      });
    } catch (error) {
      console.error('Doc type save error:', error);
    }
  };

  const handleDocumentVerification = async (docIndex: number, status: 'approved' | 'rejected') => {
    if (!application) return;
    const currentType = docTypes[docIndex];
    if (!currentType) {
      toast.error('Lütfen önce belge türünü seçin (Kimlik / Okul E-postası / Transkript).');
      return;
    }
    setDocUpdating(docIndex);
    try {
      const response = await fetch(`/api/ops/applications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentVerification: {
            documentIndex: docIndex,
            documentStatus: status,
            documentType: currentType,
          },
        }),
      });
      const data = await response.json();
      if (data.success) {
        setApplication(data.data);
        toast.success(
          status === 'approved'
            ? `Belge #${docIndex + 1} onaylandı.`
            : `Belge #${docIndex + 1} reddedildi. Başvurana e-posta gönderildi.`
        );
      } else {
        toast.error(data.error || 'Belge durumu güncellenemedi.');
      }
    } catch (error) {
      console.error('Document verification error:', error);
      toast.error('Belge doğrulama sırasında hata oluştu.');
    } finally {
      setDocUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Yükleniyor...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-grow">
          <div className="max-w-4xl mx-auto px-4 py-16 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Başvuru Bulunamadı</h1>
            <p className="text-gray-600 mb-8">Girdiğiniz başvuru ID&apos;si geçersiz veya bulunamadı.</p>
            <Button onClick={() => router.push('/ops/applications')}>Başvurulara Dön</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const docs = application.documents || [];
  const docStatuses = application.documentStatuses || docs.map(() => 'pending');
  const photos = application.photos || [];
  const needSummary = application.needSummary || '—';
  const createdAt = formatDate(application.createdAt);
  const updatedAt = formatDate(application.updatedAt);

  const statusColor = (s: string) => {
    switch (s) {
      case 'approved': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'rejected': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-amber-700 bg-amber-50 border-amber-200';
    }
  };

  const statusLabel = (s: string) => {
    switch (s) {
      case 'approved': return 'Onaylandı';
      case 'rejected': return 'Reddedildi';
      default: return 'Beklemede';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <Button
            variant="outline"
            onClick={() => router.push('/ops/applications')}
            className="mb-6 rounded-xl"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Başvurulara Dön
          </Button>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-1">Başvuru Detayı</h1>
              <p className="text-slate-500 font-mono text-sm">{application.id}</p>
            </div>
            <StatusBadge status={application.status} showIcon />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-white border-b border-slate-100">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5 text-blue-500" />
                    Başvuran Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <InfoRow icon={User} label="Ad Soyad" value={application.fullName} />
                    <InfoRow icon={Mail} label="E-posta" value={application.email} />
                    <InfoRow icon={Globe} label="Ülke" value={application.country} />
                    <InfoRow icon={GraduationCap} label="Eğitim Seviyesi" value={application.educationLevel} />
                    {application.faculty && <InfoRow icon={Building} label="Fakülte" value={application.faculty} />}
                    {application.department && <InfoRow icon={Building} label="Bölüm" value={application.department} />}
                    {application.classYear && <InfoRow icon={Calendar} label="Sınıf" value={application.classYear} />}
                    {(application.targetAmount || application.goalAmount) && (
                      <InfoRow icon={DollarSign} label="Hedef Miktar" value={`$${application.targetAmount || application.goalAmount}`} />
                    )}
                  </div>

                  <div className="mt-6 pt-5 border-t border-slate-100">
                    <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
                      <FileText className="h-4 w-4 text-slate-400" />
                      İhtiyaç Açıklaması
                      <span className="text-xs font-normal text-slate-400">({(needSummary || '').length} karakter)</span>
                    </h4>
                    <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {needSummary}
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap gap-6 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      Gönderildi: {createdAt}
                    </div>
                    {application.updatedAt && application.updatedAt !== application.createdAt && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        Güncellendi: {updatedAt}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-white border-b border-slate-100">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-amber-500" />
                    Gönderilen Belgeler
                    {docs.length > 0 && (
                      <Badge variant="secondary" className="ml-2 text-xs">{docs.length} belge</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {docs.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
                      <p className="text-sm">Bu başvuruda belge gönderilmemiş.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {docs.map((doc, index) => {
                        const name = getDocName(doc, index);
                        const url = getDocUrl(doc);
                        const status = docStatuses[index] || 'pending';
                        const isImg = url ? isImageUrl(url) : false;

                        return (
                          <div
                            key={index}
                            className={`rounded-xl border p-4 transition-all ${
                              status === 'approved'
                                ? 'border-emerald-200 bg-emerald-50/50'
                                : status === 'rejected'
                                  ? 'border-red-200 bg-red-50/50'
                                  : 'border-slate-200 bg-white'
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0">
                                {url && isImg ? (
                                  <button
                                    type="button"
                                    onClick={() => setPreviewUrl(url)}
                                    className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 hover:ring-2 hover:ring-blue-400 transition-all cursor-pointer"
                                  >
                                    <img src={url} alt={name} className="w-full h-full object-cover" />
                                  </button>
                                ) : (
                                  <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                                    <FileText className="h-7 w-7 text-slate-400" />
                                  </div>
                                )}
                              </div>

                              <div className="flex-grow min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <p className="text-sm font-semibold text-slate-800 truncate">{name}</p>
                                  <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${statusColor(status)}`}>
                                    {status === 'approved' && <CheckCircle className="h-3 w-3" />}
                                    {status === 'rejected' && <XCircle className="h-3 w-3" />}
                                    {status === 'pending' && <Clock className="h-3 w-3" />}
                                    {statusLabel(status)}
                                  </span>
                                </div>

                                {/* Belge Türü Seçici */}
                                <div className="mb-2">
                                  <Select
                                    value={docTypes[index] || ''}
                                    onValueChange={(val) => handleDocTypeChange(index, val)}
                                  >
                                    <SelectTrigger className="h-8 text-xs rounded-lg w-48">
                                      <SelectValue placeholder="Belge türü seçin..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {DOC_TYPES.map((dt) => (
                                        <SelectItem key={dt.value} value={dt.value}>
                                          {dt.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  {url && (
                                    <>
                                      {isImg && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="h-8 text-xs rounded-lg"
                                          onClick={() => setPreviewUrl(url)}
                                        >
                                          <Eye className="h-3.5 w-3.5 mr-1" />
                                          Önizle
                                        </Button>
                                      )}
                                      <a href={url} target="_blank" rel="noopener noreferrer">
                                        <Button variant="outline" size="sm" className="h-8 text-xs rounded-lg">
                                          <ExternalLink className="h-3.5 w-3.5 mr-1" />
                                          Aç
                                        </Button>
                                      </a>
                                    </>
                                  )}

                                  <div className="flex items-center gap-1.5 ml-auto">
                                    {docUpdating === index ? (
                                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                                    ) : (
                                      <>
                                        <Button
                                          size="sm"
                                          className={`h-8 text-xs rounded-lg ${
                                            status === 'approved'
                                              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                              : 'bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                                          }`}
                                          onClick={() => handleDocumentVerification(index, 'approved')}
                                          disabled={docUpdating !== null}
                                        >
                                          <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                          Onayla
                                        </Button>
                                        <Button
                                          size="sm"
                                          className={`h-8 text-xs rounded-lg ${
                                            status === 'rejected'
                                              ? 'bg-red-600 text-white hover:bg-red-700'
                                              : 'bg-white border border-red-300 text-red-700 hover:bg-red-50'
                                          }`}
                                          onClick={() => handleDocumentVerification(index, 'rejected')}
                                          disabled={docUpdating !== null}
                                        >
                                          <XCircle className="h-3.5 w-3.5 mr-1" />
                                          Reddet
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      <div className="flex items-center gap-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          Onaylı: {docStatuses.filter((s) => s === 'approved').length}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                          Reddedilen: {docStatuses.filter((s) => s === 'rejected').length}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                          Bekleyen: {docStatuses.filter((s) => s === 'pending').length}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {photos.length > 0 && (
                <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
                  <CardHeader className="bg-white border-b border-slate-100">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Camera className="h-5 w-5 text-purple-500" />
                      Fotoğraflar
                      <Badge variant="secondary" className="ml-2 text-xs">{photos.length} fotoğraf</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {photos.map((photoUrl, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setPreviewUrl(photoUrl)}
                          className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-[4/3] hover:ring-2 hover:ring-blue-400 transition-all cursor-pointer"
                        >
                          <img
                            src={photoUrl}
                            alt={`Fotoğraf ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden sticky top-6">
                <CardHeader className="bg-white border-b border-slate-100">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Shield className="h-5 w-5 text-blue-500" />
                    Durumu Güncelle
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Başvuru Durumu
                    </label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Durum seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Received">Alındı</SelectItem>
                        <SelectItem value="Under Review">İnceleniyor</SelectItem>
                        <SelectItem value="Approved">Onaylandı</SelectItem>
                        <SelectItem value="Rejected">Reddedildi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newStatus === 'Approved' && application.status !== 'Approved' && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-emerald-700 leading-relaxed">
                        <strong>Not:</strong> Bu başvuruyu onaylamak otomatik olarak bir kampanya oluşturur
                        ve <code className="text-emerald-800 bg-emerald-100 px-1 rounded">/browse</code> sayfasında yayınlar.
                      </p>
                    </div>
                  )}

                  {newStatus === 'Rejected' && application.status !== 'Rejected' && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-red-700 leading-relaxed">
                        <strong>Dikkat:</strong> Reddetme işlemi kampanyayı yayından kaldırır, bağışçılara
                        ve başvurana bildirim e-postası gönderir.
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={handleStatusUpdate}
                    disabled={updating || newStatus === application.status}
                    className="w-full rounded-xl h-11 font-semibold"
                  >
                    {updating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Güncelleniyor...
                      </>
                    ) : (
                      'Durumu Güncelle'
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-slate-200 shadow-sm">
                <CardContent className="p-5">
                  <h4 className="text-sm font-semibold text-slate-800 mb-4">Özet</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Toplam Belge</span>
                      <span className="font-semibold text-slate-800">{docs.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Onaylı Belge</span>
                      <span className="font-semibold text-emerald-600">{docStatuses.filter((s) => s === 'approved').length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Reddedilen Belge</span>
                      <span className="font-semibold text-red-600">{docStatuses.filter((s) => s === 'rejected').length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Bekleyen Belge</span>
                      <span className="font-semibold text-amber-600">{docStatuses.filter((s) => s === 'pending').length}</span>
                    </div>
                    <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-sm">
                      <span className="text-slate-500">Fotoğraf</span>
                      <span className="font-semibold text-slate-800">{photos.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {previewUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setPreviewUrl(null)}
              className="absolute -top-3 -right-3 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-slate-600 hover:text-red-500 transition-colors"
            >
              <XCircle className="h-5 w-5" />
            </button>
            <img
              src={previewUrl}
              alt="Belge önizleme"
              className="w-full h-auto max-h-[85vh] object-contain rounded-xl"
            />
            <div className="absolute bottom-3 right-3">
              <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="rounded-lg shadow-lg">
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                  Tam Boyut Aç
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="h-4 w-4 text-slate-400" />
      </div>
      <div>
        <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</dt>
        <dd className="text-sm font-semibold text-slate-800 mt-0.5">{value}</dd>
      </div>
    </div>
  );
}
