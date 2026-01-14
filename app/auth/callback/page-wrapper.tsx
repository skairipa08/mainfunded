'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

/**
 * Client component that uses useSearchParams - must be wrapped in Suspense
 */
function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    const determineRedirect = async () => {
      try {
        const userRes = await fetch('/api/auth/me');
        if (!userRes.ok) {
          router.push('/onboarding');
          return;
        }

        const userResult = await userRes.json();
        if (!userResult.success || !userResult.data) {
          router.push('/onboarding');
          return;
        }

        const user = userResult.data;
        const userRole = user.role;

        // Admin goes to admin panel
        if (userRole === 'admin') {
          router.push('/admin');
          return;
        }

        // Check verification status
        const verificationStatus = user.student_profile?.verificationStatus || 'none';

        // New user or no profile → onboarding
        if (verificationStatus === 'none') {
          router.push('/onboarding');
          return;
        }

        // Verified student → dashboard
        if (verificationStatus === 'verified') {
          router.push('/dashboard');
          return;
        }

        // Pending or rejected → dashboard (they can see status there)
        router.push('/dashboard');
      } catch (error) {
        console.error('Error checking user status:', error);
        router.push('/onboarding');
      } finally {
        setChecking(false);
      }
    };

    determineRedirect();
  }, [session, status, router]);

  // Check if there's an explicit callback URL (e.g., from protected route)
  const explicitCallback = searchParams.get('callbackUrl');
  if (explicitCallback && status === 'authenticated') {
    router.push(explicitCallback);
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}

export default AuthCallbackContent;
