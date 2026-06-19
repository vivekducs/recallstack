// frontend/src/app/my-learnings/page.js
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import useAuth from '@/hooks/useAuth';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function MyLearningsPage() {
  const { user, token, getAuthHeaders, isAuthenticated, loading: authLoading } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, DRAFT, PUBLISHED
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [noteIdToDelete, setNoteIdToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMyNotes = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`${API_URL}/notes/user/my-notes`, {
        headers: getAuthHeaders(),
      });
      setNotes(res.data);
    } catch (err) {
      console.error('Failed to load my notes:', err);
      setError('Could not load your notes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        fetchMyNotes();
      } else {
        setLoading(false);
      }
    }
  }, [authLoading, isAuthenticated, token]);

  const triggerDeleteConfirm = (e, noteId) => {
    e.preventDefault();
    e.stopPropagation();
    setNoteIdToDelete(noteId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!noteIdToDelete) return;
    setDeleting(true);
    try {
      await axios.delete(`${API_URL}/notes/${noteIdToDelete}`, {
        headers: getAuthHeaders(),
      });
      setNotes(prev => prev.filter(note => note.id !== noteIdToDelete));
      setDeleteModalOpen(false);
      setNoteIdToDelete(null);
    } catch (err) {
      console.error('Failed to delete note:', err);
      alert(err.response?.data?.error || 'Failed to delete note');
    } finally {
      setDeleting(false);
    }
  };

  const getDifficultyBadge = (difficulty) => {
    const classes = {
      EASY: 'badge-easy',
      MEDIUM: 'badge-medium',
      HARD: 'badge-hard'
    };
    return classes[difficulty] || 'badge-medium';
  };

  const filteredNotes = notes.filter(note => {
    if (activeTab === 'ALL') return true;
    return note.status === activeTab;
  });

  if (authLoading || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="loading-pulse" style={{ color: 'var(--color-text-muted)' }}>Loading your workspace...</div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-bg)' }}>
        <div className="max-w-md w-full glass-card p-8 text-center">
          <div className="text-6xl mb-4">✍️</div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: 'white' }}>Create & Manage Notes</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
            Write technical articles, design notes, and revision timelines. Sign in to access your dashboard.
          </p>
          <Link href="/login" className="btn-primary inline-block">
            Sign In to Get Started
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full opacity-[0.03]" style={{ background: 'radial-gradient(circle, #6c63f1, transparent 70%)' }}></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-6 py-12">
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-8" style={{ color: 'var(--color-text-dim)' }}>
          <Link href="/" className="hover:underline" style={{ color: 'var(--color-primary)' }}>Home</Link>
          <span>/</span>
          <span style={{ color: 'var(--color-text-muted)' }}>My Learnings</span>
        </nav>

        {/* Header Action Row */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: 'white' }}>My Workspace</h1>
            <p style={{ color: 'var(--color-text-muted)' }}>Manage your personal technical drafts and published notes.</p>
          </div>
          <Link href="/my-learnings/create" className="btn-primary inline-flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Note
          </Link>
        </header>

        {error && (
          <div className="p-4 mb-6 rounded-lg text-sm text-red-400" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            Error: {error}
          </div>
        )}

        {/* Filtering Tabs */}
        <div className="flex gap-2 mb-8 border-b pb-4" style={{ borderColor: 'var(--color-border)' }}>
          {[
            { id: 'ALL', label: 'All Notes', count: notes.length },
            { id: 'DRAFT', label: 'Drafts', count: notes.filter(n => n.status === 'DRAFT').length },
            { id: 'PUBLISHED', label: 'Published', count: notes.filter(n => n.status === 'PUBLISHED').length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-opacity-20 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
              style={{
                background: activeTab === tab.id ? 'rgba(108, 99, 241, 0.15)' : 'transparent',
                border: activeTab === tab.id ? '1px solid rgba(108, 99, 241, 0.3)' : '1px solid transparent'
              }}
            >
              {tab.label} <span className="ml-1 text-xs opacity-60">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Notes catalog */}
        {filteredNotes.length === 0 ? (
          <div className="text-center py-20 glass-card">
            <div className="text-xl mb-4 font-mono text-zinc-500 tracking-wider">Empty Workspace</div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'white' }}>No Notes Found</h2>
            <p className="max-w-md mx-auto mb-6" style={{ color: 'var(--color-text-muted)' }}>
              {activeTab === 'ALL'
                ? 'Get started by creating your very first structured technical study guide.'
                : `You don't have any notes matching the filter "${activeTab.toLowerCase()}".`}
            </p>
            {activeTab === 'ALL' && (
              <Link href="/my-learnings/create" className="btn-primary inline-block">
                Create a Note
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="glass-card p-6 flex flex-col h-full hover:bg-opacity-80 transition-all relative group"
              >
                <div className="flex-1">
                  {/* Topic + status badge */}
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="font-medium" style={{ color: 'var(--color-primary)' }}>
                      {note.topic?.subject?.name || 'Subject'} <span className="text-gray-600 mx-1">•</span> {note.topic?.name || 'Topic'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        note.status === 'PUBLISHED'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-yellow-950 text-yellow-400 border border-yellow-800'
                      }`}
                    >
                      {note.status}
                    </span>
                  </div>

                  {/* Title and Excerpt */}
                  <h3 className="text-lg font-bold mb-2 text-white line-clamp-1">{note.title}</h3>
                  <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>
                    {note.excerpt || 'No excerpt provided. Add one in settings.'}
                  </p>
                </div>

                {/* Lower Action & Meta Row */}
                <div className="flex items-center justify-between mt-4 pt-4 text-xs border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center gap-3" style={{ color: 'var(--color-text-dim)' }}>
                    <span className={`badge ${getDifficultyBadge(note.difficulty)}`}>
                      {note.difficulty}
                    </span>
                    <span>{note.readingTime || 0} min read</span>
                    {note.status === 'PUBLISHED' && (
                      <span className="flex items-center gap-1">
                        Views: {note.views || 0}
                      </span>
                    )}
                  </div>

                  {/* Editing & Deletion Action triggers */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/my-learnings/${note.id}/edit`}
                      className="p-1.5 rounded hover:bg-gray-800 text-blue-400 hover:text-blue-300 transition-colors"
                      title="Edit Note & Sections"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    {note.status === 'PUBLISHED' && (
                      <Link
                        href={`/learning/${note.topic?.subject?.slug}/${note.topic?.slug}/${note.slug}`}
                        className="p-1.5 rounded hover:bg-gray-800 text-purple-400 hover:text-purple-300 transition-colors"
                        title="View Live Note"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                    )}
                    <button
                      onClick={(e) => triggerDeleteConfirm(e, note.id)}
                      className="p-1.5 rounded hover:bg-gray-800 text-red-500 hover:text-red-400 transition-colors"
                      title="Delete Note"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          if (!deleting) {
            setDeleteModalOpen(false);
            setNoteIdToDelete(null);
          }
        }}
        title="Confirm Note Deletion"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setDeleteModalOpen(false);
                setNoteIdToDelete(null);
              }}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete Note'}
            </Button>
          </>
        }
      >
        <p>Are you sure you want to permanently delete this note? This action cannot be undone and the note will be removed from your workspace.</p>
      </Modal>
    </main>
  );
}
