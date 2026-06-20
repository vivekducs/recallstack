// frontend/src/app/admin/layout.js
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import Card from '@/components/common/Card';

function renderIcon(iconName) {
  const classes = "w-4 h-4";
  switch (iconName) {
    case 'subjects':
      return (
        <svg className={classes} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      );
    case 'users':
      return (
        <svg className={classes} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    case 'content':
      return (
        <svg className={classes} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case 'moderation':
      return (
        <svg className={classes} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      );
    case 'analytics':
      return (
        <svg className={classes} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else if (user?.role !== 'ADMIN') {
        router.replace('/user-dashboard');
      }
    }
  }, [user, isAuthenticated, loading, router]);

  if (loading || !isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin"></div>
          <span className="text-xs font-mono text-[var(--color-text-secondary)] loading-pulse">Verifying admin access...</span>
        </div>
      </main>
    );
  }

  const menuItems = [
    { name: 'Subjects & Topics', path: '/admin', iconName: 'subjects' },
    { name: 'Manage Users', path: '/admin/users', iconName: 'users' },
    { name: 'Manage Content', path: '/admin/content', iconName: 'content' },
    { name: 'Comment Moderation', path: '/admin/moderation', iconName: 'moderation' },
    { name: 'System Analytics', path: '/admin/analytics', iconName: 'analytics' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Admin Navigation Sidebar */}
        <aside className="w-full md:w-[240px] flex-shrink-0">
          <Card variant="standard" className="p-4">
            <h2 className="text-xs uppercase tracking-wider font-bold text-[var(--color-text-secondary)] mb-4 px-2">
              Admin Menu
            </h2>
            <nav className="flex flex-col gap-1">
              {menuItems.map(item => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors ${
                      isActive
                        ? 'bg-[var(--color-primary)] text-white font-semibold'
                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)]'
                    }`}
                  >
                    <span>{renderIcon(item.iconName)}</span>
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </Card>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
