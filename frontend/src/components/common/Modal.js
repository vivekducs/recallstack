// frontend/src/components/common/Modal.js
'use client';

import { useEffect, useRef } from 'react';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  className = ''
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  return (
    // Backdrop: semi-transparent black (rgba(0, 0, 0, 0.5))
    <div 
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 transition-opacity duration-150"
    >
      {/* Modal Box: bg white/dark, border radius 8px, padding 24px, max width 500px, centered */}
      <div 
        ref={modalRef}
        className={`w-full max-w-[500px] bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg shadow-xl flex flex-col p-6 max-h-[90vh] ${className}`}
      >
        
        {/* Header: title 20px, 600 weight, margin bottom 16px, Close button (X icon) on right */}
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h3 className="text-[20px] font-semibold text-[var(--color-text-primary)] leading-none">
              {title}
            </h3>
          )}
          <button 
            onClick={onClose}
            className="p-1 rounded text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            aria-label="Close dialog"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body: scrollable if content > 400px, padding 16px vertical */}
        <div className="flex-grow overflow-y-auto py-4 text-sm text-[var(--color-text-secondary)] max-h-[400px] scrollbar-thin">
          {children}
        </div>

        {/* Footer: border top, padding 16px top, buttons right-aligned */}
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-[var(--color-border)] pt-4 mt-4">
            {footer}
          </div>
        )}

      </div>
    </div>
  );
}
