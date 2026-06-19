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
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700/80 focus:border-violet-500 rounded-lg px-4 py-2.5 pr-10 text-sm text-white placeholder-zinc-500 outline-none transition-all duration-150 focus:ring-2 focus:ring-violet-500/20"
        {...props}
      />
      <button 
        type="submit" 
        className="absolute right-3.5 text-zinc-500 hover:text-zinc-300 transition-colors"
        aria-label="Search"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </form>
  );
}
