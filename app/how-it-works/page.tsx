import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-12">How It Works</h1>

        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Student Verification</h2>
          <div className="space-y-4 text-gray-700">
            <p className="leading-relaxed">
              FundEd verifies students before funding. Students submit identification, enrollment documentation, and academic records. Our verification process confirms student status, enrollment validity, and educational need before any funding is made available.
            </p>
            <p className="leading-relaxed">
              Verification status is maintained in our system and linked to all funding activities. Only verified students can receive funding through FundEd infrastructure. This verification step ensures that funding is directed to legitimate educational needs.
            </p>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Funding Flow</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Individual Contributions</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Individual supporters contribute through verified student funding requests. Contributions are processed through secure payment infrastructure. FundEd does not take a percentage from donations. Payment processing fees are transparently disclosed.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Institutional Funding</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Institutions and companies fund students through FundEd infrastructure. Institutional funding flows through the same verification and tracking systems as individual contributions. All institutional funding is linked to measurable educational outcomes and included in ESG-compliant reporting.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Revenue Model</h3>
              <p className="text-gray-700 leading-relaxed">
                FundEd generates revenue from institutions through reporting services, infrastructure access, and transparency services. We do not take a percentage from individual or institutional donations. Our revenue model is based on providing infrastructure and reporting services to institutions that require ESG-compliant, auditable impact reporting.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Impact Tracking & Reporting</h2>
          <div className="space-y-4 text-gray-700">
            <p className="leading-relaxed">
              Every contribution through FundEd infrastructure is linked to measurable educational outcomes. We track academic progress, completion rates, and educational achievements for each funded student. This outcome data is structured and reportable.
            </p>
            <p className="leading-relaxed">
              Impact reporting is available to all contributors. Individual supporters receive updates on student progress and educational outcomes. Institutions receive structured, auditable reports that link their contributions to specific educational outcomes, enabling ESG compliance and impact demonstration.
            </p>
            <p className="leading-relaxed">
              All reporting is transparent and auditable. Outcome data is maintained in our infrastructure and can be verified by institutions, auditors, and compliance officers.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">ESG & Compliance Layer</h2>
          <div className="space-y-4 text-gray-700">
            <p className="leading-relaxed">
              FundEd infrastructure is ESG-aligned by design. Our verification, tracking, and reporting systems are structured to meet ESG compliance requirements for institutions and companies. Every contribution is linked to measurable educational outcomes that can be reported for ESG purposes.
            </p>
            <p className="leading-relaxed">
              Our infrastructure provides the audit trail and documentation that institutions require for ESG reporting. Outcome data, verification records, and contribution flows are maintained in auditable formats. Institutions can demonstrate their educational impact contributions through FundEd reporting.
            </p>
            <p className="leading-relaxed">
              ESG alignment is built into our infrastructure, not added as a marketing layer. Our systems are designed to meet institutional compliance requirements from the ground up.
            </p>
          </div>
        </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
