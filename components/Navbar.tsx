'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, Search, User, Heart, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { getCurrentUser, logout as authLogout } from '@/lib/auth-client';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const result = await getCurrentUser();
        if (result?.success && result?.data) {
          setUser(result.data);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      }
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    try {
      await authLogout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    router.push('/');
  };

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
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/mission-vision" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              Mission & Vision
            </Link>
            <Link href="/who-we-are" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              Who We Are
            </Link>
            <Link href="/how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              How It Works
            </Link>
            <Link href="/apply" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              Apply
            </Link>
            <Link href="/donate" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              Donate
            </Link>
            <Link href="/ops/applications" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              Ops
            </Link>
            <Link href="/institution/dashboard" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              Institution Dashboard
            </Link>
            {user && (
              <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                Dashboard
              </Link>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/dashboard')}
                  className="flex items-center space-x-2"
                >
                  <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
                  <span className="hidden md:inline">{user.name}</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => router.push('/login')}>
                  Sign In
                </Button>
                <Button onClick={() => router.push('/campaigns/new')} className="bg-blue-600 hover:bg-blue-700">
                  Start Campaign
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
