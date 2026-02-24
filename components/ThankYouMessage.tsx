'use client';

import React, { useState } from 'react';
import {
    Video,
    MessageSquare,
    Heart,
    Play,
    Calendar,
    Send,
    Upload,
    X,
    Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ThankYouMessage {
    id: string;
    studentId: string;
    studentName: string;
    donorId: string;
    donorName: string;
    type: 'video' | 'text';
    content: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    createdAt: string;
    isRead: boolean;
}

interface ThankYouCardProps {
    message: ThankYouMessage;
    onMarkRead?: (id: string) => void;
    className?: string;
}

export function ThankYouCard({ message, onMarkRead, className }: ThankYouCardProps) {
    const [showVideo, setShowVideo] = useState(false);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <>
            <div
                className={cn(
                    'bg-white rounded-xl shadow-sm border overflow-hidden',
                    !message.isRead && 'ring-2 ring-blue-200',
                    className
                )}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                                <Heart className="h-5 w-5 text-pink-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{message.studentName}</p>
                                <p className="text-sm text-gray-500">teşekkür ediyor</p>
                            </div>
                        </div>
                        <Badge
                            variant="outline"
                            className={cn(
                                message.type === 'video'
                                    ? 'border-purple-200 text-purple-600'
                                    : 'border-blue-200 text-blue-600'
                            )}
                        >
                            {message.type === 'video' ? (
                                <><Video className="h-3 w-3 mr-1" /> Video</>
                            ) : (
                                <><MessageSquare className="h-3 w-3 mr-1" /> Mesaj</>
                            )}
                        </Badge>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">
                    {message.type === 'video' ? (
                        <div
                            className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden cursor-pointer group"
                            onClick={() => setShowVideo(true)}
                        >
                            {message.thumbnailUrl ? (
                                <img
                                    src={message.thumbnailUrl}
                                    alt="Video thumbnail"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500" />
                            )}
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                                <div className="bg-white/90 p-4 rounded-full">
                                    <Play className="h-8 w-8 text-purple-600 fill-purple-600" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-700 italic">&ldquo;{message.content}&rdquo;</p>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 pb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        {formatDate(message.createdAt)}
                    </div>
                    {!message.isRead && onMarkRead && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onMarkRead(message.id)}
                        >
                            <Check className="h-4 w-4 mr-1" />
                            Okundu
                        </Button>
                    )}
                </div>
            </div>

            {/* Video Modal */}
            {showVideo && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-3xl w-full overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="font-semibold">{message.studentName} - Teşekkür Videosu</h3>
                            <Button variant="ghost" size="icon" onClick={() => setShowVideo(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="aspect-video bg-black">
                            {message.videoUrl && (
                                <video
                                    src={message.videoUrl}
                                    controls
                                    autoPlay
                                    className="w-full h-full"
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

interface SendThankYouProps {
    donorName: string;
    donorId: string;
    onSend?: (data: { type: 'video' | 'text'; content: string; videoFile?: File }) => void;
    className?: string;
}

export function SendThankYou({ donorName, donorId, onSend, className }: SendThankYouProps) {
    const [messageType, setMessageType] = useState<'video' | 'text'>('text');
    const [textMessage, setTextMessage] = useState('');
    const [videoFile, setVideoFile] = useState<File | null>(null);

    const handleSubmit = () => {
        if (onSend) {
            onSend({
                type: messageType,
                content: textMessage,
                videoFile: videoFile || undefined,
            });
        }
        setTextMessage('');
        setVideoFile(null);
    };

    return (
        <div className={cn('bg-white rounded-xl shadow-sm border p-4', className)}>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5 text-pink-500" />
                {donorName} için Teşekkür Mesajı
            </h3>

            {/* Type Toggle */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => setMessageType('text')}
                    className={cn(
                        'flex-1 py-2 rounded-lg border-2 flex items-center justify-center gap-2',
                        messageType === 'text'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200'
                    )}
                >
                    <MessageSquare className="h-4 w-4" />
                    Metin
                </button>
                <button
                    onClick={() => setMessageType('video')}
                    className={cn(
                        'flex-1 py-2 rounded-lg border-2 flex items-center justify-center gap-2',
                        messageType === 'video'
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-200'
                    )}
                >
                    <Video className="h-4 w-4" />
                    Video
                </button>
            </div>

            {/* Content Input */}
            {messageType === 'text' ? (
                <textarea
                    placeholder="Bağışçı için teşekkür mesajınızı yazın..."
                    value={textMessage}
                    onChange={(e) => setTextMessage(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                    {videoFile ? (
                        <div className="space-y-2">
                            <Video className="h-8 w-8 mx-auto text-purple-500" />
                            <p className="font-medium text-gray-900">{videoFile.name}</p>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setVideoFile(null)}
                            >
                                <X className="h-4 w-4 mr-1" />
                                Kaldir
                            </Button>
                        </div>
                    ) : (
                        <label className="cursor-pointer">
                            <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                            <p className="text-gray-600 mb-1">Video yüklemek için tıklayın</p>
                            <p className="text-xs text-gray-400">MP4, max 100MB</p>
                            <input
                                type="file"
                                accept="video/mp4,video/webm"
                                className="hidden"
                                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                            />
                        </label>
                    )}
                </div>
            )}

            <Button
                className="w-full mt-4"
                onClick={handleSubmit}
                disabled={messageType === 'text' ? !textMessage.trim() : !videoFile}
            >
                <Send className="h-4 w-4 mr-2" />
                Teşekkür Gönder
            </Button>
        </div>
    );
}

// Mock data for demo
export const mockThankYouMessages: ThankYouMessage[] = [
    {
        id: '1',
        studentId: 'std-1',
        studentName: 'Elif Yilmaz',
        donorId: 'donor-1',
        donorName: 'Ahmet Kaya',
        type: 'video',
        content: '',
        videoUrl: '/videos/thank-you-1.mp4',
        thumbnailUrl: '/images/thank-you-thumb-1.jpg',
        createdAt: '2026-01-28',
        isRead: false,
    },
    {
        id: '2',
        studentId: 'std-2',
        studentName: 'Mehmet Demir',
        donorId: 'donor-1',
        donorName: 'Ahmet Kaya',
        type: 'text',
        content: 'Destekleriniz sayesinde hayallerime bir adim daha yaklastim. Üniversite harçlığımı rahatça ödeyebildim. Çok teşekkür ederim!',
        createdAt: '2026-01-25',
        isRead: true,
    },
];
