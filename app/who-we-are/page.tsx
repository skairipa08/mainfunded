import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';

export default function WhoWeArePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-12">Who We Are</h1>

        <section className="mb-12">
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            FundEd is infrastructure for verified education funding. We are not a donation campaign platform. We are the infrastructure layer that verifies students before funding, links every contribution to measurable educational outcomes, and provides ESG-compliant reporting to institutions and partners.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Infrastructure, Not Platform</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            FundEd operates as infrastructure, not a donation platform. Our role is to provide the verification, tracking, and reporting systems that enable education funding to operate with accountability and transparency. We establish the structural framework that ensures students are verified before receiving funding and that all contributions are linked to measurable, reportable outcomes.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Who We Serve</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Students</h3>
              <p className="text-gray-700 leading-relaxed">
                Students seeking fair access to education support. FundEd verifies student eligibility before funding, ensuring that only legitimate educational needs receive support through our infrastructure.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Individual Supporters</h3>
              <p className="text-gray-700 leading-relaxed">
                Individual donors who require transparency and clarity in their contributions. FundEd provides complete visibility into how contributions are used and what educational outcomes are achieved.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Institutions and Companies</h3>
              <p className="text-gray-700 leading-relaxed">
                Institutions and companies that require ESG-compliant, auditable impact reporting. FundEd delivers structured reporting that links every contribution to specific educational outcomes, enabling organizations to meet compliance requirements and demonstrate measurable impact.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Role in Education Funding Ecosystems</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            FundEd functions as the infrastructure layer that connects students, supporters, and institutions within education funding ecosystems. We provide the verification systems, outcome tracking, and reporting infrastructure that enable these ecosystems to operate with accountability and transparency. Our infrastructure supports both individual contributions and institutional funding programs.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Long-Term Infrastructure Positioning</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            FundEd is positioned as a long-term infrastructure layer for education funding. We focus on structure, accountability, and measurability rather than campaign management. Our infrastructure is designed to support education funding ecosystems over the long term, providing the verification, tracking, and reporting systems that institutions and partners require for sustainable, compliant education funding operations.
          </p>
        </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
