// frontend/src/app/page.js
import Link from 'next/link';
import { getHomepageTitle } from '@/lib/seo';
import JsonLd from '@/components/common/JsonLd';
import Card from '@/components/common/Card';
import SubjectIcon from '@/components/common/SubjectIcon';

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
      <div className="w-full">
        {/* 
          Hero Section (Homepage)
          - Centered alignment
          - Max width: 800px (max-w-[800px])
          - Headline: Large h1 (text-4xl md:text-5xl)
          - Subheading: Gray, body size (text-sm text-[var(--color-text-secondary)])
          - Vertical padding: 64px top (pt-16), 48px bottom (pb-12)
          - Button spacing: 16px between (gap-4)
        */}
        <section className="relative max-w-[800px] mx-auto text-center pt-16 pb-12 flex flex-col items-center animate-fadeInUp opacity-0">
          
          {/* Animated background glow blob */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-[var(--color-primary)]/10 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-lighten pointer-events-none animate-pulseSoft" />

          <div className="relative inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6 border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.15)] transition-shadow duration-300 cursor-default group overflow-hidden">
            <span className="text-[12px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider group-hover:text-[var(--color-primary)] transition-colors duration-300">
              Developer Knowledge Base
            </span>
            <div className="absolute top-0 -left-full h-full w-1/2 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shine pointer-events-none" />
          </div>

          <h1 className="relative text-4xl md:text-6xl font-extrabold mb-4 tracking-tight text-[var(--color-text-primary)] animate-fadeInUp-delayed-1 opacity-0 leading-tight">
            Recall<span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-accent)] to-[var(--color-primary)] animate-gradient-x inline-block hover:scale-105 transition-transform duration-300">Stack</span>
          </h1>

          <p className="relative text-[16px] text-[var(--color-text-secondary)] max-w-xl mb-8 animate-fadeInUp-delayed-2 opacity-0 font-medium">
            Learn Once. Recall Anytime. Organize your engineering knowledge with structured subjects, topics, and notes. Built for developers who want to reinforce their learning.
          </p>

          <div className="relative flex justify-center gap-4 animate-fadeInUp-delayed-2 opacity-0 group">
            <Link href="/search" className="relative overflow-hidden btn-primary hover:-translate-y-1 hover:shadow-[0_8px_25px_-4px_rgba(var(--color-primary-rgb),0.4)] transition-all duration-300 px-8 py-3 text-lg font-semibold rounded-xl">
              Search Library
              <div className="absolute top-0 -left-full h-full w-1/2 z-0 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-shine pointer-events-none" />
            </Link>
          </div>

        </section>

        {/* 
          Grid Layout (Subjects)
          - Desktop: 3 columns (lg:grid-cols-3)
          - Tablet: 2 columns (md:grid-cols-2)
          - Mobile: 1 column (grid-cols-1)
          - Gap between cards: 16px (gap-4)
          - Card padding: 16px internal (standard Card component has p-4 = 16px)
        */}
        {subjects.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-[var(--color-border)] rounded-lg bg-[var(--color-bg-secondary)] animate-fadeInUp-delayed-2 opacity-0">
            <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-1">Empty Catalog</h3>
            <p className="text-sm text-[var(--color-text-secondary)]">No subjects have been created yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fadeInUp-delayed-2 opacity-0">
            {subjects.map((subject, index) => (
              <Link key={subject.id} href={`/learning/${subject.slug}`} className="block group outline-none">
                <Card variant="standard" className="h-full flex flex-col justify-between transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:group-hover:shadow-[0_8px_30px_rgb(255,255,255,0.02)] group-focus-visible:ring-2 group-focus-visible:ring-[var(--color-primary)]">
                  <div>
                    {/* Header accent */}
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className="w-10 h-10 rounded flex items-center justify-center font-semibold text-sm border transition-transform duration-300 group-hover:scale-110"
                        style={{ 
                          backgroundColor: `${subject.color || '#3B82F6'}15`, 
                          borderColor: `${subject.color || '#3B82F6'}30`,
                          color: subject.color || 'var(--color-primary)'
                        }}
                      >
                        <SubjectIcon icon={subject.icon} className="w-5 h-5 text-inherit" />
                      </div>
                    </div>

                    {/* Card Title: Bottom padding 4px */}
                    <h3 className="text-[18px] font-semibold text-[var(--color-text-primary)] pb-1 group-hover:text-[var(--color-primary)] transition-colors duration-200">
                      {subject.name}
                    </h3>

                    {/* Card Content: 12px top padding (mt-3) */}
                    <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 mt-3 mb-6 group-hover:text-[var(--color-text-primary)] transition-colors duration-200">
                      {subject.description || 'Explore this subject to learn more.'}
                    </p>
                  </div>

                  {/* Card Meta/Stats: 8px top padding, 12px font size, gray */}
                  <div className="flex items-center gap-4 pt-3 border-t border-[var(--color-border)] text-[12px] text-[var(--color-text-secondary)] mt-auto transition-colors duration-300 group-hover:border-[var(--color-border-hover)]">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-[var(--color-text-secondary)]/70 group-hover:text-[var(--color-primary)]/70 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <span>{subject.topicsCount} topics</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-[var(--color-text-secondary)]/70 group-hover:text-[var(--color-primary)]/70 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>{subject.notesCount} notes</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
