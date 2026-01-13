import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">Terms of Service</h1>
            <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

            <div className="prose max-w-none space-y-6">
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-700">
                  By accessing and using FundEd, you accept and agree to be bound by these Terms of Service. 
                  If you do not agree, you may not use our platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Platform Description</h2>
                <p className="text-gray-700 mb-4">
                  FundEd is a crowdfunding platform that connects verified students with donors to support educational needs. 
                  We facilitate the connection but are not a party to the funding relationship.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Student Responsibilities</h2>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>Provide accurate and truthful information in your student profile</li>
                  <li>Submit legitimate verification documents</li>
                  <li>Use funds for the stated educational purposes</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Maintain the accuracy of campaign information</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Donor Responsibilities</h2>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>Donations are voluntary and non-refundable unless required by law</li>
                  <li>Donors understand that FundEd is a platform facilitator, not a guarantor</li>
                  <li>Donors are responsible for their own tax implications</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Verification Process</h2>
                <p className="text-gray-700 mb-4">
                  Student verification is conducted by our admin team. We reserve the right to:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>Request additional verification documents</li>
                  <li>Reject verification applications at our discretion</li>
                  <li>Revoke verification status if information is found to be inaccurate</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Payment Processing</h2>
                <p className="text-gray-700 mb-4">
                  Payments are processed through Stripe. FundEd does not store credit card information. 
                  All payment disputes should be directed to Stripe or your financial institution.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Prohibited Activities</h2>
                <p className="text-gray-700 mb-4">You agree not to:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>Provide false or misleading information</li>
                  <li>Use the platform for illegal purposes</li>
                  <li>Impersonate others or misrepresent your identity</li>
                  <li>Interfere with the platform&apos;s operation</li>
                  <li>Attempt to gain unauthorized access to any part of the platform</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h2>
                <p className="text-gray-700">
                  FundEd acts as a platform facilitator. We are not responsible for the accuracy of campaign information, 
                  the use of funds by students, or disputes between students and donors.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Termination</h2>
                <p className="text-gray-700">
                  We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to Terms</h2>
                <p className="text-gray-700">
                  We may update these terms from time to time. Continued use of the platform constitutes acceptance of updated terms.
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
