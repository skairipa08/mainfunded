import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';

export default function MissionVisionPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-12">Mission & Vision</h1>

        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Mission</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            FundEd provides verified, ESG-aligned infrastructure for education funding. We verify students before funding, link every contribution to measurable educational outcomes, and deliver auditable impact reporting to institutions, companies, and individual supporters. Our infrastructure ensures accountability, transparency, and compliance in education funding ecosystems.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Vision</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            FundEd establishes the standard infrastructure layer for education funding, where verification precedes funding, every contribution is traceable to specific educational outcomes, and institutions can meet ESG requirements through transparent, auditable reporting. We position FundEd as the foundational infrastructure that enables fair access to education support while maintaining institutional-grade accountability and compliance.
          </p>
        </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
