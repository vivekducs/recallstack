// frontend/src/app/admin/moderation/page.js
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '@/hooks/useAuth';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Table from '@/components/common/Table';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ModerationPage() {
  const { getAuthHeaders } = useAuth();
  const [comments, setComments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchComments = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_URL}/admin/comments`, {
        params: { page, limit: 10, status: 'PENDING' },
        headers: getAuthHeaders()
      });
      setComments(res.data.comments);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch pending comments list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [page]);

  const handleApprove = async (id) => {
    setError(''); setSuccess('');
    try {
      await axios.patch(`${API_URL}/admin/comments/${id}/approve`, {}, {
        headers: getAuthHeaders()
      });
      setSuccess('Comment has been approved and published.');
      fetchComments();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to approve comment.');
    }
  };

  const handleReject = async (id) => {
    setError(''); setSuccess('');
    try {
      await axios.patch(`${API_URL}/admin/comments/${id}/reject`, {}, {
        headers: getAuthHeaders()
      });
      setSuccess('Comment has been marked as rejected.');
      fetchComments();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reject comment.');
    }
  };

  const handleDeleteComment = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this comment?')) {
      return;
    }
    setError(''); setSuccess('');
    try {
      await axios.delete(`${API_URL}/admin/comments/${id}`, {
        headers: getAuthHeaders()
      });
      setSuccess('Comment has been permanently deleted.');
      fetchComments();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete comment.');
    }
  };

  const tableHeaders = [
    { key: 'author', label: 'Commenter' },
    { key: 'content', label: 'Comment Content' },
    { key: 'note', label: 'Target Note' },
    { key: 'date', label: 'Submitted' },
    { key: 'actions', label: 'Actions', align: 'right' }
  ];

  const renderCell = (row, key) => {
    if (key === 'author') return <span className="font-semibold">{row.user?.name} (@{row.user?.username})</span>;
    if (key === 'content') return <span className="italic">"{row.content}"</span>;
    if (key === 'note') return <span className="font-semibold text-xs">{row.note?.title}</span>;
    if (key === 'date') return new Date(row.createdAt).toLocaleString();
    if (key === 'actions') {
      return (
        <div className="flex gap-2 justify-end">
          <Button
            variant="secondary"
            className="text-xs px-2.5 py-1 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white border border-green-500/20"
            onClick={() => handleApprove(row.id)}
          >
            Approve
          </Button>
          <Button
            variant="secondary"
            className="text-xs px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500 text-amber-600 hover:text-white border border-amber-500/20"
            onClick={() => handleReject(row.id)}
          >
            Reject
          </Button>
          <Button
            variant="secondary"
            className="text-xs px-2.5 py-1 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20"
            onClick={() => handleDeleteComment(row.id)}
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
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Comment Moderation</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Review, approve, or reject comments flagged as pending across note guides.
        </p>
      </header>

      {error && (
        <div className="p-4 mb-6 rounded text-sm text-[var(--color-error)] bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 animate-fade-in">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-4 mb-6 rounded text-sm text-[var(--color-success)] bg-[var(--color-success)]/10 border border-[var(--color-success)]/20 animate-fade-in">
          {success}
        </div>
      )}

      {/* Pending Comments Table */}
      <Card variant="standard" className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center animate-pulse text-[var(--color-text-secondary)]">
            Loading pending comments queue...
          </div>
        ) : (
          <>
            <Table 
              headers={tableHeaders} 
              data={comments} 
              renderCell={renderCell}
            />

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-[var(--color-border)] flex items-center justify-between bg-[var(--color-bg-secondary)]/50">
                <span className="text-xs text-[var(--color-text-secondary)]">
                  Showing Page {page} of {totalPages} ({total} pending comments)
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
