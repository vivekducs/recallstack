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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrending() {
      try {
        const res = await axios.get(`${API_URL}/trending?days=7&limit=20`);
        setNotes(res.data);
      } catch (err) {
        console.error('Failed to load trending notes:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTrending();
  }, []);

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
        <p className="text-sm text-[var(--color-text-secondary)]">The most popular notes from the past 7 days across all subjects.</p>
      </header>

      <section>
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 min-h-[300px]">
            <div className="w-[20px] h-[20px] border-2 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin"></div>
            <span className="text-xs font-mono text-[var(--color-text-secondary)] mt-3">Loading trending content...</span>
          </div>
        ) : notes.length === 0 ? (
          <Card variant="standard" className="text-center py-16">
            <h3 className="text-[18px] font-semibold text-[var(--color-text-primary)] mb-1">No Trending Notes</h3>
            <p className="text-sm text-[var(--color-text-secondary)]">Check back later when more notes have been viewed.</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {notes.map((note, index) => (
              <Link key={note.id} href={`/learning/${note.topic?.subject?.slug}/${note.topic?.slug}/${note.slug}`} className="block">
                <Card variant="standard" className="hover:border-[var(--color-primary)] flex items-start gap-4">
                  
                  {/* Trending Rank Indicator */}
                  <div className="flex flex-col items-center justify-center w-10 h-10 rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] font-bold text-lg flex-shrink-0">
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
