// frontend/src/app/search/page.js
'use client';

import { useEffect, useState, Suspense, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import axios from 'axios';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Badge from '@/components/common/Badge';
import Breadcrumb from '@/components/common/Breadcrumb';
import StarRating from '@/components/common/StarRating';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

function SearchPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL States
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const debouncedQuery = useDebounce(query, 300);
  
  const [selectedSubject, setSelectedSubject] = useState(searchParams.get('subject') || '');
  const [selectedTopic, setSelectedTopic] = useState(searchParams.get('topic') || '');
  const [selectedDifficulty, setSelectedDifficulty] = useState(searchParams.get('difficulty') || '');
  const [selectedSort, setSelectedSort] = useState(searchParams.get('sort') || 'relevance');
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
  const limit = 20;

  // UI States
  const [subjects, setSubjects] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

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
          if (hasUrlTopic && !selectedTopic) {
            setSelectedTopic(urlTopic);
          } else if (!hasUrlTopic) {
            setSelectedTopic('');
          }
        } catch (err) {
          console.error('Failed to load subject topics:', err);
        }
      }
      fetchTopics();
    }
  }, [selectedSubject, subjects, searchParams]);

  // Sync state to URL and perform search
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery.trim()) params.set('q', debouncedQuery.trim());
    if (selectedSubject) params.set('subject', selectedSubject);
    if (selectedTopic) params.set('topic', selectedTopic);
    if (selectedDifficulty) params.set('difficulty', selectedDifficulty);
    if (selectedSort !== 'relevance') params.set('sort', selectedSort);
    if (page > 1) params.set('page', page);

    router.replace(`${pathname}?${params.toString()}`);

    async function performSearch() {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/search`, { 
          params: {
            q: debouncedQuery.trim() || undefined,
            subject: selectedSubject || undefined,
            topic: selectedTopic || undefined,
            difficulty: selectedDifficulty || undefined,
            sort: selectedSort,
            page,
            limit
          } 
        });
        setResults(res.data.results || []);
        setTotal(res.data.total || 0);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }
    
    performSearch();
  }, [debouncedQuery, selectedSubject, selectedTopic, selectedDifficulty, selectedSort, page, pathname, router]);

  // Reset page to 1 when filters change (except page itself)
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, selectedSubject, selectedTopic, selectedDifficulty, selectedSort]);

  // Highlight matching text helper
  const highlightText = (text, highlight) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? 
            <mark key={i} className="bg-yellow-200/50 text-inherit rounded px-0.5">{part}</mark> : 
            part
        )}
      </span>
    );
  };

  const subjectOptions = [
    { value: '', label: 'All Subjects' },
    ...subjects.map(s => ({ value: s.slug, label: s.name }))
  ];

  const topicOptions = [
    { value: '', label: 'All Topics' },
    ...filteredTopics.map(t => ({ value: t.slug, label: t.name }))
  ];

  const difficultyOptions = [
    { value: '', label: 'All Difficulties' },
    { value: 'EASY', label: 'Easy' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HARD', label: 'Hard' }
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'recent', label: 'Recent' },
    { value: 'popular', label: 'Popular' }
  ];

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="w-full">
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
        <div className="space-y-4">
          
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
            <Button 
              variant="secondary" 
              className="w-full sm:w-auto h-[38px] px-4"
              onClick={() => setShowFilters(!showFilters)}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            <Button 
              variant="secondary" 
              className="w-full sm:w-auto h-[38px] px-4"
              onClick={() => {
                setQuery('');
                setSelectedSubject('');
                setSelectedTopic('');
                setSelectedDifficulty('');
                setSelectedSort('relevance');
              }}
            >
              Clear
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-[var(--color-border)] mt-4 animate-in fade-in slide-in-from-top-4 duration-200">
              <Input
                id="filter-subject" type="select" label="Subject"
                value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}
                options={subjectOptions}
              />
              <Input
                id="filter-topic" type="select" label="Topic"
                value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)}
                disabled={!selectedSubject} options={topicOptions}
              />
              <Input
                id="filter-difficulty" type="select" label="Difficulty"
                value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)}
                options={difficultyOptions}
              />
              <Input
                id="filter-sort" type="select" label="Sort By"
                value={selectedSort} onChange={(e) => setSelectedSort(e.target.value)}
                options={sortOptions}
              />
            </div>
          )}

        </div>
      </Card>

      {/* Results Section */}
      <section>
        <div className="flex items-center justify-between mb-4 select-none">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Results ({total})
          </h2>
          {loading && <span className="text-xs text-[var(--color-text-secondary)] animate-pulse">Searching library...</span>}
        </div>

        {results.length === 0 && !loading ? (
          <Card variant="standard" className="text-center py-16">
            <h3 className="text-[18px] font-semibold text-[var(--color-text-primary)] mb-1">No Results</h3>
            <p className="text-sm text-[var(--color-text-secondary)]">No matching notes found.</p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">Try adjusting your search keywords or filters.</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {results.map((note) => (
              <Link key={note.id} href={`/learning/${note.topic?.subject?.slug}/${note.topic?.slug}/${note.slug}`} className="block">
                <Card variant="standard" className="hover:border-[var(--color-primary)]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--color-primary)] mb-2">
                        <span>{note.topic?.subject?.name}</span>
                        <span className="opacity-50">/</span>
                        <span className="text-[var(--color-text-secondary)]">{note.topic?.name}</span>
                      </div>
                      
                      <h3 className="text-[18px] font-semibold text-[var(--color-text-primary)] pb-1 truncate">
                        {highlightText(note.title, debouncedQuery)}
                      </h3>

                      {note.excerpt && (
                        <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] line-clamp-2 mt-3 mb-4">
                          {highlightText(note.excerpt, debouncedQuery)}
                        </p>
                      )}

                      <div className="flex items-center gap-3 flex-wrap text-[12px] text-[var(--color-text-secondary)] mt-4">
                        <Badge variant={note.difficulty}>{note.difficulty}</Badge>
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-inherit" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>{note.views || 0}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-inherit" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163-.024-.326-.073-.48-.148L8 19.5M7 10h4V21H7a2 2 0 01-2-2V12a2 2 0 012-2z" />
                          </svg>
                          <span>{note.helpfulCount || 0}</span>
                        </span>
                        <span>•</span>
                        <div onClick={(e) => e.preventDefault()}>
                          <StarRating noteId={note.id} initialAverage={note.averageRating} initialCount={note.ratingCount} readOnly={true} />
                        </div>
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <Button 
              variant="secondary" 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-[var(--color-text-secondary)] px-4">
              Page {page} of {totalPages}
            </span>
            <Button 
              variant="secondary" 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
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
