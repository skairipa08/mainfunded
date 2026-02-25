'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getCategories, getCountries, getFieldsOfStudy } from '@/lib/api';
import { EDUCATION_LEVELS, APPLICANT_TYPES, TURKEY_CITIES, URGENCY_LEVELS } from '@/lib/constants';

interface CreateCampaignFormProps {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export default function CreateCampaignForm({ user }: CreateCampaignFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Array<{ value: string; label: string }>>([]);
  const [countries, setCountries] = useState<Array<{ value: string; label: string }>>([]);
  const [fieldsOfStudy, setFieldsOfStudy] = useState<Array<{ value: string; label: string }>>([]);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    story: '',
    category: '',
    goal_amount: '',
    timeline: '',
    impact_log: '',
    cover_image: '',
    country: '',
    city: '',
    field_of_study: '',
    education_level: '',
    applicant_type: '',
    urgency: 'medium',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesRes, countriesRes, fieldsRes] = await Promise.all([
          getCategories(),
          getCountries(),
          getFieldsOfStudy(),
        ]);

        if (categoriesRes.success) setCategories(categoriesRes.data || []);
        if (countriesRes.success) setCountries(countriesRes.data || []);
        if (fieldsRes.success) setFieldsOfStudy(fieldsRes.data || []);
      } catch (err) {
        console.error('Failed to load form data:', err);
      }
    };
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        story: formData.story,
        category: formData.category as 'tuition' | 'books' | 'laptop' | 'housing' | 'travel' | 'emergency',
        goal_amount: parseFloat(formData.goal_amount),
        timeline: formData.timeline || undefined,
        impact_log: formData.impact_log || undefined,
        cover_image: formData.cover_image || undefined,
        country: formData.country || undefined,
        city: formData.city || undefined,
        field_of_study: formData.field_of_study || undefined,
        education_level: formData.education_level || undefined,
        applicant_type: formData.applicant_type || undefined,
        urgency: formData.urgency || 'medium',
      };

      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to create campaign');
      }

      if (result.success && result.data) {
        router.push(`/campaign/${result.data.campaign_id}`);
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create campaign. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Kampanya Oluştur / Create Campaign</h1>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Kampanya Başlığı / Campaign Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Örn: Mehmet'in Bilgisayar Mühendisliği Eğitimine Destek"
                  required
                  maxLength={200}
                />
              </div>

              <div>
                <Label htmlFor="story">Hikayeniz / Your Story *</Label>
                <Textarea
                  id="story"
                  value={formData.story}
                  onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                  placeholder="Eğitim yolculuğunuzu, hedeflerinizi ve neden desteğe ihtiyaç duyduğunuzu paylaşın..."
                  rows={6}
                  required
                  maxLength={10000}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Kategori / Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Kategori seçiniz / Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat: any) => (
                        <SelectItem key={cat.value || cat.id} value={cat.value || cat.id}>
                          {cat.nameTr || cat.name || cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="goal_amount">Hedef Tutar ($) / Goal Amount ($) *</Label>
                  <Input
                    id="goal_amount"
                    type="number"
                    min="1"
                    max="1000000"
                    step="0.01"
                    value={formData.goal_amount}
                    onChange={(e) => setFormData({ ...formData, goal_amount: e.target.value })}
                    placeholder="5000"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country">Ülke / Country</Label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) => setFormData({ ...formData, country: value, city: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Ülke seçiniz / Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country: any) => (
                        <SelectItem key={country.value || country} value={country.value || country}>
                          {country.label || country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.country === 'TR' ? (
                  <div>
                    <Label htmlFor="city">Şehir / City</Label>
                    <Select
                      value={formData.city}
                      onValueChange={(value) => setFormData({ ...formData, city: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Şehir seçiniz..." />
                      </SelectTrigger>
                      <SelectContent>
                        {TURKEY_CITIES.map((city) => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="field_of_study">Bölüm / Field of Study</Label>
                    <Select
                      value={formData.field_of_study}
                      onValueChange={(value) => setFormData({ ...formData, field_of_study: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Bölüm seçiniz / Select field of study" />
                      </SelectTrigger>
                      <SelectContent>
                        {fieldsOfStudy.map((field: any) => (
                          <SelectItem key={field.value || field} value={field.value || field}>
                            {field.label || field}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {formData.country === 'TR' && (
                <div>
                  <Label htmlFor="field_of_study">Bölüm / Field of Study</Label>
                  <Select
                    value={formData.field_of_study}
                    onValueChange={(value) => setFormData({ ...formData, field_of_study: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Bölüm seçiniz / Select field of study" />
                    </SelectTrigger>
                    <SelectContent>
                      {fieldsOfStudy.map((field: any) => (
                        <SelectItem key={field.value || field} value={field.value || field}>
                          {field.label || field}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="applicant_type">Başvuran Türü / Applicant Type</Label>
                  <Select
                    value={formData.applicant_type}
                    onValueChange={(value) => setFormData({ ...formData, applicant_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seçiniz / Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {APPLICANT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.labelTr} / {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="education_level">Eğitim Seviyesi / Education Level</Label>
                  <Select
                    value={formData.education_level}
                    onValueChange={(value) => setFormData({ ...formData, education_level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seçiniz / Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {EDUCATION_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.labelTr} / {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="urgency">Aciliyet / Urgency</Label>
                  <Select
                    value={formData.urgency}
                    onValueChange={(value) => setFormData({ ...formData, urgency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seçiniz / Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {URGENCY_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.labelTr} / {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="timeline">Zaman Çizelgesi / Timeline</Label>
                <Textarea
                  id="timeline"
                  value={formData.timeline}
                  onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                  placeholder="Fonlara ne zaman ihtiyacınız var? Zaman çizelgeniz nedir?"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="impact_log">Etki Raporu / Impact Log</Label>
                <Textarea
                  id="impact_log"
                  value={formData.impact_log}
                  onChange={(e) => setFormData({ ...formData, impact_log: e.target.value })}
                  placeholder="Bu fon eğitiminizi nasıl etkileyecek? Ne gibi sonuçlar bekliyorsunuz?"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="cover_image">Kapak Görseli URL (opsiyonel)</Label>
                <Input
                  id="cover_image"
                  type="url"
                  value={formData.cover_image}
                  onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Oluşturuluyor...' : 'Kampanya Oluştur / Create Campaign'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  disabled={loading}
                >
                  İptal / Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
