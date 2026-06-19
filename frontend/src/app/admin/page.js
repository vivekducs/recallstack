// frontend/src/app/admin/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import useAuth from '@/hooks/useAuth';
import Card from '@/components/common/Card';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading, getAuthHeaders } = useAuth();
  
  const [activeTab, setActiveTab] = useState('subjects');
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Subject Form State
  const [sName, setSName] = useState('');
  const [sSlug, setSSlug] = useState('');
  const [sDesc, setSDesc] = useState('');
  const [sIcon, setSIcon] = useState('');
  const [sColor, setSColor] = useState('#3B82F6');
  
  // Topic Form State
  const [tName, setTName] = useState('');
  const [tSlug, setTSlug] = useState('');
  const [tDesc, setTDesc] = useState('');
  const [tSubjectId, setTSubjectId] = useState('');

  // Check auth
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      // Use the public endpoints to get subjects (but might need an admin one if we want empty subjects too)
      const res = await axios.get(`${API_URL}/subjects`);
      setSubjects(res.data);
      
      // If we have subjects, fetch topics for the first one just to populate the topics list?
      // Actually, to show all topics we might need a different approach, but let's just fetch when needed.
      if (res.data.length > 0 && !tSubjectId) {
        setTSubjectId(res.data[0].slug);
      }
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchData();
    }
  }, [user]);

  // Fetch topics when subject selection changes
  useEffect(() => {
    if (tSubjectId) {
      axios.get(`${API_URL}/subjects/${tSubjectId}/topics`)
        .then(res => setTopics(res.data))
        .catch(err => console.error(err));
    } else {
      setTopics([]);
    }
  }, [tSubjectId, subjects]); // Re-run if subjects change to refresh list

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await axios.post(
        `${API_URL}/subjects`, 
        { name: sName, slug: sSlug, description: sDesc, icon: sIcon, color: sColor },
        { headers: getAuthHeaders() }
      );
      setSuccess(`Subject "${sName}" created successfully!`);
      setSName(''); setSSlug(''); setSDesc('');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create subject');
    }
  };

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!tSubjectId) return setError('Please select a subject first');
    
    try {
      await axios.post(
        `${API_URL}/subjects/${tSubjectId}/topics`, 
        { name: tName, slug: tSlug, description: tDesc },
        { headers: getAuthHeaders() }
      );
      setSuccess(`Topic "${tName}" created successfully!`);
      setTName(''); setTSlug(''); setTDesc('');
      
      // Refresh topics
      const res = await axios.get(`${API_URL}/subjects/${tSubjectId}/topics`);
      setTopics(res.data);
      fetchData(); // Refresh subject counts
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create topic');
    }
  };

  if (authLoading || !user || user.role !== 'ADMIN') {
    return (
      <div className="w-full flex justify-center py-20">
        <div className="animate-pulse text-[var(--color-text-secondary)]">Authenticating...</div>
      </div>
    );
  }

  const subjectOptions = subjects.map(s => ({ value: s.slug, label: s.name }));

  return (
    <div className="w-full">
      <header className="mb-8 border-b border-[var(--color-border)] pb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Admin Control Panel</h1>
          <Badge variant="PENDING" className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20">
            ADMIN
          </Badge>
        </div>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Manage the knowledge base hierarchy by creating subjects and topics.
        </p>
      </header>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-[var(--color-border)] mb-8">
        <button
          className={`pb-3 px-2 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'subjects' 
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]' 
              : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
          onClick={() => { setActiveTab('subjects'); setError(''); setSuccess(''); }}
        >
          Manage Subjects
        </button>
        <button
          className={`pb-3 px-2 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'topics' 
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]' 
              : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
          onClick={() => { setActiveTab('topics'); setError(''); setSuccess(''); }}
        >
          Manage Topics
        </button>
      </div>

      {error && (
        <div className="p-4 mb-6 rounded text-sm text-[var(--color-error)] bg-[var(--color-error)]/10 border border-[var(--color-error)]/20">
          ⚠️ {error}
        </div>
      )}
      
      {success && (
        <div className="p-4 mb-6 rounded text-sm text-[var(--color-success)] bg-[var(--color-success)]/10 border border-[var(--color-success)]/20">
          ✅ {success}
        </div>
      )}

      {/* Two-Column Layout (Form on left 40%, List on right 60%) */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Column: Form */}
        <div className="w-full lg:w-[40%] flex-shrink-0">
          <Card variant="standard">
            {activeTab === 'subjects' ? (
              <form onSubmit={handleCreateSubject} className="space-y-5">
                <h3 className="text-[18px] font-semibold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-3 mb-4">
                  Create New Subject
                </h3>
                
                <Input
                  id="s-name" label="Subject Name" required
                  placeholder="e.g. Data Structures"
                  value={sName} onChange={(e) => setSName(e.target.value)}
                />
                <Input
                  id="s-slug" label="URL Slug" required
                  placeholder="e.g. dsa"
                  value={sSlug} onChange={(e) => setSSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                />
                <Input
                  id="s-desc" label="Description" type="textarea"
                  placeholder="Brief description of this domain..."
                  value={sDesc} onChange={(e) => setSDesc(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    id="s-icon" label="Icon Identifier" required
                    placeholder="e.g. code, star"
                    value={sIcon} onChange={(e) => setSIcon(e.target.value)}
                  />
                  <Input
                    id="s-color" label="Theme Color" type="color" required
                    value={sColor} onChange={(e) => setSColor(e.target.value)}
                    className="h-full"
                  />
                </div>
                
                <Button type="submit" variant="primary" className="w-full mt-2">
                  Create Subject
                </Button>
              </form>
            ) : (
              <form onSubmit={handleCreateTopic} className="space-y-5">
                <h3 className="text-[18px] font-semibold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-3 mb-4">
                  Create New Topic
                </h3>
                
                <Input
                  id="t-subject" type="select" label="Parent Subject" required
                  options={subjectOptions}
                  value={tSubjectId} onChange={(e) => setTSubjectId(e.target.value)}
                />
                
                <Input
                  id="t-name" label="Topic Name" required
                  placeholder="e.g. Sorting Algorithms"
                  value={tName} onChange={(e) => setTName(e.target.value)}
                />
                <Input
                  id="t-slug" label="URL Slug" required
                  placeholder="e.g. sorting"
                  value={tSlug} onChange={(e) => setTSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                />
                <Input
                  id="t-desc" label="Description" type="textarea"
                  placeholder="What will users learn here?"
                  value={tDesc} onChange={(e) => setTDesc(e.target.value)}
                />
                
                <Button type="submit" variant="primary" className="w-full mt-2" disabled={!tSubjectId}>
                  Create Topic
                </Button>
              </form>
            )}
          </Card>
        </div>

        {/* Right Column: List */}
        <div className="w-full lg:w-[60%]">
          <Card variant="standard" className="h-full min-h-[400px]">
            <h3 className="text-[18px] font-semibold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-3 mb-4 flex justify-between items-center">
              <span>{activeTab === 'subjects' ? 'Existing Subjects' : 'Existing Topics'}</span>
              <Badge variant="DEFAULT">
                {activeTab === 'subjects' ? subjects.length : topics.length} Total
              </Badge>
            </h3>

            {loading ? (
              <div className="animate-pulse space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-16 bg-[var(--color-bg-secondary)] rounded w-full"></div>)}
              </div>
            ) : activeTab === 'subjects' ? (
              subjects.length === 0 ? (
                <p className="text-sm text-[var(--color-text-secondary)] italic">No subjects exist yet.</p>
              ) : (
                <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-2">
                  {subjects.map(sub => (
                    <div key={sub.id} className="flex items-center justify-between p-3 border border-[var(--color-border)] rounded-md hover:bg-[var(--color-bg-secondary)] transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded flex items-center justify-center bg-[var(--color-bg-secondary)]">
                          {sub.icon}
                        </span>
                        <div>
                          <p className="font-semibold text-sm text-[var(--color-text-primary)]">{sub.name}</p>
                          <p className="text-xs text-[var(--color-text-secondary)] font-mono">{sub.slug}</p>
                        </div>
                      </div>
                      <div className="text-right text-xs text-[var(--color-text-secondary)]">
                        <p>{sub.topicsCount || 0} topics</p>
                        <p>{sub.notesCount || 0} notes</p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              topics.length === 0 ? (
                <p className="text-sm text-[var(--color-text-secondary)] italic">
                  {tSubjectId ? 'No topics in this subject yet.' : 'Select a subject to view its topics.'}
                </p>
              ) : (
                <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-2">
                  {topics.map(topic => (
                    <div key={topic.id} className="flex items-center justify-between p-3 border border-[var(--color-border)] rounded-md hover:bg-[var(--color-bg-secondary)] transition-colors">
                      <div>
                        <p className="font-semibold text-sm text-[var(--color-text-primary)]">{topic.name}</p>
                        <p className="text-xs text-[var(--color-text-secondary)] font-mono">{topic.slug}</p>
                      </div>
                      <div className="text-right text-xs text-[var(--color-text-secondary)]">
                        <Badge variant="DEFAULT">{topic.notesCount || 0} notes</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </Card>
        </div>

      </div>
    </div>
  );
}
