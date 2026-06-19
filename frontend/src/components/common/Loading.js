// frontend/src/components/common/Loading.js
'use client';

export default function Loading({ 
  text = 'Loading...', 
  fullScreen = false, 
  size = 'md' 
}) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const selectedSize = sizes[size] || sizes.md;

  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      {/* Spinner */}
      <div 
        className={`${selectedSize} border-zinc-800 border-t-violet-500 rounded-full animate-spin`}
        style={{ borderWidth: size === 'lg' ? '3px' : '2px' }}
      ></div>
      {/* Message text */}
      {text && (
        <span className="text-xs font-mono text-zinc-500 tracking-wider loading-pulse">
          {text}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0f]/80 backdrop-blur-sm pointer-events-none">
        {content}
      </div>
    );
  }

  return content;
}
