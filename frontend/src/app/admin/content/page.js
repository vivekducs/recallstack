// frontend/src/app/admin/content/page.js
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '@/hooks/useAuth';
import Card from '@/components/common/Card';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import Table from '@/components/common/Table';
import Badge from '@/components/common/Badge';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ContentManagementPage() {
  const { getAuthHeaders } = useAuth();
  const [notes, setNotes] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchNotes = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_URL}/admin/notes`, {
        params: { page, limit: 10, search, status },
        headers: getAuthHeaders()
      });
      setNotes(res.data.notes);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch library notes content.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [page, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchNotes();
  };

  const handleUnpublish = async (id, title) => {
    if (!window.confirm(`Are you sure you want to unpublish "${title}"? It will be reverted to draft status and hidden from the public library.`)) {
      return;
    }
    setError(''); setSuccess('');
    try {
      await axios.patch(`${API_URL}/admin/notes/${id}/unpublish`, {}, {
        headers: getAuthHeaders()
      });
      setSuccess(`"${title}" has been unpublished.`);
      fetchNotes();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to unpublish note.');
    }
  };

  const handleDeleteNote = async (id, title) => {
    if (!window.confirm(`Are you absolutely sure you want to delete note "${title}" permanently? This action cannot be undone.`)) {
      return;
    }
    setError(''); setSuccess('');
    try {
      await axios.delete(`${API_URL}/admin/notes/${id}`, {
        headers: getAuthHeaders()
      });
      setSuccess(`"${title}" has been permanently deleted.`);
      fetchNotes();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete note.');
    }
  };

  const tableHeaders = [
    { key: 'title', label: 'Note Title' },
    { key: 'author', label: 'Author' },
    { key: 'topic', label: 'Topic & Subject' },
    { key: 'status', label: 'Status' },
    { key: 'views', label: 'Views' },
    { key: 'actions', label: 'Actions', align: 'right' }
  ];

  const getStatusBadgeVariant = (s) => {
    if (s === 'PUBLISHED') return 'SUCCESS';
    if (s === 'DRAFT') return 'DEFAULT';
    return 'DANGER';
  };

  const renderCell = (row, key) => {
    if (key === 'title') {
      return (
        <div>
          <span className="font-semibold block text-sm text-[var(--color-text-primary)]">{row.title}</span>
          <span className="text-[10px] text-[var(--color-text-secondary)] font-mono">{row.id}</span>
        </div>
      );
    }
    if (key === 'author') return row.author ? row.author.name : 'Unknown';
    if (key === 'topic') {
      return (
        <div>
          <span className="block text-xs font-medium text-[var(--color-text-primary)]">{row.topic?.name}</span>
          <span className="text-[10px] text-[var(--color-text-secondary)] uppercase">{row.topic?.subject?.name}</span>
        </div>
      );
    }
    if (key === 'status') {
      return (
        <Badge variant={getStatusBadgeVariant(row.status)}>
          {row.status}
        </Badge>
      );
    }
    if (key === 'views') return row.views || 0;
    if (key === 'actions') {
      const subjectSlug = row.topic?.subject?.slug;
      const topicSlug = row.topic?.slug;
      const noteSlug = row.slug;
      
      return (
        <div className="flex gap-2 justify-end">
          {row.status === 'PUBLISHED' && subjectSlug && topicSlug && (
            <Link 
              href={`/learning/${subjectSlug}/${topicSlug}/${noteSlug}`}
              className="bg-[var(--color-bg-secondary)] hover:bg-[var(--color-border)] text-[var(--color-text-primary)] text-xs px-2.5 py-1 rounded transition-colors font-medium border border-[var(--color-border)]"
            >
              View
            </Link>
          )}
          {row.status === 'PUBLISHED' && (
            <Button
              variant="secondary"
              className="text-xs px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500 text-amber-600 hover:text-white border border-amber-500/20"
              onClick={() => handleUnpublish(row.id, row.title)}
            >
              Unpublish
            </Button>
          )}
          <Button
            variant="secondary"
            className="text-xs px-2.5 py-1 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20"
            onClick={() => handleDeleteNote(row.id, row.title)}
          >
            Delete
          </Button>
        </div>
      );
    }
    return row[key];
  };

  return (
    <div>
      <header className="mb-8 border-b border-[var(--color-border)] pb-6">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Manage Content</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Review, publish/unpublish, and moderate learning notes across the entire platform.
        </p>
      </header>

      {error && (
        <div className="p-4 mb-6 rounded text-sm text-[var(--color-error)] bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 animate-fade-in">
          ⚠️ {error}
        </div>
      )}
      
      {success && (
        <div className="p-4 mb-6 rounded text-sm text-[var(--color-success)] bg-[var(--color-success)]/10 border border-[var(--color-success)]/20 animate-fade-in">
          ✅ {success}
        </div>
      )}

      {/* Filters Header */}
      <Card variant="standard" className="mb-6">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <Input
              id="content-search"
              placeholder="Search by title, excerpt, or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="w-full md:w-48">
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">
              Status Filter
            </label>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="w-full h-[38px] bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded px-3 text-xs text-[var(--color-text-primary)] outline-none"
            >
              <option value="">All Statuses</option>
              <option value="PUBLISHED">Published Only</option>
              <option value="DRAFT">Drafts Only</option>
              <option value="ARCHIVED">Archived Only</option>
            </select>
          </div>
          <Button type="submit" variant="primary" className="px-6 h-[38px]">
            Search
          </Button>
        </form>
      </Card>

      {/* Content Table */}
      <Card variant="standard" className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center animate-pulse text-[var(--color-text-secondary)]">
            Loading library notes content...
          </div>
        ) : (
          <>
            <Table 
              headers={tableHeaders} 
              data={notes} 
              renderCell={renderCell}
            />

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-[var(--color-border)] flex items-center justify-between bg-[var(--color-bg-secondary)]/50">
                <span className="text-xs text-[var(--color-text-secondary)]">
                  Showing Page {page} of {totalPages} ({total} total notes)
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="text-xs px-3 py-1.5"
                    disabled={page === 1}
                    onClick={() => setPage(prev => prev - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    className="text-xs px-3 py-1.5"
                    disabled={page === totalPages}
                    onClick={() => setPage(prev => prev + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
