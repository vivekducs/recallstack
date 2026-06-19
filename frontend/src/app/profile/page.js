// frontend/src/app/profile/page.js
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';

export default function ProfileRedirect() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated && user?.username) {
        router.replace(`/profile/${user.username}`);
      } else {
        router.replace('/login');
      }
    }
  }, [loading, isAuthenticated, user, router]);

  return (
    <div className="flex flex-col items-center justify-center p-20 min-h-[300px]">
      <div className="w-[20px] h-[20px] border-2 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin"></div>
      <span className="text-xs font-mono text-[var(--color-text-secondary)] mt-3">Redirecting...</span>
    </div>
  );
}
