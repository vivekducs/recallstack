// frontend/src/app/user-dashboard/layout.js
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import useAuth from '@/hooks/useAuth';
import Card from '@/components/common/Card';

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
    { name: 'Dashboard Overview', path: '/user-dashboard', icon: '📊' },
    { name: 'My Notes', path: '/user-dashboard/my-notes', icon: '📝' },
    { name: 'Create Note', path: '/user-dashboard/create', icon: '➕' },
    { name: 'Bookmarks', path: '/user-dashboard/bookmarks', icon: '🔖' },
    { name: 'Profile Settings', path: '/user-dashboard/profile', icon: '⚙️' }
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
                    <span>{item.icon}</span>
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
