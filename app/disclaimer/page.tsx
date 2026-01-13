import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">Disclaimer</h1>
            <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

            <div className="prose max-w-none space-y-6">
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Platform Nature</h2>
                <p className="text-gray-700 mb-4">
                  FundEd is a crowdfunding platform that facilitates connections between verified students and donors. 
                  We are a technology platform, not a financial institution, charity, or educational institution.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">No Guarantees</h2>
                <p className="text-gray-700 mb-4">
                  FundEd does not guarantee:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>That campaigns will reach their funding goals</li>
                  <li>That students will use funds as stated in their campaigns</li>
                  <li>The accuracy of information provided by students</li>
                  <li>The success of any educational endeavor</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Verification Disclaimer</h2>
                <p className="text-gray-700 mb-4">
                  While we verify student status through document review, verification does not constitute:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>Endorsement of the student&apos;s campaign</li>
                  <li>Guarantee of campaign success</li>
                  <li>Verification of the student&apos;s financial need</li>
                  <li>Assurance of fund usage compliance</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Donation Risks</h2>
                <p className="text-gray-700 mb-4">
                  Donors should be aware that:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>Donations are voluntary contributions, not purchases</li>
                  <li>FundEd does not provide refunds except as required by law</li>
                  <li>Donors are responsible for their own tax reporting</li>
                  <li>There is no guarantee that campaign goals will be met</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Services</h2>
                <p className="text-gray-700 mb-4">
                  FundEd uses third-party services including:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>Stripe for payment processing</li>
                  <li>Cloudinary for file storage</li>
                  <li>Google OAuth for authentication</li>
                </ul>
                <p className="text-gray-700">
                  We are not responsible for the actions, policies, or services of these third parties.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
                <p className="text-gray-700">
                  To the maximum extent permitted by law, FundEd shall not be liable for any indirect, incidental, 
                  special, consequential, or punitive damages arising from your use of the platform.
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
