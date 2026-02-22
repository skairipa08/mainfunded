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
    EyeOff,
    Bookmark,
    SmilePlus,
    ChevronDown,
    ChevronUp,
    GraduationCap,
    CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { censorSurname } from '@/lib/privacy';

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
    showTimeline?: boolean;
}

export function StudentBlog({ posts, className, showTimeline }: StudentBlogProps) {
    return (
        <div className={cn('space-y-5', className)}>
            {posts.map((post, index) => (
                <StudentBlogPost
                    key={post.id}
                    post={post}
                    showTimeline={showTimeline}
                    isFirst={index === 0}
                />
            ))}
        </div>
    );
}

function StudentBlogPost({
    post,
    showTimeline,
    isFirst,
}: {
    post: BlogPost;
    showTimeline?: boolean;
    isFirst?: boolean;
}) {
    const [liked, setLiked] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState<{ text: string; author: string; time: string }[]>([]);
    const [shareSuccess, setShareSuccess] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getRelativeTime = (dateStr: string) => {
        const now = new Date();
        const date = new Date(dateStr);
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Bugün';
        if (diffDays === 1) return 'Dün';
        if (diffDays < 7) return `${diffDays} gün önce`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
        return formatDate(dateStr);
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
                await navigator.clipboard.writeText(`${post.title} - ${window.location.href}`);
                setShareSuccess(true);
                setTimeout(() => setShareSuccess(false), 2000);
            }
        } catch {
            console.log('Share cancelled');
        }
    };

    const handleCommentSubmit = () => {
        if (comment.trim()) {
            setComments([
                ...comments,
                {
                    text: comment,
                    author: 'Sen',
                    time: 'Şimdi',
                },
            ]);
            setComment('');
        }
    };

    const isLongContent = post.content.length > 200;
    const displayContent = isLongContent && !expanded ? post.content.slice(0, 200) + '...' : post.content;

    // Color scheme based on student
    const avatarColors = [
        { bg: 'bg-gradient-to-br from-blue-400 to-blue-600', ring: 'ring-blue-200' },
        { bg: 'bg-gradient-to-br from-emerald-400 to-emerald-600', ring: 'ring-emerald-200' },
        { bg: 'bg-gradient-to-br from-purple-400 to-purple-600', ring: 'ring-purple-200' },
        { bg: 'bg-gradient-to-br from-rose-400 to-rose-600', ring: 'ring-rose-200' },
        { bg: 'bg-gradient-to-br from-amber-400 to-amber-600', ring: 'ring-amber-200' },
    ];
    const colorIdx = post.studentId.charCodeAt(post.studentId.length - 1) % avatarColors.length;
    const avatarColor = avatarColors[colorIdx];

    return (
        <div className={cn('relative', showTimeline && 'md:pl-14')}>
            {/* Timeline dot */}
            {showTimeline && (
                <div className="hidden md:flex absolute left-4 top-6 w-5 h-5 rounded-full bg-white border-[3px] border-blue-400 z-10 shadow-sm" />
            )}

            <div
                className={cn(
                    'bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md',
                    isFirst && 'ring-2 ring-blue-100'
                )}
            >
                {/* Header */}
                <div className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className={cn(
                                'w-11 h-11 rounded-full flex items-center justify-center ring-2 shadow-sm',
                                avatarColor.bg,
                                avatarColor.ring
                            )}
                        >
                            {post.studentAvatar ? (
                                <img
                                    src={post.studentAvatar}
                                    alt={censorSurname(post.studentName)}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <span className="text-white font-bold text-sm">
                                    {post.studentName
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join('')
                                        .toUpperCase()}
                                </span>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="font-semibold text-gray-900">
                                    {censorSurname(post.studentName)}
                                </p>
                                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <Calendar className="h-3 w-3" />
                                <span>{getRelativeTime(post.date)}</span>
                                <span className="text-gray-300">·</span>
                                <GraduationCap className="h-3 w-3" />
                                <span>Öğrenci</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                'h-8 w-8 rounded-lg transition-colors',
                                bookmarked
                                    ? 'text-amber-500 hover:text-amber-600'
                                    : 'text-gray-400 hover:text-gray-600'
                            )}
                            onClick={() => setBookmarked(!bookmarked)}
                        >
                            <Bookmark
                                className={cn('h-4 w-4', bookmarked && 'fill-current')}
                            />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-gray-400">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="px-5 pb-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
                        {post.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line text-[15px]">
                        {displayContent}
                    </p>
                    {isLongContent && (
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="mt-1 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                        >
                            {expanded ? (
                                <>
                                    Daha az göster <ChevronUp className="h-3.5 w-3.5" />
                                </>
                            ) : (
                                <>
                                    Devamını oku <ChevronDown className="h-3.5 w-3.5" />
                                </>
                            )}
                        </button>
                    )}

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                            {post.tags.map((tag) => (
                                <Badge
                                    key={tag}
                                    variant="outline"
                                    className="text-xs px-2.5 py-0.5 rounded-full bg-gray-50 text-gray-500 border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors cursor-pointer"
                                >
                                    #{tag}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>

                {/* Images */}
                {post.images && post.images.length > 0 && (
                    <div
                        className={cn(
                            'grid gap-0.5 mx-5 mb-4 rounded-xl overflow-hidden',
                            post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                        )}
                    >
                        {post.images.slice(0, 4).map((img, index) => (
                            <div
                                key={index}
                                className="aspect-video bg-gradient-to-br from-gray-100 to-gray-50 relative cursor-pointer hover:opacity-90 transition-opacity"
                            >
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <ImageIcon className="h-8 w-8 text-gray-300" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Engagement Stats (subtle) */}
                <div className="px-5 pb-2">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                            <div className="flex -space-x-1">
                                <div className="w-4 h-4 rounded-full bg-rose-400 border border-white" />
                                <div className="w-4 h-4 rounded-full bg-blue-400 border border-white" />
                                <div className="w-4 h-4 rounded-full bg-emerald-400 border border-white" />
                            </div>
                            <span className="ml-1">{post.likes + (liked ? 1 : 0)} beğeni</span>
                        </div>
                        <button
                            onClick={() => setShowComments(!showComments)}
                            className="hover:text-gray-600 transition-colors"
                        >
                            {post.comments + comments.length} yorum
                        </button>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mx-5 mb-2 border-t border-gray-100" />
                <div className="px-3 pb-3 flex items-center justify-between">
                    <div className="flex items-center gap-0.5">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setLiked(!liked)}
                            className={cn(
                                'rounded-xl h-9 px-3 gap-1.5 text-sm font-medium transition-all',
                                liked
                                    ? 'text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100'
                                    : 'text-gray-500 hover:text-rose-500 hover:bg-rose-50'
                            )}
                        >
                            <Heart className={cn('h-[18px] w-[18px]', liked && 'fill-current')} />
                            Beğen
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowComments(!showComments)}
                            className={cn(
                                'rounded-xl h-9 px-3 gap-1.5 text-sm font-medium transition-all',
                                showComments
                                    ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                                    : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                            )}
                        >
                            <MessageSquare className="h-[18px] w-[18px]" />
                            Yorum
                        </Button>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                            'rounded-xl h-9 px-3 gap-1.5 text-sm font-medium transition-all',
                            shareSuccess
                                ? 'text-green-600 bg-green-50'
                                : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                        )}
                        onClick={handleShare}
                    >
                        <Share2 className="h-[18px] w-[18px]" />
                        {shareSuccess ? 'Kopyalandı!' : 'Paylaş'}
                    </Button>
                </div>

                {/* Comments Section */}
                {showComments && (
                    <div className="border-t border-gray-100 bg-gray-50/50">
                        {/* Existing comments */}
                        {comments.length > 0 && (
                            <div className="p-4 space-y-3">
                                {comments.map((c, i) => (
                                    <div key={i} className="flex gap-2.5 group">
                                        <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold flex-shrink-0">
                                            {c.author.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="bg-white rounded-2xl rounded-tl-sm px-3.5 py-2.5 shadow-sm border border-gray-100">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="font-semibold text-sm text-gray-900">
                                                        {c.author}
                                                    </span>
                                                    <span className="text-[11px] text-gray-400">
                                                        {c.time}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600">{c.text}</p>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 ml-2">
                                                <button className="text-[11px] text-gray-400 hover:text-gray-600 font-medium">
                                                    Beğen
                                                </button>
                                                <button className="text-[11px] text-gray-400 hover:text-gray-600 font-medium">
                                                    Yanıtla
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Comment input */}
                        <div className="p-4 pt-2 flex gap-3 items-start">
                            <div className="w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex-shrink-0" />
                            <div className="flex-1 flex gap-2">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit()}
                                        placeholder="Yorum yaz..."
                                        className="w-full pl-4 pr-10 py-2.5 text-sm bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 placeholder:text-gray-400"
                                    />
                                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                                        <SmilePlus className="h-4 w-4" />
                                    </button>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={handleCommentSubmit}
                                    disabled={!comment.trim()}
                                    className="rounded-xl h-10 w-10 p-0 bg-blue-600 hover:bg-blue-700 disabled:opacity-30"
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Write Blog Post Form
interface WriteBlogPostProps {
    onSubmit?: (data: { title: string; content: string; tags: string[]; censorSurname: boolean }) => void;
    className?: string;
}

export function WriteBlogPost({ onSubmit, className }: WriteBlogPostProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');
    const [censorName, setCensorName] = useState(true);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSubmit) {
            onSubmit({
                title,
                content,
                tags: tags.split(',').map(t => t.trim()).filter(Boolean),
                censorSurname: censorName,
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

            {/* Surname Censoring Option */}
            <div className="flex items-center gap-2 mt-4 p-3 bg-gray-50 rounded-lg">
                <input
                    type="checkbox"
                    id="censorName"
                    checked={censorName}
                    onChange={(e) => setCensorName(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="censorName" className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <EyeOff className="h-4 w-4 text-gray-500" />
                    Soyadimi sansurle (Ornek: Ayse Y***)
                </label>
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
        date: '2026-02-20',
        title: 'Final Sinavlarini Bitirdim! 🎉',
        content: 'Bu donem cok yogun gecti ama sonunda finalleri bitirdim. Sizin destekleriniz olmasa bu kadar odaklanamzdim. Ozellikle laptop bagisi yapan Ahmet Bey\'e cok tesekkurler! Artik yaz staji icin hazirlanmaya baslayabilirim.',
        likes: 24,
        comments: 5,
        tags: ['tesekkur', 'basari', 'finals'],
    },
    {
        id: '2',
        studentId: 'std-1',
        studentName: 'Elif Yilmaz',
        date: '2026-02-15',
        title: 'Staj Haberleri 🚀',
        content: 'Google\'a yaz staji icin basvurdum ve ilk mulakati gectim! Eger kabul edilirsem bu harika bir deneyim olacak. Dua edin 🤞\n\nTeknik mulakat icin algoritma calisiyorum. LeetCode ve HackerRank uzerinden pratik yapiyorum.',
        likes: 45,
        comments: 12,
        tags: ['staj', 'kariyer', 'google'],
    },
    {
        id: '3',
        studentId: 'std-2',
        studentName: 'Mehmet Kaya',
        date: '2026-02-10',
        title: 'Yeni Donem Basliyor',
        content: 'Bahar donemi icin kayit yaptirdim. Bu donem 6 ders alacagim. Heyecanli ve biraz da endiseli. Ama biliyorum ki arkamdaki destekle basaracagim!',
        likes: 18,
        comments: 3,
        tags: ['yenidonem', 'universite'],
    },
    {
        id: '4',
        studentId: 'std-3',
        studentName: 'Zeynep Demir',
        date: '2026-02-05',
        title: 'Burs Haberi Geldi! 💫',
        content: 'FundEd sayesinde aldıgım burs ile bu donem kitap ve materyal masraflarimi karsilayabildim. Bu destek olmasa derslerime bu kadar odaklanamazdim. Cok tesekkur ederim!',
        likes: 67,
        comments: 8,
        tags: ['tesekkur', 'basari'],
    },
    {
        id: '5',
        studentId: 'std-4',
        studentName: 'Ahmet Ozkan',
        date: '2026-01-28',
        title: 'Hackathon Birincisi Olduk! 🏆',
        content: 'Universitemizin duzenledigı hackathon yarismasinda takimimla birinci olduk! Proje konumuz egitimde firsat esitligi uzerineydi - tam da FundEd\'in misyonu gibi. Bu basariyi sizlerle paylasmak istedim.',
        likes: 89,
        comments: 15,
        tags: ['basari', 'kariyer'],
    },
];
