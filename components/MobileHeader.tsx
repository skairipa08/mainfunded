'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
    ArrowLeft,
    Menu,
    X,
    Sparkles,
    LogOut,
    User,
    Home,
    Users,
    GraduationCap,
    Trophy,
    Award,
    Share2,
    Heart,
    Gift,
    Shield,
    MessageSquare,
} from 'lucide-react';
import { Button } from './ui/button';
import { useTranslation } from '@/lib/i18n';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface MobileHeaderProps {
    title?: string;
    showBackButton?: boolean;
    backHref?: string;
    transparent?: boolean;
}

interface MenuItem {
    label: string;
    href: string;
    icon: React.ElementType;
}

export default function MobileHeader({
    title,
    showBackButton = true,
    backHref,
    transparent = false
}: MobileHeaderProps) {
    const router = useRouter();
    const { t } = useTranslation();
    const { data: session, status } = useSession();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const user = session?.user;
    const isAdmin = (user as any)?.role === 'admin';

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (menuOpen) {
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
        } else {
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        }
        return () => {
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        };
    }, [menuOpen]);

    const handleBack = () => {
        if (backHref) {
            router.push(backHref);
        } else {
            router.back();
        }
    };

    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.push('/');
        setMenuOpen(false);
    };

    // Menu items
    const mainLinks: MenuItem[] = [
        { label: t('nav.home'), href: '/', icon: Home },
        { label: 'Mission & Vision', href: '/mission-vision', icon: Sparkles },
        { label: t('nav.aboutUs'), href: '/who-we-are', icon: Users },
        { label: t('nav.apply'), href: '/apply', icon: GraduationCap },
    ];

    const socialFeatures: MenuItem[] = [
        { label: t('nav.menu.leaderboard'), href: '/leaderboard', icon: Trophy },
        { label: t('nav.menu.badges'), href: '/badges', icon: Award },
        { label: t('nav.menu.studentUpdates'), href: '/updates', icon: Share2 },
        { label: t('nav.menu.alumni'), href: '/alumni', icon: Users },
    ];

    const donorFeatures: MenuItem[] = [
        { label: t('nav.menu.donateNow'), href: '/donate', icon: Heart },
        { label: t('nav.menu.becomeMentor'), href: '/mentors', icon: Users },
    ];

    const transparencyFeatures: MenuItem[] = [
        { label: t('nav.menu.howItWorks'), href: '/how-it-works', icon: Sparkles },
        { label: t('nav.menu.progressReports'), href: '/reports', icon: Shield },
        { label: t('nav.menu.donationGuarantee'), href: '/guarantee', icon: Shield },
        { label: t('nav.menu.transparency'), href: '/transparency', icon: Shield },
        { label: t('nav.menu.stories'), href: '/stories', icon: MessageSquare },
    ];

    return (
        <>
            {/* Fixed Header */}
            <div
                className={`fixed top-0 left-0 right-0 z-50 ${transparent
                    ? 'bg-transparent'
                    : 'bg-white/95 backdrop-blur-sm border-b border-gray-200'
                    }`}
            >
                <div className="flex items-center justify-between px-4 h-14">
                    {/* Left: Back Button */}
                    <div className="flex items-center">
                        {showBackButton && (
                            <button
                                onClick={handleBack}
                                className={`p-2 -ml-2 rounded-full transition-colors ${transparent
                                    ? 'text-white hover:bg-white/20'
                                    : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                aria-label="Geri"
                            >
                                <ArrowLeft className="h-6 w-6" />
                            </button>
                        )}
                        {title && (
                            <span className={`ml-2 font-semibold ${transparent ? 'text-white' : 'text-gray-900'}`}>
                                {title}
                            </span>
                        )}
                    </div>

                    {/* Right: Language Switcher + Menu Button */}
                    <div className="flex items-center gap-1">
                        <LanguageSwitcher variant="minimal" />
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className={`p-2 -mr-2 rounded-full transition-colors ${transparent
                                ? 'text-white hover:bg-white/20'
                                : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            aria-label="Menü"
                        >
                            {menuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {menuOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 z-40"
                        onClick={() => setMenuOpen(false)}
                        onTouchMove={(e) => e.preventDefault()}
                    />

                    {/* Menu Panel */}
                    <div
                        ref={menuRef}
                        className="fixed top-0 right-0 h-screen w-80 max-w-[85vw] bg-white z-50 shadow-2xl flex flex-col"
                        style={{ touchAction: 'pan-y' }}
                    >
                        {/* Menu Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <Link href="/" className="flex items-center space-x-2" onClick={() => setMenuOpen(false)}>
                                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-lg">
                                    <GraduationCap className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                                    FundEd
                                </span>
                            </Link>
                            <button
                                onClick={() => setMenuOpen(false)}
                                className="p-2 rounded-full hover:bg-gray-100"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Menu Content */}
                        <div className="flex-1 overflow-y-auto overscroll-contain p-4 pb-8 space-y-4">
                            {/* User Info if logged in */}
                            {user && (
                                <div className="p-3 bg-gray-50 rounded-xl mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                                            {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{user.name || user.email?.split('@')[0]}</p>
                                            <p className="text-sm text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Main Links */}
                            <div className="space-y-1">
                                {mainLinks.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMenuOpen(false)}
                                        className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                                    >
                                        <item.icon className="h-5 w-5 text-blue-600" />
                                        <span>{item.label}</span>
                                    </Link>
                                ))}
                            </div>

                            {/* Sosyal Section */}
                            <div className="border-t border-gray-100 pt-4">
                                <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t('nav.menu.social')}</p>
                                <div className="space-y-1">
                                    {socialFeatures.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setMenuOpen(false)}
                                            className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                                        >
                                            <item.icon className="h-5 w-5 text-blue-600" />
                                            <span>{item.label}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Bağış Section */}
                            <div className="border-t border-gray-100 pt-4">
                                <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t('nav.menu.donation')}</p>
                                <div className="space-y-1">
                                    {donorFeatures.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setMenuOpen(false)}
                                            className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                                        >
                                            <item.icon className="h-5 w-5 text-blue-600" />
                                            <span>{item.label}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Hakkında Section */}
                            <div className="border-t border-gray-100 pt-4">
                                <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t('nav.menu.about')}</p>
                                <div className="space-y-1">
                                    {transparencyFeatures.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setMenuOpen(false)}
                                            className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                                        >
                                            <item.icon className="h-5 w-5 text-blue-600" />
                                            <span>{item.label}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Admin Links */}
                            {isAdmin && (
                                <div className="border-t border-gray-100 pt-4">
                                    <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Admin</p>
                                    <div className="space-y-1">
                                        <Link
                                            href="/ops/applications"
                                            onClick={() => setMenuOpen(false)}
                                            className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                                        >
                                            <Shield className="h-5 w-5 text-purple-600" />
                                            <span>Ops</span>
                                        </Link>
                                        <Link
                                            href="/institution/dashboard"
                                            onClick={() => setMenuOpen(false)}
                                            className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                                        >
                                            <Shield className="h-5 w-5 text-purple-600" />
                                            <span>Institution</span>
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* Language Switcher */}
                            <div className="border-t border-gray-100 pt-4">
                                <div className="px-3">
                                    <LanguageSwitcher variant="minimal" />
                                </div>
                            </div>

                            {/* Auth Section */}
                            <div className="border-t border-gray-100 pt-4 space-y-2">
                                {user ? (
                                    <>
                                        <Link
                                            href="/account"
                                            onClick={() => setMenuOpen(false)}
                                            className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                                        >
                                            <User className="h-5 w-5 text-gray-600" />
                                            <span>{t('dashboard.title')}</span>
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-3 w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                                        >
                                            <LogOut className="h-5 w-5" />
                                            <span>{t('common.logout')}</span>
                                        </button>
                                    </>
                                ) : status !== 'loading' && (
                                    <>
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => {
                                                router.push('/login');
                                                setMenuOpen(false);
                                            }}
                                        >
                                            {t('common.login')}
                                        </Button>
                                        <Button
                                            className="w-full bg-blue-600 hover:bg-blue-700"
                                            onClick={() => {
                                                router.push('/campaigns/new');
                                                setMenuOpen(false);
                                            }}
                                        >
                                            {t('campaign.createCampaign')}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Spacer for fixed header */}
            <div className="h-14" />
        </>
    );
}
