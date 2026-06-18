// frontend/src/app/bookmarks/page.js
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import useAuth from '@/hooks/useAuth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function BookmarksPage() {
  const { user, token, getAuthHeaders, isAuthenticated, loading: authLoading } = useAuth();
  const [savedNotes, setSavedNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/bookmarks`, {
        headers: getAuthHeaders()
      });
      setSavedNotes(res.data);
    } catch (err) {
      console.error('Failed to load bookmarks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        fetchBookmarks();
      } else {
        setLoading(false);
      }
    }
  }, [authLoading, isAuthenticated, token]);

  const handleUnsave = async (e, noteId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await axios.delete(`${API_URL}/bookmarks/${noteId}`, {
        headers: getAuthHeaders()
      });
      // Remove from state
      setSavedNotes(prev => prev.filter(note => note.id !== noteId));
    } catch (err) {
      console.error('Failed to unsave note:', err);
    }
  };

  const getDifficultyBadge = (difficulty) => {
    const classes = {
      EASY: 'badge-easy',
      MEDIUM: 'badge-medium',
      HARD: 'badge-hard'
    };
    return classes[difficulty] || 'badge-medium';
  };

  if (authLoading || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="loading-pulse" style={{ color: 'var(--color-text-muted)' }}>Loading bookmarks...</div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-bg)' }}>
        <div className="max-w-md w-full glass-card p-8 text-center">
          <div className="text-6xl mb-4">🔖</div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: 'white' }}>Save Your Learning</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
            Keep track of the most helpful guides, code snippets, and cheat sheets. Sign in to sync bookmarks.
          </p>
          <Link href="/login" className="btn-primary inline-block">
            Sign In to Start Saving
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full opacity-[0.03]" style={{ background: 'radial-gradient(circle, #6c63f1, transparent 70%)' }}></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-6 py-12">
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-8" style={{ color: 'var(--color-text-dim)' }}>
          <Link href="/" className="hover:underline" style={{ color: 'var(--color-primary)' }}>Home</Link>
          <span>/</span>
          <span style={{ color: 'var(--color-text-muted)' }}>Bookmarks</span>
        </nav>

        <header className="mb-10">
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'white' }}>My Saved Notes</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>A curated collection of your bookmarked learning resources.</p>
        </header>

        {savedNotes.length === 0 ? (
          <div className="text-center py-20 glass-card">
            <div className="text-6xl mb-4">🌟</div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'white' }}>No Bookmarks Yet</h2>
            <p className="max-w-md mx-auto mb-6" style={{ color: 'var(--color-text-muted)' }}>
              Explore subjects and topics, and click the bookmark button inside notes to save them for easy access later.
            </p>
            <Link href="/" className="btn-primary inline-block">
              Browse Subjects
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedNotes.map((note) => (
              <Link key={note.id} href={`/learning/${note.topic?.subject?.slug}/${note.topic?.slug}/${note.slug}`}>
                <div className="glass-card p-6 flex flex-col h-full cursor-pointer hover:bg-opacity-80 transition-all">
                  <div className="flex-1">
                    {/* Topic details */}
                    <div className="flex items-center justify-between text-xs mb-3">
                      <div className="flex items-center gap-1.5" style={{ color: 'var(--color-primary)' }}>
                        <span>{note.topic?.subject?.name}</span>
                        <span>•</span>
                        <span style={{ color: 'var(--color-text-muted)' }}>{note.topic?.name}</span>
                      </div>
                      {/* Delete Bookmark Button */}
                      <button
                        onClick={(e) => handleUnsave(e, note.id)}
                        className="p-1 rounded hover:bg-gray-800 text-red-400"
                        title="Remove Bookmark"
                      >
                        <svg className="w-4 h-4" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    <h3 className="text-lg font-bold mb-2 text-white">{note.title}</h3>
                    {note.excerpt && (
                      <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>
                        {note.excerpt}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-4 pt-4 text-xs" style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-text-dim)' }}>
                    <span className={`badge ${getDifficultyBadge(note.difficulty)}`}>
                      {note.difficulty}
                    </span>
                    <span>{note.readingTime || 1} min read</span>
                    <span>by {note.author?.name}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
