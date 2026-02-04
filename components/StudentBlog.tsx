'use client';

import React, { useState } from 'react';
import {
    BookOpen,
    Calendar,
    Heart,
    MessageSquare,
    Image as ImageIcon,
    Send,
    MoreHorizontal,
    Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface BlogPost {
    id: string;
    studentId: string;
    studentName: string;
    studentAvatar?: string;
    date: string;
    title: string;
    content: string;
    images?: string[];
    likes: number;
    comments: number;
    tags?: string[];
}

interface StudentBlogProps {
    posts: BlogPost[];
    className?: string;
}

export function StudentBlog({ posts, className }: StudentBlogProps) {
    return (
        <div className={cn('space-y-6', className)}>
            {posts.map((post) => (
                <StudentBlogPost key={post.id} post={post} />
            ))}
        </div>
    );
}

function StudentBlogPost({ post }: { post: BlogPost }) {
    const [liked, setLiked] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState<{ text: string; author: string }[]>([]);
    const [shareSuccess, setShareSuccess] = useState(false);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const handleShare = async () => {
        const shareData = {
            title: post.title,
            text: `${post.studentName}: ${post.title}`,
            url: window.location.href,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                // Fallback: copy to clipboard
                await navigator.clipboard.writeText(`${post.title} - ${window.location.href}`);
                setShareSuccess(true);
                setTimeout(() => setShareSuccess(false), 2000);
            }
        } catch (err) {
            // User cancelled or error
            console.log('Share cancelled');
        }
    };

    const handleCommentSubmit = () => {
        if (comment.trim()) {
            setComments([...comments, { text: comment, author: 'Sen' }]);
            setComment('');
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        {post.studentAvatar ? (
                            <img src={post.studentAvatar} alt={post.studentName} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <span className="text-blue-600 font-medium">
                                {post.studentName.charAt(0)}
                            </span>
                        )}
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">{post.studentName}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(post.date)}
                        </p>
                    </div>
                </div>
                <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-5 w-5" />
                </Button>
            </div>

            {/* Content */}
            <div className="px-4 pb-4">
                <h3 className="font-semibold text-gray-900 mb-2">{post.title}</h3>
                <p className="text-gray-600 whitespace-pre-line">{post.content}</p>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                        {post.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                                #{tag}
                            </Badge>
                        ))}
                    </div>
                )}
            </div>

            {/* Images */}
            {post.images && post.images.length > 0 && (
                <div className={cn(
                    'grid gap-1',
                    post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                )}>
                    {post.images.slice(0, 4).map((img, index) => (
                        <div
                            key={index}
                            className="aspect-video bg-gray-100 relative"
                        >
                            <div className="absolute inset-0 flex items-center justify-center">
                                <ImageIcon className="h-8 w-8 text-gray-400" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Actions */}
            <div className="p-4 border-t flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setLiked(!liked)}
                        className={cn(
                            'flex items-center gap-1 text-sm transition-colors',
                            liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                        )}
                    >
                        <Heart className={cn('h-5 w-5', liked && 'fill-current')} />
                        {post.likes + (liked ? 1 : 0)}
                    </button>
                    <button
                        onClick={() => setShowComments(!showComments)}
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-500"
                    >
                        <MessageSquare className="h-5 w-5" />
                        {post.comments + comments.length}
                    </button>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                        "transition-colors",
                        shareSuccess ? "text-green-600" : "text-gray-500 hover:text-blue-600"
                    )}
                    onClick={handleShare}
                >
                    <Share2 className="h-4 w-4 mr-1" />
                    {shareSuccess ? 'Kopyalandi!' : 'Paylas'}
                </Button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="p-4 border-t bg-gray-50">
                    {/* Existing comments */}
                    {comments.length > 0 && (
                        <div className="space-y-3 mb-4">
                            {comments.map((c, i) => (
                                <div key={i} className="flex gap-2">
                                    <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs text-blue-700 font-medium">
                                        {c.author.charAt(0)}
                                    </div>
                                    <div className="flex-1 bg-white rounded-lg px-3 py-2 text-sm">
                                        <span className="font-medium text-gray-900">{c.author}: </span>
                                        <span className="text-gray-600">{c.text}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {/* Comment input */}
                    <div className="flex gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full" />
                        <div className="flex-1 flex gap-2">
                            <input
                                type="text"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit()}
                                placeholder="Yorum yaz..."
                                className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <Button size="sm" onClick={handleCommentSubmit} disabled={!comment.trim()}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Write Blog Post Form
interface WriteBlogPostProps {
    onSubmit?: (data: { title: string; content: string; tags: string[] }) => void;
    className?: string;
}

export function WriteBlogPost({ onSubmit, className }: WriteBlogPostProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSubmit) {
            onSubmit({
                title,
                content,
                tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            });
        }
        setTitle('');
        setContent('');
        setTags('');
    };

    return (
        <form onSubmit={handleSubmit} className={cn('bg-white rounded-xl shadow-sm border p-4', className)}>
            <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Yeni Gonderi</h3>
            </div>

            <div className="space-y-4">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Baslik"
                    className="w-full px-3 py-2 border rounded-lg font-medium"
                    required
                />
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Bagisclarinla paylasacagin bir guncelleme yaz..."
                    rows={4}
                    className="w-full px-3 py-2 border rounded-lg resize-none"
                    required
                />
                <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="Etiketler (virgul ile ayirin)"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                />
            </div>

            <div className="flex items-center justify-between mt-4">
                <Button type="button" variant="ghost" size="sm">
                    <ImageIcon className="h-4 w-4 mr-1" />
                    Fotograf Ekle
                </Button>
                <Button type="submit">
                    <Send className="h-4 w-4 mr-1" />
                    Paylas
                </Button>
            </div>
        </form>
    );
}

// Mock data
export const mockBlogPosts: BlogPost[] = [
    {
        id: '1',
        studentId: 'std-1',
        studentName: 'Elif Yilmaz',
        date: '2026-01-28',
        title: 'Final Sinavlarini Bitirdim! 🎉',
        content: 'Bu donem cok yogun gecti ama sonunda finalleri bitirdim. Sizin destekleriniz olmasa bu kadar odaklanamzdim. Ozellikle laptop bagisi yapan Ahmet Bey\'e cok tesekkurler!',
        likes: 24,
        comments: 5,
        tags: ['tesekkur', 'basari', 'finals'],
    },
    {
        id: '2',
        studentId: 'std-1',
        studentName: 'Elif Yilmaz',
        date: '2026-01-15',
        title: 'Staj Haberleri',
        content: 'Google\'a yaz staji icin basvurdum ve ilk mulakati gectim! Eger kabul edilirsem bu harika bir deneyim olacak. Dua edin 🤞',
        likes: 45,
        comments: 12,
        tags: ['staj', 'kariyer', 'google'],
    },
    {
        id: '3',
        studentId: 'std-2',
        studentName: 'Mehmet Kaya',
        date: '2026-01-10',
        title: 'Yeni Donem Basliyor',
        content: 'Bahar donemi icin kayit yaptirdim. Bu donem 6 ders alacagim. Heyecanli ve biraz da endiseli. Ama biliyorum ki arkamdaki destekle basaracagim!',
        likes: 18,
        comments: 3,
        tags: ['yenidonem', 'universite'],
    },
];
