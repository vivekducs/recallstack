// frontend/src/components/common/Button.js
'use client';

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  loading = false,
  className = '',
  ...props
}) {
  const baseStyle = 'inline-flex items-center justify-center font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none';
  
  const variants = {
    // Primary: Background: Blue, Text: White, 600 weight, Padding: 8px vertical / 10-12px horizontal, Border radius: 4-6px
    primary: 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white shadow-[0_4px_14px_0_rgba(59,130,246,0.2)] dark:shadow-[0_4px_14px_0_rgba(96,165,250,0.15)] hover:shadow-[0_6px_20px_0_rgba(59,130,246,0.3)] dark:hover:shadow-[0_6px_20px_0_rgba(96,165,250,0.25)] border border-transparent text-xs rounded-lg active:scale-[0.98] hover:-translate-y-[1px] active:translate-y-0 transition-all duration-200',
    // Secondary: Background: Light gray, Text: Dark gray, 600 weight, Padding: Same, Border: 1px solid gray, Hover: Darker gray background
    secondary: 'bg-[var(--color-bg-secondary)] hover:bg-[var(--color-border)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs rounded-lg active:scale-[0.98] hover:-translate-y-[1px] active:translate-y-0 transition-all duration-200',
    // Text: Background: Transparent, Text: Blue, 600 weight, Hover: Underline
    text: 'bg-transparent hover:text-[var(--color-primary-hover)] text-[var(--color-primary)] py-1.5 px-3 rounded hover:bg-[var(--color-bg-secondary)] transition-all duration-200',
    // Destructive: Background: Red, Text: White, 600 weight
    destructive: 'bg-[var(--color-error)] hover:brightness-95 text-white text-xs rounded-lg active:scale-[0.98] hover:-translate-y-[1px] active:translate-y-0 transition-all duration-200 border border-transparent shadow-[0_4px_14px_0_rgba(239,68,68,0.2)] hover:shadow-[0_6px_20px_0_rgba(239,68,68,0.3)]'
  };

  const selectedVariant = variants[variant] || variants.primary;
  
  const needsDensity = variant !== 'text';
  const buttonStyle = needsDensity ? {
    height: 'var(--density-btn-height, 40px)',
    paddingLeft: 'var(--density-padding, 16px)',
    paddingRight: 'var(--density-padding, 16px)',
    paddingTop: 0,
    paddingBottom: 0,
    ...props.style
  } : props.style;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyle} ${selectedVariant} ${className}`}
      style={buttonStyle}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
