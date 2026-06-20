// frontend/src/app/about/page.js
'use client';

import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto py-12">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-[var(--color-text-primary)] mb-3">
          About Recall<span className="text-[var(--color-primary)]">Stack</span>
        </h1>
        <p className="text-base text-[var(--color-text-secondary)] max-w-xl mx-auto">
          Learn Once. Recall Anytime. A structured knowledge base built for developer retention and growth.
        </p>
      </header>

      <div className="space-y-10 text-sm leading-relaxed text-[var(--color-text-primary)]">

        {/* Our Mission */}
        <section className="glass-card p-6">
          <h2 className="text-xl font-bold mb-3 text-[var(--color-text-primary)]">Our Mission</h2>
          <p className="mb-4">
            In modern software development, information overload is a constant challenge. Developers read blogs, docs, and guides, only to forget the core details a week later.
          </p>
          <p>
            <strong>RecallStack</strong> solves this by enabling you to build a structured, hierarchy-based personal knowledge vault (Subject → Topic → Note → Section) designed specifically for quick review and long-term recall.
          </p>
        </section>

        {/* Key Features */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6 border-l-4 border-[var(--color-primary)]">
            <h3 className="font-bold text-base mb-2">Structured Learning</h3>
            <p className="text-[var(--color-text-secondary)] text-xs">
              Organize your technical guides in a logical hierarchy of subjects and topics, rather than flat files or tags.
            </p>
          </div>

          <div className="glass-card p-6 border-l-4 border-[var(--color-accent)]">
            <h3 className="font-bold text-base mb-2">Granular Sections</h3>
            <p className="text-[var(--color-text-secondary)] text-xs">
              Break note content down into modular blocks (text, examples, code blocks, diagrams) for quick scanning.
            </p>
          </div>

          <div className="glass-card p-6 border-l-4 border-[var(--color-warning)]">
            <h3 className="font-bold text-base mb-2">Revision Tracker</h3>
            <p className="text-[var(--color-text-secondary)] text-xs">
              Keep track of revision histories and follow space-repetition practices to commit patterns to memory.
            </p>
          </div>

          <div className="glass-card p-6 border-l-4 border-[var(--color-success)]">
            <h3 className="font-bold text-base mb-2">Developer Sandbox</h3>
            <p className="text-[var(--color-text-secondary)] text-xs">
              Share your guides publicly or save bookmarks from other developers to collaborate on study tracks.
            </p>
          </div>
        </section>

        {/* Built For Developers */}
        <section className="glass-card p-6 bg-gradient-to-br from-[var(--color-primary)]/5 to-transparent">
          <h2 className="text-xl font-bold mb-3 text-[var(--color-text-primary)]">Built With the Modern Stack</h2>
          <p className="mb-4 text-[var(--color-text-secondary)]">
            RecallStack is engineered for performance, clean typography, accessibility, and high contrast.
          </p>
          <ul className="grid grid-cols-2 gap-2 text-xs font-mono text-[var(--color-text-secondary)] pl-4 list-disc">
            <li>Next.js App Router & Tailwind</li>
            <li>Node.js & Express REST API</li>
            <li>Prisma ORM & PostgreSQL</li>
            <li>Native Dark / Light Modes</li>
          </ul>
        </section>

        {/* CTA */}
        <div className="text-center pt-6">
          <Link href="/login" className="btn-primary inline-flex items-center gap-2">
            Get Started Free
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

      </div>
    </div>
  );
}
