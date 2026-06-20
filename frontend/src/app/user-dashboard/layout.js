// frontend/src/app/user-dashboard/layout.js
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import useAuth from '@/hooks/useAuth';
import Card from '@/components/common/Card';

function renderIcon(iconName) {
  const classes = "w-4 h-4";
  switch (iconName) {
    case 'overview':
      return (
        <svg className={classes} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    case 'my-notes':
      return (
        <svg className={classes} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case 'create':
      return (
        <svg className={classes} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      );
    case 'bookmarks':
      return (
        <svg className={classes} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      );
    case 'profile':
      return (
        <svg className={classes} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function UserDashboardLayout({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else if (user?.role === 'ADMIN') {
        router.replace('/admin');
      }
    }
  }, [user, isAuthenticated, loading, router]);

  if (loading || !isAuthenticated || user?.role === 'ADMIN') {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin"></div>
          <span className="text-xs font-mono text-[var(--color-text-secondary)] loading-pulse">Verifying access...</span>
        </div>
      </main>
    );
  }

  const menuItems = [
    { name: 'Dashboard Overview', path: '/user-dashboard', iconName: 'overview' },
    { name: 'My Notes', path: '/user-dashboard/my-notes', iconName: 'my-notes' },
    { name: 'Create Note', path: '/user-dashboard/create', iconName: 'create' },
    { name: 'Bookmarks', path: '/user-dashboard/bookmarks', iconName: 'bookmarks' },
    { name: 'Profile Settings', path: '/user-dashboard/profile', iconName: 'profile' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* User Sidebar Navigation */}
        <aside className="w-full md:w-[240px] flex-shrink-0">
          <Card variant="standard" className="p-4">
            <h2 className="text-xs uppercase tracking-wider font-bold text-[var(--color-text-secondary)] mb-4 px-2">
              Workspace Menu
            </h2>
            <nav className="flex flex-col gap-1">
              {menuItems.map(item => {
                // Check if active: exact match for home dashboard, prefix match for others
                const isActive = item.path === '/user-dashboard' 
                  ? pathname === '/user-dashboard'
                  : pathname === item.path || pathname?.startsWith(item.path + '/');
                
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
