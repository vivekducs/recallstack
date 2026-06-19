// frontend/src/app/dashboard/page.js
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import useAuth from '@/hooks/useAuth';
import Card from '@/components/common/Card';
import dynamic from 'next/dynamic';

const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });

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
          <h2 className="text-2xl font-bold mb-3 text-[var(--color-text-primary)]">Dashboard Access Required</h2>
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

  const { summary, mostRevised = [], topNotes = [], dailyViews = [], timeline = [] } = data || {};

  return (
    <main className="min-h-screen py-12" style={{ background: 'var(--color-bg)' }}>
      {/* Ambient glow decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full opacity-[0.03]" style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)' }}></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 md:px-6">
        {/* Welcome Header */}
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-[var(--color-text-primary)]">
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
          <Card>
            <span className="text-xs uppercase tracking-wider font-semibold animate-fade-in" style={{ color: 'var(--color-text-dim)' }}>Notes Created</span>
            <div className="text-3xl font-bold mt-2 mb-1 text-[var(--color-text-primary)]">{summary?.totalNotes || 0}</div>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {summary?.publishedNotes || 0} published / {summary?.draftNotes || 0} drafts
            </p>
          </Card>

          <Card>
            <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-dim)' }}>Total Views</span>
            <div className="text-3xl font-bold mt-2 mb-1 text-[var(--color-text-primary)]">{summary?.totalViews || 0}</div>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Across all published sections</p>
          </Card>

          <Card>
            <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-dim)' }}>Helpful Clicks</span>
            <div className="text-3xl font-bold mt-2 mb-1 text-[var(--color-text-primary)]">{summary?.totalHelpful || 0}</div>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Positive feedback ratings received</p>
          </Card>

          <Card>
            <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-dim)' }}>Total Read Time</span>
            <div className="text-3xl font-bold mt-2 mb-1 text-[var(--color-text-primary)]">{summary?.totalReadingTime || 0} min</div>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Estimated consumption time</p>
          </Card>
        </section>

        {/* Action Panel Links */}
        <Card className="mb-10">
          <h2 className="text-lg font-bold mb-4 text-[var(--color-text-primary)]">Quick Navigation</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/search" className="p-4 text-center rounded border transition hover:border-[var(--color-primary)] bg-[var(--color-bg)] border-[var(--color-border)]">
              <span className="block font-semibold text-sm text-[var(--color-text-primary)]">Search Library</span>
              <span className="text-xs mt-1 block" style={{ color: 'var(--color-text-dim)' }}>Browse catalog</span>
            </Link>
            <Link href="/bookmarks" className="p-4 text-center rounded border transition hover:border-[var(--color-primary)] bg-[var(--color-bg)] border-[var(--color-border)]">
              <span className="block font-semibold text-sm text-[var(--color-text-primary)]">Bookmarks</span>
              <span className="text-xs mt-1 block" style={{ color: 'var(--color-text-dim)' }}>Saved notes ({summary?.bookmarksCount || 0})</span>
            </Link>
            <Link href="/dashboard/analytics" className="p-4 text-center rounded border transition hover:border-[var(--color-primary)] bg-[var(--color-bg)] border-[var(--color-border)]">
              <span className="block font-semibold text-sm text-[var(--color-text-primary)]">Detailed Stats</span>
              <span className="text-xs mt-1 block" style={{ color: 'var(--color-text-dim)' }}>View statistics</span>
            </Link>
            <Link href="/my-learnings" className="p-4 text-center rounded border transition hover:border-[var(--color-primary)] bg-[var(--color-bg)] border-[var(--color-border)]">
              <span className="block font-semibold text-sm text-[var(--color-text-primary)]">Creator Space</span>
              <span className="text-xs mt-1 block" style={{ color: 'var(--color-text-dim)' }}>Manage articles</span>
            </Link>
          </div>
        </Card>

        {/* Analytics Chart */}
        <Card className="mb-10">
          <h2 className="text-xl font-bold mb-6 text-[var(--color-text-primary)]">Views Over Time (Last 30 Days)</h2>
          {dailyViews.length === 0 ? (
            <p className="text-sm text-center py-16" style={{ color: 'var(--color-text-muted)' }}>
              No views recorded in the last 30 days. Share your published notes to start collecting analytics!
            </p>
          ) : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyViews} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="date" stroke="#666" tick={{ fill: '#888', fontSize: 12 }} tickMargin={10} minTickGap={30} />
                  <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 12 }} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--color-primary)' }}
                    labelStyle={{ color: 'var(--color-text-muted)', marginBottom: '5px' }}
                  />
                  <Line type="monotone" dataKey="views" name="Views" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--color-bg)', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Multi-column Detail lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Column 1: Learning activity timeline */}
          <Card>
            <h2 className="text-xl font-bold mb-6 text-[var(--color-text-primary)]">Learning Timeline</h2>
            {timeline.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
                No activity logged yet. Revisions, note creations, and comments will populate here.
              </p>
            ) : (
              <div className="space-y-6 relative border-l pl-4" style={{ borderColor: 'var(--color-border)' }}>
                {timeline.map((event) => (
                  <div key={event.id} className="relative">
                    <div>
                      <p className="text-sm text-[var(--color-text-primary)] font-medium">{event.description}</p>
                      <span className="text-xs mt-1 block" style={{ color: 'var(--color-text-dim)' }}>
                        {new Date(event.date).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Column 2: Most Revised Notes */}
          <Card>
            <h2 className="text-xl font-bold mb-6 text-[var(--color-text-primary)]">Most Revised Notes</h2>
            {mostRevised.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
                No notes found in your repository workspace.
              </p>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {mostRevised.map((note) => (
                  <div key={note.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-[var(--color-text-primary)] hover:underline">
                        <Link href={`/learning/${note.topic?.subject?.slug}/${note.topic?.slug}/${note.slug}`}>
                          {note.title}
                        </Link>
                      </h3>
                      <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                        Subject: {note.topic?.subject?.name} | Topic: {note.topic?.name}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs px-2 py-1 rounded font-semibold block text-center" style={{ background: 'rgba(96, 165, 250, 0.1)', color: 'var(--color-primary)' }}>
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
          </Card>
        </div>
        
        {/* Top Performing Notes Row */}
        <div className="mt-8">
          <Card>
            <h2 className="text-xl font-bold mb-6 text-[var(--color-text-primary)]">Top Performing Notes</h2>
            {topNotes.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
                You have no published notes yet.
              </p>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {topNotes.map((note) => (
                  <div key={note.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-[var(--color-text-primary)] hover:underline">
                        <Link href={`/learning/${note.topic?.subject?.slug}/${note.topic?.slug}/${note.slug}`}>
                          {note.title}
                        </Link>
                      </h3>
                      <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                        Subject: {note.topic?.subject?.slug} | Views: {note.views} | Helpful: {note.helpfulCount}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs px-2 py-1 rounded font-semibold block text-center" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                        #{topNotes.indexOf(note) + 1} Best
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </main>
  );
}
