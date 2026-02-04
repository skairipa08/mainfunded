'use client';

import React from 'react';
import { Users, Search } from 'lucide-react';
import { MentorCard, mockMentors } from '@/components/MentorConnect';
import { Input } from '@/components/ui/input';
import MobileHeader from '@/components/MobileHeader';

export default function MentorsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
            {/* Mobile Header */}
            <MobileHeader transparent backHref="/" />

            {/* Hero */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-16 -mt-14 pt-20">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Users className="h-10 w-10" />
                        <h1 className="text-4xl font-bold">Mentor Programi</h1>
                    </div>
                    <p className="text-indigo-100 text-lg max-w-2xl mx-auto">
                        Deneyimli profesyonellerle baglanti kurun ve kariyer yolculugunuzda rehberlik alin
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Search */}
                <div className="max-w-md mx-auto mb-8 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                        placeholder="Mentor ara (isim, sektor, beceri...)"
                        className="pl-10"
                    />
                </div>

                {/* Mentors Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockMentors.map((mentor) => (
                        <MentorCard
                            key={mentor.id}
                            mentor={mentor}
                            onConnect={(id, message) => {
                                console.log('Connect request:', id, message);
                                alert('Mentorluk talebi gonderildi!');
                            }}
                        />
                    ))}
                </div>

                {/* CTA */}
                <div className="mt-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-8 text-center text-white">
                    <h3 className="text-2xl font-bold mb-2">Mentor Olmak Ister misiniz?</h3>
                    <p className="text-indigo-100 mb-4">
                        Deneyimlerinizi paylasarak ogrencilere ilham verin
                    </p>
                    <button className="bg-white text-indigo-600 px-6 py-2 rounded-lg font-medium hover:bg-indigo-50 transition-colors">
                        Mentor Olarak Katil
                    </button>
                </div>
            </div>
        </div>
    );
}
