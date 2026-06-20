// frontend/src/app/user-dashboard/create/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import useAuth from '@/hooks/useAuth';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Breadcrumb from '@/components/common/Breadcrumb';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function CreateNotePage() {
  const { getAuthHeaders, token } = useAuth();
  const router = useRouter();

  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [tagsInput, setTagsInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch subjects on mount
  useEffect(() => {
    async function fetchSubjects() {
      try {
        const res = await axios.get(`${API_URL}/subjects`);
        setSubjects(res.data);
        if (res.data.length > 0) {
          setSelectedSubjectId(res.data[0].id);
        }
      } catch (err) {
        console.error('Failed to load subjects:', err);
        setError('Could not load subjects. Please check if backend API is online.');
      } finally {
        setPageLoading(false);
      }
    }

    if (token) {
      fetchSubjects();
    }
  }, [token]);

  // Fetch topics when subject changes
  useEffect(() => {
    if (!selectedSubjectId) {
      setTopics([]);
      setSelectedTopicId('');
      return;
    }

    async function fetchTopics() {
      try {
        const res = await axios.get(`${API_URL}/subjects/${selectedSubjectId}/topics`);
        setTopics(res.data);
        if (res.data.length > 0) {
          setSelectedTopicId(res.data[0].id);
        } else {
          setSelectedTopicId('');
        }
      } catch (err) {
        console.error('Failed to load topics:', err);
        setError('Failed to retrieve topics for selected subject.');
      }
    }

    fetchTopics();
  }, [selectedSubjectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !selectedTopicId) {
      setError('Title and Topic selection are required.');
      return;
    }

    setLoading(true);
    setError('');

    const tags = tagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    try {
      const res = await axios.post(
        `${API_URL}/notes`,
        {
          title,
          excerpt,
          difficulty,
          tags,
          topicId: selectedTopicId
        },
        {
          headers: getAuthHeaders()
        }
      );
      
      const newNote = res.data;
      router.push(`/user-dashboard/${newNote.id}/edit`);
    } catch (err) {
      console.error('Failed to create note:', err);
      setError(err.response?.data?.error || 'Failed to create new note draft.');
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[200px]">
        <div className="w-[20px] h-[20px] border-2 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin"></div>
        <span className="text-xs font-mono text-[var(--color-text-secondary)] mt-3 loading-pulse">Loading workspace...</span>
      </div>
    );
  }

  const subjectOptions = subjects.map(sub => ({
    value: sub.id,
    label: sub.name
  }));

  const topicOptions = topics.length === 0 
    ? [{ value: '', label: 'No topics in this subject' }]
    : topics.map(t => ({ value: t.id, label: t.name }));

  const difficultyOptions = [
    { value: 'EASY', label: 'Easy' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HARD', label: 'Hard' }
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Navigation Breadcrumb */}
      <Breadcrumb 
        items={[
          { name: 'Home', href: '/' },
          { name: 'My Notes', href: '/user-dashboard/my-notes' },
          { name: 'Create Note' }
        ]} 
        className="mb-8"
      />

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">Create New Note Draft</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">Fill in the metadata. You will add details and sections in the next step.</p>
      </header>

      {error && (
        <div className="p-4 mb-6 rounded-lg text-sm text-[var(--color-error)] border border-[var(--color-error)]/20 bg-[var(--color-error)]/10">
          {error}
        </div>
      )}

      {/* Form Area in Card */}
      <Card variant="standard" className="p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* Subject dropdown select */}
          <Input
            id="note-subject"
            type="select"
            label="1. Select Subject"
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            options={subjectOptions}
            required
          />

          {/* Topic dropdown select */}
          <Input
            id="note-topic"
            type="select"
            label="2. Select Topic"
            value={selectedTopicId}
            onChange={(e) => setSelectedTopicId(e.target.value)}
            disabled={topics.length === 0}
            options={topicOptions}
            required
          />

          {/* Title input */}
          <Input
            id="title"
            type="text"
            label="3. Note Title"
            placeholder="e.g. Dijkstra's Algorithm, CSS Flexbox Crash Course..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          {/* Excerpt textarea */}
          <Input
            id="excerpt"
            type="textarea"
            label="4. Excerpt / Short Summary"
            placeholder="Provide a quick overview of what this note covers..."
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
          />

          {/* Row: Difficulty and Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              id="difficulty"
              type="select"
              label="5. Difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              options={difficultyOptions}
              required
            />

            <Input
              id="tags"
              type="text"
              label="6. Tags (comma-separated)"
              placeholder="e.g. algorithms, graphs, shortest-path"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 mt-4 justify-end">
            <Link href="/user-dashboard/my-notes">
              <Button variant="secondary">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={loading || topics.length === 0}
              variant="primary"
              className="min-w-[140px]"
            >
              {loading ? 'Creating...' : 'Create Draft'}
            </Button>
          </div>

        </form>
      </Card>
    </div>
  );
}
