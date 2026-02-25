'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Filter, Loader2, Users, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator, SelectLabel, SelectGroup } from '@/components/ui/select';
import CampaignCard from '@/components/CampaignCard';
import { getCampaigns, getCategories, getCountries, getFieldsOfStudy } from '@/lib/api';
import { APPLICANT_TYPES, EDUCATION_LEVELS } from '@/lib/constants';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

/**
 * Client component that uses useSearchParams - must be wrapped in Suspense
 */
export default function BrowsePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [fieldsOfStudy, setFieldsOfStudy] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, total_pages: 0 });

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedCountry, setSelectedCountry] = useState(searchParams.get('country') || 'all');
  const [selectedField, setSelectedField] = useState(searchParams.get('field_of_study') || 'all');
  const [selectedApplicantType, setSelectedApplicantType] = useState(searchParams.get('applicant_type') || 'all');
  const [selectedEducationLevel, setSelectedEducationLevel] = useState(searchParams.get('education_level') || 'all');

  // Load static data on mount
  useEffect(() => {
    const loadStaticData = async () => {
      try {
        const [catRes, countryRes, fieldsRes] = await Promise.all([
          getCategories(),
          getCountries(),
          getFieldsOfStudy()
        ]);
        setCategories(catRes.data || []);
        setCountries(countryRes.data || []);
        setFieldsOfStudy(fieldsRes.data || []);
      } catch (error) {
        // Silently fail - filters will just be empty
      }
    };
    loadStaticData();
  }, []);

  // Load campaigns when filters change
  useEffect(() => {
    const loadCampaigns = async () => {
      setLoading(true);
      try {
        const params: any = {
          page: 1,
          limit: 12,
        };

        if (searchQuery) params.search = searchQuery;
        if (selectedCategory !== 'all') params.category = selectedCategory;
        if (selectedCountry !== 'all') params.country = selectedCountry;
        if (selectedField !== 'all') params.field_of_study = selectedField;
        if (selectedApplicantType !== 'all') params.applicant_type = selectedApplicantType;
        if (selectedEducationLevel !== 'all') params.education_level = selectedEducationLevel;

        const res = await getCampaigns(params);
        setCampaigns(res.data || []);
        setPagination(res.pagination || { total: 0, page: 1, total_pages: 0 });
      } catch (error) {
        console.error('Failed to load campaigns:', error);
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    };

    loadCampaigns();
  }, [searchQuery, selectedCategory, selectedCountry, selectedField, selectedApplicantType, selectedEducationLevel]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (selectedCountry !== 'all') params.set('country', selectedCountry);
    if (selectedField !== 'all') params.set('field_of_study', selectedField);
    if (selectedApplicantType !== 'all') params.set('applicant_type', selectedApplicantType);
    if (selectedEducationLevel !== 'all') params.set('education_level', selectedEducationLevel);
    router.push(`/browse?${params.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Browse Campaigns</h1>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <form onSubmit={handleSearch} className="space-y-4">
              {/* Row 1: Search + Category + Country */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Kampanya ara... / Search campaigns..."
                      value={searchQuery}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Category */}
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori / Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Kategoriler / All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id || cat.value} value={cat.id || cat.value}>
                        {cat.nameTr ? `${cat.nameTr}` : cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Country — Turkey first */}
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ülke / Country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Ülkeler / All Countries</SelectItem>
                    {countries.map((country: any, index: number) => (
                      <SelectItem key={country.value || country} value={country.value || country}>
                        {country.label || country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Row 2: Applicant Type + Education Level + Field of Study */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Applicant Type */}
                <Select value={selectedApplicantType} onValueChange={setSelectedApplicantType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Başvuran Türü / Applicant Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Başvuranlar / All Applicants</SelectItem>
                    {APPLICANT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.labelTr} / {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Education Level */}
                <Select value={selectedEducationLevel} onValueChange={setSelectedEducationLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Eğitim Seviyesi / Education Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Seviyeler / All Levels</SelectItem>
                    {EDUCATION_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.labelTr} / {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Field of Study */}
                <Select value={selectedField} onValueChange={setSelectedField}>
                  <SelectTrigger>
                    <SelectValue placeholder="Bölüm / Field of Study" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Bölümler / All Fields</SelectItem>
                    {fieldsOfStudy.map((field: any) => (
                      <SelectItem key={field} value={field}>
                        {field}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end">
                <Button type="submit">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </form>
          </div>

          {/* Campaigns */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No campaigns found. Try adjusting your filters.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {campaigns.map((campaign) => (
                  <CampaignCard key={campaign.campaign_id} campaign={campaign} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.total_pages > 1 && (
                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    disabled={pagination.page === 1}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.set('page', String(pagination.page - 1));
                      router.push(`/browse?${params.toString()}`);
                    }}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4 text-gray-600">
                    Page {pagination.page} of {pagination.total_pages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={pagination.page >= pagination.total_pages}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.set('page', String(pagination.page + 1));
                      router.push(`/browse?${params.toString()}`);
                    }}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
