// frontend/src/app/my-learnings/[id]/edit/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import useAuth from '@/hooks/useAuth';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function EditNotePage() {
  const { id } = useParams();
  const { user, token, getAuthHeaders, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [note, setNote] = useState(null);
  const [sections, setSections] = useState([]);
  
  // Note metadata edit state
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [tagsInput, setTagsInput] = useState('');
  const [editingMetadata, setEditingMetadata] = useState(false);

  // New section form state
  const [newSecTitle, setNewSecTitle] = useState('');
  const [newSecContent, setNewSecContent] = useState('');
  const [newSecType, setNewSecType] = useState('TEXT'); // TEXT, CODE, EXAMPLE, IMAGE, DIAGRAM
  const [newSecLanguage, setNewSecLanguage] = useState('javascript');
  const [addingSection, setAddingSection] = useState(false);

  // Edit section inline state
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [editSecTitle, setEditSecTitle] = useState('');
  const [editSecContent, setEditSecContent] = useState('');
  const [editSecType, setEditSecType] = useState('TEXT');
  const [editSecLanguage, setEditSecLanguage] = useState('javascript');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Confirmation Modals State
  const [deleteSecModalOpen, setDeleteSecModalOpen] = useState(false);
  const [sectionIdToDelete, setSectionIdToDelete] = useState(null);
  const [publishModalOpen, setPublishModalOpen] = useState(false);

  const fetchNote = async () => {
    try {
      setError('');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${API_URL}/notes/${id}`, { headers });
      const noteData = res.data;
      
      setNote(noteData);
      setSections(noteData.sections || []);
      
      // Initialize edit fields
      setTitle(noteData.title);
      setExcerpt(noteData.excerpt || '');
      setDifficulty(noteData.difficulty);
      setTagsInput(noteData.tags ? noteData.tags.join(', ') : '');
    } catch (err) {
      console.error('Failed to fetch note:', err);
      setError('Could not fetch note details. Ensure you have access to this draft.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        fetchNote();
      } else {
        setLoading(false);
      }
    }
  }, [authLoading, isAuthenticated, token]);

  const handleUpdateMetadata = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    const tags = tagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    try {
      const res = await axios.put(
        `${API_URL}/notes/${id}`,
        { title, excerpt, difficulty, tags },
        { headers: getAuthHeaders() }
      );
      setNote(res.data);
      setEditingMetadata(false);
      setSuccess('Metadata updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to update metadata:', err);
      setError(err.response?.data?.error || 'Failed to update note details.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSection = async (e) => {
    e.preventDefault();
    if (!newSecTitle.trim() || !newSecContent.trim()) {
      setError('Section title and content are required.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await axios.post(
        `${API_URL}/notes/${id}/sections`,
        {
          title: newSecTitle,
          content: newSecContent,
          contentType: newSecType,
          language: newSecType === 'CODE' ? newSecLanguage : undefined
        },
        { headers: getAuthHeaders() }
      );

      setSections(prev => [...prev, res.data]);
      
      // Reset form
      setNewSecTitle('');
      setNewSecContent('');
      setNewSecType('TEXT');
      setNewSecLanguage('javascript');
      setAddingSection(false);
      setSuccess('Section added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to add section:', err);
      setError(err.response?.data?.error || 'Failed to add section.');
    } finally {
      setSaving(false);
    }
  };

  const handleStartEditSection = (section) => {
    setEditingSectionId(section.id);
    setEditSecTitle(section.title);
    setEditSecContent(section.content);
    setEditSecType(section.contentType);
    setEditSecLanguage(section.language || 'javascript');
  };

  const handleUpdateSection = async (e, sectionId) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await axios.put(
        `${API_URL}/sections/${sectionId}`,
        {
          title: editSecTitle,
          content: editSecContent,
          contentType: editSecType,
          language: editSecType === 'CODE' ? editSecLanguage : null
        },
        { headers: getAuthHeaders() }
      );

      setSections(prev => prev.map(sec => sec.id === sectionId ? res.data : sec));
      setEditingSectionId(null);
      setSuccess('Section updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to update section:', err);
      setError(err.response?.data?.error || 'Failed to update section.');
    } finally {
      setSaving(false);
    }
  };

  const triggerDeleteSection = (sectionId) => {
    setSectionIdToDelete(sectionId);
    setDeleteSecModalOpen(true);
  };

  const handleConfirmDeleteSection = async () => {
    if (!sectionIdToDelete) return;
    setSaving(true);
    setError('');

    try {
      await axios.delete(`${API_URL}/sections/${sectionIdToDelete}`, {
        headers: getAuthHeaders()
      });
      setSections(prev => prev.filter(sec => sec.id !== sectionIdToDelete));
      setSuccess('Section deleted.');
      setTimeout(() => setSuccess(''), 3000);
      setDeleteSecModalOpen(false);
      setSectionIdToDelete(null);
    } catch (err) {
      console.error('Failed to delete section:', err);
      setError(err.response?.data?.error || 'Failed to delete section.');
    } finally {
      setSaving(false);
    }
  };

  const handleReorder = async (sectionId, currentIndex, direction) => {
    const newOrder = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newOrder < 0 || newOrder >= sections.length) return;
    
    setSaving(true);
    setError('');

    try {
      await axios.patch(
        `${API_URL}/sections/${sectionId}/reorder`,
        { newOrder },
        { headers: getAuthHeaders() }
      );
      
      // Refetch note/sections to assure accurate synchronized database order
      await fetchNote();
      setSuccess('Reordered successfully.');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      console.error('Failed to reorder sections:', err);
      setError('Failed to reorder sections.');
    } finally {
      setSaving(false);
    }
  };

  const triggerPublish = () => {
    if (sections.length === 0) {
      setError('You must add at least one section before publishing.');
      return;
    }
    setPublishModalOpen(true);
  };

  const handleConfirmPublish = async () => {
    setSaving(true);
    setError('');
    setPublishModalOpen(false);

    try {
      const res = await axios.patch(
        `${API_URL}/notes/${id}/publish`,
        {},
        { headers: getAuthHeaders() }
      );
      setNote(res.data);
      setSuccess('Note published successfully!');
      setTimeout(() => {
        router.push(`/learning/${res.data.topic?.subject?.slug || 'subject'}/${res.data.topic?.slug || 'topic'}/${res.data.slug}`);
      }, 1500);
    } catch (err) {
      console.error('Failed to publish note:', err);
      setError(err.response?.data?.error || 'Failed to publish note.');
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="loading-pulse" style={{ color: 'var(--color-text-muted)' }}>Loading editor workspace...</div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-bg)' }}>
        <div className="max-w-md w-full glass-card p-8 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-3 text-[var(--color-text-primary)]">Authorization Required</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
            Sign in to edit this note.
          </p>
          <Link href="/login" className="btn-primary inline-block">
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  if (!note) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-bg)' }}>
        <div className="max-w-md w-full glass-card p-8 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-3 text-[var(--color-text-primary)]">Note Not Found</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
            {error || 'The note you are trying to edit does not exist or you do not have permission.'}
          </p>
          <Link href="/my-learnings" className="btn-secondary inline-block">
            Back to Workspace
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-24" style={{ background: 'var(--color-bg)' }}>
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-15%] w-[450px] h-[450px] rounded-full opacity-[0.03]" style={{ background: 'radial-gradient(circle, #6c63f1, transparent 75%)' }}></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-6 py-12">
        {/* Navigation Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm mb-8" style={{ color: 'var(--color-text-dim)' }}>
          <Link href="/" className="hover:underline" style={{ color: 'var(--color-primary)' }}>Home</Link>
          <span>/</span>
          <Link href="/my-learnings" className="hover:underline" style={{ color: 'var(--color-primary)' }}>My Learnings</Link>
          <span>/</span>
          <span style={{ color: 'var(--color-text-muted)' }}>Edit Note</span>
        </nav>

        {/* Header Block */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-8 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--color-primary)' }}>
                {note.topic?.subject?.name} / {note.topic?.name}
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
            <h1 className="text-4xl font-extrabold text-[var(--color-text-primary)]">{note.title}</h1>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
              Created by you | Revisions: {note.revisionCount || 0} | Views: {note.views || 0}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {note.status === 'DRAFT' && (
              <button
                onClick={triggerPublish}
                disabled={saving}
                className="btn-primary bg-emerald-600 hover:bg-emerald-500 font-bold"
                style={{ background: 'var(--gradient-accent)' }}
              >
                🚀 Publish Note
              </button>
            )}
            <Link
              href={
                note.status === 'PUBLISHED'
                  ? `/learning/${note.topic?.subject?.slug}/${note.topic?.slug}/${note.slug}`
                  : `/my-learnings`
              }
              className="btn-secondary"
            >
              {note.status === 'PUBLISHED' ? 'View Live Note' : 'Close Editor'}
            </Link>
          </div>
        </header>

        {/* Global Notifications */}
        {error && (
          <div className="p-4 mb-6 rounded-lg text-sm text-red-400" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className="p-4 mb-6 rounded-lg text-sm text-emerald-400" style={{ background: 'rgba(36, 166, 112, 0.1)', border: '1px solid rgba(36, 166, 112, 0.2)' }}>
            ✅ {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main sections flow column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                📂 Note Sections ({sections.length})
              </h2>
              <button
                onClick={() => setAddingSection(!addingSection)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold btn-primary flex items-center gap-1"
              >
                {addingSection ? 'Hide Panel' : '+ Add Block'}
              </button>
            </div>

            {/* Dynamic Add Section Form Block */}
            {addingSection && (
              <form onSubmit={handleAddSection} className="glass-card p-6 border-2" style={{ borderColor: 'var(--color-primary)' }}>
                <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider mb-4">Add Content Section</h3>
                
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400">Block Title</label>
                      <input
                        type="text"
                        placeholder="e.g. 1. Base Complexity, Code Example..."
                        value={newSecTitle}
                        onChange={(e) => setNewSecTitle(e.target.value)}
                        required
                        className="px-3 py-2 text-sm rounded-lg text-[var(--color-text-primary)] bg-[var(--color-bg)] border-[var(--color-border)] outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400">Content Type</label>
                      <select
                        value={newSecType}
                        onChange={(e) => setNewSecType(e.target.value)}
                        className="px-3 py-2 text-sm rounded-lg text-[var(--color-text-primary)] bg-[var(--color-bg)] border-[var(--color-border)] outline-none"
                      >
                        <option value="TEXT">Text (supports plain content)</option>
                        <option value="CODE">Code Block</option>
                        <option value="EXAMPLE">Interactive Example Box</option>
                        <option value="IMAGE">Image Link URL</option>
                        <option value="DIAGRAM">Diagram Notation</option>
                      </select>
                    </div>
                  </div>

                  {newSecType === 'CODE' && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400">Coding Language</label>
                      <select
                        value={newSecLanguage}
                        onChange={(e) => setNewSecLanguage(e.target.value)}
                        className="px-3 py-2 text-sm rounded-lg text-[var(--color-text-primary)] bg-[var(--color-bg)] border-[var(--color-border)] outline-none w-48"
                      >
                        <option value="javascript">JavaScript</option>
                        <option value="typescript">TypeScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                        <option value="html">HTML</option>
                        <option value="css">CSS</option>
                        <option value="sql">SQL</option>
                        <option value="bash">Bash/Terminal</option>
                      </select>
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-gray-400">Content Body</label>
                    <textarea
                      rows={6}
                      placeholder={
                        newSecType === 'CODE'
                          ? 'Paste code snippet here...'
                          : newSecType === 'IMAGE'
                          ? 'Paste raw image link URL...'
                          : 'Write content markdown or description...'
                      }
                      value={newSecContent}
                      onChange={(e) => setNewSecContent(e.target.value)}
                      required
                      className="px-3 py-2 text-sm rounded-lg text-[var(--color-text-primary)] bg-[var(--color-bg)] border-[var(--color-border)] outline-none font-mono"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setAddingSection(false)}
                      className="btn-secondary text-xs px-4 py-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn-primary text-xs px-5 py-2"
                    >
                      Save Section Block
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Sections Flow List */}
            {sections.length === 0 ? (
              <div className="text-center py-16 glass-card border-dashed" style={{ borderColor: 'var(--color-border)' }}>
                <div className="text-4xl mb-3">📦</div>
                <h3 className="font-bold text-[var(--color-text-primary)] mb-1">Your note is empty</h3>
                <p className="text-sm text-gray-500 mb-5 max-w-sm mx-auto">
                  Click the "+ Add Block" button to populate this note with text, code snippets, or diagrams.
                </p>
                <button
                  onClick={() => setAddingSection(true)}
                  className="btn-primary text-xs"
                >
                  Create First Section
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {sections.map((section, idx) => (
                  <div key={section.id} className="relative group/card">
                    {/* Inline Section Editing Panel */}
                    {editingSectionId === section.id ? (
                      <form
                        onSubmit={(e) => handleUpdateSection(e, section.id)}
                        className="glass-card p-6 border-2"
                        style={{ borderColor: 'var(--color-primary)' }}
                      >
                        <div className="flex flex-col gap-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                              <label className="text-xs text-gray-400">Block Title</label>
                              <input
                                type="text"
                                value={editSecTitle}
                                onChange={(e) => setEditSecTitle(e.target.value)}
                                required
                                className="px-3 py-2 text-sm rounded-lg text-[var(--color-text-primary)] bg-[var(--color-bg)] border-[var(--color-border)] outline-none"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-xs text-gray-400">Content Type</label>
                              <select
                                value={editSecType}
                                onChange={(e) => setEditSecType(e.target.value)}
                                className="px-3 py-2 text-sm rounded-lg text-[var(--color-text-primary)] bg-[var(--color-bg)] border-[var(--color-border)] outline-none"
                              >
                                <option value="TEXT">Text</option>
                                <option value="CODE">Code Block</option>
                                <option value="EXAMPLE">Interactive Example Box</option>
                                <option value="IMAGE">Image Link URL</option>
                                <option value="DIAGRAM">Diagram Notation</option>
                              </select>
                            </div>
                          </div>

                          {editSecType === 'CODE' && (
                            <div className="flex flex-col gap-1">
                              <label className="text-xs text-gray-400">Language</label>
                              <select
                                value={editSecLanguage}
                                onChange={(e) => setEditSecLanguage(e.target.value)}
                                className="px-3 py-2 text-sm rounded-lg text-[var(--color-text-primary)] bg-[var(--color-bg)] border-[var(--color-border)] outline-none w-48"
                              >
                                <option value="javascript">JavaScript</option>
                                <option value="typescript">TypeScript</option>
                                <option value="python">Python</option>
                                <option value="java">Java</option>
                                <option value="cpp">C++</option>
                                <option value="html">HTML</option>
                                <option value="css">CSS</option>
                                <option value="sql">SQL</option>
                                <option value="bash">Bash/Terminal</option>
                              </select>
                            </div>
                          )}

                          <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-400">Content Body</label>
                            <textarea
                              rows={5}
                              value={editSecContent}
                              onChange={(e) => setEditSecContent(e.target.value)}
                              required
                              className="px-3 py-2 text-sm rounded-lg text-[var(--color-text-primary)] bg-[var(--color-bg)] border-[var(--color-border)] outline-none font-mono"
                            />
                          </div>

                          <div className="flex justify-end gap-3 pt-2">
                            <button
                              type="button"
                              onClick={() => setEditingSectionId(null)}
                              className="btn-secondary text-xs px-4 py-2"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={saving}
                              className="btn-primary text-xs px-5 py-2"
                            >
                              Update Block
                            </button>
                          </div>
                        </div>
                      </form>
                    ) : (
                      /* Section Display Card */
                      <div className="glass-card p-6 flex flex-col gap-3 group">
                        {/* Section Header Controls */}
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full border border-gray-700">
                              {section.contentType} {section.contentType === 'CODE' && `(${section.language})`}
                            </span>
                            <h3 className="text-base font-bold text-[var(--color-text-primary)] mt-1">{section.title}</h3>
                          </div>

                          {/* Controls Panel */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* Reordering Controls */}
                            <button
                              onClick={() => handleReorder(section.id, idx, 'up')}
                              disabled={idx === 0 || saving}
                              className="p-1.5 rounded hover:bg-gray-800 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                              title="Move Up"
                            >
                              ▲
                            </button>
                            <button
                              onClick={() => handleReorder(section.id, idx, 'down')}
                              disabled={idx === sections.length - 1 || saving}
                              className="p-1.5 rounded hover:bg-gray-800 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                              title="Move Down"
                            >
                              ▼
                            </button>

                            {/* Edit & Delete Action Panel */}
                            <button
                              onClick={() => handleStartEditSection(section)}
                              className="p-1.5 rounded hover:bg-gray-800 text-blue-400"
                              title="Edit Section"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => triggerDeleteSection(section.id)}
                              className="p-1.5 rounded hover:bg-gray-800 text-red-400"
                              title="Delete Section"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>

                        {/* Section Preview Block */}
                        <div className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
                          {section.contentType === 'CODE' ? (
                            <pre className="p-4 rounded-lg text-xs font-mono overflow-x-auto" style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }}>
                              <code className="text-[var(--color-text-primary)]">{section.content}</code>
                            </pre>
                          ) : section.contentType === 'EXAMPLE' ? (
                            <div className="p-4 rounded-lg text-xs" style={{ background: 'rgba(36, 166, 112, 0.05)', borderLeft: '4px solid var(--color-accent)' }}>
                              <p className="font-semibold mb-1" style={{ color: 'var(--color-accent)' }}>Example Callout</p>
                              {section.content}
                            </div>
                          ) : section.contentType === 'IMAGE' ? (
                            <div className="my-2 text-center">
                              <img src={section.content} alt={section.title} className="max-h-60 max-w-full rounded-lg mx-auto border" style={{ borderColor: 'var(--color-border)' }} onError={(e) => { e.target.src='https://via.placeholder.com/600x300?text=Invalid+Image+URL'; }} />
                              <span className="text-[10px] text-gray-500 mt-1 block font-mono">{section.content}</span>
                            </div>
                          ) : (
                            <p className="whitespace-pre-line text-[var(--color-text-primary)]">{section.content}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Note Metadata Settings Panel */}
          <div className="flex flex-col gap-6">
            <div className="glass-card p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center pb-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <h2 className="text-lg font-bold text-[var(--color-text-primary)]">⚙️ Note Settings</h2>
                {!editingMetadata && (
                  <button
                    onClick={() => setEditingMetadata(true)}
                    className="text-xs text-blue-400 hover:underline font-semibold"
                  >
                    Change Info
                  </button>
                )}
              </div>

              {editingMetadata ? (
                <form onSubmit={handleUpdateMetadata} className="flex flex-col gap-4 text-sm">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-400">Note Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="px-3 py-2 rounded-lg text-[var(--color-text-primary)] bg-[var(--color-bg)] border-[var(--color-border)] outline-none text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-400">Excerpt / Short Info</label>
                    <textarea
                      rows={3}
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      className="px-3 py-2 rounded-lg text-[var(--color-text-primary)] bg-[var(--color-bg)] border-[var(--color-border)] outline-none text-sm resize-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-400">Difficulty</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="px-3 py-2 rounded-lg text-[var(--color-text-primary)] bg-[var(--color-bg)] border-[var(--color-border)] outline-none text-sm"
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-400">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      className="px-3 py-2 rounded-lg text-[var(--color-text-primary)] bg-[var(--color-bg)] border-[var(--color-border)] outline-none text-sm"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingMetadata(false)}
                      className="px-3 py-1.5 rounded-lg border text-xs text-gray-300 hover:bg-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-4 py-1.5 rounded-lg btn-primary text-xs font-bold"
                    >
                      Save Settings
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col gap-3 text-sm">
                  <div>
                    <span className="text-xs text-gray-500 block">Title</span>
                    <span className="font-semibold text-[var(--color-text-primary)]">{note.title}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Excerpt</span>
                    <p style={{ color: 'var(--color-text-muted)' }}>{note.excerpt || 'No excerpt summary defined.'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Difficulty</span>
                    <span
                      className={`badge mt-1 ${
                        note.difficulty === 'EASY'
                          ? 'badge-easy'
                          : note.difficulty === 'MEDIUM'
                          ? 'badge-medium'
                          : 'badge-hard'
                      }`}
                    >
                      {note.difficulty}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Tags</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {note.tags && note.tags.length > 0 ? (
                        note.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded bg-gray-800 border text-gray-300"
                            style={{ borderColor: 'var(--color-border)' }}
                          >
                            #{tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs italic text-gray-600">No tags defined.</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Tips Panel */}
            <div className="glass-card p-6" style={{ background: 'rgba(108, 99, 241, 0.02)' }}>
              <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-2">💡 Quick Tips</h3>
              <ul className="text-xs space-y-2 list-disc pl-4" style={{ color: 'var(--color-text-muted)' }}>
                <li>Add multiple sections to structure your notes step-by-step.</li>
                <li>Use code sections for code snippets (with syntax highlighting support).</li>
                <li>Use hover controls to reorder sections by moving them up or down.</li>
                <li>Write a descriptive excerpt/summary to help users navigate content from search feeds.</li>
                <li>Don't forget to click "Publish Note" when your guide is ready!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Section Deletion Modal */}
      <Modal
        isOpen={deleteSecModalOpen}
        onClose={() => {
          if (!saving) {
            setDeleteSecModalOpen(false);
            setSectionIdToDelete(null);
          }
        }}
        title="Delete Content Section"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setDeleteSecModalOpen(false);
                setSectionIdToDelete(null);
              }}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDeleteSection}
              disabled={saving}
            >
              {saving ? 'Deleting...' : 'Delete Section'}
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete this section block? This action cannot be undone.</p>
      </Modal>

      {/* Confirm Note Publication Modal */}
      <Modal
        isOpen={publishModalOpen}
        onClose={() => {
          if (!saving) {
            setPublishModalOpen(false);
          }
        }}
        title="Publish Note"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setPublishModalOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmPublish}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-500 font-bold text-white"
            >
              {saving ? 'Publishing...' : 'Publish'}
            </Button>
          </>
        }
      >
        <p>Are you ready to publish this note? It will become publicly visible to other developers on the platform.</p>
      </Modal>
    </main>
  );
}
