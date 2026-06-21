// frontend/src/components/common/Card.js
'use client';

export default function Card({
  children,
  onClick,
  variant = 'standard',
  className = '',
  ...props
}) {
  const isClickable = !!onClick;
  
  const baseStyle = 'border rounded-xl transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md border-black/[0.06] dark:border-white/[0.06]';
  
  const variants = {
    standard: 'shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-[0_12px_30px_-6px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_12px_30px_-6px_rgba(0,0,0,0.3)] hover:border-black/[0.12] dark:hover:border-white/[0.12]',
    elevated: 'shadow-[0_8px_30px_-6px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-8px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_20px_40px_-8px_rgba(0,0,0,0.4)] hover:border-black/[0.16] dark:hover:border-white/[0.16]'
  };

  const selectedVariant = variants[variant] || variants.standard;
  const cursorStyle = isClickable ? 'cursor-pointer hover:border-[var(--color-primary)]' : '';

  return (
    <div
      onClick={onClick}
      className={`${baseStyle} ${selectedVariant} ${cursorStyle} ${className}`}
      style={{ padding: 'var(--density-padding, 16px)', ...props.style }}
      {...props}
    >
      {children}
    </div>
  );
}

