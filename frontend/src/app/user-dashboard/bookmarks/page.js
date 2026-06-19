// frontend/src/app/user-dashboard/bookmarks/page.js
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import useAuth from '@/hooks/useAuth';
import Card from '@/components/common/Card';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function BookmarksPage() {
  const { token, getAuthHeaders } = useAuth();
  const router = useRouter();
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
    fetchBookmarks();
  }, [token]);

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

  if (loading) {
    return (
      <div className="p-8 text-center animate-pulse text-[var(--color-text-secondary)]">
        Loading bookmarks...
      </div>
    );
  }

  return (
    <div>
      {/* Header Block */}
      <header className="mb-8 border-b border-[var(--color-border)] pb-6">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">My Saved Notes</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">A curated collection of your bookmarked learning resources.</p>
      </header>

      {savedNotes.length === 0 ? (
        <div className="text-center py-16 glass-card">
          <div className="text-xl mb-4 font-mono text-zinc-500 tracking-wider">Empty Library</div>
          <h2 className="text-xl font-bold mb-2 text-[var(--color-text-primary)]">No Bookmarks Yet</h2>
          <p className="max-w-md mx-auto mb-6 text-sm text-[var(--color-text-secondary)]">
            Explore subjects and topics, and click the bookmark button inside notes to save them for easy access later.
          </p>
          <Link href="/" className="btn-primary inline-block">
            Browse Subjects
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {savedNotes.map((note) => (
            <Card
              key={note.id}
              onClick={() => router.push(`/learning/${note.topic?.subject?.slug}/${note.topic?.slug}/${note.slug}`)}
              className="flex flex-col h-full animate-in fade-in cursor-pointer hover:border-[var(--color-primary)] transition-all"
            >
              <div className="flex-1">
                {/* Topic details */}
                <div className="flex items-center justify-between text-xs mb-3">
                  <div className="flex items-center gap-1.5 text-[var(--color-primary)]">
                    <span>{note.topic?.subject?.name}</span>
                    <span>•</span>
                    <span className="text-[var(--color-text-secondary)]">{note.topic?.name}</span>
                  </div>
                  {/* Delete Bookmark Button */}
                  <button
                    onClick={(e) => handleUnsave(e, note.id)}
                    className="p-1 rounded hover:bg-[var(--color-bg-secondary)] text-red-500"
                    title="Remove Bookmark"
                  >
                    <svg className="w-4 h-4" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                <h3 className="text-lg font-bold mb-2 text-[var(--color-text-primary)]">{note.title}</h3>
                <p className="text-sm line-clamp-2 text-[var(--color-text-secondary)] mb-4">{note.excerpt || 'Read complete note details.'}</p>
              </div>

              <div className="flex items-center justify-between text-xs pt-3 border-t border-[var(--color-border)] text-[var(--color-text-secondary)]">
                <div className="flex items-center gap-2">
                  <span className={`badge ${getDifficultyBadge(note.difficulty)}`}>{note.difficulty}</span>
                  <span>by @{note.author?.username || 'author'}</span>
                </div>
                <span>{note.readingTime || 0} min read</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
