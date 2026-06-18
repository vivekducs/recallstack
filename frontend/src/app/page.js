// frontend/src/app/page.js
import Link from 'next/link';
import { getHomepageTitle } from '@/lib/seo';
import JsonLd from '@/components/common/JsonLd';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://recallstack.com';

export const metadata = {
  title: getHomepageTitle(),
  description: 'A personal knowledge management platform for interview prep, DSA, and system design. Browse subjects, topics, and structured notes.',
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title: getHomepageTitle(),
    description: 'A personal knowledge management platform for interview prep, DSA, and system design.',
    url: BASE_URL,
    siteName: 'RecallStack',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: getHomepageTitle(),
    description: 'A personal knowledge management platform for interview prep, DSA, and system design.',
  },
};

export default async function HomePage() {
  let subjects = [];
  try {
    const res = await fetch(`${API_URL}/subjects`, { next: { revalidate: 60 } });
    if (res.ok) {
      subjects = await res.json();
    }
  } catch (err) {
    console.error('Failed to fetch subjects on server:', err);
  }

  const jsonLdSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'RecallStack',
    url: BASE_URL,
    description: 'A personal knowledge management platform for interview prep, DSA, and system design.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <JsonLd schema={jsonLdSchema} />
      <main className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
        {/* Ambient background glow */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-[0.07]" style={{ background: 'radial-gradient(circle, #6c63f1, transparent 70%)' }}></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full opacity-[0.05]" style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)' }}></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-16">
          {/* Hero Section */}
          <header className="text-center mb-16 fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: 'rgba(108, 99, 241, 0.1)', border: '1px solid rgba(108, 99, 241, 0.2)' }}>
              <span className="w-2 h-2 rounded-full" style={{ background: 'var(--color-accent)' }}></span>
              <span className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>Knowledge Management Platform</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tight">
              <span className="gradient-text">Recall</span>
              <span style={{ color: 'white' }}>Stack</span>
            </h1>

            <p className="text-xl md:text-2xl font-light max-w-2xl mx-auto mb-8" style={{ color: 'var(--color-text-muted)' }}>
              Learn Once. Recall Anytime.
            </p>

            <p className="max-w-xl mx-auto" style={{ color: 'var(--color-text-dim)' }}>
              Organize your knowledge with structured subjects, topics, notes, and sections.
              Built for developers who want to remember what they learn.
            </p>

            <div className="mt-8 flex justify-center gap-4">
              <Link href="/search" className="btn-primary">
                Search Notes
              </Link>
            </div>
          </header>

          {/* Subjects Grid */}
          {subjects.length === 0 ? (
            <div className="text-center py-20 fade-in">
              <div className="text-xl mb-4 font-mono text-zinc-500 tracking-wider">Empty Catalogue</div>
              <p className="text-lg" style={{ color: 'var(--color-text-muted)' }}>No subjects available yet.</p>
              <p className="text-sm mt-2" style={{ color: 'var(--color-text-dim)' }}>
                Contact an admin to add subjects and topics.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject, index) => (
                <Link key={subject.id} href={`/learning/${subject.slug}`}>
                  <div
                     className={`glass-card p-6 cursor-pointer fade-in fade-in-delay-${Math.min(index + 1, 4)}`}
                     style={{ '--hover-color': subject.color || '#6c63f1' }}
                  >
                    {/* Icon + Color accent */}
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center font-mono text-sm font-semibold text-zinc-400"
                        style={{ background: `${subject.color || '#6c63f1'}20`, border: `1px solid ${subject.color || '#6c63f1'}30` }}
                      >
                        {subject.icon || 'Book'}
                      </div>
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: subject.color || 'var(--color-primary)' }}
                      ></div>
                    </div>

                    {/* Name */}
                    <h3 className="text-xl font-bold mb-2" style={{ color: 'white' }}>
                      {subject.name}
                    </h3>

                    {/* Description */}
                    <p className="text-sm mb-5 line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>
                      {subject.description || 'Explore this subject to learn more.'}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" style={{ color: 'var(--color-text-dim)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <span className="text-sm font-medium" style={{ color: 'var(--color-text-dim)' }}>
                          {subject.topicsCount} topics
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" style={{ color: 'var(--color-text-dim)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm font-medium" style={{ color: 'var(--color-text-dim)' }}>
                          {subject.notesCount} notes
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
