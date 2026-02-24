'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Megaphone,
  MessageCircle,
  FileEdit,
  ChevronLeft,
  ChevronRight,
  LogOut,
  GraduationCap,
  X,
  Home,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

const sidebarItems: SidebarItem[] = [
  { name: 'Panel', href: '/student/panel', icon: LayoutDashboard },
  { name: 'Aktif Kampanyalarım', href: '/student/panel/campaigns', icon: Megaphone },
  { name: 'Güncellemelerim', href: '/student/panel/updates', icon: FileEdit },
  { name: 'Mesajlar', href: '/student/panel/messages', icon: MessageCircle },
  { name: 'Ödeme Yöntemleri', href: '/student/dashboard/payout', icon: Wallet },
];

interface StudentSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function StudentSidebar({ mobileOpen = false, onMobileClose }: StudentSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const { data: session } = useSession();

  const handleLinkClick = () => {
    if (onMobileClose) onMobileClose();
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  const user = session?.user as any;
  const initials = user?.name
    ? user.name.split(' ').map((w: string) => w.charAt(0)).join('').slice(0, 2).toUpperCase()
    : 'ÖP';
  const displayName = user?.name || 'Öğrenci';

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onMobileClose} />
      )}

      {/* Sidebar - Desktop */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen bg-gray-900 text-white transition-all duration-300 flex flex-col',
          'hidden md:flex',
          collapsed ? 'md:w-20' : 'md:w-64',
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <Link href="/student/panel" className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <GraduationCap className="h-6 w-6" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="font-bold text-lg">FundEd</h1>
                <p className="text-xs text-gray-400">Öğrenci Paneli</p>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/student/panel' && pathname?.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white',
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span className="text-sm font-medium">{item.name}</span>}
                {item.badge && !collapsed && (
                  <span className="absolute right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex items-center justify-center p-2 border-t border-gray-800 hover:bg-gray-800 transition-colors"
          aria-label={collapsed ? 'Genişlet' : 'Daralt'}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>

        {/* User Info */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {initials}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{displayName}</p>
                <p className="text-xs text-gray-400 truncate">Öğrenci</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={cn(
              'flex items-center gap-2 mt-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors w-full',
              collapsed && 'justify-center',
            )}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="text-sm">Çıkış Yap</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen w-72 bg-gray-900 text-white transition-transform duration-300 flex flex-col md:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <Link href="/student/panel" className="flex items-center gap-3" onClick={handleLinkClick}>
            <div className="bg-blue-600 p-2 rounded-lg">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg">FundEd</h1>
              <p className="text-xs text-gray-400">Öğrenci Paneli</p>
            </div>
          </Link>
          <button onClick={onMobileClose} className="p-2 rounded-lg hover:bg-gray-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile Nav */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/student/panel' && pathname?.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleLinkClick}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white',
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile User Info */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{displayName}</p>
              <p className="text-xs text-gray-400 truncate">Öğrenci</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors w-full"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm">Çıkış Yap</span>
          </button>
        </div>
      </aside>
    </>
  );
}
