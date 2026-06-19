// frontend/src/components/layout/Header.js
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import Navigation from './Navigation';

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    router.push('/');
    window.location.reload();
  };

  return (
    <header 
      // Header: Fixed/Sticky, Full width. Desktop: 56px (h-14). Mobile: 48px (h-12).
      // Background: White in light mode, Dark in dark mode.
      className={`sticky top-0 z-50 w-full transition-all duration-200 border-b ${
        scrolled 
          ? 'bg-[var(--color-bg)] shadow-md border-[var(--color-border)]' 
          : 'bg-[var(--color-bg)] border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-12 md:h-14 flex items-center justify-between">
        
        {/* Logo & Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 select-none">
            <span className="text-[18px] font-bold tracking-tight text-[var(--color-text-primary)]">
              Recall<span className="text-[var(--color-primary)]">Stack</span>
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <Navigation />
          </div>
        </div>

        {/* Desktop Search & User Profile */}
        <div className="hidden md:flex items-center gap-4">
          {/* Search bar: 36px height, 200px width, right-aligned magnifying glass icon */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[200px] h-[36px] bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:border-[var(--color-text-secondary)] focus:border-[var(--color-primary)] rounded px-3 pr-8 text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)]/60 outline-none transition-all duration-150 focus:ring-2 focus:ring-[var(--color-primary)]/20"
            />
            <button type="submit" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          {/* User Menu */}
          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded bg-[var(--color-bg-secondary)] hover:bg-[var(--color-border)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-primary)] transition-all focus:ring-2 focus:ring-[var(--color-primary)]/50"
              >
                <span>{user?.username || 'User'}</span>
                {user?.role === 'ADMIN' && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--color-primary)]/20 text-[var(--color-primary)] border border-[var(--color-primary)]/30 font-bold">
                    Admin
                  </span>
                )}
                <svg className={`w-3 h-3 text-[var(--color-text-secondary)] transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-xl py-1.5 text-xs z-50">
                  <Link 
                    href="/dashboard" 
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 text-[var(--color-text-primary)] hover:bg-[var(--color-border)]"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/bookmarks" 
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 text-[var(--color-text-primary)] hover:bg-[var(--color-border)]"
                  >
                    Bookmarks
                  </Link>
                  <hr className="border-[var(--color-border)] my-1" />
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-[var(--color-error)] hover:bg-[var(--color-error)]/10 font-semibold"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-xs font-semibold px-3 py-1.5 transition-all">
                Login
              </Link>
              <Link href="/register" className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-4 py-1.5 text-xs font-semibold rounded-[4px] sm:rounded-[6px] transition-all">
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden flex items-center gap-3">
          {!isAuthenticated && (
            <Link href="/login" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-xs font-semibold px-2 py-1">
              Login
            </Link>
          )}
          
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[var(--color-border)] bg-[var(--color-bg)] p-4 flex flex-col gap-4 z-40 relative">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Search library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] focus:border-[var(--color-primary)] rounded px-3 py-2 pr-10 text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)]/60 outline-none"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          <Navigation vertical={true} onItemClick={() => setMobileMenuOpen(false)} />

          <div className="border-t border-[var(--color-border)] pt-4">
            {isAuthenticated ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-3 py-1 mb-2">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-[var(--color-text-primary)]">{user?.name}</span>
                    <span className="text-[10px] text-[var(--color-text-secondary)]">@{user?.username}</span>
                  </div>
                  {user?.role === 'ADMIN' && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--color-primary)]/20 text-[var(--color-primary)] border border-[var(--color-primary)]/30 font-bold">
                      Admin
                    </span>
                  )}
                </div>
                <Link 
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-left px-3 py-2 rounded hover:bg-[var(--color-bg-secondary)] text-xs text-[var(--color-text-primary)]"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/bookmarks"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-left px-3 py-2 rounded hover:bg-[var(--color-bg-secondary)] text-xs text-[var(--color-text-primary)]"
                >
                  Bookmarks
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded text-[var(--color-error)] hover:bg-[var(--color-error)]/10 text-xs font-semibold"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link 
                  href="/login" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2 border border-[var(--color-border)] rounded text-xs font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]"
                >
                  Login
                </Link>
                <Link 
                  href="/register" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-center px-4 py-2 rounded text-xs font-semibold"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
