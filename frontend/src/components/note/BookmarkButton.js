// frontend/src/components/note/BookmarkButton.js
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '@/hooks/useAuth';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function BookmarkButton({ noteId }) {
  const { user, token, getAuthHeaders, isAuthenticated } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    async function checkBookmark() {
      try {
        const res = await axios.get(`${API_URL}/bookmarks`, {
          headers: getAuthHeaders()
        });
        const saved = res.data.some(note => note.id === noteId);
        setIsBookmarked(saved);
      } catch (err) {
        console.error('Failed to verify bookmark status:', err);
      } finally {
        setLoading(false);
      }
    }

    checkBookmark();
  }, [noteId, isAuthenticated]);

  const handleToggleBookmark = async () => {
    if (!isAuthenticated) {
      alert('Please sign in to bookmark notes.');
      window.location.href = '/login';
      return;
    }

    try {
      if (isBookmarked) {
        await axios.delete(`${API_URL}/bookmarks/${noteId}`, {
          headers: getAuthHeaders()
        });
        setIsBookmarked(false);
      } else {
        await axios.post(
          `${API_URL}/bookmarks`,
          { noteId },
          { headers: getAuthHeaders() }
        );
        setIsBookmarked(true);
      }
    } catch (err) {
      console.error('Bookmark toggle failed:', err);
    }
  };

  if (loading) {
    return (
      <span className="w-8 h-8 rounded-full border border-gray-700 inline-block animate-pulse"></span>
    );
  }

  return (
    <button
      onClick={handleToggleBookmark}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors"
      style={{
        background: isBookmarked ? 'rgba(108, 99, 241, 0.15)' : 'rgba(255, 255, 255, 0.05)',
        color: isBookmarked ? 'var(--color-primary)' : 'var(--color-text-dim)',
        border: `1px solid ${isBookmarked ? 'rgba(108, 99, 241, 0.3)' : 'var(--color-border)'}`
      }}
      aria-label={isBookmarked ? 'Unsave Note' : 'Save Note'}
    >
      <svg
        className="w-4 h-4"
        fill={isBookmarked ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
      <span>{isBookmarked ? 'Saved' : 'Save'}</span>
    </button>
  );
}
