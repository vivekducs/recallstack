// frontend/src/app/dashboard/page.js
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import useAuth from '@/hooks/useAuth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function DashboardPage() {
  const { user, token, getAuthHeaders, isAuthenticated, loading: authLoading } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`${API_URL}/analytics/dashboard`, {
        headers: getAuthHeaders(),
      });
      setData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Could not load dashboard statistics. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        fetchDashboardData();
      } else {
        setLoading(false);
      }
    }
  }, [authLoading, isAuthenticated, token]);

  if (authLoading || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="loading-pulse" style={{ color: 'var(--color-text-muted)' }}>Loading dashboard statistics...</div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-bg)' }}>
        <div className="max-w-md w-full glass-card p-8 text-center">
          <h2 className="text-2xl font-bold mb-3" style={{ color: 'white' }}>Dashboard Access Required</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
            Please sign in to view your learning activity, revisions, and reading statistics.
          </p>
          <Link href="/login" className="btn-primary inline-block">
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  const { summary, mostRevised = [], timeline = [] } = data || {};

  return (
    <main className="min-h-screen py-12" style={{ background: 'var(--color-bg)' }}>
      {/* Ambient glow decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full opacity-[0.03]" style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)' }}></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Welcome Header */}
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: 'white' }}>
              Welcome back, {user?.name || 'Developer'}
            </h1>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Here is an overview of your knowledge repository and learning timeline.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/my-learnings/create" className="btn-primary">
              Write New Note
            </Link>
            <Link href="/dashboard/settings" className="btn-secondary">
              Edit Profile
            </Link>
          </div>
        </header>

        {error && (
          <div className="glass-card p-4 mb-8 text-center border-red-500/30">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="glass-card p-6">
            <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-dim)' }}>Notes Created</span>
            <div className="text-3xl font-bold mt-2 mb-1" style={{ color: 'white' }}>{summary?.totalNotes || 0}</div>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {summary?.publishedNotes || 0} published / {summary?.draftNotes || 0} drafts
            </p>
          </div>

          <div className="glass-card p-6">
            <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-dim)' }}>Total Views</span>
            <div className="text-3xl font-bold mt-2 mb-1" style={{ color: 'white' }}>{summary?.totalViews || 0}</div>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Across all published sections</p>
          </div>

          <div className="glass-card p-6">
            <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-dim)' }}>Helpful Clicks</span>
            <div className="text-3xl font-bold mt-2 mb-1" style={{ color: 'white' }}>{summary?.totalHelpful || 0}</div>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Positive feedback ratings received</p>
          </div>

          <div className="glass-card p-6">
            <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-dim)' }}>Total Read Time</span>
            <div className="text-3xl font-bold mt-2 mb-1" style={{ color: 'white' }}>{summary?.totalReadingTime || 0} min</div>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Estimated consumption time</p>
          </div>
        </section>

        {/* Action Panel Links */}
        <section className="glass-card p-6 mb-10">
          <h2 className="text-lg font-bold mb-4" style={{ color: 'white' }}>Quick Navigation</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/search" className="p-4 text-center rounded border transition hover:border-violet-500/50" style={{ background: 'var(--color-bg-elevated)', borderColor: 'var(--color-border)' }}>
              <span className="block font-semibold text-sm text-white">Search Library</span>
              <span className="text-xs mt-1 block" style={{ color: 'var(--color-text-dim)' }}>Browse catalog</span>
            </Link>
            <Link href="/bookmarks" className="p-4 text-center rounded border transition hover:border-violet-500/50" style={{ background: 'var(--color-bg-elevated)', borderColor: 'var(--color-border)' }}>
              <span className="block font-semibold text-sm text-white">Bookmarks</span>
              <span className="text-xs mt-1 block" style={{ color: 'var(--color-text-dim)' }}>Saved notes ({summary?.bookmarksCount || 0})</span>
            </Link>
            <Link href="/dashboard/analytics" className="p-4 text-center rounded border transition hover:border-violet-500/50" style={{ background: 'var(--color-bg-elevated)', borderColor: 'var(--color-border)' }}>
              <span className="block font-semibold text-sm text-white">Detailed Stats</span>
              <span className="text-xs mt-1 block" style={{ color: 'var(--color-text-dim)' }}>View statistics</span>
            </Link>
            <Link href="/my-learnings" className="p-4 text-center rounded border transition hover:border-violet-500/50" style={{ background: 'var(--color-bg-elevated)', borderColor: 'var(--color-border)' }}>
              <span className="block font-semibold text-sm text-white">Creator Space</span>
              <span className="text-xs mt-1 block" style={{ color: 'var(--color-text-dim)' }}>Manage articles</span>
            </Link>
          </div>
        </section>

        {/* Multi-column Detail lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Column 1: Learning activity timeline */}
          <section className="glass-card p-6">
            <h2 className="text-xl font-bold mb-6" style={{ color: 'white' }}>Learning Timeline</h2>
            {timeline.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
                No activity logged yet. Revisions, note creations, and comments will populate here.
              </p>
            ) : (
              <div className="space-y-6 relative border-l pl-4" style={{ borderColor: 'var(--color-border)' }}>
                {timeline.map((event) => (
                  <div key={event.id} className="relative">
                    <span className="absolute left-[-21px] top-1.5 w-2.5 h-2.5 rounded-full" style={{ background: 'var(--color-primary)' }}></span>
                    <div>
                      <p className="text-sm text-white font-medium">{event.description}</p>
                      <span className="text-xs mt-1 block" style={{ color: 'var(--color-text-dim)' }}>
                        {new Date(event.date).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Column 2: Most Revised Notes */}
          <section className="glass-card p-6">
            <h2 className="text-xl font-bold mb-6" style={{ color: 'white' }}>Most Revised Notes</h2>
            {mostRevised.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
                No notes found in your repository workspace.
              </p>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {mostRevised.map((note) => (
                  <div key={note.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-white hover:underline">
                        <Link href={`/learning/${note.topic?.subject?.slug}/${note.topic?.slug}/${note.slug}`}>
                          {note.title}
                        </Link>
                      </h3>
                      <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                        Subject: {note.topic?.subject?.name} | Topic: {note.topic?.name}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs px-2 py-1 rounded font-semibold block text-center" style={{ background: 'var(--color-primary-transparent)', color: 'var(--color-primary)' }}>
                        {note.revisionCount} revisions
                      </span>
                      <Link href={`/revision-tracker?noteId=${note.id}`} className="text-xs hover:underline mt-1.5 block" style={{ color: 'var(--color-text-muted)' }}>
                        Audit logs
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
