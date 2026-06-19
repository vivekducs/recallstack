// frontend/src/app/dashboard/analytics/page.js
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import useAuth from '@/hooks/useAuth';
import Card from '@/components/common/Card';
import Table from '@/components/common/Table';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AnalyticsDashboard() {
  const { token, getAuthHeaders, isAuthenticated, loading: authLoading } = useAuth();
  const [notes, setNotes] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalyticsData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError('');
      
      // Fetch both dashboard stats and user notes
      const [statsRes, notesRes] = await Promise.all([
        axios.get(`${API_URL}/analytics/dashboard`, { headers: getAuthHeaders() }),
        axios.get(`${API_URL}/notes/user/my-notes`, { headers: getAuthHeaders() })
      ]);
      
      setSummary(statsRes.data.summary);
      setNotes(notesRes.data);
    } catch (err) {
      console.error('Failed to load analytics metrics:', err);
      setError('Could not load detailed metrics. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        fetchAnalyticsData();
      } else {
        setLoading(false);
      }
    }
  }, [authLoading, isAuthenticated, token]);

  if (authLoading || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="loading-pulse" style={{ color: 'var(--color-text-muted)' }}>Loading analytics charts...</div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-bg)' }}>
        <Card className="max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-3" style={{ color: 'white' }}>Analytics Access Required</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
            Sign in to view catalog analytics, difficulty distributions, and notes statistics.
          </p>
          <Link href="/login" className="btn-primary inline-block">
            Sign In
          </Link>
        </Card>
      </main>
    );
  }

  // Calculate stats from user notes locally
  let easyCount = 0;
  let mediumCount = 0;
  let hardCount = 0;

  notes.forEach(note => {
    if (note.difficulty === 'EASY') easyCount++;
    else if (note.difficulty === 'MEDIUM') mediumCount++;
    else if (note.difficulty === 'HARD') hardCount++;
  });

  const totalNotes = notes.length;
  const easyPct = totalNotes ? Math.round((easyCount / totalNotes) * 100) : 0;
  const mediumPct = totalNotes ? Math.round((mediumCount / totalNotes) * 100) : 0;
  const hardPct = totalNotes ? Math.round((hardCount / totalNotes) * 100) : 0;

  const publishedCount = summary?.publishedNotes || 0;
  const draftCount = summary?.draftNotes || 0;
  const publishedPct = totalNotes ? Math.round((publishedCount / totalNotes) * 100) : 0;
  const draftPct = totalNotes ? Math.round((draftCount / totalNotes) * 100) : 0;

  const avgReadTime = totalNotes ? Math.round((summary?.totalReadingTime || 0) / totalNotes) : 0;

  return (
    <main className="min-h-screen py-12" style={{ background: 'var(--color-bg)' }}>
      <div className="relative max-w-5xl mx-auto px-6">
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-8" style={{ color: 'var(--color-text-dim)' }}>
          <Link href="/" className="hover:underline" style={{ color: 'var(--color-primary)' }}>Home</Link>
          <span>/</span>
          <Link href="/dashboard" className="hover:underline" style={{ color: 'var(--color-primary)' }}>Dashboard</Link>
          <span>/</span>
          <span style={{ color: 'var(--color-text-muted)' }}>Analytics</span>
        </nav>

        <header className="mb-10">
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'white' }}>Catalog Analytics</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Overview of note classifications, difficulty structures, and view statistics.
          </p>
        </header>

        {error && (
          <Card className="mb-8 text-center" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
            <p className="text-red-400 text-sm">{error}</p>
          </Card>
        )}

        {/* Visual Analytics Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* Difficulty Level Distribution card */}
          <Card>
            <h2 className="text-lg font-bold mb-6" style={{ color: 'white' }}>Difficulty Level Distribution</h2>
            {totalNotes === 0 ? (
              <p className="text-sm text-center py-10" style={{ color: 'var(--color-text-muted)' }}>
                Create notes to see difficulty distributions.
              </p>
            ) : (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium" style={{ color: 'white' }}>Easy Difficulty</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>{easyCount} notes ({easyPct}%)</span>
                  </div>
                  <div className="w-full bg-neutral-800 h-2.5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${easyPct}%`, background: 'var(--color-primary)' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium" style={{ color: 'white' }}>Medium Difficulty</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>{mediumCount} notes ({mediumPct}%)</span>
                  </div>
                  <div className="w-full bg-neutral-800 h-2.5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${mediumPct}%`, background: '#f59e0b' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium" style={{ color: 'white' }}>Hard Difficulty</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>{hardCount} notes ({hardPct}%)</span>
                  </div>
                  <div className="w-full bg-neutral-800 h-2.5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${hardPct}%`, background: '#ef4444' }}></div>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Note Status Ratio Card */}
          <Card>
            <h2 className="text-lg font-bold mb-6" style={{ color: 'white' }}>Publication Status Ratio</h2>
            {totalNotes === 0 ? (
              <p className="text-sm text-center py-10" style={{ color: 'var(--color-text-muted)' }}>
                Create notes to see publication status distributions.
              </p>
            ) : (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium" style={{ color: 'white' }}>Published Notes</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>{publishedCount} notes ({publishedPct}%)</span>
                  </div>
                  <div className="w-full bg-neutral-800 h-2.5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${publishedPct}%`, background: '#10b981' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium" style={{ color: 'white' }}>Draft Notes</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>{draftCount} notes ({draftPct}%)</span>
                  </div>
                  <div className="w-full bg-neutral-800 h-2.5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${draftPct}%`, background: '#6b7280' }}></div>
                  </div>
                </div>

                <div className="pt-4 border-t flex justify-between gap-4 text-center" style={{ borderColor: 'var(--color-border)' }}>
                  <div>
                    <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>Total Catalog</span>
                    <div className="text-lg font-bold text-white mt-0.5">{totalNotes}</div>
                  </div>
                  <div>
                    <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>Published</span>
                    <div className="text-lg font-bold text-emerald-400 mt-0.5">{publishedCount}</div>
                  </div>
                  <div>
                    <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>Drafts</span>
                    <div className="text-lg font-bold text-neutral-400 mt-0.5">{draftCount}</div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Read Stats Metrics Row */}
        <Card className="mb-10">
          <h2 className="text-lg font-bold mb-4" style={{ color: 'white' }}>Reading Statistics Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center divide-y md:divide-y-0 md:divide-x" style={{ borderColor: 'var(--color-border)' }}>
            <div className="py-4 md:py-0">
              <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-dim)' }}>Total Reading Time</span>
              <div className="text-2xl font-bold mt-2" style={{ color: 'white' }}>{summary?.totalReadingTime || 0} minutes</div>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Combined estimation of all notes</p>
            </div>
            
            <div className="py-4 md:py-0">
              <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-dim)' }}>Average Note Length</span>
              <div className="text-2xl font-bold mt-2" style={{ color: 'white' }}>{avgReadTime} minutes</div>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Average reading time per article</p>
            </div>

            <div className="py-4 md:py-0">
              <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-dim)' }}>Saved Bookmarks Count</span>
              <div className="text-2xl font-bold mt-2" style={{ color: 'white' }}>{summary?.bookmarksCount || 0} notes</div>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Articles saved in quick-read folder</p>
            </div>
          </div>
        </Card>

        {/* Subject wise Distribution summary */}
        <Card>
          <h2 className="text-lg font-bold mb-4" style={{ color: 'white' }}>Subject Breakdown</h2>
          {totalNotes === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: 'var(--color-text-muted)' }}>
              No notes written in the workspace to catalog by subject.
            </p>
          ) : (
            <Table
              headers={[
                { key: 'title', label: 'Subject / Topic', align: 'left' },
                { key: 'difficulty', label: 'Difficulty', align: 'center' },
                { key: 'status', label: 'Status', align: 'center' },
                { key: 'readingTime', label: 'Reading Time', align: 'right' }
              ]}
              data={notes}
              renderCell={(note, key) => {
                if (key === 'title') {
                  return (
                    <>
                      <Link href={`/learning/${note.topic?.subject?.slug}/${note.topic?.slug}/${note.slug}`} className="hover:underline font-medium block">
                        {note.title}
                      </Link>
                      <span className="text-xs block" style={{ color: 'var(--color-text-dim)' }}>
                        {note.topic?.subject?.name} - {note.topic?.name}
                      </span>
                    </>
                  );
                }
                if (key === 'difficulty') {
                  return (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{
                      background: note.difficulty === 'EASY' ? 'rgba(16, 185, 129, 0.1)' : note.difficulty === 'MEDIUM' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: note.difficulty === 'EASY' ? '#10b981' : note.difficulty === 'MEDIUM' ? '#f59e0b' : '#ef4444'
                    }}>
                      {note.difficulty}
                    </span>
                  );
                }
                if (key === 'status') {
                  return (
                    <span className="text-xs px-2 py-0.5 rounded font-mono" style={{
                      background: note.status === 'PUBLISHED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                      color: note.status === 'PUBLISHED' ? '#10b981' : '#9ca3af'
                    }}>
                      {note.status.toLowerCase()}
                    </span>
                  );
                }
                if (key === 'readingTime') {
                  return (
                    <span className="font-mono" style={{ color: 'var(--color-text-muted)' }}>
                      {note.readingTime || 0}m
                    </span>
                  );
                }
                return note[key];
              }}
            />
          )}
        </Card>
      </div>
    </main>
  );
}
