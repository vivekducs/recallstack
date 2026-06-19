// frontend/src/components/common/Badge.js
'use client';

export default function Badge({ 
  children, 
  variant = 'default', 
  className = '' 
}) {
  const baseStyle = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border';
  
  const variants = {
    // Note status badges
    PUBLISHED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    DRAFT: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    PENDING: 'bg-zinc-800/80 text-zinc-400 border-zinc-800',
    ARCHIVED: 'bg-zinc-900/60 text-zinc-500 border-zinc-900',
    
    // Difficulty badges
    EASY: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    MEDIUM: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
    HARD: 'bg-red-500/15 text-red-400 border-red-500/25',
    
    // Default fallback
    default: 'bg-zinc-900/40 text-zinc-300 border-zinc-800/60'
  };

  const normalVariant = variant ? variant.toUpperCase() : 'DEFAULT';
  const selectedVariant = variants[normalVariant] || variants.default;

  return (
    <span className={`${baseStyle} ${selectedVariant} ${className}`}>
      {children}
    </span>
  );
}
