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
      router.replace('/login');
      return;
    }

    const determineRedirect = async () => {
      try {
        // Check for explicit callback URL first (from protected route)
        const explicitCallback = searchParams.get('callbackUrl');
        if (explicitCallback) {
          router.replace(explicitCallback);
          setChecking(false);
          return;
        }

        const userRes = await fetch('/api/auth/me');
        if (!userRes.ok) {
          router.replace('/onboarding');
          setChecking(false);
          return;
        }

        const userResult = await userRes.json();
        if (!userResult.success || !userResult.data) {
          router.replace('/onboarding');
          setChecking(false);
          return;
        }

        const user = userResult.data;
        const userRole = user.role;

        // Admin goes to admin panel
        if (userRole === 'admin') {
          router.replace('/admin');
          setChecking(false);
          return;
        }

        // Check verification status
        const verificationStatus = user.student_profile?.verificationStatus || 'none';

        // New user or no profile → onboarding
        if (verificationStatus === 'none') {
          router.replace('/onboarding');
          setChecking(false);
          return;
        }

        // Verified student → dashboard
        if (verificationStatus === 'verified') {
          router.replace('/dashboard');
          setChecking(false);
          return;
        }

        // Pending or rejected → dashboard (they can see status there)
        router.replace('/dashboard');
        setChecking(false);
      } catch (error) {
        console.error('Error checking user status:', error);
        router.replace('/onboarding');
        setChecking(false);
      }
    };

    determineRedirect();
  }, [session, status, router, searchParams]);

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
