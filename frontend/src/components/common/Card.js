// frontend/src/components/common/Card.js
'use client';

import { useRef } from 'react';

export default function Card({
  children,
  onClick,
  variant = 'standard',
  className = '',
  ...props
}) {
  const isClickable = !!onClick;
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    cardRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };
  
  // Use will-change-transform for best performance, deeper rounding for modern look, and refined backdrop blur.
  // We add 'group overflow-hidden' to clip the shine effect and trigger child hover states.
  const baseStyle = 'group relative overflow-hidden border rounded-2xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border-black/[0.05] dark:border-white/[0.05] will-change-transform';
  
  // Enhanced hover animations with gentle scale, lift, and gorgeous modern shadow diffusion
  const variants = {
    standard: 'shadow-sm hover:-translate-y-1.5 hover:scale-[1.015] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_20px_40px_-12px_rgba(255,255,255,0.04)] hover:border-black/[0.1] dark:hover:border-white/[0.1]',
    elevated: 'shadow-md hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_30px_60px_-15px_rgba(255,255,255,0.06)] hover:border-black/[0.15] dark:hover:border-white/[0.15]'
  };

  const selectedVariant = variants[variant] || variants.standard;
  const cursorStyle = isClickable ? 'cursor-pointer hover:border-[var(--color-primary)]/50' : '';

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      className={`${baseStyle} ${selectedVariant} ${cursorStyle} ${className}`}
      style={{ padding: 'var(--density-padding, 16px)', ...props.style }}
      {...props}
    >
      {/* Advanced Dynamic Mouse Spotlight Effect */}
      <div
        className="pointer-events-none absolute -inset-px z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(96, 165, 250, 0.1), transparent 40%)`,
        }}
      />

      {/* Eye-catching glowing gradient that appears on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/0 via-[var(--color-primary)]/5 to-[var(--color-primary)]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      {/* Ultra-premium shine sweep effect */}
      {isClickable && (
        <div className="absolute top-0 -left-[100%] h-full w-1/2 z-0 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent group-hover:animate-shine pointer-events-none" />
      )}
      
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
}

