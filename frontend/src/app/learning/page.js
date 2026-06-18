'use client';

import Link from 'next/link';

export default function LearningPage() {
  // This page redirects to home since subjects are displayed there
  return (
    <main className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <nav className="flex items-center gap-2 text-sm mb-8" style={{ color: 'var(--color-text-dim)' }}>
          <Link href="/" className="hover:underline" style={{ color: 'var(--color-primary)' }}>Home</Link>
          <span>/</span>
          <span style={{ color: 'var(--color-text-muted)' }}>Learning</span>
        </nav>

        <h1 className="text-4xl font-bold mb-4" style={{ color: 'white' }}>Browse Subjects</h1>
        <p className="mb-8" style={{ color: 'var(--color-text-muted)' }}>
          Select a subject to start exploring topics and notes.
        </p>

        <Link href="/" className="btn-primary inline-block">
          View All Subjects →
        </Link>
      </div>
    </main>
  );
}
