// frontend/src/components/layout/Footer.js
'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#0a0a0f] border-t border-zinc-800/50 text-zinc-500 py-12 px-4 sm:px-6 lg:px-8 mt-auto flex-shrink-0">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        
        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Company Column */}
          <div className="flex flex-col gap-4">
            <h3 className="text-zinc-300 font-bold text-xs uppercase tracking-wider">Company</h3>
            <ul className="flex flex-col gap-2.5 text-xs">
              <li>
                <Link href="/" className="hover:text-zinc-300 transition-colors">About Us</Link>
              </li>
              <li>
                <Link href="/" className="hover:text-zinc-300 transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/" className="hover:text-zinc-300 transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link href="/" className="hover:text-zinc-300 transition-colors">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div className="flex flex-col gap-4">
            <h3 className="text-zinc-300 font-bold text-xs uppercase tracking-wider">Resources</h3>
            <ul className="flex flex-col gap-2.5 text-xs">
              <li>
                <Link href="/" className="hover:text-zinc-300 transition-colors">API Reference</Link>
              </li>
              <li>
                <Link href="/" className="hover:text-zinc-300 transition-colors">FAQ</Link>
              </li>
              <li>
                <Link href="/" className="hover:text-zinc-300 transition-colors">Blog</Link>
              </li>
              <li>
                <Link href="/" className="hover:text-zinc-300 transition-colors">System Status</Link>
              </li>
            </ul>
          </div>

          {/* Follow Column */}
          <div className="flex flex-col gap-4">
            <h3 className="text-zinc-300 font-bold text-xs uppercase tracking-wider">Follow</h3>
            <ul className="flex flex-col gap-2.5 text-xs">
              <li>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors">GitHub</a>
              </li>
              <li>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors">Twitter / X</a>
              </li>
              <li>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors">LinkedIn</a>
              </li>
              <li>
                <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors">Discord</a>
              </li>
            </ul>
          </div>

        </div>

        {/* Divider & Copyright */}
        <div className="border-t border-zinc-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center sm:items-start gap-1">
            <span className="text-sm font-black tracking-tight text-white">
              <span className="gradient-text">Recall</span>Stack
            </span>
            <p className="text-[10px] text-zinc-550">Learn once. Recall anytime.</p>
          </div>
          <p className="text-[11px] text-zinc-600 text-center sm:text-right">
            &copy; {currentYear} RecallStack. All rights reserved. Built for developers.
          </p>
        </div>

      </div>
    </footer>
  );
}
