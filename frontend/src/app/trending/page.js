// frontend/src/app/trending/page.js
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import Breadcrumb from '@/components/common/Breadcrumb';
import StarRating from '@/components/common/StarRating';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function TrendingPage() {
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('all'); // 'all' | subjectSlug
  const [period, setPeriod] = useState(7); // 7 | 30
  const [loading, setLoading] = useState(true);

  // Fetch subjects for filter
  useEffect(() => {
    async function fetchSubjects() {
      try {
        const res = await axios.get(`${API_URL}/subjects`);
        setSubjects(res.data);
      } catch (err) {
        console.error('Failed to load subjects:', err);
      }
    }
    fetchSubjects();
  }, []);

  // Fetch trending notes when period changes
  useEffect(() => {
    async function fetchTrending() {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/trending?days=${period}&limit=20`);
        setNotes(res.data);
      } catch (err) {
        console.error('Failed to load trending notes:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTrending();
  }, [period]);

  // Filter notes on client side by subject
  const filteredNotes = selectedSubject === 'all'
    ? notes
    : notes.filter(note => note.topic?.subject?.slug === selectedSubject);

  return (
    <div className="w-full">
      <Breadcrumb 
        items={[
          { name: 'Home', href: '/' },
          { name: 'Trending' }
        ]} 
        className="mb-8"
      />

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">Trending Notes</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">The most popular notes based on views, ratings, and helpful feedback.</p>
      </header>

      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8 pb-4 border-b border-[var(--color-border)]">
        {/* Time Period Selector */}
        <div className="flex bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded p-1">
          <button
            onClick={() => setPeriod(7)}
            className={`px-4 py-1.5 rounded text-xs font-semibold transition-all ${
              period === 7
                ? 'bg-[var(--color-primary)] text-white'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setPeriod(30)}
            className={`px-4 py-1.5 rounded text-xs font-semibold transition-all ${
              period === 30
                ? 'bg-[var(--color-primary)] text-white'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            This Month
          </button>
        </div>

        {/* Subject Filter Selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-[var(--color-text-secondary)] whitespace-nowrap">Subject:</span>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-text-secondary)] focus:border-[var(--color-primary)] rounded px-3 py-1.5 text-xs text-[var(--color-text-primary)] outline-none w-full sm:w-48"
          >
            <option value="all">All Subjects</option>
            {subjects.map(sub => (
              <option key={sub.id} value={sub.slug}>{sub.name}</option>
            ))}
          </select>
        </div>
      </div>

      <section>
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 min-h-[300px]">
            <div className="w-[20px] h-[20px] border-2 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin"></div>
            <span className="text-xs font-mono text-[var(--color-text-secondary)] mt-3">Loading trending content...</span>
          </div>
        ) : filteredNotes.length === 0 ? (
          <Card variant="standard" className="text-center py-16">
            <h3 className="text-[18px] font-semibold text-[var(--color-text-primary)] mb-1">No Trending Notes</h3>
            <p className="text-sm text-[var(--color-text-secondary)]">Check back later or try selecting a different subject or period.</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredNotes.map((note, index) => (
              <Link key={note.id} href={`/learning/${note.topic?.subject?.slug}/${note.topic?.slug}/${note.slug}`} className="block">
                <Card variant="standard" className="hover:border-[var(--color-primary)] flex items-start gap-4 p-5 sm:p-6">
                  
                  {/* Trending Rank Indicator */}
                  <div className="flex flex-col items-center justify-center w-10 h-10 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold text-lg flex-shrink-0">
                    #{index + 1}
                  </div>
 
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--color-primary)] mb-2">
                      <span>{note.topic?.subject?.name}</span>
                      <span className="opacity-50">/</span>
                      <span className="text-[var(--color-text-secondary)]">{note.topic?.name}</span>
                    </div>
                    
                    <h3 className="text-[18px] font-semibold text-[var(--color-text-primary)] pb-1 truncate">
                      {note.title}
                    </h3>
 
                    {note.excerpt && (
                      <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] line-clamp-2 mt-3 mb-4">
                        {note.excerpt}
                      </p>
                    )}
 
                    <div className="flex items-center gap-3 flex-wrap text-[12px] text-[var(--color-text-secondary)] mt-4">
                      <Badge variant={note.difficulty}>{note.difficulty}</Badge>
                      <span className="opacity-50">|</span>
                      <span>{note.views || 0} Views</span>
                      <span className="opacity-50">|</span>
                      <span>{note.helpfulCount || 0} Helpful</span>
                      <span className="opacity-50">|</span>
                      <div onClick={(e) => e.preventDefault()}>
                        <StarRating noteId={note.id} initialAverage={note.averageRating} initialCount={note.ratingCount} readOnly={true} />
                      </div>
                      <span className="opacity-50">|</span>
                      <span>by {note.author?.name || 'Unknown'}</span>
                    </div>
 
                  </div>
 
                  <svg className="w-4.5 h-4.5 text-[var(--color-text-secondary)]/50 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
