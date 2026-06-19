// frontend/src/app/revision-tracker/page.js
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import Card from '@/components/common/Card';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function RevisionTimeline() {
  const searchParams = useSearchParams();
  const noteId = searchParams.get('noteId');

  const [note, setNote] = useState(null);
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!noteId) return;

    async function fetchRevisions() {
      setLoading(true);
      setError('');
      try {
        // Fetch note metadata
        const noteRes = await axios.get(`${API_URL}/notes/${noteId}`);
        setNote(noteRes.data);

        // Fetch revisions
        const revRes = await axios.get(`${API_URL}/notes/${noteId}/revisions`);
        setRevisions(revRes.data);
      } catch (err) {
        console.error('Failed to load revisions:', err);
        setError('Could not load revision history. Please verify you have access.');
      } finally {
        setLoading(false);
      }
    }

    fetchRevisions();
  }, [noteId]);

  if (!noteId) {
    return (
      <Card className="text-center py-20">
        <div className="text-xl mb-4 font-mono text-zinc-500 tracking-wider">No Selection</div>
        <h2 className="text-xl font-bold mb-2" style={{ color: 'white' }}>No Note Selected</h2>
        <p className="max-w-md mx-auto mb-6" style={{ color: 'var(--color-text-muted)' }}>
          To view a note's revision history timeline, please search for a note first.
        </p>
        <Link href="/search" className="btn-primary inline-block">
          Search Notes Library
        </Link>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="loading-pulse" style={{ color: 'var(--color-text-muted)' }}>Loading timeline...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="text-center py-20">
        <div className="text-lg font-mono text-zinc-500 mb-4 tracking-wider">Warning</div>
        <p className="text-red-400 mb-6">{error}</p>
        <Link href="/search" className="btn-secondary inline-block">
          ← Back to Search
        </Link>
      </Card>
    );
  }

  return (
    <div>
      {/* Note Reference Info */}
      {note && (
        <Card className="mb-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--color-primary)' }}>
              Revision Timeline For
            </span>
            <h2 className="text-2xl font-bold mt-1 mb-2" style={{ color: 'white' }}>{note.title}</h2>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Total Revisions: <span className="text-white font-medium">{note.revisionCount || revisions.length}</span> | 
              Last Revised: <span className="text-white font-medium">{note.lastRevised ? new Date(note.lastRevised).toLocaleString() : 'N/A'}</span>
            </p>
          </div>
          <Link
            href={`/learning/${note.topic?.subject?.slug}/${note.topic?.slug}/${note.slug}`}
            className="btn-primary"
          >
            View Live Note
          </Link>
        </Card>
      )}

      {/* Revisions Vertical Timeline */}
      {revisions.length === 0 ? (
        <Card className="text-center py-12">
          <p style={{ color: 'var(--color-text-muted)' }}>No revisions logged yet for this note.</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-dim)' }}>Modifications to note sections will trigger timeline logs.</p>
        </Card>
      ) : (
        <div className="relative border-l-2 pl-6 ml-4 space-y-8" style={{ borderColor: 'var(--color-border)' }}>
          {revisions.map((rev, index) => (
            <div key={rev.id} className="relative">
              {/* Vertical timeline node indicator */}
              <div
                className="absolute left-[-31px] top-1.5 w-4.5 h-4.5 rounded-full border-2"
                style={{
                  background: index === 0 ? 'var(--color-primary)' : 'var(--color-bg-elevated)',
                  borderColor: 'var(--color-primary)'
                }}
              ></div>

              {/* Timeline card */}
              <Card>
                <div className="flex justify-between items-start flex-wrap gap-2 mb-3">
                  <div>
                    <span className="font-semibold text-white block">
                      {rev.user?.name || 'Contributor'}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
                      @{rev.user?.username || 'user'}
                    </span>
                  </div>
                  <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>
                    {new Date(rev.revisedAt).toLocaleString()}
                  </span>
                </div>

                <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {index === revisions.length - 1 ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-400">
                      Initial compilation and section layout established.
                    </span>
                  ) : (
                    <span>Note content or sections revised.</span>
                  )}
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RevisionTrackerPage() {
  return (
    <main className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <div className="relative max-w-4xl mx-auto px-6 py-12">
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-8" style={{ color: 'var(--color-text-dim)' }}>
          <Link href="/" className="hover:underline" style={{ color: 'var(--color-primary)' }}>Home</Link>
          <span>/</span>
          <span style={{ color: 'var(--color-text-muted)' }}>Revision Tracker</span>
        </nav>

        <header className="mb-10">
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'white' }}>Version History</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Audit trail of content updates and notes modifications.</p>
        </header>

        {/* Suspense Boundary for Query Params parsing */}
        <Suspense fallback={<div className="text-center py-20"><p style={{ color: 'var(--color-text-muted)' }}>Initializing timeline...</p></div>}>
          <RevisionTimeline />
        </Suspense>
      </div>
    </main>
  );
}
