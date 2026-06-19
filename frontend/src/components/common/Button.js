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
  const baseStyle = 'inline-flex items-center justify-center font-semibold text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    // Primary: Background: Blue, Text: White, 600 weight, Padding: 8px vertical / 10-12px horizontal, Border radius: 4-6px
    primary: 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white shadow-sm border border-transparent text-xs rounded-[4px] sm:rounded-[6px]',
    // Secondary: Background: Light gray, Text: Dark gray, 600 weight, Padding: Same, Border: 1px solid gray, Hover: Darker gray background
    secondary: 'bg-[var(--color-bg-secondary)] hover:bg-[var(--color-border)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs rounded-[4px] sm:rounded-[6px]',
    // Text: Background: Transparent, Text: Blue, 600 weight, Hover: Underline
    text: 'bg-transparent hover:underline text-[var(--color-primary)] py-1.5 px-3 rounded',
    // Destructive: Background: Red, Text: White, 600 weight
    destructive: 'bg-[var(--color-error)] hover:brightness-90 text-white text-xs rounded-[4px] sm:rounded-[6px] border border-transparent shadow-sm'
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
