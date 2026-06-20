// frontend/src/app/admin/analytics/page.js
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '@/hooks/useAuth';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AnalyticsDashboard() {
  const { token, getAuthHeaders } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_URL}/admin/analytics`, {
        headers: getAuthHeaders()
      });
      setStats(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch system-wide analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="p-8 text-center animate-pulse text-[var(--color-text-secondary)]">
        Loading system analytics...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded text-sm text-[var(--color-error)] bg-[var(--color-error)]/10 border border-[var(--color-error)]/20">
        {error}
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8 border-b border-[var(--color-border)] pb-6">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">System Analytics</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Review database records growth, user registration activity, and engagement rates.
        </p>
      </header>

      {/* Stats Counters Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-secondary)]">Total Users</span>
          <div className="text-3xl font-bold mt-2 mb-1 text-[var(--color-text-primary)]">{stats?.totalUsers || 0}</div>
          <p className="text-xs text-[var(--color-text-secondary)]">
            {stats?.activeUsers || 0} active users this week
          </p>
        </Card>

        <Card>
          <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-secondary)]">Total Notes</span>
          <div className="text-3xl font-bold mt-2 mb-1 text-[var(--color-text-primary)]">{stats?.totalNotes || 0}</div>
          <p className="text-xs text-[var(--color-text-secondary)]">
            {stats?.publishedNotes || 0} published / {stats?.draftNotes || 0} drafts
          </p>
        </Card>

        <Card>
          <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-secondary)]">Total Comments</span>
          <div className="text-3xl font-bold mt-2 mb-1 text-[var(--color-text-primary)]">{stats?.totalComments || 0}</div>
          <p className="text-xs text-[var(--color-text-secondary)]">Submitted by platform readers</p>
        </Card>

        <Card>
          <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-secondary)]">Avg Notes / User</span>
          <div className="text-3xl font-bold mt-2 mb-1 text-[var(--color-text-primary)]">{stats?.averageNotesPerUser || 0}</div>
          <p className="text-xs text-[var(--color-text-secondary)]">Production rate metric</p>
        </Card>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Content Production breakdown card */}
        <Card>
          <h3 className="text-[18px] font-semibold text-[var(--color-text-primary)] mb-4 border-b border-[var(--color-border)] pb-3">
            Notes Production Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--color-text-secondary)]">Published Notes</span>
              <Badge variant="SUCCESS">{stats?.publishedNotes || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--color-text-secondary)]">Draft Notes</span>
              <Badge variant="DEFAULT">{stats?.draftNotes || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--color-text-secondary)]">Archived Notes</span>
              <Badge variant="DANGER">{stats?.archivedNotes || 0}</Badge>
            </div>
            <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
              <span>Total Bookmarked Notes</span>
              <span>{stats?.totalBookmarks || 0} saves</span>
            </div>
          </div>
        </Card>

        {/* Top Authors card */}
        <Card>
          <h3 className="text-[18px] font-semibold text-[var(--color-text-primary)] mb-4 border-b border-[var(--color-border)] pb-3">
            Top 5 Most Active Authors
          </h3>
          {stats?.topAuthors?.length === 0 ? (
            <p className="text-sm text-[var(--color-text-secondary)] italic">No notes created yet.</p>
          ) : (
            <div className="divide-y divide-[var(--color-border)]">
              {stats?.topAuthors?.map((author, index) => (
                <div key={author.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                  <div>
                    <span className="font-semibold text-sm text-[var(--color-text-primary)]">
                      {index + 1}. {author.name}
                    </span>
                    <span className="text-xs text-[var(--color-text-secondary)] block">
                      @{author.username} ({author.email})
                    </span>
                  </div>
                  <Badge variant="SUCCESS">
                    {author.noteCount} notes
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
