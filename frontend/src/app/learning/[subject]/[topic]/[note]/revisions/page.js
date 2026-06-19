// frontend/src/app/learning/[subject]/[topic]/[note]/revisions/page.js
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Breadcrumb from '@/components/common/Breadcrumb';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function RevisionsPage() {
  const params = useParams();
  const router = useRouter();
  const { subject, topic, note } = params;

  const [noteData, setNoteData] = useState(null);
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSnapshot, setSelectedSnapshot] = useState(null);
  const [restoring, setRestoring] = useState(false);

  // First fetch the note ID using the slug
  useEffect(() => {
    async function init() {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // 1. Fetch note
        const noteRes = await axios.get(`${API_URL}/notes/${note}`, { headers });
        setNoteData(noteRes.data);

        // 2. Fetch revisions
        const revRes = await axios.get(`${API_URL}/notes/${noteRes.data.id}/revisions`, { headers });
        setRevisions(revRes.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || 'Failed to load revisions');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [note]);

  const fetchSnapshot = async (revisionId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${API_URL}/notes/${noteData.id}/revisions/${revisionId}`, { headers });
      
      if (!res.data.snapshot) {
        alert('No snapshot data is available for this revision.');
      } else {
        setSelectedSnapshot({ ...res.data, sections: res.data.snapshot });
      }
    } catch (err) {
      console.error(err);
      alert('Failed to load snapshot');
    }
  };

  const handleRestore = async () => {
    if (!selectedSnapshot) return;
    
    if (!confirm('Are you sure you want to restore this version? All current content will be replaced.')) {
      return;
    }

    setRestoring(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.post(`${API_URL}/notes/${noteData.id}/revisions/${selectedSnapshot.id}/restore`, {}, { headers });
      
      alert('Note successfully restored!');
      router.push(`/learning/${subject}/${topic}/${note}`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to restore note');
      setRestoring(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 min-h-[300px]">
        <div className="w-[20px] h-[20px] border-2 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin"></div>
        <span className="text-xs font-mono text-[var(--color-text-secondary)] mt-3">Loading history...</span>
      </div>
    );
  }

  if (error || !noteData) {
    return (
      <Card variant="standard" className="text-center py-16">
        <h3 className="text-[18px] font-semibold text-[var(--color-text-primary)] mb-1">Error</h3>
        <p className="text-sm text-[var(--color-text-secondary)]">{error}</p>
      </Card>
    );
  }

  return (
    <div className="w-full">
      <Breadcrumb 
        items={[
          { name: 'Home', href: '/' },
          { name: noteData.topic?.subject?.name || subject, href: `/learning/${subject}` },
          { name: noteData.topic?.name || topic, href: `/learning/${subject}/${topic}` },
          { name: noteData.title, href: `/learning/${subject}/${topic}/${note}` },
          { name: 'Revision History' }
        ]} 
        className="mb-8"
      />

      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">Revision History</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">View and restore previous versions of: <strong className="text-[var(--color-text-primary)]">{noteData.title}</strong></p>
        </div>
        <Link href={`/learning/${subject}/${topic}/${note}`}>
          <Button variant="secondary">Back to Note</Button>
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Timeline Panel */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Timeline</h2>
          
          {revisions.length === 0 ? (
            <p className="text-sm text-[var(--color-text-secondary)]">No previous revisions found.</p>
          ) : (
            <div className="flex flex-col gap-3 relative before:absolute before:inset-y-0 before:left-[11px] before:w-px before:bg-[var(--color-border)]">
              {revisions.map((rev) => {
                const isSelected = selectedSnapshot?.id === rev.id;
                return (
                  <div key={rev.id} className="relative pl-8">
                    {/* Timeline dot */}
                    <div className={`absolute left-0 top-3 w-[23px] h-[23px] rounded-full border-4 border-[var(--color-bg-primary)] ${isSelected ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'}`}></div>
                    
                    <Card 
                      variant="standard" 
                      className={`cursor-pointer transition-colors p-4 ${isSelected ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'hover:border-[var(--color-border-hover)]'}`}
                      onClick={() => fetchSnapshot(rev.id)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {rev.user?.avatar ? (
                          <img src={rev.user.avatar} alt={rev.user.name} className="w-5 h-5 rounded-full" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] flex items-center justify-center text-[10px] font-bold">
                            {rev.user?.name?.charAt(0) || '?'}
                          </div>
                        )}
                        <span className="text-sm font-medium text-[var(--color-text-primary)]">
                          {rev.user?.name || 'Unknown User'}
                        </span>
                      </div>
                      <div className="text-xs text-[var(--color-text-secondary)]">
                        {new Date(rev.revisedAt).toLocaleString()}
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Snapshot Viewer Panel */}
        <div className="lg:col-span-2">
          {selectedSnapshot ? (
            <Card variant="standard" className="sticky top-4">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Snapshot Preview</h3>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Saved on {new Date(selectedSnapshot.revisedAt).toLocaleString()}
                  </p>
                </div>
                <Button 
                  variant="primary" 
                  onClick={handleRestore}
                  disabled={restoring}
                >
                  {restoring ? 'Restoring...' : 'Restore This Version'}
                </Button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-6">
                {(!selectedSnapshot.sections || selectedSnapshot.sections.length === 0) ? (
                  <p className="text-sm text-[var(--color-text-secondary)] italic">This snapshot contains no sections.</p>
                ) : (
                  selectedSnapshot.sections.map((section, idx) => (
                    <div key={idx} className="border border-[var(--color-border)] rounded-md p-4 bg-[var(--color-bg-secondary)]">
                      <h4 className="font-semibold text-[var(--color-text-primary)] mb-2">{section.title}</h4>
                      <Badge variant="default" className="mb-3 inline-block">{section.contentType}</Badge>
                      
                      {section.contentType === 'CODE' ? (
                        <pre className="text-xs font-mono bg-[#1E1E1E] text-[#D4D4D4] p-3 rounded overflow-x-auto">
                          <code>{section.content}</code>
                        </pre>
                      ) : (
                        <div className="text-sm text-[var(--color-text-primary)] whitespace-pre-wrap">
                          {section.content}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>
          ) : (
            <Card variant="standard" className="h-full flex flex-col items-center justify-center py-20 text-[var(--color-text-secondary)]">
              <svg className="w-12 h-12 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>Select a revision from the timeline to view its snapshot.</p>
            </Card>
          )}
        </div>

      </div>
    </div>
  );
}
