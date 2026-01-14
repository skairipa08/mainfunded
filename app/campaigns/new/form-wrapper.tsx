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
    field_of_study: '',
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
        field_of_study: formData.field_of_study || undefined,
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
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Campaign</h1>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Campaign Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Help me complete my Computer Science degree"
                  required
                  maxLength={200}
                />
              </div>

              <div>
                <Label htmlFor="story">Your Story *</Label>
                <Textarea
                  id="story"
                  value={formData.story}
                  onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                  placeholder="Share your educational journey, goals, and why you need support..."
                  rows={6}
                  required
                  maxLength={10000}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="goal_amount">Goal Amount ($) *</Label>
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
                  <Label htmlFor="country">Country</Label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) => setFormData({ ...formData, country: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.value} value={country.value}>
                          {country.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="field_of_study">Field of Study</Label>
                  <Select
                    value={formData.field_of_study}
                    onValueChange={(value) => setFormData({ ...formData, field_of_study: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select field of study" />
                    </SelectTrigger>
                    <SelectContent>
                      {fieldsOfStudy.map((field) => (
                        <SelectItem key={field.value} value={field.value}>
                          {field.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="timeline">Timeline</Label>
                <Textarea
                  id="timeline"
                  value={formData.timeline}
                  onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                  placeholder="When do you need the funds? What is your timeline?"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="impact_log">Impact Log</Label>
                <Textarea
                  id="impact_log"
                  value={formData.impact_log}
                  onChange={(e) => setFormData({ ...formData, impact_log: e.target.value })}
                  placeholder="How will this funding impact your education? What outcomes do you expect?"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="cover_image">Cover Image URL (optional)</Label>
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
                  {loading ? 'Creating...' : 'Create Campaign'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  disabled={loading}
                >
                  Cancel
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
