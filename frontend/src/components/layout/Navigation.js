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
    <nav className={vertical ? 'flex flex-col gap-1 w-full' : 'flex items-center gap-6'}>
      {links.map((link) => {
        // Highlight active link
        const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
        
        return (
          <Link
            key={link.name}
            href={link.href}
            onClick={onItemClick}
            className={`
              transition-all duration-150 text-sm px-3 py-2 rounded-lg font-medium
              ${vertical ? 'w-full block text-left' : 'inline-block'}
              ${
                isActive
                  ? 'text-white font-semibold bg-zinc-800/80 border border-zinc-700/50'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border border-transparent'
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
