// frontend/src/components/comments/CommentsSection.js
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import useAuth from '@/hooks/useAuth';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Input from '@/components/common/Input';
import Badge from '@/components/common/Badge';

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
      <Card
        key={comment.id}
        variant="standard"
        className="mb-4 flex flex-col gap-2"
        style={{
          marginLeft: `${Math.min(depth * 24, 96)}px`
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-start flex-wrap gap-2 text-[12px]">
          <div>
            <span className="font-semibold text-[var(--color-text-primary)] block text-[13px]">
              {comment.user?.name || 'Contributor'}
            </span>
            <span className="text-[var(--color-text-secondary)]">
              @{comment.user?.username || 'user'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {comment.status === 'PENDING' && (
              <Badge variant="PENDING">
                Pending Approval
              </Badge>
            )}
            <span className="text-[var(--color-text-secondary)]">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Content */}
        <p className="text-[14px] leading-relaxed text-[var(--color-text-primary)] mt-1">
          {comment.content}
        </p>

        {/* Actions bar */}
        <div className="flex gap-4 text-[13px] items-center mt-2">
          {isAuthenticated && (
            <button
              onClick={() => {
                setReplyToId(comment.id);
                setReplyText('');
              }}
              className="text-[var(--color-primary)] hover:underline font-semibold"
            >
              Reply
            </button>
          )}

          {canModerate && comment.status === 'PENDING' && (
            <>
              <button
                onClick={() => handleToggleStatus(comment.id, 'APPROVED')}
                className="text-[var(--color-success)] hover:underline font-semibold"
              >
                Approve
              </button>
              <button
                onClick={() => handleToggleStatus(comment.id, 'REJECTED')}
                className="text-[var(--color-error)] hover:underline font-semibold"
              >
                Reject
              </button>
            </>
          )}

          {(isCommentOwner || canModerate) && (
            <button
              onClick={() => triggerDeleteComment(comment.id)}
              className="text-[var(--color-error)] hover:underline"
            >
              Delete
            </button>
          )}
        </div>

        {/* Inline Reply Input Box */}
        {replyToId === comment.id && (
          <form
            onSubmit={(e) => handlePostReply(e, comment.id)}
            className="mt-4 flex gap-2"
          >
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
            </div>
            <Button type="submit" variant="primary">
              Post
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setReplyToId(null)}
            >
              Cancel
            </Button>
          </form>
        )}

        {/* Recursively Render Child Replies */}
        {comment.replies && comment.replies.map(reply => renderComment(reply, depth + 1))}
      </Card>
    );
  };

  return (
    <section className="mt-12 pt-8 border-t border-[var(--color-border)]">
      <h3 className="text-[20px] font-bold mb-6 text-[var(--color-text-primary)]">
        Discussion
      </h3>

      {error && (
        <div className="p-4 mb-4 rounded bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 text-sm text-[var(--color-error)]">
          {error}
        </div>
      )}

      {/* Main Comment Box */}
      {isAuthenticated ? (
        <form onSubmit={handlePostComment} className="flex flex-col gap-4 mb-8">
          <Input
            type="textarea"
            placeholder="What are your thoughts or questions?..."
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
          />
          <div className="self-end">
            <Button type="submit" variant="primary">
              Post Comment
            </Button>
          </div>
        </form>
      ) : (
        <Card variant="standard" className="p-6 mb-8 text-center">
          <p className="text-sm mb-4 text-[var(--color-text-secondary)]">
            Join the discussion! Sign in to leave comments and ask questions.
          </p>
          <Link href="/login" className="inline-block">
            <Button variant="primary">Sign In to Comment</Button>
          </Link>
        </Card>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="text-[var(--color-text-secondary)] text-sm animate-pulse">
          Loading discussion...
        </div>
      ) : comments.length === 0 ? (
        <p className="text-[14px] text-center py-6 text-[var(--color-text-secondary)]">
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
        <p className="text-[14px] text-[var(--color-text-primary)]">Are you sure you want to delete this comment? This action cannot be undone.</p>
      </Modal>
    </section>
  );
}
