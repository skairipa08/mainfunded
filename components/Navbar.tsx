'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  GraduationCap,
  LogOut,
  User,
  ChevronDown,
  Trophy,
  Share2,
  Heart,
  Gift,
  Users,
  Award,
  MessageSquare,
  Shield,
  Sparkles,
  Menu,
  X,
  Globe,
} from 'lucide-react';
import { Button } from './ui/button';
import { useTranslation } from '@/lib/i18n';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface DropdownItem {
  label: string;
  href: string;
  icon: React.ElementType;
  description?: string;
}

interface NavDropdownProps {
  label: string;
  icon: React.ElementType;
  items: DropdownItem[];
}

function NavDropdown({ label, icon: Icon, items }: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors font-medium px-2 py-1 rounded-lg hover:bg-gray-50"
      >
        <Icon className="h-4 w-4" />
        <span>{label}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="bg-blue-50 p-2 rounded-lg">
                <item.icon className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{item.label}</p>
                {item.description && (
                  <p className="text-xs text-gray-500">{item.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const router = useRouter();
  const { t } = useTranslation();
  const { data: session, status } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const user = session?.user;
  const isAdmin = (user as any)?.role === 'admin';

  // Close dropdown and mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  // Dropdown menu configurations
  const socialFeatures: DropdownItem[] = [
    {
      label: t('nav.menu.leaderboard'),
      href: '/leaderboard',
      icon: Trophy,
      description: t('nav.menu.leaderboardDesc'),
    },
    {
      label: t('nav.menu.badges'),
      href: '/badges',
      icon: Award,
      description: t('nav.menu.badgesDesc'),
    },
    {
      label: t('nav.menu.studentUpdates'),
      href: '/updates',
      icon: Share2,
      description: t('nav.menu.studentUpdatesDesc'),
    },
    {
      label: t('nav.menu.alumni'),
      href: '/alumni',
      icon: Users,
      description: t('nav.menu.alumniDesc'),
    },
  ];

  const donorFeatures: DropdownItem[] = [
    {
      label: t('nav.menu.donateNow'),
      href: '/donate',
      icon: Heart,
      description: t('nav.menu.donateDesc'),
    },
    {
      label: 'Eğitimde Eşitlik Bağışları',
      href: '/education-equality',
      icon: Globe,
      description: 'Dünyada eğitim eşitliği için kampanyamız',
    },
    {
      label: t('nav.menu.matchingGift'),
      href: '/corporate',
      icon: Gift,
      description: t('nav.menu.matchingGiftDesc'),
    },
    {
      label: t('nav.menu.becomeMentor'),
      href: '/mentors',
      icon: Users,
      description: t('nav.menu.becomeMentorDesc'),
    },
  ];

  const transparencyFeatures: DropdownItem[] = [
    {
      label: t('nav.menu.howItWorks'),
      href: '/how-it-works',
      icon: Sparkles,
      description: t('nav.menu.howItWorksDesc'),
    },
    {
      label: t('nav.menu.progressReports'),
      href: '/reports',
      icon: Shield,
      description: t('nav.menu.progressReportsDesc'),
    },
    {
      label: t('nav.menu.donationGuarantee'),
      href: '/guarantee',
      icon: Shield,
      description: t('nav.menu.donationGuaranteeDesc'),
    },
    {
      label: t('nav.menu.transparency'),
      href: '/transparency',
      icon: Shield,
      description: t('nav.menu.transparencyDesc'),
    },
    {
      label: t('nav.menu.stories'),
      href: '/stories',
      icon: MessageSquare,
      description: t('nav.menu.storiesDesc'),
    },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              FundEd
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-2">
            <Link href="/mission-vision" className="text-gray-600 hover:text-blue-600 transition-colors font-medium px-2 py-1">
              Mission & Vision
            </Link>
            <Link href="/who-we-are" className="text-gray-600 hover:text-blue-600 transition-colors font-medium px-2 py-1">
              {t('nav.aboutUs')}
            </Link>

            {/* Dropdown Menus */}
            <NavDropdown label={t('nav.menu.social')} icon={Trophy} items={socialFeatures} />
            <NavDropdown label={t('nav.menu.donation')} icon={Heart} items={donorFeatures} />
            <NavDropdown label={t('nav.menu.about')} icon={Shield} items={transparencyFeatures} />

            <Link href="/apply" className="text-gray-600 hover:text-blue-600 transition-colors font-medium px-2 py-1">
              {t('nav.apply')}
            </Link>

            {/* Admin-only links */}
            {isAdmin && (
              <>
                <Link href="/ops/applications" className="text-gray-600 hover:text-blue-600 transition-colors font-medium px-2 py-1">
                  Ops
                </Link>
                <Link href="/institution/dashboard" className="text-gray-600 hover:text-blue-600 transition-colors font-medium px-2 py-1">
                  Institution
                </Link>
              </>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Language Switcher - hidden on mobile */}
            <div className="hidden sm:block">
              <LanguageSwitcher variant="minimal" />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-600" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600" />
              )}
            </button>

            {status === 'loading' ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            ) : user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {user.image ? (
                    <div className="relative w-8 h-8">
                      <Image
                        src={user.image}
                        alt={user.name || 'User'}
                        fill
                        className="rounded-full border-2 border-blue-500 object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                      {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                  )}
                  <span className="hidden md:inline font-medium text-gray-700">
                    {user.name || user.email?.split('@')[0]}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      {isAdmin && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                          Admin
                        </span>
                      )}
                    </div>
                    <Link
                      href="/account"
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      {t('dashboard.title')}
                    </Link>
                    <Link
                      href="/my-donations"
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      {t('dashboard.myDonations')}
                    </Link>
                    <Link
                      href="/leaderboard"
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Trophy className="h-4 w-4 mr-2" />
                      {t('nav.menu.leaderboard')}
                    </Link>
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {t('common.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button variant="ghost" onClick={() => router.push('/login')}>
                  {t('common.login')}
                </Button>
                <Button onClick={() => router.push('/campaigns/new')} className="bg-blue-600 hover:bg-blue-700">
                  {t('campaign.createCampaign')}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="md:hidden border-t border-gray-200 bg-white shadow-lg"
        >
          <div className="px-4 py-4 space-y-4">
            {/* Main Navigation Links */}
            <div className="space-y-2">
              <Link
                href="/mission-vision"
                className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Mission & Vision
              </Link>
              <Link
                href="/who-we-are"
                className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.aboutUs')}
              </Link>
              <Link
                href="/apply"
                className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.apply')}
              </Link>
            </div>

            {/* Sosyal Section */}
            <div className="border-t border-gray-100 pt-4">
              <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sosyal</p>
              <div className="space-y-1">
                {socialFeatures.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
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
              <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Bağış</p>
              <div className="space-y-1">
                {donorFeatures.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
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
              <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Hakkında</p>
              <div className="space-y-1">
                {transparencyFeatures.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <item.icon className="h-5 w-5 text-blue-600" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* User Links (logged in) */}
            {user && (
              <div className="border-t border-gray-100 pt-4">
                <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Hesabim</p>
                <div className="space-y-1">
                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <User className="h-5 w-5 text-blue-600" />
                    <span>{t('dashboard.title')}</span>
                  </Link>
                  <Link
                    href="/my-donations"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <Heart className="h-5 w-5 text-red-500" />
                    <span>{t('dashboard.myDonations')}</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Admin Links */}
            {isAdmin && (
              <div className="border-t border-gray-100 pt-4">
                <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Admin</p>
                <div className="space-y-1">
                  <Link
                    href="/ops/applications"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Ops
                  </Link>
                  <Link
                    href="/institution/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Institution
                  </Link>
                </div>
              </div>
            )}

            {/* Language Switcher for Mobile */}
            <div className="border-t border-gray-100 pt-4">
              <div className="px-3">
                <LanguageSwitcher variant="minimal" />
              </div>
            </div>

            {/* Auth Buttons for Mobile */}
            {!user && status !== 'loading' && (
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    router.push('/login');
                    setMobileMenuOpen(false);
                  }}
                >
                  {t('common.login')}
                </Button>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    router.push('/campaigns/new');
                    setMobileMenuOpen(false);
                  }}
                >
                  {t('campaign.createCampaign')}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
