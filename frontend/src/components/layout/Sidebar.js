// frontend/src/components/layout/Sidebar.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import axios from 'axios';
import SubjectIcon from '@/components/common/SubjectIcon';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const [subjects, setSubjects] = useState([]);
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [topicsMap, setTopicsMap] = useState({});
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingTopics, setLoadingTopics] = useState({});

  // Fetch subjects on mount
  useEffect(() => {
    async function fetchSubjects() {
      try {
        const res = await axios.get(`${API_URL}/subjects`);
        setSubjects(res.data);
      } catch (err) {
        console.error('Failed to load subjects for sidebar:', err);
      } finally {
        setLoadingSubjects(false);
      }
    }
    fetchSubjects();
  }, []);

  // Fetch topics helper
  const fetchTopicsForSubject = async (subjectId, subjectSlug) => {
    if (topicsMap[subjectId] || loadingTopics[subjectId]) return;

    setLoadingTopics(prev => ({ ...prev, [subjectId]: true }));
    try {
      const res = await axios.get(`${API_URL}/subjects/${subjectSlug}`);
      const subjectDetails = res.data;
      setTopicsMap(prev => ({
        ...prev,
        [subjectId]: subjectDetails.topics || []
      }));
    } catch (err) {
      console.error(`Failed to load topics for subject ${subjectSlug}:`, err);
    } finally {
      setLoadingTopics(prev => ({ ...prev, [subjectId]: false }));
    }
  };

  // Check active subject from pathname and expand it automatically
  useEffect(() => {
    if (subjects.length === 0 || !pathname) return;

    const parts = pathname.split('/');
    if (parts[1] === 'learning' && parts[2]) {
      const activeSubjectSlug = parts[2];
      const activeSubject = subjects.find(s => s.slug === activeSubjectSlug);
      
      if (activeSubject && !expandedSubjects[activeSubject.id]) {
        setExpandedSubjects(prev => ({ ...prev, [activeSubject.id]: true }));
        fetchTopicsForSubject(activeSubject.id, activeSubject.slug);
      }
    }
  }, [pathname, subjects]);

  const toggleSubject = (subjectId, subjectSlug) => {
    setExpandedSubjects(prev => {
      const isCurrentlyExpanded = !!prev[subjectId];
      if (!isCurrentlyExpanded) {
        fetchTopicsForSubject(subjectId, subjectSlug);
      }
      return { ...prev, [subjectId]: !isCurrentlyExpanded };
    });
  };

  // Helper to extract active route details
  const parts = pathname ? pathname.split('/') : [];
  const currentSubjectSlug = parts[1] === 'learning' ? parts[2] : null;
  const currentTopicSlug = parts[1] === 'learning' ? parts[3] : null;

  const renderContent = () => (
    <div className="flex flex-col h-full select-none">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs uppercase tracking-wider font-bold text-[var(--color-text-secondary)]">Subjects</h2>
        {onClose && (
          <button 
            onClick={onClose} 
            className="lg:hidden p-1 rounded bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {loadingSubjects ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-9 w-full bg-[var(--color-bg-secondary)] animate-pulse rounded"></div>
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <p className="text-xs text-[var(--color-text-secondary)] italic">No subjects available.</p>
      ) : (
        // Sidebar list spacing: 2px gap
        <div className="flex flex-col gap-[2px] overflow-y-auto pr-1">
          {subjects.map((subject) => {
            const isSubjectExpanded = !!expandedSubjects[subject.id];
            const isSubjectActive = currentSubjectSlug === subject.slug;
            const subjectTopics = topicsMap[subject.id] || [];
            const isTopicLoading = !!loadingTopics[subject.id];

            return (
              <div key={subject.id} className="flex flex-col">
                {/* 
                  Subject Header Nav: 
                  - Padding: 12px (py-3 px-4 as per vertical guidelines)
                  - Text: 14px (text-sm is 14px), 400 weight (font-normal)
                  - Active: Blue background, white text.
                  - Hover: Light gray background.
                */}
                <button
                  onClick={() => toggleSubject(subject.id, subject.slug)}
                  className={`
                    w-full flex items-center justify-between py-2.5 px-3 rounded-lg text-left transition-all duration-200 text-sm font-medium
                    ${isSubjectActive 
                      ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-semibold border border-[var(--color-primary)]/20 shadow-sm' 
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'
                    }
                  `}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm flex-shrink-0">
                      <SubjectIcon icon={subject.icon} className="w-4 h-4 text-inherit" />
                    </span>
                    <span className="truncate">{subject.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${isSubjectActive ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]' : 'bg-black/[0.03] dark:bg-white/[0.03] text-[var(--color-text-secondary)]'}`}>
                      {subject.topicsCount}
                    </span>
                    <svg 
                      className={`w-3.5 h-3.5 transition-transform duration-250 ${isSubjectExpanded ? 'rotate-180' : ''} ${isSubjectActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Indent sub-items: 16px (pl-4) */}
                {isSubjectExpanded && (
                  <div className="pl-3.5 pr-1 py-0.5 flex flex-col gap-[2px] mt-[2px] border-l border-black/[0.06] dark:border-white/[0.06] ml-4">
                    {isTopicLoading ? (
                      <div className="h-6 w-full bg-[var(--color-bg-secondary)]/50 animate-pulse rounded"></div>
                    ) : subjectTopics.length === 0 ? (
                      <span className="text-[11px] text-[var(--color-text-secondary)] pl-2 italic">No topics</span>
                    ) : (
                      subjectTopics.map((topic) => {
                        const isTopicActive = isSubjectActive && currentTopicSlug === topic.slug;
                        return (
                          <Link
                            key={topic.id}
                            href={`/learning/${subject.slug}/${topic.slug}`}
                            onClick={onClose}
                            className={`
                              w-full text-xs text-left py-2 px-3 rounded-md transition-all duration-200 flex items-center justify-between
                              ${isTopicActive
                                ? 'text-[var(--color-primary)] font-semibold bg-[var(--color-primary)]/5'
                                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                              }
                            `}
                          >
                            <span className="truncate">{topic.name}</span>
                            <span className="text-[9px] text-[var(--color-text-secondary)]/60 font-mono font-medium">{topic.notesCount}</span>
                          </Link>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop view: Width 240px (w-60), sticky top-14 (since header height is 56px) */}
      <aside className="hidden lg:flex flex-col w-[240px] sticky top-14 h-[calc(100vh-3.5rem)] border-r border-black/[0.06] dark:border-white/[0.06] bg-transparent overflow-y-auto px-4 py-6 flex-shrink-0">
        {renderContent()}
      </aside>

      {/* Mobile/Tablet drawer view */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div 
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
          ></div>
          <div className="relative w-[240px] bg-[var(--color-bg)] border-r border-black/[0.06] dark:border-white/[0.06] p-4 flex flex-col h-full z-10 overflow-y-auto">
            {renderContent()}
          </div>
        </div>
      )}
    </>
  );
}
