// frontend/src/components/common/EmptyState.js
'use client';

import Button from './Button';

export default function EmptyState({
  title = 'No items yet',
  description = 'Create one to get started',
  ctaLabel,
  onCtaClick,
  className = ''
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center border border-dashed border-[var(--color-border)] rounded-lg bg-[var(--color-bg-secondary)] ${className}`}>
      {/* Icon: Light gray box symbol */}
      <div className="w-12 h-12 rounded-full bg-[var(--color-border)] flex items-center justify-center text-[var(--color-text-secondary)] mb-4 select-none pointer-events-none">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>

      {/* Heading & description */}
      <h3 className="text-[18px] font-semibold text-[var(--color-text-primary)] mb-1">
        {title}
      </h3>
      
      <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] max-w-sm mb-6">
        {description}
      </p>

      {/* CTA Button */}
      {ctaLabel && onCtaClick && (
        <Button onClick={onCtaClick} variant="primary">
          {ctaLabel}
        </Button>
      )}
    </div>
  );
}
