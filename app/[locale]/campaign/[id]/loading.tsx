export default function CampaignLoading() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-6 w-full">
                <div className="animate-pulse">
                    <div className="h-8 w-32 bg-gray-200 rounded mb-4" />
                    <div className="h-10 w-3/4 bg-gray-200 rounded mb-6" />
                    <div className="grid lg:grid-cols-5 gap-8">
                        <div className="lg:col-span-3 space-y-6">
                            <div className="aspect-[4/3] bg-gray-200 rounded-2xl" />
                            <div className="space-y-3">
                                <div className="h-4 bg-gray-200 rounded w-full" />
                                <div className="h-4 bg-gray-200 rounded w-5/6" />
                                <div className="h-4 bg-gray-200 rounded w-4/6" />
                            </div>
                        </div>
                        <div className="lg:col-span-2">
                            <div className="bg-white border rounded-2xl p-6 space-y-4">
                                <div className="h-20 w-20 bg-gray-200 rounded-full mx-auto" />
                                <div className="h-6 bg-gray-200 rounded w-full" />
                                <div className="h-12 bg-gray-200 rounded w-full" />
                                <div className="h-12 bg-gray-200 rounded w-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
