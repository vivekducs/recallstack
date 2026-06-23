// frontend/src/app/user-dashboard/page.js
'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import useAuth from '@/hooks/useAuth';
import Card from '@/components/common/Card';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import Skeleton, { StatsCardSkeleton, ListRowSkeleton } from '@/components/common/Skeleton';

const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function UserDashboardPage() {
  const { user, token, getAuthHeaders } = useAuth();

  const fetcher = useCallback((url) => {
    return axios.get(url, { headers: getAuthHeaders() }).then(res => res.data);
  }, [getAuthHeaders]);

  const { data, error, isLoading } = useSWR(
    token ? `${API_URL}/analytics/dashboard` : null,
    fetcher
  );

  if (isLoading) {
    return (
      <div>
        {/* Welcome Header */}
        <header className="mb-8 border-b border-[var(--color-border)] pb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Skeleton variant="rect" width="220px" height="32px" className="mb-2" />
            <Skeleton variant="text" width="340px" />
          </div>
          <div className="flex gap-3">
            <Skeleton variant="rect" width="120px" height="38px" />
          </div>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </section>

        {/* Analytics Chart */}
        <div className="border border-black/[0.05] dark:border-white/[0.05] rounded-2xl p-5 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-xl mb-8">
          <Skeleton variant="rect" width="180px" height="20px" className="mb-6" />
          <Skeleton variant="rect" height="300px" />
        </div>

        {/* Detail lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="border border-black/[0.05] dark:border-white/[0.05] rounded-2xl p-5 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-xl">
            <Skeleton variant="rect" width="140px" height="20px" className="mb-6" />
            <div className="space-y-4">
              <ListRowSkeleton />
              <ListRowSkeleton />
              <ListRowSkeleton />
            </div>
          </div>
          <div className="border border-black/[0.05] dark:border-white/[0.05] rounded-2xl p-5 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-xl">
            <Skeleton variant="rect" width="140px" height="20px" className="mb-6" />
            <div className="space-y-4">
              <ListRowSkeleton />
              <ListRowSkeleton />
              <ListRowSkeleton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { summary, mostRevised = [], topNotes = [], dailyViews = [], timeline = [] } = data || {};
  const displayError = error ? 'Could not load dashboard statistics. Please refresh the page.' : '';

  return (
    <div>
      {/* Welcome Header */}
      <header className="mb-8 border-b border-[var(--color-border)] pb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
            Welcome back, {user?.name || 'Developer'}
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Here is an overview of your knowledge repository and learning timeline.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/user-dashboard/create" className="btn-primary">
            Write New Note
          </Link>
        </div>
      </header>

      {displayError && (
        <div className="p-4 mb-6 rounded text-sm text-[var(--color-error)] bg-[var(--color-error)]/10 border border-[var(--color-error)]/20">
          {displayError}
        </div>
      )}

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-secondary)]">Notes Created</span>
          <div className="text-3xl font-bold mt-2 mb-1 text-[var(--color-text-primary)]">{summary?.totalNotes || 0}</div>
          <p className="text-xs text-[var(--color-text-secondary)]">
            {summary?.publishedNotes || 0} published / {summary?.draftNotes || 0} drafts
          </p>
        </Card>

        <Card>
          <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-secondary)]">Total Views</span>
          <div className="text-3xl font-bold mt-2 mb-1 text-[var(--color-text-primary)]">{summary?.totalViews || 0}</div>
          <p className="text-xs text-[var(--color-text-secondary)]">Across published sections</p>
        </Card>

        <Card>
          <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-secondary)]">Helpful Clicks</span>
          <div className="text-3xl font-bold mt-2 mb-1 text-[var(--color-text-primary)]">{summary?.totalHelpful || 0}</div>
          <p className="text-xs text-[var(--color-text-secondary)]">Ratings received from readers</p>
        </Card>

        <Card>
          <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-secondary)]">Total Read Time</span>
          <div className="text-3xl font-bold mt-2 mb-1 text-[var(--color-text-primary)]">{summary?.totalReadingTime || 0} min</div>
          <p className="text-xs text-[var(--color-text-secondary)]">Estimated content consumption</p>
        </Card>
      </section>

      {/* Analytics Chart */}
      <Card className="mb-8">
        <h2 className="text-lg font-bold mb-6 text-[var(--color-text-primary)]">Views Over Time (Last 30 Days)</h2>
        {dailyViews.length === 0 ? (
          <p className="text-sm text-center py-16 text-[var(--color-text-secondary)]">
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

      {/* Detail lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Column 1: Learning activity timeline */}
        <Card>
          <h2 className="text-lg font-bold mb-6 text-[var(--color-text-primary)]">Learning Timeline</h2>
          {timeline.length === 0 ? (
            <p className="text-sm text-center py-8 text-[var(--color-text-secondary)]">
              No activity logged yet. Revisions, note creations, and comments will populate here.
            </p>
          ) : (
            <div className="space-y-6 relative border-l pl-4" style={{ borderColor: 'var(--color-border)' }}>
              {timeline.map((event) => (
                <div key={event.id} className="relative">
                  <div>
                    <p className="text-sm text-[var(--color-text-primary)] font-medium">{event.description}</p>
                    <span className="text-xs mt-1 block text-[var(--color-text-secondary)]/70">
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
          <h2 className="text-lg font-bold mb-6 text-[var(--color-text-primary)]">Most Revised Notes</h2>
          {mostRevised.length === 0 ? (
            <p className="text-sm text-center py-8 text-[var(--color-text-secondary)]">
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
                    <p className="text-xs mt-1 text-[var(--color-text-secondary)]">
                      Subject: {note.topic?.subject?.name} | Topic: {note.topic?.name}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs px-2 py-1 rounded font-semibold block text-center" style={{ background: 'rgba(96, 165, 250, 0.1)', color: 'var(--color-primary)' }}>
                      {note.revisionCount} revisions
                    </span>
                    <Link href={`/revision-tracker?noteId=${note.id}`} className="text-xs hover:underline mt-1.5 block text-[var(--color-text-secondary)]">
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
      <Card>
        <h2 className="text-lg font-bold mb-6 text-[var(--color-text-primary)]">Top Performing Notes</h2>
        {topNotes.length === 0 ? (
          <p className="text-sm text-center py-8 text-[var(--color-text-secondary)]">
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
                  <p className="text-xs mt-1 text-[var(--color-text-secondary)]">
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
  );
}
