// frontend/src/components/layout/Sidebar.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
        // Expand the active subject
        setExpandedSubjects(prev => ({ ...prev, [activeSubject.id]: true }));
        // Fetch topics for this subject
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
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xs uppercase tracking-wider font-bold text-zinc-500">Learning Catalog</h2>
        {onClose && (
          <button 
            onClick={onClose} 
            className="lg:hidden p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {loadingSubjects ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-9 w-full bg-zinc-900/60 animate-pulse rounded-lg"></div>
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <p className="text-xs text-zinc-500">No subjects catalogued yet.</p>
      ) : (
        <div className="flex flex-col gap-1.5 overflow-y-auto pr-1">
          {subjects.map((subject) => {
            const isSubjectExpanded = !!expandedSubjects[subject.id];
            const isSubjectActive = currentSubjectSlug === subject.slug;
            const subjectTopics = topicsMap[subject.id] || [];
            const isTopicLoading = !!loadingTopics[subject.id];

            return (
              <div key={subject.id} className="flex flex-col gap-1">
                {/* Subject Header Nav */}
                <button
                  onClick={() => toggleSubject(subject.id, subject.slug)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-all duration-150
                    ${isSubjectActive 
                      ? 'bg-zinc-900/80 text-white font-semibold' 
                      : 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                    }
                  `}
                  style={{ 
                    borderColor: isSubjectActive ? `${subject.color || '#6c63f1'}30` : 'transparent',
                    borderLeft: `3px solid ${subject.color || '#6c63f1'}`
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-sm flex-shrink-0 opacity-70">
                      {subject.icon || '📚'}
                    </span>
                    <span className="text-xs truncate">{subject.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 font-mono font-medium">
                      {subject.topicsCount}
                    </span>
                    <svg 
                      className={`w-3 h-3 text-zinc-500 transition-transform duration-200 ${isSubjectExpanded ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Topics Sub-menu */}
                {isSubjectExpanded && (
                  <div className="pl-4 pr-1 py-1 flex flex-col gap-1 border-l border-zinc-800/80 ml-4 mt-1 mb-2">
                    {isTopicLoading ? (
                      <div className="h-6 w-full bg-zinc-900/40 animate-pulse rounded-md"></div>
                    ) : subjectTopics.length === 0 ? (
                      <span className="text-[10px] text-zinc-600 pl-2">No topics found</span>
                    ) : (
                      subjectTopics.map((topic) => {
                        const isTopicActive = isSubjectActive && currentTopicSlug === topic.slug;
                        return (
                          <Link
                            key={topic.id}
                            href={`/learning/${subject.slug}/${topic.slug}`}
                            onClick={onClose}
                            className={`
                              w-full text-xs text-left py-1.5 px-3 rounded-lg border transition-all duration-150 flex items-center justify-between
                              ${isTopicActive
                                ? 'text-violet-400 font-semibold border-violet-900/30 bg-violet-950/10'
                                : 'text-zinc-500 hover:text-zinc-300 border-transparent hover:bg-zinc-900/30'
                              }
                            `}
                          >
                            <span className="truncate">{topic.name}</span>
                            <span className="text-[10px] text-zinc-600 font-mono font-medium">{topic.notesCount}</span>
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
      {/* Desktop view */}
      <aside className="hidden lg:flex flex-col w-64 sticky top-16 h-[calc(100vh-4rem)] border-r border-zinc-800/80 bg-[#0a0a0f] overflow-y-auto px-4 py-6 flex-shrink-0">
        {renderContent()}
      </aside>

      {/* Mobile/Tablet drawer view */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300"
          ></div>
          
          {/* Drawer container */}
          <div className="relative w-64 max-w-xs bg-[#0a0a0f] border-r border-zinc-800 p-5 flex flex-col h-full z-10 overflow-y-auto">
            {renderContent()}
          </div>
        </div>
      )}
    </>
  );
}
