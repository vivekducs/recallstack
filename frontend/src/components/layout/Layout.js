// frontend/src/components/layout/Layout.js
'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

export default function Layout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check if current route is login or register
  const isAuthPage = pathname === '/login' || pathname === '/register';
  
  // Hide sidebar and footer on auth pages
  const showSidebar = !isAuthPage;
  const showFooter = !isAuthPage;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-text-primary)] font-sans antialiased">
      {/* Sticky Header */}
      <Header />

      {/* Main body area */}
      <div className="flex flex-1 relative min-h-0">
        
        {/* Subjects navigation sidebar */}
        {showSidebar && (
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
          />
        )}

        {/* Content panel */}
        <div className="flex-grow flex-1 min-w-0 flex flex-col">
          {/* 
            Main content wrapper:
            - Centered: mx-auto
            - Spacing System (4px base): 
              - Top padding: 32px (pt-8)
              - Bottom padding: 64px (pb-16)
              - Left/Right padding: 16px (px-4) mobile, 24px (md:px-6) desktop
              - Max width (desktop): 1200px (max-w-[1200px])
          */}
          <main className={`flex-1 w-full mx-auto pt-8 pb-16 px-4 md:px-6 ${isAuthPage ? 'max-w-md flex items-center justify-center' : 'max-w-[1200px]'}`}>
            {showSidebar && (
              <div className="lg:hidden mb-6">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-xs font-semibold text-[var(--color-text-primary)] hover:brightness-110 active:scale-95 transition-all focus-ring"
                >
                  <svg className="w-4 h-4 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <span>Browse Subjects & Topics</span>
                </button>
              </div>
            )}
            {children}
          </main>

          {/* Persistent Footer */}
          {showFooter && <Footer />}
        </div>
      </div>
    </div>
  );
}
