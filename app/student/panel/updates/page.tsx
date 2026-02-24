'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Camera,
  FileEdit,
  Trash2,
  Upload,
  X,
  ImageIcon,
  Send,
} from 'lucide-react';

interface CampaignItem {
  campaign_id: string;
  title: string;
  status: string;
}

interface UpdateItem {
  update_id: string;
  campaign_id: string;
  campaign_title?: string;
  content: string;
  photos: string[];
  created_at: string;
  visibility: 'donors_only';
}

export default function StudentUpdatesPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const preselectedCampaign = searchParams.get('campaign') || '';

  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [updates, setUpdates] = useState<UpdateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [selectedCampaign, setSelectedCampaign] = useState(preselectedCampaign);
  const [content, setContent] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [campRes, updRes] = await Promise.all([
        fetch('/api/campaigns/my'),
        fetch('/api/student/updates'),
      ]);

      if (campRes.ok) {
        const campData = await campRes.json();
        // Show all campaigns (completed ones get priority for updates)
        setCampaigns(campData.data ?? []);
      }

      if (updRes.ok) {
        const updData = await updRes.json();
        setUpdates(updData.data ?? []);
      }
    } catch {
      toast.error('Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) fetchData();
  }, [session, fetchData]);

  useEffect(() => {
    if (preselectedCampaign) setSelectedCampaign(preselectedCampaign);
  }, [preselectedCampaign]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (let i = 0; i < Math.min(files.length, 5 - photos.length); i++) {
        const formData = new FormData();
        formData.append('file', files[i]);
        formData.append('type', 'photo');

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data?.url) {
            setPhotos((prev) => [...prev, data.data.url]);
          }
        } else {
          toast.error('Fotoğraf yüklenemedi');
        }
      }
    } catch {
      toast.error('Fotoğraf yüklenirken hata oluştu');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedCampaign) {
      toast.error('Lütfen bir kampanya seçin');
      return;
    }
    if (!content.trim() && photos.length === 0) {
      toast.error('Lütfen bir güncelleme yazın veya fotoğraf ekleyin');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/student/updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: selectedCampaign,
          content: content.trim(),
          photos,
        }),
      });

      if (res.ok) {
        toast.success('Güncelleme paylaşıldı!');
        setContent('');
        setPhotos([]);
        fetchData();
      } else {
        const errData = await res.json();
        toast.error(errData.error?.message || 'Güncelleme paylaşılamadı');
      }
    } catch {
      toast.error('Bir hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (updateId: string) => {
    if (!confirm('Bu güncellemeyi silmek istediğinizden emin misiniz?')) return;

    try {
      const res = await fetch(`/api/student/updates/${updateId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Güncelleme silindi');
        setUpdates((prev) => prev.filter((u) => u.update_id !== updateId));
      } else {
        toast.error('Güncelleme silinemedi');
      }
    } catch {
      toast.error('Bir hata oluştu');
    }
  };

  const completedCampaigns = campaigns.filter((c) => c.status === 'completed');
  const allCampaignsForSelect = campaigns.filter(
    (c) => c.status === 'completed' || c.status === 'published',
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/student/panel">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> Geri
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Güncellemelerim</h1>
          <p className="text-gray-500 text-sm">
            Bağışçılarınızla ilerlemenizi ve fotoğraflarınızı paylaşın. Sadece size bağış yapan
            donörler görebilir.
          </p>
        </div>
      </div>

      {/* Create Update Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileEdit className="h-5 w-5 text-blue-600" />
          Yeni Güncelleme Paylaş
        </h2>

        {/* Campaign Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Kampanya</label>
          <select
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Kampanya Seçin</option>
            {allCampaignsForSelect.map((c) => (
              <option key={c.campaign_id} value={c.campaign_id}>
                {c.title} {c.status === 'completed' ? '(Tamamlandı)' : '(Aktif)'}
              </option>
            ))}
          </select>
        </div>

        {/* Content */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Güncelleme Metni</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            placeholder="Kampanya ilerlemeniz hakkında bilgi verin, bağışçılarınıza teşekkür edin..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            maxLength={2000}
          />
          <p className="text-xs text-gray-400 mt-1">{content.length}/2000</p>
        </div>

        {/* Photo Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fotoğraflar (maks. 5)
          </label>

          <div className="flex flex-wrap gap-3">
            {photos.map((url, index) => (
              <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden group">
                <img
                  src={url}
                  alt={`Fotoğraf ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}

            {photos.length < 5 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-400 transition-colors"
              >
                {uploading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
                ) : (
                  <>
                    <Camera className="h-6 w-6 mb-1" />
                    <span className="text-xs">Ekle</span>
                  </>
                )}
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-blue-800">
          <strong>Gizlilik:</strong> Paylaştığınız güncellemeler ve fotoğraflar sadece bu kampanyaya
          bağış yapan donörler tarafından görülebilir.
        </div>

        {/* Submit */}
        <Button onClick={handleSubmit} disabled={submitting} className="w-full sm:w-auto">
          {submitting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          Güncelleme Paylaş
        </Button>
      </div>

      {/* Past Updates */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Geçmiş Güncellemeler</h2>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-4 w-2/3 mb-2" />
                <Skeleton className="h-20 w-full" />
              </div>
            ))}
          </div>
        ) : updates.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Henüz güncelleme paylaşmadınız.</p>
            <p className="text-gray-400 text-sm mt-1">
              İlk güncellemenizi yukarıdan paylaşabilirsiniz.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {updates.map((u) => (
              <div key={u.update_id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      {u.campaign_title && (
                        <Badge variant="outline" className="mb-2">
                          {u.campaign_title}
                        </Badge>
                      )}
                      <p className="text-xs text-gray-500">
                        {new Date(u.created_at).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        🔒 Sadece Bağışçılar
                      </Badge>
                      <button
                        onClick={() => handleDelete(u.update_id)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {u.content && (
                    <p className="text-gray-700 whitespace-pre-wrap mb-3">{u.content}</p>
                  )}

                  {u.photos && u.photos.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {u.photos.map((photo, idx) => (
                        <div
                          key={idx}
                          className="relative w-32 h-32 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                        >
                          <img
                            src={photo}
                            alt={`Güncelleme fotoğrafı ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
