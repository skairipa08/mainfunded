import { DashboardSkeleton } from '@/components/ui/PageSkeleton';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Loading() {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />
            <main className="flex-grow">
                <div className="max-w-7xl mx-auto px-4 py-16">
                    <DashboardSkeleton />
                </div>
            </main>
            <Footer />
        </div>
    );
}
