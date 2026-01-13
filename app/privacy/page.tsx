import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
            <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

            <div className="prose max-w-none space-y-6">
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
                <p className="text-gray-700 mb-4">
                  We collect information that you provide directly to us, including:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>Account information (name, email address) when you sign up</li>
                  <li>Student profile information (university, field of study, country) for verification</li>
                  <li>Campaign information (title, description, funding goals)</li>
                  <li>Payment information processed securely through Stripe</li>
                  <li>Verification documents submitted for student verification</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
                <p className="text-gray-700 mb-4">We use the information we collect to:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process and verify student applications</li>
                  <li>Process donations and payment transactions</li>
                  <li>Send you transactional emails (verification status, donation confirmations)</li>
                  <li>Respond to your inquiries and provide customer support</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Information Sharing</h2>
                <p className="text-gray-700 mb-4">
                  We do not sell your personal information. We may share your information only in the following circumstances:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>With payment processors (Stripe) to process donations</li>
                  <li>With service providers who assist in operating our platform</li>
                  <li>When required by law or to protect our rights</li>
                  <li>Public campaign information (name, campaign details) as displayed on campaign pages</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
                <p className="text-gray-700 mb-4">
                  We implement appropriate technical and organizational measures to protect your personal information. 
                  However, no method of transmission over the Internet is 100% secure.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Your Rights</h2>
                <p className="text-gray-700 mb-4">You have the right to:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate information</li>
                  <li>Request deletion of your account and data</li>
                  <li>Opt out of non-transactional communications</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Contact Us</h2>
                <p className="text-gray-700">
                  If you have questions about this Privacy Policy, please contact us through the support channels provided on the platform.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
