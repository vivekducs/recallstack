// frontend/src/app/my-learnings/create/page.js
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';

export default function MyLearningsCreateRedirect() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        router.replace('/user-dashboard/create');
      } else {
        router.replace('/login');
      }
    }
  }, [loading, isAuthenticated, router]);

  return (
    <div className="flex flex-col items-center justify-center p-20 min-h-[300px]" style={{ background: 'var(--color-bg)' }}>
      <div className="w-5 h-5 border-2 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin"></div>
      <span className="text-xs font-mono text-[var(--color-text-secondary)] mt-3">Redirecting...</span>
    </div>
  );
}
