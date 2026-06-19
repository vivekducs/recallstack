// frontend/src/app/my-learnings/[id]/edit/page.js
'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import useAuth from '@/hooks/useAuth';

export default function MyLearningsEditRedirect() {
  const router = useRouter();
  const { id } = useParams();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        router.replace(`/user-dashboard/${id}/edit`);
      } else {
        router.replace('/login');
      }
    }
  }, [loading, isAuthenticated, id, router]);

  return (
    <div className="flex flex-col items-center justify-center p-20 min-h-[300px]" style={{ background: 'var(--color-bg)' }}>
      <div className="w-5 h-5 border-2 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin"></div>
      <span className="text-xs font-mono text-[var(--color-text-secondary)] mt-3">Redirecting to editor...</span>
    </div>
  );
}
