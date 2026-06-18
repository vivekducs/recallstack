// frontend/src/app/search/page.js
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  
  const [subjects, setSubjects] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch subjects to populate filters
  useEffect(() => {
    async function fetchFilterData() {
      try {
        const res = await axios.get(`${API_URL}/subjects`);
        setSubjects(res.data);
      } catch (err) {
        console.error('Failed to load filter subjects:', err);
      }
    }
    fetchFilterData();
  }, []);

  // Update topics dropdown when subject changes
  useEffect(() => {
    if (!selectedSubject) {
      setFilteredTopics([]);
      setSelectedTopic('');
      return;
    }
    const foundSubject = subjects.find(s => s.slug === selectedSubject);
    if (foundSubject) {
      // Fetch topics for this subject
      async function fetchTopics() {
        try {
          const res = await axios.get(`${API_URL}/subjects/${foundSubject.id}/topics`);
          setFilteredTopics(res.data);
        } catch (err) {
          console.error('Failed to load subject topics:', err);
        }
      }
      fetchTopics();
    }
  }, [selectedSubject, subjects]);

  // Handle Search Trigger
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const params = {};
      if (query) params.q = query;
      if (selectedSubject) params.subject = selectedSubject;
      if (selectedTopic) params.topic = selectedTopic;
      if (selectedDifficulty) params.difficulty = selectedDifficulty;

      const res = await axios.get(`${API_URL}/search`, { params });
      setResults(res.data);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Run initial search on mount to show all published notes
  useEffect(() => {
    handleSearch();
  }, []);

  const getDifficultyBadge = (difficulty) => {
    const classes = {
      EASY: 'badge-easy',
      MEDIUM: 'badge-medium',
      HARD: 'badge-hard'
    };
    return classes[difficulty] || 'badge-medium';
  };

  return (
    <main className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full opacity-[0.04]" style={{ background: 'radial-gradient(circle, #6c63f1, transparent 70%)' }}></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-6 py-12">
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-8" style={{ color: 'var(--color-text-dim)' }}>
          <Link href="/" className="hover:underline" style={{ color: 'var(--color-primary)' }}>Home</Link>
          <span>/</span>
          <span style={{ color: 'var(--color-text-muted)' }}>Search</span>
        </nav>

        <header className="mb-10">
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'white' }}>Search Library</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Find notes and learning guides across all subjects and topics.</p>
        </header>

        {/* Search Panel */}
        <section className="glass-card p-6 mb-10">
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Query Input Box */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Type keywords (e.g. merge sort, load balancer)..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-xl text-white outline-none transition-all"
                  style={{
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border)',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                />
              </div>
              <button type="submit" className="btn-primary flex items-center gap-2 px-8">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Search</span>
              </button>
            </div>

            {/* Filter Dropdowns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Subject Filter */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-dim)' }}>Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-4 py-3 rounded-lg text-white outline-none cursor-pointer"
                  style={{
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <option value="">All Subjects</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.slug}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Topic Filter */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-dim)' }}>Topic</label>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  disabled={!selectedSubject}
                  className="px-4 py-3 rounded-lg text-white outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <option value="">All Topics</option>
                  {filteredTopics.map(t => (
                    <option key={t.id} value={t.slug}>{t.name}</option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-dim)' }}>Difficulty</label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="px-4 py-3 rounded-lg text-white outline-none cursor-pointer"
                  style={{
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <option value="">All Difficulties</option>
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
            </div>
          </form>
        </section>

        {/* Results Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold" style={{ color: 'white' }}>Results ({results.length})</h2>
            {loading && <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Searching...</span>}
          </div>

          {results.length === 0 ? (
            <div className="text-center py-20 glass-card">
              <div className="text-6xl mb-4">🔍</div>
              <p style={{ color: 'var(--color-text-muted)' }}>No matching notes found.</p>
              <p className="text-sm mt-2" style={{ color: 'var(--color-text-dim)' }}>Try adjusting your search keywords or filters.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((note) => (
                <Link key={note.id} href={`/learning/${note.topic.subject.slug}/${note.topic.slug}/${note.slug}`}>
                  <div className="glass-card p-5 cursor-pointer hover:bg-opacity-80 transition-all mb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-xs mb-2" style={{ color: 'var(--color-primary)' }}>
                          <span>{note.topic.subject.name}</span>
                          <span>•</span>
                          <span style={{ color: 'var(--color-text-muted)' }}>{note.topic.name}</span>
                        </div>
                        
                        <h3 className="text-lg font-semibold mb-2" style={{ color: 'white' }}>{note.title}</h3>
                        {note.excerpt && (
                          <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>
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
                              <span key={i} className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-dim)', border: '1px solid var(--color-border)' }}>
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
