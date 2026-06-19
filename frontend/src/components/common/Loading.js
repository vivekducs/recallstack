// frontend/src/components/common/Loading.js
'use client';

export default function Loading({ 
  text = 'Loading...', 
  fullScreen = false 
}) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3 select-none pointer-events-none">
      {/* Spinner: 20px diameter, blue */}
      <div className="w-[20px] h-[20px] border-[2px] border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin"></div>
      
      {/* Text below spinner */}
      {text && (
        <span className="text-xs font-mono text-[var(--color-text-secondary)] tracking-wider loading-pulse">
          {text}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-bg)]/90 backdrop-blur-xs pointer-events-none">
        {content}
      </div>
    );
  }

  return content;
}
