// frontend/src/app/search/page.js
'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Badge from '@/components/common/Badge';
import Breadcrumb from '@/components/common/Breadcrumb';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  
  const [subjects, setSubjects] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch subjects to populate filters
  useEffect(() => {
    async function fetchFilterData() {
      try {
        const res = await axios.get(`${API_URL}/subjects`);
        setSubjects(res.data);
      } catch (err) {
        console.error('Failed to load filter subjects:', err);
      }
    }
    fetchFilterData();
  }, []);

  // Update topics dropdown when subject changes
  useEffect(() => {
    if (!selectedSubject) {
      setFilteredTopics([]);
      setSelectedTopic('');
      return;
    }
    const foundSubject = subjects.find(s => s.slug === selectedSubject);
    if (foundSubject) {
      async function fetchTopics() {
        try {
          const res = await axios.get(`${API_URL}/subjects/${foundSubject.id}/topics`);
          setFilteredTopics(res.data);

          // Restore topic from URL if present and valid
          const urlTopic = searchParams.get('topic') || '';
          const hasUrlTopic = res.data.some(t => t.slug === urlTopic);
          if (hasUrlTopic) {
            setSelectedTopic(urlTopic);
          } else {
            setSelectedTopic('');
          }
        } catch (err) {
          console.error('Failed to load subject topics:', err);
        }
      }
      fetchTopics();
    }
  }, [selectedSubject, subjects, searchParams]);

  // Synchronize state and trigger search whenever URL params change
  useEffect(() => {
    const qVal = searchParams.get('q') || '';
    const subjectVal = searchParams.get('subject') || '';
    const topicVal = searchParams.get('topic') || '';
    const difficultyVal = searchParams.get('difficulty') || '';

    setQuery(qVal);
    setSelectedSubject(subjectVal);
    setSelectedDifficulty(difficultyVal);

    async function performSearch() {
      setLoading(true);
      try {
        const params = {};
        if (qVal) params.q = qVal;
        if (subjectVal) params.subject = subjectVal;
        if (topicVal) params.topic = topicVal;
        if (difficultyVal) params.difficulty = difficultyVal;

        const res = await axios.get(`${API_URL}/search`, { params });
        setResults(res.data);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }
    
    performSearch();
  }, [searchParams]);

  // Handle Search Trigger
  const handleSearch = (e) => {
    if (e) e.preventDefault();
    
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (selectedSubject) params.set('subject', selectedSubject);
    if (selectedTopic) params.set('topic', selectedTopic);
    if (selectedDifficulty) params.set('difficulty', selectedDifficulty);
    
    router.push(`/search?${params.toString()}`);
  };

  // Convert subject options for dropdown select
  const subjectOptions = [
    { value: '', label: 'All Subjects' },
    ...subjects.map(s => ({ value: s.slug, label: s.name }))
  ];

  // Convert topic options for dropdown select
  const topicOptions = [
    { value: '', label: 'All Topics' },
    ...filteredTopics.map(t => ({ value: t.slug, label: t.name }))
  ];

  // Convert difficulty options for dropdown select
  const difficultyOptions = [
    { value: '', label: 'All Difficulties' },
    { value: 'EASY', label: 'Easy' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HARD', label: 'Hard' }
  ];

  return (
    <div className="w-full">
      {/* Navigation Breadcrumb */}
      <Breadcrumb 
        items={[
          { name: 'Home', href: '/' },
          { name: 'Search' }
        ]} 
        className="mb-8"
      />

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">Search Library</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">Find notes and learning guides across all subjects and topics.</p>
      </header>

      {/* Search Panel Card */}
      <Card variant="standard" className="mb-8">
        <form onSubmit={handleSearch} className="space-y-6">
          
          {/* Query Input Box & Search Button */}
          <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center">
            <div className="flex-1 w-full">
              <Input
                id="search-query"
                type="text"
                placeholder="Type keywords (e.g. merge sort, load balancer)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button type="submit" variant="primary" className="w-full sm:w-auto h-[38px] px-6">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </Button>
          </div>

          {/* Filter Dropdowns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Subject Filter */}
            <Input
              id="filter-subject"
              type="select"
              label="Subject"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              options={subjectOptions}
            />

            {/* Topic Filter */}
            <Input
              id="filter-topic"
              type="select"
              label="Topic"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              disabled={!selectedSubject}
              options={topicOptions}
            />

            {/* Difficulty Filter */}
            <Input
              id="filter-difficulty"
              type="select"
              label="Difficulty"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              options={difficultyOptions}
            />
          </div>

        </form>
      </Card>

      {/* Results Section */}
      <section>
        <div className="flex items-center justify-between mb-4 select-none">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Results ({results.length})
          </h2>
          {loading && <span className="text-xs text-[var(--color-text-secondary)] animate-pulse">Searching library...</span>}
        </div>

        {results.length === 0 ? (
          <Card variant="standard" className="text-center py-16">
            <h3 className="text-[18px] font-semibold text-[var(--color-text-primary)] mb-1">No Results</h3>
            <p className="text-sm text-[var(--color-text-secondary)]">No matching notes found.</p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">Try adjusting your search keywords or filters.</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {results.map((note) => (
              <Link key={note.id} href={`/learning/${note.topic.subject.slug}/${note.topic.slug}/${note.slug}`} className="block">
                <Card variant="standard" className="hover:border-[var(--color-primary)]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      
                      {/* Subject info path */}
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--color-primary)] mb-2">
                        <span>{note.topic.subject.name}</span>
                        <span className="opacity-50">/</span>
                        <span className="text-[var(--color-text-secondary)]">{note.topic.name}</span>
                      </div>
                      
                      {/* Note Title: 4px padding bottom */}
                      <h3 className="text-[18px] font-semibold text-[var(--color-text-primary)] pb-1 truncate">
                        {note.title}
                      </h3>

                      {/* Content: 12px padding top */}
                      {note.excerpt && (
                        <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] line-clamp-2 mt-3 mb-4">
                          {note.excerpt}
                        </p>
                      )}

                      {/* Meta stats: 8px top, 12px size, gray */}
                      <div className="flex items-center gap-3 flex-wrap text-[12px] text-[var(--color-text-secondary)] mt-4">
                        <Badge variant={note.difficulty}>
                          {note.difficulty}
                        </Badge>
                        <span>•</span>
                        <span>{note.readingTime || 1} min read</span>
                        <span>•</span>
                        <span>by {note.author?.name || 'Unknown'}</span>
                        {note.publishedAt && (
                          <>
                            <span>•</span>
                            <span>{new Date(note.publishedAt).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>

                    </div>

                    <svg className="w-4.5 h-4.5 text-[var(--color-text-secondary)]/50 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center p-20 min-h-[300px]">
        <div className="w-[20px] h-[20px] border-2 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin"></div>
        <span className="text-xs font-mono text-[var(--color-text-secondary)] mt-3 loading-pulse">Loading search directory...</span>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
