// frontend/src/components/layout/Navigation.js
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useAuth from '@/hooks/useAuth';

export default function Navigation({ vertical = false, onItemClick }) {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  const links = [
    { name: 'Learn', href: '/' },
    { name: 'Search', href: '/search' },
  ];

  if (isAuthenticated) {
    links.push({ name: 'My Notes', href: '/my-learnings' });
  }

  if (user?.role === 'ADMIN') {
    links.push({ name: 'Manage', href: '/admin' });
  }

  return (
    <nav className={vertical ? 'flex flex-col gap-[2px] w-full' : 'flex items-center gap-[24px]'}>
      {links.map((link) => {
        const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
        
        return (
          <Link
            key={link.name}
            href={link.href}
            onClick={onItemClick}
            className={`
              transition-all duration-150 text-[14px]
              ${vertical 
                ? 'w-full block text-left py-3 px-3 rounded font-normal' 
                : 'inline-block px-3 py-1 font-normal'
              }
              ${vertical
                // Vertical (Sidebar): Active: Blue bg, White text. Hover: Light gray bg. Spacing: 2px
                ? isActive
                  ? 'bg-[var(--color-primary)] text-white font-semibold shadow-sm'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]'
                // Horizontal (Header): Active: Blue text + underline. Hover: Gray background. Spacing: 24px
                : isActive
                  ? 'text-[var(--color-primary)] underline underline-offset-4 font-semibold'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] rounded'
              }
            `}
          >
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
}
