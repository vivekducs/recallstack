// frontend/src/components/common/ErrorState.js
'use client';

export default function ErrorState({
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  onDismiss,
  className = ''
}) {
  return (
    // Background: Light red (#FEE2E2), border, dark-red text
    <div className={`p-4 rounded-lg bg-[#FEE2E2] border border-red-250 text-red-900 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm ${className}`}>
      
      {/* Icon & Message */}
      <div className="flex items-center gap-3">
        {/* Red error icon */}
        <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center bg-red-600 text-white rounded-full text-xs font-bold select-none pointer-events-none">
          !
        </span>
        <span className="text-sm font-semibold text-red-950">
          {message}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {onRetry && (
          <button 
            onClick={onRetry} 
            className="px-3 py-1.5 rounded bg-red-800 hover:bg-red-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            Retry
          </button>
        )}
        {onDismiss && (
          <button 
            onClick={onDismiss} 
            className="px-3 py-1.5 rounded bg-transparent hover:bg-red-200/50 text-red-900 text-xs font-semibold transition-all"
          >
            Dismiss
          </button>
        )}
      </div>

    </div>
  );
}
