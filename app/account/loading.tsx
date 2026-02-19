export default function AccountLoading() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 w-48 bg-gray-200 rounded" />
                    <div className="bg-white rounded-xl p-6 space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 bg-gray-200 rounded-full" />
                            <div className="space-y-2">
                                <div className="h-5 w-40 bg-gray-200 rounded" />
                                <div className="h-4 w-56 bg-gray-200 rounded" />
                            </div>
                        </div>
                        <div className="border-t pt-4 space-y-3">
                            <div className="h-4 w-full bg-gray-200 rounded" />
                            <div className="h-4 w-3/4 bg-gray-200 rounded" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
