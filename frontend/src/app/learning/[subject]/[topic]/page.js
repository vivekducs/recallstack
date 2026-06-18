'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function TopicPage() {
  const params = useParams();
  const [subject, setSubject] = useState(null);
  const [topic, setTopic] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Get subject by slug
        const subjectRes = await axios.get(`${API_URL}/subjects/${params.subject}`);
        setSubject(subjectRes.data);

        // Find topic by slug
        const foundTopic = subjectRes.data.topics?.find(t => t.slug === params.topic);
        if (foundTopic) {
          setTopic(foundTopic);

          // Get notes for topic
          const notesRes = await axios.get(`${API_URL}/topics/${foundTopic.id}/notes`);
          setNotes(notesRes.data);
        }
      } catch (err) {
        console.error('Failed to fetch topic:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params.subject, params.topic]);

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
        <div className="loading-pulse" style={{ color: 'var(--color-text-muted)' }}>Loading topic...</div>
      </main>
    );
  }

  if (!topic) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-xl" style={{ color: 'var(--color-text-muted)' }}>Topic not found.</p>
          <Link href={`/learning/${params.subject}`} className="inline-block mt-4 text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
            ← Back to Subject
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-8 fade-in flex-wrap" style={{ color: 'var(--color-text-dim)' }}>
          <Link href="/" className="hover:underline" style={{ color: 'var(--color-primary)' }}>Home</Link>
          <span>/</span>
          <Link href={`/learning/${params.subject}`} className="hover:underline" style={{ color: 'var(--color-primary)' }}>
            {subject?.name || params.subject}
          </Link>
          <span>/</span>
          <span style={{ color: 'var(--color-text-muted)' }}>{topic.name}</span>
        </nav>

        {/* Topic Header */}
        <header className="mb-10 fade-in">
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'white' }}>{topic.name}</h1>
          {topic.description && (
            <p className="text-lg" style={{ color: 'var(--color-text-muted)' }}>{topic.description}</p>
          )}
          <div className="flex items-center gap-4 mt-3 text-sm" style={{ color: 'var(--color-text-dim)' }}>
            <span className="font-medium">{notes.length} notes</span>
          </div>
        </header>

        {/* Notes List */}
        <section>
          <h2 className="text-xl font-bold mb-6 fade-in" style={{ color: 'white' }}>
            Notes
          </h2>

          {notes.length === 0 ? (
            <div className="text-center py-16 glass-card">
              <div className="text-5xl mb-4">📝</div>
              <p style={{ color: 'var(--color-text-muted)' }}>No notes yet in this topic.</p>
              <p className="text-sm mt-2" style={{ color: 'var(--color-text-dim)' }}>Be the first to contribute!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note, index) => (
                <Link key={note.id} href={`/learning/${params.subject}/${params.topic}/${note.slug}`}>
                  <div className={`glass-card p-5 cursor-pointer fade-in fade-in-delay-${Math.min(index + 1, 4)} mb-4`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2" style={{ color: 'white' }}>{note.title}</h3>
                        {note.excerpt && (
                          <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>
                            {note.excerpt}
                          </p>
                        )}

                        <div className="flex items-center gap-3 flex-wrap">
                          <span className={`badge ${getDifficultyBadge(note.difficulty)}`}>
                            {note.difficulty}
                          </span>
                          <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
                            {note.readingTime || 1} min read
                          </span>
                          <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
                            by {note.author?.name || 'Unknown'}
                          </span>
                          {note.publishedAt && (
                            <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
                              {new Date(note.publishedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        {note.tags && note.tags.length > 0 && (
                          <div className="flex gap-2 mt-3 flex-wrap">
                            {note.tags.map((tag, i) => (
                              <span key={i} className="text-xs px-2 py-1 rounded-md" style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-dim)', border: '1px solid var(--color-border)' }}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <svg className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: 'var(--color-text-dim)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
