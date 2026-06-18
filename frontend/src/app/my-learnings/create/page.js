// frontend/src/app/my-learnings/create/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import useAuth from '@/hooks/useAuth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function CreateNotePage() {
  const { user, token, getAuthHeaders, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [tagsInput, setTagsInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch subjects on mount
  useEffect(() => {
    async function fetchSubjects() {
      try {
        const res = await axios.get(`${API_URL}/subjects`);
        setSubjects(res.data);
        if (res.data.length > 0) {
          setSelectedSubjectId(res.data[0].id);
        }
      } catch (err) {
        console.error('Failed to load subjects:', err);
        setError('Could not load subjects. Please check if backend API is online.');
      } finally {
        setPageLoading(false);
      }
    }

    if (!authLoading) {
      if (isAuthenticated) {
        fetchSubjects();
      } else {
        setPageLoading(false);
      }
    }
  }, [authLoading, isAuthenticated]);

  // Fetch topics when subject changes
  useEffect(() => {
    if (!selectedSubjectId) {
      setTopics([]);
      setSelectedTopicId('');
      return;
    }

    async function fetchTopics() {
      try {
        const res = await axios.get(`${API_URL}/subjects/${selectedSubjectId}/topics`);
        setTopics(res.data);
        if (res.data.length > 0) {
          setSelectedTopicId(res.data[0].id);
        } else {
          setSelectedTopicId('');
        }
      } catch (err) {
        console.error('Failed to load topics:', err);
        setError('Failed to retrieve topics for selected subject.');
      }
    }

    fetchTopics();
  }, [selectedSubjectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !selectedTopicId) {
      setError('Title and Topic selection are required.');
      return;
    }

    setLoading(true);
    setError('');

    // Parse comma-separated tags into an array of trimmed strings
    const tags = tagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    try {
      const res = await axios.post(
        `${API_URL}/notes`,
        {
          title,
          excerpt,
          difficulty,
          tags,
          topicId: selectedTopicId
        },
        {
          headers: getAuthHeaders()
        }
      );
      
      const newNote = res.data;
      // Redirect to section editor
      router.push(`/my-learnings/${newNote.id}/edit`);
    } catch (err) {
      console.error('Failed to create note:', err);
      setError(err.response?.data?.error || 'Failed to create new note draft.');
      setLoading(false);
    }
  };

  if (authLoading || pageLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="loading-pulse" style={{ color: 'var(--color-text-muted)' }}>Loading subjects...</div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-bg)' }}>
        <div className="max-w-md w-full glass-card p-8 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: 'white' }}>Authorization Required</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
            Please log in to create note drafts.
          </p>
          <Link href="/login" className="btn-primary inline-block">
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      {/* Glow backgrounds */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-15%] w-[450px] h-[450px] rounded-full opacity-[0.04]" style={{ background: 'radial-gradient(circle, #6c63f1, transparent 75%)' }}></div>
      </div>

      <div className="relative max-w-2xl mx-auto px-6 py-12">
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-8" style={{ color: 'var(--color-text-dim)' }}>
          <Link href="/" className="hover:underline" style={{ color: 'var(--color-primary)' }}>Home</Link>
          <span>/</span>
          <Link href="/my-learnings" className="hover:underline" style={{ color: 'var(--color-primary)' }}>My Learnings</Link>
          <span>/</span>
          <span style={{ color: 'var(--color-text-muted)' }}>Create Note</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create New Note Draft</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Fill in the metadata. You will add details and sections in the next step.</p>
        </header>

        {error && (
          <div className="p-4 mb-6 rounded-lg text-sm text-red-400" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass-card p-8 flex flex-col gap-6">
          {/* Subject Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-white uppercase tracking-wider">
              1. Select Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-4 py-3 rounded-lg text-white outline-none border focus:border-purple-500 transition-colors"
              style={{
                background: 'var(--color-bg-elevated)',
                borderColor: 'var(--color-border)'
              }}
            >
              {subjects.map(sub => (
                <option key={sub.id} value={sub.id}>
                  {sub.icon} {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Topic Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-white uppercase tracking-wider">
              2. Select Topic
            </label>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              disabled={topics.length === 0}
              className="w-full px-4 py-3 rounded-lg text-white outline-none border focus:border-purple-500 transition-colors disabled:opacity-50"
              style={{
                background: 'var(--color-bg-elevated)',
                borderColor: 'var(--color-border)'
              }}
            >
              {topics.length === 0 ? (
                <option value="">No topics in this subject</option>
              ) : (
                topics.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Title input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="title" className="text-xs font-semibold text-white uppercase tracking-wider">
              3. Note Title
            </label>
            <input
              id="title"
              type="text"
              placeholder="e.g. Dijkstra's Algorithm, CSS Flexbox Crash Course..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg text-white outline-none border focus:border-purple-500 transition-colors"
              style={{
                background: 'var(--color-bg-elevated)',
                borderColor: 'var(--color-border)'
              }}
            />
          </div>

          {/* Excerpt */}
          <div className="flex flex-col gap-2">
            <label htmlFor="excerpt" className="text-xs font-semibold text-white uppercase tracking-wider">
              4. Excerpt / Short Summary
            </label>
            <textarea
              id="excerpt"
              rows={2}
              placeholder="Provide a quick overview of what this note covers..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full px-4 py-3 rounded-lg text-white outline-none border focus:border-purple-500 transition-colors resize-none"
              style={{
                background: 'var(--color-bg-elevated)',
                borderColor: 'var(--color-border)'
              }}
            />
          </div>

          {/* Row: Difficulty and Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-white uppercase tracking-wider">
                5. Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-white outline-none border focus:border-purple-500 transition-colors"
                style={{
                  background: 'var(--color-bg-elevated)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="tags" className="text-xs font-semibold text-white uppercase tracking-wider">
                6. Tags (comma-separated)
              </label>
              <input
                id="tags"
                type="text"
                placeholder="e.g. algorithms, graphs, shortest-path"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-white outline-none border focus:border-purple-500 transition-colors"
                style={{
                  background: 'var(--color-bg-elevated)',
                  borderColor: 'var(--color-border)'
                }}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 mt-4 justify-end">
            <Link href="/my-learnings" className="btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || topics.length === 0}
              className="btn-primary flex items-center justify-center min-w-[140px] disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Draft'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
