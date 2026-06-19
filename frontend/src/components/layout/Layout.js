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
            {children}
          </main>

          {/* Persistent Footer */}
          {showFooter && <Footer />}
        </div>

        {/* Floating Sidebar Toggle Button for mobile/tablet */}
        {showSidebar && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden fixed bottom-6 left-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-xs font-semibold text-[var(--color-text-primary)] shadow-md hover:brightness-110 active:scale-95 transition-all duration-150 focus-ring"
          >
            <svg className="w-4 h-4 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>Catalog</span>
          </button>
        )}
      </div>
    </div>
  );
}
