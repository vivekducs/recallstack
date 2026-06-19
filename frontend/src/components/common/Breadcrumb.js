// frontend/src/components/common/Breadcrumb.js
'use client';

import Link from 'next/link';

export default function Breadcrumb({ items = [], className = '' }) {
  if (items.length === 0) return null;

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`flex items-center flex-wrap gap-2 text-[12px] text-[var(--color-text-secondary)] ${className}`}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <div key={item.name || index} className="flex items-center gap-2">
            {index > 0 && <span className="opacity-40 select-none">/</span>}
            
            {isLast ? (
              <span className="font-bold text-[var(--color-text-primary)]">
                {item.name}
              </span>
            ) : (
              <Link 
                href={item.href || '#'} 
                className="hover:underline hover:text-[var(--color-text-primary)] transition-colors"
              >
                {item.name}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
