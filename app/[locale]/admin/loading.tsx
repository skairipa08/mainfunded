export default function AdminLoading() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 w-48 bg-gray-200 rounded" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl p-6 space-y-3">
                                <div className="h-4 w-24 bg-gray-200 rounded" />
                                <div className="h-8 w-16 bg-gray-200 rounded" />
                            </div>
                        ))}
                    </div>
                    <div className="bg-white rounded-xl p-6 space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-12 bg-gray-200 rounded w-full" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
