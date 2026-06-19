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

  // Close on Escape key press
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
    <div 
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-opacity duration-200"
    >
      {/* Modal Box */}
      <div 
        ref={modalRef}
        className={`w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl flex flex-col p-6 max-h-[90vh] ${className}`}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-850 pb-4 mb-4">
          {title && (
            <h3 className="text-lg font-bold text-white leading-none">
              {title}
            </h3>
          )}
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all hover:bg-zinc-800/80"
            aria-label="Close dialog"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto pr-1 text-sm text-zinc-300 py-2 scrollbar-thin">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-zinc-850 pt-4 mt-4">
            {footer}
          </div>
        )}

      </div>
    </div>
  );
}
