// frontend/src/app/admin/layout.js
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Card from '@/components/common/Card';

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Subjects & Topics', path: '/admin', icon: '📁' },
    { name: 'Manage Users', path: '/admin/users', icon: '👤' },
    { name: 'Manage Content', path: '/admin/content', icon: '📝' },
    { name: 'Comment Moderation', path: '/admin/moderation', icon: '💬' },
    { name: 'System Analytics', path: '/admin/analytics', icon: '📊' }
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
