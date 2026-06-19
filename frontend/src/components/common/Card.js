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
  
  const baseStyle = 'border rounded-lg transition-all duration-150 bg-[var(--color-bg-secondary)] border-[var(--color-border)]';
  
  const variants = {
    standard: 'hover:shadow-sm',
    elevated: 'shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.15)]'
  };

  const selectedVariant = variants[variant] || variants.standard;
  const cursorStyle = isClickable ? 'cursor-pointer hover:border-[var(--color-text-secondary)]' : '';

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
