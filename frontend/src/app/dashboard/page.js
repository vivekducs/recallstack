// frontend/src/app/dashboard/page.js
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';

export default function DashboardRedirect() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        if (user?.role === 'ADMIN') {
          router.replace('/admin');
        } else {
          router.replace('/user-dashboard');
        }
      } else {
        router.replace('/login');
      }
    }
  }, [loading, isAuthenticated, user, router]);

  return (
    <div className="flex flex-col items-center justify-center p-20 min-h-[300px]" style={{ background: 'var(--color-bg)' }}>
      <div className="w-5 h-5 border-2 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin"></div>
      <span className="text-xs font-mono text-[var(--color-text-secondary)] mt-3">Redirecting to dashboard...</span>
    </div>
  );
}
