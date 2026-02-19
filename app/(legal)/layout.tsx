import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-8 md:p-12">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
