// frontend/src/components/common/SearchBar.js
'use client';

export default function SearchBar({
  value = '',
  onChange,
  onSubmit,
  placeholder = 'Search notes...',
  className = '',
  ...props
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit} className={`relative flex items-center w-full ${className}`}>
      {/* Height: 36px-40px -> 38px. Padding: 8-10px -> 10px. Border radius: 4px */}
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full px-2.5 h-[38px] rounded-[4px] bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)]/70 placeholder:italic outline-none transition-all duration-150 focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)]"
        {...props}
      />
      {/* Icon: Magnifying glass on right */}
      <button 
        type="submit" 
        className="absolute right-3 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        aria-label="Search"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </form>
  );
}
