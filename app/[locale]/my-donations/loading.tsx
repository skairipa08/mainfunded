export default function MyDonationsLoading() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 w-48 bg-gray-200 rounded" />
                    <div className="h-5 w-72 bg-gray-200 rounded" />
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl p-4 space-y-2">
                                <div className="h-4 w-20 bg-gray-200 rounded" />
                                <div className="h-7 w-28 bg-gray-200 rounded" />
                            </div>
                        ))}
                    </div>
                    <div className="bg-white rounded-xl overflow-hidden">
                        <div className="p-4 space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center gap-4 py-3 border-b last:border-0">
                                    <div className="h-4 w-1/4 bg-gray-200 rounded" />
                                    <div className="h-4 w-1/4 bg-gray-200 rounded" />
                                    <div className="h-4 w-1/6 bg-gray-200 rounded" />
                                    <div className="h-4 w-1/6 bg-gray-200 rounded" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
