'use client';

import React from 'react';

function Shimmer({ className = '' }: { className?: string }) {
    return (
        <div
            className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded ${className}`}
            style={{ animationDuration: '1.5s' }}
        />
    );
}

/** Full-page skeleton with header, stats cards, and content area */
export function DashboardSkeleton() {
    return (
        <div className="space-y-8">
            {/* Header skeleton */}
            <div className="space-y-3">
                <Shimmer className="h-9 w-64" />
                <Shimmer className="h-5 w-96" />
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 space-y-3">
                        <div className="flex items-center justify-between">
                            <Shimmer className="h-4 w-24" />
                            <Shimmer className="h-4 w-4 rounded" />
                        </div>
                        <Shimmer className="h-8 w-20" />
                        <Shimmer className="h-3 w-32" />
                    </div>
                ))}
            </div>

            {/* Table skeleton */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <Shimmer className="h-5 w-40" />
                </div>
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-gray-50 last:border-0">
                        <Shimmer className="h-4 w-32" />
                        <Shimmer className="h-4 w-20" />
                        <Shimmer className="h-4 w-40 flex-1" />
                        <Shimmer className="h-6 w-16 rounded-full" />
                        <Shimmer className="h-4 w-24" />
                    </div>
                ))}
            </div>
        </div>
    );
}

/** Card-based content skeleton */
export function CardsSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <Shimmer className="h-48 w-full rounded-none" />
                    <div className="p-5 space-y-3">
                        <Shimmer className="h-5 w-3/4" />
                        <Shimmer className="h-4 w-full" />
                        <Shimmer className="h-4 w-2/3" />
                        <div className="pt-2">
                            <Shimmer className="h-2 w-full rounded-full" />
                        </div>
                        <div className="flex justify-between pt-1">
                            <Shimmer className="h-4 w-16" />
                            <Shimmer className="h-4 w-12" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

/** Form skeleton for donate page */
export function FormSkeleton() {
    return (
        <div className="space-y-6">
            {/* Quick amounts */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Shimmer key={i} className="h-12 rounded-xl" />
                ))}
            </div>
            {/* Input */}
            <Shimmer className="h-14 rounded-xl" />
            {/* Select */}
            <div className="space-y-2">
                <Shimmer className="h-4 w-20" />
                <Shimmer className="h-12 rounded-xl" />
            </div>
            {/* Input fields */}
            <div className="space-y-2">
                <Shimmer className="h-4 w-24" />
                <Shimmer className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
                <Shimmer className="h-4 w-16" />
                <Shimmer className="h-12 rounded-xl" />
            </div>
            {/* Button */}
            <Shimmer className="h-14 rounded-2xl" />
        </div>
    );
}

export { Shimmer };
