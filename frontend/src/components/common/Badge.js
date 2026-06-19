// frontend/src/components/common/Badge.js
'use client';

export default function Badge({ 
  children, 
  variant = 'default', 
  className = '' 
}) {
  const baseStyle = 'inline-flex items-center gap-1.5 px-2 py-1 rounded text-[12px] font-semibold uppercase tracking-wider border';
  
  const variants = {
    // Status Badges
    PUBLISHED: 'bg-[var(--color-success)] text-white border-transparent',
    DRAFT: 'bg-[var(--color-warning)] text-[#1A1A1A] border-transparent',
    PENDING: 'bg-[var(--color-text-secondary)] text-[#1A1A1A] border-transparent',
    ARCHIVED: 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] border-[var(--color-border)]',
    
    // Difficulty Badges
    EASY: 'bg-[var(--color-success)]/15 text-[var(--color-success)] border-[var(--color-success)]/20',
    MEDIUM: 'bg-[var(--color-warning)]/15 text-[var(--color-warning)] border-[var(--color-warning)]/20',
    HARD: 'bg-[var(--color-error)]/15 text-[var(--color-error)] border-[var(--color-error)]/20',
    
    // Fallback
    default: 'bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] border-[var(--color-border)]'
  };

  const normalVariant = variant ? variant.toUpperCase() : 'DEFAULT';
  const selectedVariant = variants[normalVariant] || variants.default;

  return (
    <span className={`${baseStyle} ${selectedVariant} ${className}`}>
      {children}
    </span>
  );
}
