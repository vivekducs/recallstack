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
  const baseStyle = 'inline-flex items-center justify-center font-semibold text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-violet-500/50 rounded-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';
  
  const variants = {
    primary: 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-950/20 px-5 py-2.5 border border-violet-500/20',
    secondary: 'bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800 text-zinc-300 hover:text-white px-5 py-2.5',
    text: 'bg-transparent hover:underline text-violet-400 hover:text-violet-300 py-1.5 px-3',
    destructive: 'bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 shadow-lg shadow-red-950/20 border border-red-500/20'
  };

  const selectedVariant = variants[variant] || variants.primary;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyle} ${selectedVariant} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
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
