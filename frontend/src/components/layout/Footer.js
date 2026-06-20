// frontend/src/components/layout/Footer.js
'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    // Background: Light #F5F5F5 / Dark #1F1F1F
    // Margin top: 64px (mt-16)
    // Padding: 32px top/bottom (py-8), 24px left/right (px-6)
    // Separator line: border-t border-[var(--color-border)]
    <footer className="w-full bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)] text-[var(--color-text-secondary)] py-8 px-6 mt-16 flex-shrink-0">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* Footer grid: 3 columns Company | Resources | Social */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Company */}
          <div className="flex flex-col gap-3">
            <h3 className="text-[var(--color-text-primary)] font-bold text-xs uppercase tracking-wider">Company</h3>
            <ul className="flex flex-col gap-2 text-xs">
              <li>
                <Link href="/about" className="hover:text-[var(--color-text-primary)] hover:underline transition-colors">About Us</Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[var(--color-text-primary)] hover:underline transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[var(--color-text-primary)] hover:underline transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[var(--color-text-primary)] hover:underline transition-colors">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="flex flex-col gap-3">
            <h3 className="text-[var(--color-text-primary)] font-bold text-xs uppercase tracking-wider">Resources</h3>
            <ul className="flex flex-col gap-2 text-xs">
              <li>
                <Link href="/docs" className="hover:text-[var(--color-text-primary)] hover:underline transition-colors">API Reference</Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[var(--color-text-primary)] hover:underline transition-colors">FAQ</Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-[var(--color-text-primary)] hover:underline transition-colors">Blog</Link>
              </li>
              <li>
                <Link href="/status" className="hover:text-[var(--color-text-primary)] hover:underline transition-colors">System Status</Link>
              </li>
            </ul>
          </div>

          {/* Follow */}
          <div className="flex flex-col gap-3">
            <h3 className="text-[var(--color-text-primary)] font-bold text-xs uppercase tracking-wider">Follow</h3>
            <ul className="flex flex-col gap-2 text-xs">
              <li>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-text-primary)] hover:underline transition-colors">GitHub</a>
              </li>
              <li>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-text-primary)] hover:underline transition-colors">Twitter / X</a>
              </li>
              <li>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-text-primary)] hover:underline transition-colors">LinkedIn</a>
              </li>
              <li>
                <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-text-primary)] hover:underline transition-colors">Discord</a>
              </li>
            </ul>
          </div>

        </div>

        {/* Separator line & legal copyright */}
        <div className="border-t border-[var(--color-border)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex flex-col items-center sm:items-start gap-0.5">
            <span className="font-bold text-[var(--color-text-primary)]">
              Recall<span className="text-[var(--color-primary)]">Stack</span>
            </span>
            <p className="text-[10px] text-[var(--color-text-secondary)]/80">Learn once. Recall anytime.</p>
          </div>
          <p className="text-[11px] text-[var(--color-text-secondary)] text-center sm:text-right">
            &copy; {currentYear} RecallStack. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}
