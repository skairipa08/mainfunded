import { CardsSkeleton } from '@/components/ui/PageSkeleton';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Loading() {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />
            <main className="flex-grow">
                <div className="max-w-7xl mx-auto px-4 py-16">
                    <div className="space-y-8">
                        <div className="space-y-3">
                            <div className="animate-pulse bg-gray-200 h-10 w-64 rounded" />
                            <div className="animate-pulse bg-gray-200 h-5 w-96 rounded" />
                        </div>
                        <CardsSkeleton count={6} />
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
