'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import CodeBlock from '@/components/note/CodeBlock';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function NotePage() {
  const params = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(null);

  useEffect(() => {
    async function fetchNote() {
      try {
        // Get subject by slug
        const subjectRes = await axios.get(`${API_URL}/subjects/${params.subject}`);
        const subject = subjectRes.data;

        // Find topic by slug
        const topic = subject.topics?.find(t => t.slug === params.topic);
        if (!topic) return;

        // Get notes for topic
        const notesRes = await axios.get(`${API_URL}/topics/${topic.id}/notes`);
        const foundNote = notesRes.data.find(n => n.slug === params.slug);

        if (foundNote) {
          // Get full note details with sections
          const noteRes = await axios.get(`${API_URL}/notes/${foundNote.id}`);
          setNote(noteRes.data);
        }
      } catch (err) {
        console.error('Failed to fetch note:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchNote();
  }, [params.subject, params.topic, params.slug]);

  // Track active section on scroll
  useEffect(() => {
    if (!note?.sections?.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );

    note.sections.forEach((section) => {
      const el = document.getElementById(`section-${section.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [note]);

  const getDifficultyBadge = (difficulty) => {
    const classes = {
      EASY: 'badge-easy',
      MEDIUM: 'badge-medium',
      HARD: 'badge-hard'
    };
    return classes[difficulty] || 'badge-medium';
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="loading-pulse" style={{ color: 'var(--color-text-muted)' }}>Loading note...</div>
      </main>
    );
  }

  if (!note) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-xl" style={{ color: 'var(--color-text-muted)' }}>Note not found.</p>
          <Link href={`/learning/${params.subject}/${params.topic}`} className="inline-block mt-4 text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
            ← Back to Topic
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex gap-8">
          {/* Main Content */}
          <article className="flex-1 min-w-0">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm mb-8 fade-in flex-wrap" style={{ color: 'var(--color-text-dim)' }}>
              <Link href="/" className="hover:underline" style={{ color: 'var(--color-primary)' }}>Home</Link>
              <span>/</span>
              <Link href={`/learning/${params.subject}`} className="hover:underline" style={{ color: 'var(--color-primary)' }}>
                {note.topic?.subject?.name || params.subject}
              </Link>
              <span>/</span>
              <Link href={`/learning/${params.subject}/${params.topic}`} className="hover:underline" style={{ color: 'var(--color-primary)' }}>
                {note.topic?.name || params.topic}
              </Link>
              <span>/</span>
              <span style={{ color: 'var(--color-text-muted)' }}>{note.title}</span>
            </nav>

            {/* Note Header */}
            <header className="mb-10 fade-in">
              <h1 className="text-4xl font-bold mb-4" style={{ color: 'white' }}>{note.title}</h1>

              <div className="flex items-center gap-4 flex-wrap mb-4">
                <span className={`badge ${getDifficultyBadge(note.difficulty)}`}>{note.difficulty}</span>
                <span className="text-sm" style={{ color: 'var(--color-text-dim)' }}>
                  {note.readingTime || 1} min read
                </span>
                <span className="text-sm" style={{ color: 'var(--color-text-dim)' }}>
                  by {note.author?.name || 'Unknown'}
                </span>
                {note.publishedAt && (
                  <span className="text-sm" style={{ color: 'var(--color-text-dim)' }}>
                    {new Date(note.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                )}
              </div>

              {note.excerpt && (
                <p className="text-lg" style={{ color: 'var(--color-text-muted)' }}>{note.excerpt}</p>
              )}

              {note.tags && note.tags.length > 0 && (
                <div className="flex gap-2 mt-4 flex-wrap">
                  {note.tags.map((tag, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-md" style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-dim)', border: '1px solid var(--color-border)' }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </header>

            {/* Sections */}
            <div className="prose-dark">
              {note.sections && note.sections.map((section, index) => (
                <section
                  key={section.id}
                  id={`section-${section.id}`}
                  className={`mb-10 fade-in fade-in-delay-${Math.min(index + 1, 4)}`}
                >
                  <h2 className="text-2xl font-bold mb-4" style={{ color: 'white' }}>{section.title}</h2>

                  {section.contentType === 'TEXT' && (
                    <div className="whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--color-text)' }}>
                      {section.content}
                    </div>
                  )}

                  {section.contentType === 'CODE' && (
                    <CodeBlock language={section.language} content={section.content} />
                  )}

                  {section.contentType === 'EXAMPLE' && (
                    <div className="rounded-xl p-5" style={{ background: 'rgba(36, 166, 112, 0.08)', borderLeft: '3px solid var(--color-accent)' }}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-semibold" style={{ color: 'var(--color-accent)' }}>💡 Example</span>
                      </div>
                      <div className="whitespace-pre-wrap" style={{ color: 'var(--color-text)' }}>
                        {section.content}
                      </div>
                    </div>
                  )}

                  {section.contentType === 'IMAGE' && (
                    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
                      <img src={section.content} alt={section.title} className="w-full" />
                    </div>
                  )}

                  {section.contentType === 'DIAGRAM' && (
                    <div className="rounded-xl p-5 font-mono text-sm overflow-x-auto" style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }}>
                      <pre className="whitespace-pre" style={{ color: 'var(--color-text)' }}>{section.content}</pre>
                    </div>
                  )}
                </section>
              ))}
            </div>
          </article>

          {/* Table of Contents Sidebar */}
          {note.sections && note.sections.length > 1 && (
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-8">
                <nav className="glass-card p-5">
                  <h3 className="text-sm font-bold mb-4 uppercase tracking-wider" style={{ color: 'var(--color-text-dim)' }}>Contents</h3>
                  <ul className="space-y-2">
                    {note.sections.map((section) => (
                      <li key={section.id}>
                        <a
                          href={`#section-${section.id}`}
                          className="block text-sm py-1 px-3 rounded-md transition-colors"
                          style={{
                            color: activeSection === `section-${section.id}` ? 'var(--color-primary)' : 'var(--color-text-muted)',
                            background: activeSection === `section-${section.id}` ? 'rgba(108, 99, 241, 0.1)' : 'transparent',
                          }}
                        >
                          {section.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </aside>
          )}
        </div>
      </div>
    </main>
  );
}
