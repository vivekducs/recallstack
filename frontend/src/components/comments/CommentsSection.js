// frontend/src/components/comments/CommentsSection.js
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import useAuth from '@/hooks/useAuth';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function CommentsSection({ noteId, noteAuthorId }) {
  const { user, token, getAuthHeaders, isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyToId, setReplyToId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [commentIdToDelete, setCommentIdToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch comments tree
  const fetchComments = async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${API_URL}/notes/${noteId}/comments`, { headers });
      setComments(res.data);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [noteId, token]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    try {
      setError('');
      const res = await axios.post(
        `${API_URL}/notes/${noteId}/comments`,
        { content: newCommentText },
        { headers: getAuthHeaders() }
      );
      setNewCommentText('');
      fetchComments(); // Reload tree
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post comment');
    }
  };

  const handlePostReply = async (e, parentId) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      setError('');
      await axios.post(
        `${API_URL}/notes/${noteId}/comments`,
        { content: replyText, parentId },
        { headers: getAuthHeaders() }
      );
      setReplyText('');
      setReplyToId(null);
      fetchComments();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post reply');
    }
  };

  const triggerDeleteComment = (commentId) => {
    setCommentIdToDelete(commentId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDeleteComment = async () => {
    if (!commentIdToDelete) return;
    setDeleting(true);
    try {
      await axios.delete(`${API_URL}/comments/${commentIdToDelete}`, { headers: getAuthHeaders() });
      setDeleteModalOpen(false);
      setCommentIdToDelete(null);
      fetchComments();
    } catch (err) {
      console.error('Failed to delete comment:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (commentId, status) => {
    try {
      await axios.patch(
        `${API_URL}/comments/${commentId}/status`,
        { status },
        { headers: getAuthHeaders() }
      );
      fetchComments();
    } catch (err) {
      console.error('Failed to update comment status:', err);
    }
  };

  const renderComment = (comment, depth = 0) => {
    const isNoteAuthor = user?.id === noteAuthorId;
    const isAdmin = user?.role === 'ADMIN';
    const isCommentOwner = user?.id === comment.userId;
    const canModerate = isNoteAuthor || isAdmin;

    return (
      <div
        key={comment.id}
        className="mb-4 p-4 rounded-xl flex flex-col gap-2"
        style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          marginLeft: `${Math.min(depth * 24, 96)}px`
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-start flex-wrap gap-2 text-xs">
          <div>
            <span className="font-semibold text-white block">
              {comment.user?.name || 'Contributor'}
            </span>
            <span style={{ color: 'var(--color-text-dim)' }}>
              @{comment.user?.username || 'user'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {comment.status === 'PENDING' && (
              <span className="px-2 py-0.5 rounded text-[10px] bg-yellow-950 text-yellow-400 border border-yellow-800">
                Pending Approval
              </span>
            )}
            <span style={{ color: 'var(--color-text-dim)' }}>
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Content */}
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
          {comment.content}
        </p>

        {/* Actions bar */}
        <div className="flex gap-4 text-xs items-center mt-1">
          {isAuthenticated && (
            <button
              onClick={() => {
                setReplyToId(comment.id);
                setReplyText('');
              }}
              style={{ color: 'var(--color-primary)' }}
              className="hover:underline font-medium"
            >
              Reply
            </button>
          )}

          {canModerate && comment.status === 'PENDING' && (
            <>
              <button
                onClick={() => handleToggleStatus(comment.id, 'APPROVED')}
                className="text-emerald-400 hover:underline font-medium"
              >
                Approve
              </button>
              <button
                onClick={() => handleToggleStatus(comment.id, 'REJECTED')}
                className="text-red-400 hover:underline font-medium"
              >
                Reject
              </button>
            </>
          )}

          {(isCommentOwner || canModerate) && (
            <button
              onClick={() => triggerDeleteComment(comment.id)}
              className="text-red-500 hover:underline"
            >
              Delete
            </button>
          )}
        </div>

        {/* Inline Reply Input Box */}
        {replyToId === comment.id && (
          <form
            onSubmit={(e) => handlePostReply(e, comment.id)}
            className="mt-3 flex gap-2"
          >
            <input
              type="text"
              placeholder="Write a reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-lg text-sm text-white outline-none"
              style={{
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)'
              }}
            />
            <button type="submit" className="btn-primary text-xs py-1 px-4">
              Post
            </button>
            <button
              type="button"
              onClick={() => setReplyToId(null)}
              className="btn-secondary text-xs py-1 px-3"
            >
              Cancel
            </button>
          </form>
        )}

        {/* Recursively Render Child Replies */}
        {comment.replies && comment.replies.map(reply => renderComment(reply, depth + 1))}
      </div>
    );
  };

  return (
    <section className="mt-16" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '2.5rem' }}>
      <h3 className="text-2xl font-bold mb-6" style={{ color: 'white' }}>
        Discussion
      </h3>

      {error && (
        <div className="p-4 mb-4 rounded-lg text-sm text-red-400" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Main Comment Box */}
      {isAuthenticated ? (
        <form onSubmit={handlePostComment} className="flex gap-4 mb-8">
          <textarea
            placeholder="What are your thoughts or questions?..."
            rows={3}
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            className="flex-1 p-4 rounded-xl text-white outline-none resize-none transition-all"
            style={{
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)'
            }}
          />
          <button type="submit" className="btn-primary self-end py-3 px-6">
            Post Comment
          </button>
        </form>
      ) : (
        <div className="glass-card p-6 mb-8 text-center">
          <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
            Join the discussion! Sign in to leave comments and ask questions.
          </p>
          <Link href="/login" className="btn-primary inline-block text-sm">
            Sign In to Comment
          </Link>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div style={{ color: 'var(--color-text-muted)' }} className="loading-pulse">
          Loading discussion...
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-center py-6" style={{ color: 'var(--color-text-dim)' }}>
          No comments yet. Be the first to start the discussion!
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => renderComment(comment, 0))}
        </div>
      )}

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          if (!deleting) {
            setDeleteModalOpen(false);
            setCommentIdToDelete(null);
          }
        }}
        title="Delete Comment"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setDeleteModalOpen(false);
                setCommentIdToDelete(null);
              }}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDeleteComment}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete this comment? This action cannot be undone.</p>
      </Modal>
    </section>
  );
}
