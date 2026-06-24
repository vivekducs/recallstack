// frontend/src/app/roadmap/RoadmapClient.js
'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  RotateCcw, 
  FileText, 
  Search, 
  Download, 
  Upload, 
  Plus, 
  BookOpen, 
  Sparkles, 
  ChevronDown, 
  Calendar,
  AlertTriangle,
  Trash2,
  Check,
  Lock,
  ExternalLink,
  Edit2
} from 'lucide-react';
import Card from '@/components/common/Card';
import apiClient from '@/services/apiClient';
import useAuth from '@/hooks/useAuth';

export default function RoadmapDashboard({ initialWeeks }) {
  const { user, isAuthenticated } = useAuth();
  
  // Hydrated DB & Local Storage States
  const [isMounted, setIsMounted] = useState(false);
  const [loadingDb, setLoadingDb] = useState(false);
  const [completedItems, setCompletedItems] = useState({});
  const [revisionItems, setRevisionItems] = useState({});
  const [itemNotes, setItemNotes] = useState({});
  const [customResources, setCustomResources] = useState([]);

  // UI States
  const [expandedWeeks, setExpandedWeeks] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); 
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [tempNoteText, setTempNoteText] = useState('');

  // Custom Resource Form State
  const [addingResourceDayId, setAddingResourceDayId] = useState(null);
  const [newResourceTitle, setNewResourceTitle] = useState('');
  const [newResourceUrl, setNewResourceUrl] = useState('');
  const [newResourceType, setNewResourceType] = useState('YOUTUBE');

  // Load user progress, notes, and custom resources
  useEffect(() => {
    setIsMounted(true);

    async function loadRoadmapData() {
      setLoadingDb(true);
      try {
        // Fetch public admin custom resources
        let dbResources = [];
        try {
          const resResponse = await apiClient.get('/roadmap/resources');
          dbResources = resResponse.data;
        } catch (err) {
          console.error('Failed to load global resources:', err);
        }

        // Fetch user progress and notes if authenticated
        if (isAuthenticated) {
          const [progressRes, notesRes] = await Promise.all([
            apiClient.get('/roadmap/progress'),
            apiClient.get('/roadmap/notes')
          ]);

          const comps = {};
          const revs = {};
          progressRes.data.forEach(p => {
            comps[p.itemId] = p.completed;
            revs[p.itemId] = p.needsRevision;
          });
          setCompletedItems(comps);
          setRevisionItems(revs);

          const notesMap = {};
          notesRes.data.forEach(n => {
            notesMap[n.itemId] = n.content;
          });
          setItemNotes(notesMap);
          
          // Render global DB resources
          setCustomResources(dbResources);
        } else {
          // GUEST FALLBACK: Load everything from local storage
          const storedCompleted = localStorage.getItem('recallstack-roadmap-completed');
          const storedRevision = localStorage.getItem('recallstack-roadmap-revision');
          const storedNotes = localStorage.getItem('recallstack-roadmap-notes');
          const localRes = localStorage.getItem('recallstack-roadmap-local-resources');

          if (storedCompleted) setCompletedItems(JSON.parse(storedCompleted));
          if (storedRevision) setRevisionItems(JSON.parse(storedRevision));
          if (storedNotes) setItemNotes(JSON.parse(storedNotes));

          const parsedLocalRes = localRes ? JSON.parse(localRes) : [];
          
          // Merge global admin links and user local links
          setCustomResources([...dbResources, ...parsedLocalRes]);
        }
      } catch (err) {
        console.error('Failed to load roadmap data:', err);
      } finally {
        setLoadingDb(false);
      }
    }

    loadRoadmapData();

    // Expand first week by default
    if (initialWeeks && initialWeeks.length > 0) {
      setExpandedWeeks({ [initialWeeks[0].id]: true });
    }
  }, [isAuthenticated, initialWeeks]);

  const handleToggleComplete = async (itemId) => {
    const nextVal = !completedItems[itemId];
    
    // Optimistic Update
    setCompletedItems(prev => ({ ...prev, [itemId]: nextVal }));
    
    if (isAuthenticated) {
      try {
        await apiClient.post('/roadmap/progress', {
          itemId,
          completed: nextVal,
          needsRevision: revisionItems[itemId] || false
        });
      } catch (err) {
        console.error('Failed to save completion state:', err);
        // Revert on failure
        setCompletedItems(prev => ({ ...prev, [itemId]: !nextVal }));
      }
    } else {
      // Local Storage save for guest users
      const stored = localStorage.getItem('recallstack-roadmap-completed');
      const parsed = stored ? JSON.parse(stored) : {};
      parsed[itemId] = nextVal;
      localStorage.setItem('recallstack-roadmap-completed', JSON.stringify(parsed));
    }
  };

  const handleToggleRevision = async (itemId) => {
    const nextVal = !revisionItems[itemId];
    
    // Optimistic Update
    setRevisionItems(prev => ({ ...prev, [itemId]: nextVal }));

    if (isAuthenticated) {
      try {
        await apiClient.post('/roadmap/progress', {
          itemId,
          completed: completedItems[itemId] || false,
          needsRevision: nextVal
        });
      } catch (err) {
        console.error('Failed to save revision state:', err);
        // Revert on failure
        setRevisionItems(prev => ({ ...prev, [itemId]: !nextVal }));
      }
    } else {
      // Local Storage save for guest users
      const stored = localStorage.getItem('recallstack-roadmap-revision');
      const parsed = stored ? JSON.parse(stored) : {};
      parsed[itemId] = nextVal;
      localStorage.setItem('recallstack-roadmap-revision', JSON.stringify(parsed));
    }
  };

  const handleOpenNote = (itemId) => {
    setEditingNoteId(itemId);
    setTempNoteText(itemNotes[itemId] || '');
  };

  const handleSaveNote = async () => {
    const noteContent = tempNoteText;
    
    // Optimistic Update
    setItemNotes(prev => {
      const updated = { ...prev, [editingNoteId]: noteContent };
      if (!noteContent.trim()) delete updated[editingNoteId];
      return updated;
    });

    if (isAuthenticated) {
      try {
        if (noteContent.trim()) {
          await apiClient.post('/roadmap/notes', {
            itemId: editingNoteId,
            content: noteContent
          });
        } else {
          await apiClient.delete(`/roadmap/notes/${editingNoteId}`);
        }
      } catch (err) {
        console.error('Failed to save note:', err);
        // Refresh notes from server to sync correct state on error
        const notesRes = await apiClient.get('/roadmap/notes');
        const notesMap = {};
        notesRes.data.forEach(n => {
          notesMap[n.itemId] = n.content;
        });
        setItemNotes(notesMap);
      }
    } else {
      // Local Storage save for guest users
      const stored = localStorage.getItem('recallstack-roadmap-notes');
      const parsed = stored ? JSON.parse(stored) : {};
      if (noteContent.trim()) {
        parsed[editingNoteId] = noteContent;
      } else {
        delete parsed[editingNoteId];
      }
      localStorage.setItem('recallstack-roadmap-notes', JSON.stringify(parsed));
    }
    setEditingNoteId(null);
  };

  // Resource management (DB for Admins, localStorage fallback for others)
  const handleAddResource = async (e) => {
    e.preventDefault();

    const isGlobalAdmin = isAuthenticated && user?.role === 'ADMIN';
    
    const newResource = {
      id: isGlobalAdmin ? 'db-temp-' + Date.now() : 'local-' + Date.now(),
      itemId: addingResourceDayId,
      title: newResourceTitle,
      url: newResourceUrl,
      type: newResourceType,
      isLocal: !isGlobalAdmin
    };
    
    if (isGlobalAdmin) {
      try {
        const response = await apiClient.post('/roadmap/resources', {
          itemId: addingResourceDayId,
          title: newResourceTitle,
          url: newResourceUrl,
          type: newResourceType
        });
        setCustomResources(prev => [...prev, response.data]);
      } catch (err) {
        console.error('Failed to add custom resource to database:', err);
        alert('Failed to add global resource. Ensure URL is valid.');
      }
    } else {
      // Save locally to localstorage for standard users/guests
      try {
        const localRes = localStorage.getItem('recallstack-roadmap-local-resources');
        const parsed = localRes ? JSON.parse(localRes) : [];
        const updated = [...parsed, newResource];
        localStorage.setItem('recallstack-roadmap-local-resources', JSON.stringify(updated));
        
        setCustomResources(prev => [...prev, newResource]);
      } catch (err) {
        console.error('Failed to save local resource:', err);
      }
    }

    // Reset form
    setAddingResourceDayId(null);
    setNewResourceTitle('');
    setNewResourceUrl('');
    setNewResourceType('YOUTUBE');
  };

  const handleDeleteResource = async (resToDelete) => {
    if (resToDelete.isLocal) {
      // Local link deletion
      try {
        const localRes = localStorage.getItem('recallstack-roadmap-local-resources');
        if (localRes) {
          const parsed = JSON.parse(localRes);
          const updated = parsed.filter(r => r.id !== resToDelete.id);
          localStorage.setItem('recallstack-roadmap-local-resources', JSON.stringify(updated));
        }
        setCustomResources(prev => prev.filter(r => r.id !== resToDelete.id));
      } catch (err) {
        console.error('Failed to delete local resource:', err);
      }
    } else if (isAuthenticated && user?.role === 'ADMIN') {
      // Global database link deletion
      if (!confirm('Are you sure you want to delete this global admin resource?')) return;

      try {
        await apiClient.delete(`/roadmap/resources/${resToDelete.id}`);
        setCustomResources(prev => prev.filter(r => r.id !== resToDelete.id));
      } catch (err) {
        console.error('Failed to delete resource from database:', err);
        alert('Failed to delete global resource.');
      }
    }
  };

  const handleToggleWeek = (weekId) => {
    setExpandedWeeks(prev => ({
      ...prev,
      [weekId]: !prev[weekId]
    }));
  };

  const handleExpandAll = () => {
    const allExpanded = {};
    initialWeeks.forEach(w => {
      allExpanded[w.id] = true;
    });
    setExpandedWeeks(allExpanded);
  };

  const handleCollapseAll = () => {
    setExpandedWeeks({});
  };

  // Group custom resources by Day ID (itemId)
  const resourcesByDay = useMemo(() => {
    const map = {};
    customResources.forEach(res => {
      if (!map[res.itemId]) map[res.itemId] = [];
      map[res.itemId].push(res);
    });
    return map;
  }, [customResources]);

  // Compute progress analytics counters
  const stats = useMemo(() => {
    let totalItems = 0;
    let completedCount = 0;
    let revisionCount = 0;

    initialWeeks.forEach(week => {
      week.days.forEach(day => {
        day.items.forEach(item => {
          totalItems++;
          if (completedItems[item.id]) completedCount++;
          if (revisionItems[item.id]) revisionCount++;
        });
      });
    });

    const completionRate = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

    return {
      totalItems,
      completedCount,
      revisionCount,
      completionRate
    };
  }, [initialWeeks, completedItems, revisionItems]);

  // Filter and search matching logic
  const filteredWeeks = useMemo(() => {
    if (!searchQuery && filterType === 'all') return initialWeeks;

    return initialWeeks.map(week => {
      const filteredDays = week.days.map(day => {
        const filteredItems = day.items.filter(item => {
          const matchesSearch = searchQuery 
            ? item.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
              (item.subItems && item.subItems.some(sub => sub.toLowerCase().includes(searchQuery.toLowerCase())))
            : true;

          let matchesFilter = true;
          if (filterType === 'completed') {
            matchesFilter = !!completedItems[item.id];
          } else if (filterType === 'pending') {
            matchesFilter = !completedItems[item.id];
          } else if (filterType === 'revision') {
            matchesFilter = !!revisionItems[item.id];
          }

          return matchesSearch && matchesFilter;
        });

        return { ...day, items: filteredItems };
      }).filter(day => day.items.length > 0);

      return { ...week, days: filteredDays };
    }).filter(week => week.days.length > 0);
  }, [initialWeeks, searchQuery, filterType, completedItems, revisionItems]);

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-sm font-medium animate-pulse text-[var(--color-text-secondary)]">
          Preparing database connections...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* HYBRID BANNER EXPLAINING STORAGE TYPE */}
      {!isAuthenticated && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-blue-500/20 bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-500">
              <Lock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--color-text-primary)]">Guest Mode Active</h4>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5 font-medium">
                Completions, study notes, and custom links are saved locally inside your browser. Sign in to sync them to the database.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <a href="/login" className="flex-1 md:flex-none text-center px-4 py-2 border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] text-xs font-semibold rounded-xl text-[var(--color-text-primary)] transition-all">
              Log In
            </a>
            <a href="/register" className="flex-1 md:flex-none text-center px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-semibold rounded-xl transition-all shadow-[0_4px_14px_0_rgba(59,130,246,0.15)]">
              Sign Up
            </a>
          </div>
        </motion.div>
      )}

      {/* 1. PROGRESS METERS PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="standard" className="relative group border-black/[0.04] dark:border-white/[0.04] bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                Overall Progress
              </span>
              <h3 className="text-3xl font-extrabold mt-1 text-[var(--color-text-primary)]">
                {stats.completionRate}%
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] mt-1.5 font-medium">
                {stats.completedCount} of {stats.totalItems} topics mastered
              </p>
            </div>
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="26" stroke="var(--color-border)" strokeWidth="4.5" fill="transparent" className="opacity-20" />
                <circle cx="32" cy="32" r="26" stroke="var(--color-primary)" strokeWidth="5.5" fill="transparent"
                  strokeDasharray={2 * Math.PI * 26}
                  strokeDashoffset={2 * Math.PI * 26 * (1 - stats.completionRate / 100)}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <Sparkles className="absolute w-5 h-5 text-[var(--color-primary)]" />
            </div>
          </div>
          <div className="w-full bg-black/5 dark:bg-white/5 h-2 rounded-full overflow-hidden mt-4">
            <div 
              className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] h-full transition-all duration-1000 ease-out rounded-full" 
              style={{ width: `${stats.completionRate}%` }} 
            />
          </div>
        </Card>

        <Card variant="standard" className="border-black/[0.04] dark:border-white/[0.04] bg-gradient-to-br from-amber-500/5 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                Needs Revision
              </span>
              <h3 className="text-3xl font-extrabold mt-1 text-[var(--color-text-primary)]">
                {stats.revisionCount}
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] mt-1.5 font-medium">
                Flagged for Spaced Repetition
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-500">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <div className="text-[11px] mt-5 font-semibold text-amber-500 bg-amber-500/5 px-2.5 py-1 rounded-lg inline-block">
            {stats.revisionCount > 0 ? 'Review recommended today' : 'All caught up!'}
          </div>
        </Card>

        <Card variant="standard" className="border-black/[0.04] dark:border-white/[0.04] flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
              Storage Type
            </span>
            <p className="text-xs text-[var(--color-text-muted)] mt-2">
              {isAuthenticated 
                ? 'All roadmap progress and notes are synced with your cloud database account.'
                : 'Roadmap progress, notes, and custom links are saved locally inside browser localStorage.'}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
            <span className={`text-[10px] font-semibold flex items-center gap-1 ${isAuthenticated ? 'text-emerald-500' : 'text-blue-500'}`}>
              <span className={`w-1.5 h-1.5 rounded-full animate-ping ${isAuthenticated ? 'bg-emerald-500' : 'bg-blue-500'}`} />
              {isAuthenticated ? 'Cloud Sync Connected' : 'Local Storage Fallback'}
            </span>
            <span className="text-[10px] text-[var(--color-text-dim)]">
              {isAuthenticated ? 'Cloud DB' : 'Browser Local'}
            </span>
          </div>
        </Card>
      </div>

      {/* 2. FILTER & UTILITY BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 border-b border-[var(--color-border)]">
        {/* Search */}
        <div className="relative max-w-sm w-full">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--color-text-secondary)]">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search topic or skill keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] focus:border-[var(--color-primary)] rounded-xl py-2 pl-10 pr-4 text-sm outline-none transition-all focus:ring-4 focus:ring-[var(--color-primary)]/10"
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* State Filter Buttons */}
          <div className="flex bg-[var(--color-bg-secondary)] border border-[var(--color-border)] p-1 rounded-xl">
            {[
              { label: 'All', value: 'all' },
              { label: 'Completed', value: 'completed' },
              { label: 'Pending', value: 'pending' },
              { label: 'Needs Revision', value: 'revision' }
            ].map(f => (
              <button
                key={f.value}
                onClick={() => setFilterType(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterType === f.value
                    ? 'bg-white dark:bg-neutral-800 text-[var(--color-primary)] shadow-sm'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="h-4 w-[1px] bg-[var(--color-border)] hidden sm:block" />

          {/* Accordion Expand/Collapse */}
          <div className="flex gap-2">
            <button 
              onClick={handleExpandAll}
              className="text-[11px] font-semibold text-[var(--color-primary)] hover:underline"
            >
              Expand All
            </button>
            <span className="text-[var(--color-text-dim)]">|</span>
            <button 
              onClick={handleCollapseAll}
              className="text-[11px] font-semibold text-[var(--color-primary)] hover:underline"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* 3. ROADMAP CONTENT */}
      {filteredWeeks.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-[var(--color-border)] rounded-2xl bg-[var(--color-bg-secondary)]">
          <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-[var(--color-text-dim)]" />
          <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-1">No Matching Content</h3>
          <p className="text-sm text-[var(--color-text-secondary)] max-w-sm mx-auto">
            Try adjusting your search queries or check filter options to reveal items.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredWeeks.map((week) => {
            const isExpanded = !!expandedWeeks[week.id];
            
            // Calculate week progress
            let weekTotal = 0;
            let weekCompleted = 0;
            week.days.forEach(day => {
              day.items.forEach(item => {
                weekTotal++;
                if (completedItems[item.id]) weekCompleted++;
              });
            });

            return (
              <div 
                key={week.id} 
                className="border border-[var(--color-border)] rounded-2xl overflow-hidden bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl shadow-sm hover:border-[var(--color-primary)]/20 transition-all duration-300"
              >
                {/* Week Header */}
                <button
                  onClick={() => handleToggleWeek(week.id)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-black/[0.02] dark:hover:bg-white/[0.01] transition-colors focus:outline-none"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)] font-bold text-xs">
                      {week.title.match(/Week \d+/)?.[0]?.replace('Week ', '') || 'W'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-base md:text-lg font-bold text-[var(--color-text-primary)] truncate">
                        {week.title}
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-secondary)]">
                      {weekCompleted} / {weekTotal} Done
                    </span>
                    <ChevronDown className={`w-5 h-5 text-[var(--color-text-secondary)] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {/* Week Body */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-[var(--color-border)] bg-black/[0.01] dark:bg-white/[0.01]"
                    >
                      <div className="p-6 space-y-8">
                        {week.days.map((day) => {
                          const customResList = resourcesByDay[day.id] || [];

                          return (
                            <div key={day.id} className="space-y-4">
                              {/* Day title */}
                              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-[var(--color-primary)]" />
                                  <h3 className="text-sm font-bold tracking-wide uppercase text-[var(--color-text-primary)]">
                                    {day.title}
                                  </h3>
                                </div>

                                {/* ADD LINK TRIGGER BUTTON (Everyone can add: admin goes to db, standard users/guests save locally) */}
                                <button
                                  onClick={() => setAddingResourceDayId(day.id)}
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--color-primary)] hover:underline border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 px-2.5 py-1 rounded-lg hover:bg-[var(--color-primary)]/10 transition-colors"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  Add Link
                                </button>
                              </div>

                              {/* Topics List */}
                              <div className="grid grid-cols-1 gap-3">
                                {day.items.map((item) => {
                                  const isCompleted = !!completedItems[item.id];
                                  const isRevision = !!revisionItems[item.id];
                                  const hasNote = !!itemNotes[item.id];

                                  return (
                                    <div
                                      key={item.id}
                                      className={`group flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 ${
                                        isCompleted 
                                          ? 'bg-emerald-500/[0.02] border-emerald-500/20 dark:bg-emerald-500/[0.01]' 
                                          : 'bg-[var(--color-bg)] border-[var(--color-border)]'
                                      }`}
                                    >
                                      {/* Completion Checkbox */}
                                      <button
                                        onClick={() => handleToggleComplete(item.id)}
                                        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                                          isCompleted
                                            ? 'bg-emerald-500 border-emerald-500 text-white'
                                            : 'border-[var(--color-border)] hover:border-[var(--color-primary)] bg-[var(--color-bg)]'
                                        }`}
                                        aria-label="Toggle Complete"
                                      >
                                        {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                                      </button>

                                      {/* Topic text */}
                                      <div className="flex-1 space-y-2">
                                        <span className={`text-[14px] leading-relaxed transition-all block ${
                                          isCompleted 
                                            ? 'text-[var(--color-text-secondary)] line-through' 
                                            : 'text-[var(--color-text-primary)] font-medium'
                                        }`}>
                                          {item.text}
                                        </span>

                                        {/* Sub-items */}
                                        {item.subItems && item.subItems.length > 0 && (
                                          <ul className="list-disc pl-4 space-y-1 mt-2">
                                            {item.subItems.map((sub, sIdx) => (
                                              <li key={sIdx} className="text-xs text-[var(--color-text-secondary)]">
                                                {sub}
                                              </li>
                                            ))}
                                          </ul>
                                        )}

                                        {/* Notes display */}
                                        {hasNote && (
                                          <div className="bg-[var(--color-bg-secondary)] border-l-2 border-[var(--color-primary)] p-2.5 rounded-r-lg text-xs text-[var(--color-text-muted)] flex items-start gap-2 mt-2">
                                            <FileText className="w-3.5 h-3.5 text-[var(--color-primary)] mt-0.5 flex-shrink-0" />
                                            <div className="flex-1 italic break-words">
                                              {itemNotes[item.id]}
                                            </div>
                                            <button
                                              onClick={() => handleOpenNote(item.id)}
                                              className="text-[10px] font-bold text-[var(--color-primary)] hover:underline ml-2 flex-shrink-0"
                                            >
                                              Edit
                                            </button>
                                          </div>
                                        )}
                                      </div>

                                      {/* Actions */}
                                      <div className="flex items-center gap-2 flex-shrink-0">
                                        <button
                                          onClick={() => handleToggleRevision(item.id)}
                                          className={`p-1.5 rounded-lg border transition-all ${
                                            isRevision
                                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                                              : 'border-transparent text-[var(--color-text-dim)] hover:text-amber-500 hover:bg-amber-500/5'
                                          }`}
                                          title={isRevision ? 'Needs Revision' : 'Flag for Revision'}
                                        >
                                          <RotateCcw className="w-4 h-4" />
                                        </button>

                                        <button
                                          onClick={() => handleOpenNote(item.id)}
                                          className={`p-1.5 rounded-lg border transition-all ${
                                            hasNote
                                              ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/30 text-[var(--color-primary)]'
                                              : 'border-transparent text-[var(--color-text-dim)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5'
                                          }`}
                                          title="Add/Edit Notes"
                                        >
                                          <FileText className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Day Curated Resources Card */}
                              <div className="mt-3 bg-black/[0.015] dark:bg-white/[0.015] border border-[var(--color-border)]/50 rounded-xl p-3 space-y-3 text-xs">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-black/[0.03] dark:border-white/[0.03]">
                                  <span className="font-semibold text-[var(--color-text-secondary)] inline-flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                                    Resources for {day.title.split(':')[0]}
                                  </span>
                                  
                                  {/* Standard/Default Search Links */}
                                  <div className="flex items-center gap-3">
                                    <a 
                                      href={`https://www.youtube.com/results?search_query=AI+Engineering+${encodeURIComponent(day.title)}`}
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-[var(--color-text-secondary)] hover:text-red-500 transition-colors font-medium"
                                    >
                                      <svg className="w-3.5 h-3.5 fill-current text-inherit" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                      </svg>
                                      YouTube Search
                                    </a>
                                    <span className="text-[var(--color-border)]">|</span>
                                    <a 
                                      href={`https://www.google.com/search?q=${encodeURIComponent(day.title + " documentation tutorial code")}`}
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors font-medium"
                                    >
                                      <BookOpen className="w-4 h-4" />
                                      Docs Search
                                    </a>
                                  </div>
                                </div>

                                {/* ADMIN & USER DYNAMIC LINKS LIST */}
                                {customResList.length > 0 && (
                                  <div className="space-y-2 pt-1">
                                    <span className="text-[10px] uppercase font-bold text-[var(--color-text-dim)] block tracking-wider">
                                      Curated Links
                                    </span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {customResList.map(res => {
                                        const isMyLocalLink = res.isLocal;
                                        const isGlobalAdmin = !res.isLocal;
                                        
                                        // Allow deleting if it's user's local link, or if logged in as Admin
                                        const canDelete = isMyLocalLink || (isAuthenticated && user?.role === 'ADMIN');

                                        return (
                                          <div 
                                            key={res.id} 
                                            className="flex items-center justify-between p-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)]/60 hover:border-[var(--color-primary)]/20 transition-all group/res"
                                          >
                                            <a 
                                              href={res.url} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-primary)] truncate"
                                            >
                                              {res.type === 'YOUTUBE' ? (
                                                <svg className="w-3.5 h-3.5 fill-red-500" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                                </svg>
                                              ) : (
                                                <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                                              )}
                                              <span className="truncate max-w-[180px]">{res.title}</span>
                                              {res.isLocal && (
                                                <span className="text-[9px] font-bold text-blue-500 bg-blue-500/10 px-1 py-0.2 rounded font-mono">
                                                  Local
                                                </span>
                                              )}
                                              <ExternalLink className="w-3 h-3 text-[var(--color-text-dim)] group-hover/res:text-[var(--color-primary)] transition-colors flex-shrink-0" />
                                            </a>

                                            {/* Delete button (displays if canDelete is true) */}
                                            {canDelete && (
                                              <button
                                                onClick={() => handleDeleteResource(res)}
                                                className="text-[var(--color-text-dim)] hover:text-red-500 p-1 rounded opacity-0 group-hover/res:opacity-100 transition-opacity"
                                                title="Delete link"
                                              >
                                                <Trash2 className="w-3.5 h-3.5" />
                                              </button>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. NOTE-TAKING DIALOG MODAL */}
      <AnimatePresence>
        {editingNoteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingNoteId(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-white dark:bg-neutral-900 border border-[var(--color-border)] rounded-2xl shadow-2xl p-6 overflow-hidden z-10"
            >
              <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[var(--color-primary)]" />
                Study Notes
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] mb-4">
                Add summaries, formulas, or links. These are private and only viewable by you.
              </p>
              <textarea
                value={tempNoteText}
                onChange={(e) => setTempNoteText(e.target.value)}
                placeholder="Write your note contents... (e.g. Spaced repetition dates, reference notes)"
                className="w-full h-32 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] focus:border-[var(--color-primary)] rounded-xl p-3 text-sm outline-none resize-none focus:ring-4 focus:ring-[var(--color-primary)]/10 text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)]/50"
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setEditingNoteId(null)}
                  className="px-4 py-2 border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] rounded-xl text-xs font-semibold text-[var(--color-text-secondary)] transition-colors active:scale-95 duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNote}
                  className="px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-xl text-xs font-semibold transition-colors active:scale-95 duration-200"
                >
                  Save Note
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. ADD RESOURCE MODAL (Admin or Local User) */}
      <AnimatePresence>
        {addingResourceDayId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAddingResourceDayId(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-neutral-900 border border-[var(--color-border)] rounded-2xl shadow-2xl p-6 overflow-hidden z-10"
            >
              <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-1.5 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[var(--color-primary)]" />
                Add Curated Resource
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] mb-4">
                {isAuthenticated && user?.role === 'ADMIN'
                  ? 'Admin mode: This link will be saved to the database and will be visible to everyone.'
                  : 'User/Guest mode: This link will be saved in your browser storage (only visible to you).'}
              </p>
              
              <form onSubmit={handleAddResource} className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-secondary)] block mb-1">
                    Resource Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newResourceTitle}
                    onChange={(e) => setNewResourceTitle(e.target.value)}
                    placeholder="e.g. PyTorch Tensor Tutorial"
                    className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] focus:border-[var(--color-primary)] rounded-xl py-2 px-3 text-xs outline-none text-[var(--color-text-primary)]"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-secondary)] block mb-1">
                    URL Address
                  </label>
                  <input
                    type="url"
                    required
                    value={newResourceUrl}
                    onChange={(e) => setNewResourceUrl(e.target.value)}
                    placeholder="e.g. https://www.youtube.com/watch?v=..."
                    className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] focus:border-[var(--color-primary)] rounded-xl py-2 px-3 text-xs outline-none text-[var(--color-text-primary)]"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-secondary)] block mb-1">
                    Resource Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['YOUTUBE', 'BLOG'].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setNewResourceType(type)}
                        className={`py-2 text-center text-xs font-semibold border rounded-xl capitalize transition-colors ${
                          newResourceType === type
                            ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-sm'
                            : 'bg-[var(--color-bg-secondary)] border-[var(--color-border)] text-[var(--color-text-secondary)]'
                        }`}
                      >
                        {type.toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-2">
                  <button
                    type="button"
                    onClick={() => setAddingResourceDayId(null)}
                    className="px-4 py-2 border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] rounded-xl text-xs font-semibold text-[var(--color-text-secondary)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-xl text-xs font-semibold"
                  >
                    Create Resource
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
