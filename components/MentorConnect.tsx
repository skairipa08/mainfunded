'use client';

import React, { useState } from 'react';
import {
    Users,
    MessageSquare,
    Calendar,
    Briefcase,
    GraduationCap,
    Link as LinkIcon,
    Check,
    X,
    Star,
    Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MentorProfile {
    id: string;
    name: string;
    title: string;
    company: string;
    industry: string;
    experience: string;
    skills: string[];
    linkedIn?: string;
    availability: 'available' | 'busy' | 'unavailable';
    rating: number;
    menteeCount: number;
    avatar?: string;
}

interface MentorshipRequest {
    id: string;
    studentId: string;
    studentName: string;
    mentorId: string;
    status: 'pending' | 'accepted' | 'declined';
    message: string;
    createdAt: string;
}

interface MentorCardProps {
    mentor: MentorProfile;
    onConnect?: (mentorId: string, message: string) => void;
    className?: string;
}

export function MentorCard({ mentor, onConnect, className }: MentorCardProps) {
    const [showDialog, setShowDialog] = useState(false);
    const [message, setMessage] = useState('');

    const getAvailabilityBadge = () => {
        switch (mentor.availability) {
            case 'available':
                return <Badge className="bg-green-100 text-green-700">Musait</Badge>;
            case 'busy':
                return <Badge className="bg-yellow-100 text-yellow-700">Sinirli</Badge>;
            case 'unavailable':
                return <Badge className="bg-gray-100 text-gray-700">Musait Degil</Badge>;
        }
    };

    const handleConnect = () => {
        if (onConnect && message.trim()) {
            onConnect(mentor.id, message);
            setMessage('');
            setShowDialog(false);
        }
    };

    return (
        <>
            <div className={cn('bg-white rounded-xl shadow-sm border overflow-hidden', className)}>
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 border-b">
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl">
                            {mentor.avatar ? (
                                <img src={mentor.avatar} alt={mentor.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                mentor.name.split(' ').map(n => n[0]).join('')
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-900">{mentor.name}</h3>
                                {getAvailabilityBadge()}
                            </div>
                            <p className="text-sm text-gray-600">{mentor.title}</p>
                            <p className="text-sm text-gray-500">{mentor.company}</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            {mentor.industry}
                        </span>
                        <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {mentor.experience}
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                        {mentor.skills.slice(0, 4).map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                            </Badge>
                        ))}
                        {mentor.skills.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                                +{mentor.skills.length - 4}
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-yellow-500">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="font-medium">{mentor.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-gray-500">
                            <GraduationCap className="h-4 w-4 inline mr-1" />
                            {mentor.menteeCount} mentee
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-4 border-t flex gap-2">
                    {mentor.linkedIn && (
                        <Button variant="outline" size="sm" asChild>
                            <a href={mentor.linkedIn} target="_blank" rel="noopener noreferrer">
                                <LinkIcon className="h-4 w-4 mr-1" />
                                LinkedIn
                            </a>
                        </Button>
                    )}
                    <Button
                        size="sm"
                        className="flex-1"
                        disabled={mentor.availability === 'unavailable'}
                        onClick={() => setShowDialog(true)}
                    >
                        <Users className="h-4 w-4 mr-1" />
                        Baglanti Kur
                    </Button>
                </div>
            </div>

            {/* Connection Dialog */}
            {showDialog && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg">{mentor.name} ile Baglanti</h3>
                            <Button variant="ghost" size="icon" onClick={() => setShowDialog(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Kendinizi tanitarak mentorluk talep edin.
                        </p>
                        <textarea
                            placeholder="Merhaba, ben... alaninda yardim almak istiyorum..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                        />
                        <Button className="w-full" onClick={handleConnect} disabled={!message.trim()}>
                            <Send className="h-4 w-4 mr-2" />
                            Talep Gonder
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
}

interface MentorshipRequestCardProps {
    request: MentorshipRequest;
    onAccept?: (id: string) => void;
    onDecline?: (id: string) => void;
    className?: string;
}

export function MentorshipRequestCard({
    request,
    onAccept,
    onDecline,
    className,
}: MentorshipRequestCardProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR');
    };

    const getStatusBadge = () => {
        switch (request.status) {
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-700">Beklemede</Badge>;
            case 'accepted':
                return <Badge className="bg-green-100 text-green-700">Kabul Edildi</Badge>;
            case 'declined':
                return <Badge className="bg-red-100 text-red-700">Reddedildi</Badge>;
        }
    };

    return (
        <div className={cn('bg-white rounded-xl shadow-sm border p-4', className)}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <GraduationCap className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">{request.studentName}</p>
                        <p className="text-xs text-gray-500">{formatDate(request.createdAt)}</p>
                    </div>
                </div>
                {getStatusBadge()}
            </div>

            <p className="text-sm text-gray-600 mb-4 italic">&ldquo;{request.message}&rdquo;</p>

            {request.status === 'pending' && (
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => onDecline?.(request.id)}
                    >
                        <X className="h-4 w-4 mr-1" />
                        Reddet
                    </Button>
                    <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => onAccept?.(request.id)}
                    >
                        <Check className="h-4 w-4 mr-1" />
                        Kabul Et
                    </Button>
                </div>
            )}
        </div>
    );
}

// Mock data
export const mockMentors: MentorProfile[] = [
    {
        id: '1',
        name: 'Ali Yilmaz',
        title: 'Senior Software Engineer',
        company: 'Google',
        industry: 'Teknoloji',
        experience: '10+ yil',
        skills: ['Python', 'Machine Learning', 'System Design', 'Career Growth'],
        linkedIn: 'https://linkedin.com/in/aliyilmaz',
        availability: 'available',
        rating: 4.9,
        menteeCount: 15,
    },
    {
        id: '2',
        name: 'Zeynep Kara',
        title: 'Investment Analyst',
        company: 'JP Morgan',
        industry: 'Finans',
        experience: '8 yil',
        skills: ['Financial Modeling', 'Valuation', 'Excel', 'Interview Prep'],
        linkedIn: 'https://linkedin.com/in/zeynepkara',
        availability: 'busy',
        rating: 4.7,
        menteeCount: 8,
    },
    {
        id: '3',
        name: 'Mehmet Demir',
        title: 'Product Manager',
        company: 'Meta',
        industry: 'Teknoloji',
        experience: '6 yil',
        skills: ['Product Strategy', 'A/B Testing', 'User Research', 'Roadmapping'],
        availability: 'available',
        rating: 4.8,
        menteeCount: 12,
    },
];
