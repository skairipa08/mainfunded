'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Heart, Shield, TrendingUp, Users, Globe, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CampaignCard from '@/components/CampaignCard';
import { getCampaigns, getCategories } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredCampaigns, setFeaturedCampaigns] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);
        const [campaignsRes, categoriesRes] = await Promise.all([
          getCampaigns({ limit: 3 }),
          getCategories()
        ]);
        setFeaturedCampaigns(campaignsRes.data || []);
        setCategories(categoriesRes.data || []);
      } catch (error) {
        console.error('Failed to load data:', error);
        setError('Unable to load campaigns. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const stats = [
    { label: 'Students Funded', value: '2,500+', icon: Users },
    { label: 'Total Raised', value: '$12M+', icon: TrendingUp },
    { label: 'Countries Reached', value: '45+', icon: Globe },
    { label: 'Success Rate', value: '94%', icon: CheckCircle }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/browse?search=${searchQuery}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Fund Education, Transform Lives
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Support verified students worldwide in achieving their educational dreams
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 text-gray-900"
                />
                <Button type="submit" size="lg">
                  <Search className="mr-2 h-5 w-5" />
                  Search
                </Button>
              </div>
            </form>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <Icon className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                    <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-gray-600 mt-2">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Featured Campaigns */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Featured Campaigns</h2>
              <Button variant="outline" onClick={() => router.push('/browse')}>
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading campaigns...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">{error}</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setLoading(true);
                    setError(null);
                    setFeaturedCampaigns([]);
                    const loadData = async () => {
                      try {
                        const [campaignsRes, categoriesRes] = await Promise.all([
                          getCampaigns({ limit: 3 }),
                          getCategories()
                        ]);
                        setFeaturedCampaigns(campaignsRes.data || []);
                        setCategories(categoriesRes.data || []);
                      } catch (error) {
                        console.error('Failed to load data:', error);
                        setError('Unable to load campaigns. Please try again.');
                      } finally {
                        setLoading(false);
                      }
                    };
                    loadData();
                  }}
                >
                  Retry
                </Button>
              </div>
            ) : featuredCampaigns.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No campaigns available at the moment.</p>
                <p className="text-sm text-gray-500">Check back soon for new campaigns.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredCampaigns.map((campaign: any) => (
                  <CampaignCard key={campaign.campaign_id} campaign={campaign} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Students Apply</h3>
                <p className="text-gray-600">
                  Verified students create campaigns to share their educational goals and funding needs
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Donors Support</h3>
                <p className="text-gray-600">
                  Supporters browse campaigns and make secure donations through Stripe
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Impact Made</h3>
                <p className="text-gray-600">
                  Students receive funds and update donors on their progress and achievements
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              Why Trust FundEd?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <Shield className="h-16 w-16 mx-auto mb-4 text-green-600" />
                <h3 className="text-xl font-semibold mb-2">Verified Students</h3>
                <p className="text-gray-600">
                  All students are verified by our admin team to ensure authenticity and build trust
                </p>
              </div>
              <div className="text-center">
                <Heart className="h-16 w-16 mx-auto mb-4 text-red-600" />
                <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
                <p className="text-gray-600">
                  Safe and secure payment processing through Stripe with industry-standard encryption
                </p>
              </div>
              <div className="text-center">
                <TrendingUp className="h-16 w-16 mx-auto mb-4 text-blue-600" />
                <h3 className="text-xl font-semibold mb-2">Transparent Impact</h3>
                <p className="text-gray-600">
                  Track how your donations are making a real difference in students&apos; lives
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
