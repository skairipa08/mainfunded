'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    FileText,
    ShoppingCart,
    Leaf,
    Bell,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Building2,
    X,
    Menu,
    ArrowLeft,
    Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarItem {
    name: string;
    href: string;
    icon: React.ElementType;
    badge?: number;
}

const sidebarItems: SidebarItem[] = [
    { name: 'Dashboard', href: '/corporate', icon: LayoutDashboard },
    { name: 'Ogrenciler', href: '/corporate/students', icon: Users },
    { name: 'Raporlar', href: '/corporate/reports', icon: FileText },
    { name: 'Kampanyalar', href: '/corporate/campaigns', icon: ShoppingCart },
    { name: 'ESG Raporu', href: '/corporate/esg', icon: Leaf },
    { name: 'Bildirimler', href: '/corporate/notifications', icon: Bell, badge: 2 },
    { name: 'Ayarlar', href: '/corporate/settings', icon: Settings },
];

interface CorporateSidebarProps {
    mobileOpen?: boolean;
    onMobileClose?: () => void;
}

export default function CorporateSidebar({ mobileOpen = false, onMobileClose }: CorporateSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [collapsed, setCollapsed] = useState(false);

    const handleLinkClick = () => {
        // Close mobile menu when a link is clicked
        if (onMobileClose) {
            onMobileClose();
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onMobileClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed left-0 top-0 z-50 h-screen bg-gray-900 text-white transition-all duration-300 flex flex-col',
                    // Desktop: always visible
                    'hidden md:flex',
                    collapsed ? 'md:w-20' : 'md:w-64',
                )}
            >
                {/* Logo */}
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    <Link href="/corporate" className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <Building2 className="h-6 w-6" />
                        </div>
                        {!collapsed && (
                            <div>
                                <h1 className="font-bold text-lg">FundEd</h1>
                                <p className="text-xs text-gray-400">Kurumsal Panel</p>
                            </div>
                        )}
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/corporate' && pathname?.startsWith(item.href));
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative',
                                    isActive
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                )}
                            >
                                <Icon className="h-5 w-5 flex-shrink-0" />
                                {!collapsed && (
                                    <>
                                        <span className="flex-1">{item.name}</span>
                                        {item.badge && (
                                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                                {item.badge}
                                            </span>
                                        )}
                                    </>
                                )}
                                {collapsed && item.badge && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Collapse Toggle */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-20 bg-gray-800 border border-gray-700 rounded-full p-1 hover:bg-gray-700 transition-colors hidden md:block"
                >
                    {collapsed ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <ChevronLeft className="h-4 w-4" />
                    )}
                </button>

                {/* User Section */}
                <div className="p-4 border-t border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                            AY
                        </div>
                        {!collapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">Ahmet Yilmaz</p>
                                <p className="text-xs text-gray-400 truncate">TechVentures Inc.</p>
                            </div>
                        )}
                    </div>
                    {!collapsed && (
                        <Link
                            href="/"
                            className="flex items-center gap-2 mt-4 text-gray-400 hover:text-white transition-colors text-sm"
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Cikis Yap</span>
                        </Link>
                    )}
                </div>
            </aside>

            {/* Mobile Sidebar */}
            <aside
                className={cn(
                    'fixed left-0 top-0 z-50 h-screen w-72 bg-gray-900 text-white transition-transform duration-300 flex flex-col md:hidden',
                    mobileOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {/* Mobile Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    <Link href="/corporate" className="flex items-center gap-3" onClick={handleLinkClick}>
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <Building2 className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg">FundEd</h1>
                            <p className="text-xs text-gray-400">Kurumsal Panel</p>
                        </div>
                    </Link>
                    <button
                        onClick={onMobileClose}
                        className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Back to Main Site */}
                <div className="p-4 border-b border-gray-800">
                    <Link
                        href="/"
                        onClick={handleLinkClick}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
                    >
                        <Home className="h-5 w-5" />
                        <span>Ana Siteye Don</span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/corporate' && pathname?.startsWith(item.href));
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={handleLinkClick}
                                className={cn(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative',
                                    isActive
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                )}
                            >
                                <Icon className="h-5 w-5 flex-shrink-0" />
                                <span className="flex-1">{item.name}</span>
                                {item.badge && (
                                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Section */}
                <div className="p-4 border-t border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                            AY
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">Ahmet Yilmaz</p>
                            <p className="text-xs text-gray-400 truncate">TechVentures Inc.</p>
                        </div>
                    </div>
                    <Link
                        href="/"
                        onClick={handleLinkClick}
                        className="flex items-center gap-2 mt-4 text-gray-400 hover:text-white transition-colors text-sm"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>Cikis Yap</span>
                    </Link>
                </div>
            </aside>
        </>
    );
}
