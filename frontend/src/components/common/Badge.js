// frontend/src/components/common/Badge.js
'use client';

export default function Badge({ 
  children, 
  variant = 'default', 
  className = '' 
}) {
  const baseStyle = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border';
  
  const variants = {
    // Status Badges
    PUBLISHED: 'bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/20',
    DRAFT: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/20',
    PENDING: 'bg-[var(--color-text-secondary)]/10 text-[var(--color-text-primary)] border-black/[0.08] dark:border-white/[0.08]',
    ARCHIVED: 'bg-[var(--color-bg-secondary)]/30 text-[var(--color-text-dim)] border-black/[0.05] dark:border-white/[0.05]',
    
    // Difficulty Badges
    EASY: 'bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/20',
    MEDIUM: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/20',
    HARD: 'bg-[var(--color-error)]/10 text-[var(--color-error)] border-[var(--color-error)]/20',
    
    // Fallback
    default: 'bg-[var(--color-bg-secondary)]/50 text-[var(--color-text-primary)] border-black/[0.08] dark:border-white/[0.08]'
  };

  const normalVariant = variant ? variant.toUpperCase() : 'DEFAULT';
  const selectedVariant = variants[normalVariant] || variants.default;

  return (
    <span className={`${baseStyle} ${selectedVariant} ${className}`}>
      {children}
    </span>
  );
}
