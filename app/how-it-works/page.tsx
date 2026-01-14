import Link from 'next/link';
import { Shield, Heart, TrendingUp, CheckCircle, DollarSign, Users, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-700 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">How FundEd Works</h1>
          <p className="text-xl text-blue-100 mb-8">
            A transparent, verified platform connecting students with donors who want to make a real impact
          </p>
        </div>
      </section>

      {/* What is FundEd */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">What is FundEd?</h2>
          <p className="text-lg text-gray-700 text-center mb-12 max-w-2xl mx-auto">
            FundEd is an educational crowdfunding platform that ensures every student is verified and every donation creates measurable impact. We provide transparency, security, and accountability for both students and donors.
          </p>
        </div>
      </section>

      {/* Verification Flow */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Student Verification Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mx-auto mb-4">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center">1. Create Profile</h3>
              <p className="text-gray-600 text-center">
                Students sign in and create a profile with their educational information, university details, and field of study
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 mx-auto mb-4">
                <Shield className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center">2. Submit Documents</h3>
              <p className="text-gray-600 text-center">
                Students upload verification documents (ID, enrollment proof, transcripts) for admin review
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center">3. Admin Verification</h3>
              <p className="text-gray-600 text-center">
                Our admin team reviews and verifies each student profile to ensure authenticity before campaigns can be created
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Donor Transparency / ESG Reporting */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Donor Transparency & Impact Tracking</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-blue-50 rounded-lg p-6">
              <TrendingUp className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Real-Time Impact</h3>
              <p className="text-gray-700">
                Donors can see exactly how their contributions are being used. Campaign updates, progress reports, and student achievements are all transparent and accessible.
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-6">
              <Users className="h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">ESG Reporting</h3>
              <p className="text-gray-700">
                Corporate donors receive detailed reporting on their educational impact, making it easy to track ESG contributions and demonstrate social responsibility.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Fees Model */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Transparent Fee Structure</h2>
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-start space-x-4 mb-6">
              <DollarSign className="h-8 w-8 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold mb-3">No Percentage Cut</h3>
                <p className="text-gray-700 mb-4">
                  FundEd does not take a percentage of donations. We believe 100% of your contribution should go to the student.
                </p>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-6">
              <h4 className="font-semibold mb-3 text-gray-900">B2B Transparency</h4>
              <p className="text-gray-700">
                For corporate donors and institutional partners, we provide complete transparency on all fees and processing costs. 
                Stripe payment processing fees are clearly disclosed, and there are no hidden charges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - 3 Steps */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">The FundEd Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Students Apply</h3>
              <p className="text-gray-600">
                Verified students create campaigns to share their educational goals, funding needs, and personal stories
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Donors Support</h3>
              <p className="text-gray-600">
                Supporters browse verified campaigns and make secure donations through Stripe with full transparency
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Impact Made</h3>
              <p className="text-gray-600">
                Students receive funds and update donors on their progress, achievements, and the real-world impact of their support
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Why Trust FundEd?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <Shield className="h-16 w-16 mx-auto mb-4 text-green-600" />
              <h3 className="text-xl font-semibold mb-2">Verified Students</h3>
              <p className="text-gray-600">
                All students are verified by our admin team to ensure authenticity and build trust with donors
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

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Browse verified campaigns or sign in to create your own
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              <Link href="/browse" className="flex items-center gap-2">
                Browse Campaigns
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-blue-600"
            >
              <Link href="/login" className="flex items-center gap-2">
                Sign In
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
