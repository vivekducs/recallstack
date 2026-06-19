// frontend/src/app/settings/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import useAuth from '@/hooks/useAuth';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Breadcrumb from '@/components/common/Breadcrumb';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function SettingsPage() {
  const router = useRouter();
  const { user, token, getAuthHeaders, isAuthenticated, loading: authLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'notifications'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Profile Form State
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');

  // Preferences Form State
  const [prefs, setPrefs] = useState({
    newComment: true,
    newReply: true,
    helpful: false,
    newNoteInTopic: false,
    digestFrequency: 'daily'
  });

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      
      const fetchUserData = async () => {
        try {
          const res = await axios.get(`${API_URL}/auth/me`, {
            headers: getAuthHeaders()
          });
          const data = res.data;
          
          setName(data.name || '');
          setBio(data.bio || '');
          setAvatar(data.avatar || '');
          
          if (data.emailPreferences) {
            // Need to parse if it comes as a string, but Prisma JSON field usually returns an object
            const parsedPrefs = typeof data.emailPreferences === 'string' 
              ? JSON.parse(data.emailPreferences) 
              : data.emailPreferences;
              
            setPrefs(prev => ({ ...prev, ...parsedPrefs }));
          }
        } catch (err) {
          console.error('Failed to load user settings:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchUserData();
    }
  }, [authLoading, isAuthenticated, router]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Name cannot be empty.');
      return;
    }

    setSaving(true);
    try {
      await axios.put(`${API_URL}/auth/profile`, {
        name,
        bio,
        avatar
      }, {
        headers: getAuthHeaders()
      });
      showToast('Profile updated successfully');
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePref = async (key) => {
    const newPrefs = { ...prefs, [key]: !prefs[key] };
    setPrefs(newPrefs);
    await savePreferences(newPrefs);
  };

  const handleDigestChange = async (e) => {
    const newPrefs = { ...prefs, digestFrequency: e.target.value };
    setPrefs(newPrefs);
    await savePreferences(newPrefs);
  };

  const savePreferences = async (preferencesToSave) => {
    try {
      await axios.patch(`${API_URL}/auth/preferences`, preferencesToSave, {
        headers: getAuthHeaders()
      });
      showToast('Preferences saved');
    } catch (err) {
      console.error('Failed to update preferences:', err);
      showToast('Failed to save preferences');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 min-h-[300px]">
        <div className="w-[20px] h-[20px] border-2 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin"></div>
        <span className="text-xs font-mono text-[var(--color-text-secondary)] mt-3">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
      <Breadcrumb 
        items={[
          { name: 'Home', href: '/' },
          { name: 'Settings' }
        ]} 
        className="mb-8"
      />

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">Settings</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">Manage your personal profile and notification preferences.</p>
      </header>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[var(--color-primary)] text-white px-4 py-2 rounded shadow-lg text-sm z-50 animate-in slide-in-from-bottom-5">
          {toastMessage}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Sidebar Tabs */}
        <div className="w-full md:w-64 flex-shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0">
          <button
            onClick={() => setActiveTab('profile')}
            className={`text-left px-4 py-2 rounded text-sm transition-colors whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-[var(--color-primary)] text-white font-semibold'
                : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]'
            }`}
          >
            Profile Details
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`text-left px-4 py-2 rounded text-sm transition-colors whitespace-nowrap ${
              activeTab === 'notifications'
                ? 'bg-[var(--color-primary)] text-white font-semibold'
                : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]'
            }`}
          >
            Email Notifications
          </button>
        </div>

        {/* Settings Content Area */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <Card variant="standard" className="p-6">
              <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-6 border-b border-[var(--color-border)] pb-4">
                Public Profile
              </h2>
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1">Avatar URL</label>
                  <p className="text-xs text-[var(--color-text-secondary)] mb-2">Provide a direct link to an image (e.g. Imgur, GitHub).</p>
                  <Input 
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full"
                  />
                  {avatar && (
                    <div className="mt-3">
                      <img src={avatar} alt="Avatar Preview" className="w-16 h-16 rounded-full object-cover border border-[var(--color-border)]" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1">Display Name *</label>
                  <Input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full max-w-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1">Bio</label>
                  <p className="text-xs text-[var(--color-text-secondary)] mb-2">Write a short introduction about yourself and your interests.</p>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-text-secondary)] focus:border-[var(--color-primary)] rounded px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)]/60 outline-none transition-all duration-150 focus:ring-2 focus:ring-[var(--color-primary)]/20 resize-y"
                    placeholder="Software engineer interested in distributed systems..."
                  />
                </div>

                <div className="pt-4 border-t border-[var(--color-border)] flex justify-end">
                  <Button type="submit" variant="primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Profile'}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card variant="standard" className="p-6">
              <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-6 border-b border-[var(--color-border)] pb-4">
                Notification Preferences
              </h2>
              
              <div className="space-y-6">
                
                {/* Comments & Replies */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Discussions</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-[var(--color-text-primary)]">New Comments</div>
                      <div className="text-xs text-[var(--color-text-secondary)]">Get notified when someone comments on your notes.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={prefs.newComment} onChange={() => handleTogglePref('newComment')} className="sr-only peer" />
                      <div className="w-11 h-6 bg-[var(--color-border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-[var(--color-text-primary)]">New Replies</div>
                      <div className="text-xs text-[var(--color-text-secondary)]">Get notified when someone replies to your comment.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={prefs.newReply} onChange={() => handleTogglePref('newReply')} className="sr-only peer" />
                      <div className="w-11 h-6 bg-[var(--color-border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
                    </label>
                  </div>
                </div>

                <hr className="border-[var(--color-border)]" />

                {/* Ratings */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Engagement</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-[var(--color-text-primary)]">Helpful Ratings</div>
                      <div className="text-xs text-[var(--color-text-secondary)]">Get notified when your note receives a helpful rating.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={prefs.helpful} onChange={() => handleTogglePref('helpful')} className="sr-only peer" />
                      <div className="w-11 h-6 bg-[var(--color-border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
                    </label>
                  </div>
                </div>

                <hr className="border-[var(--color-border)]" />

                {/* Content Discovery */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Content Discovery</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-[var(--color-text-primary)]">New Notes in Subscribed Topics</div>
                      <div className="text-xs text-[var(--color-text-secondary)]">Get notified when a new note is published in topics you follow.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={prefs.newNoteInTopic} onChange={() => handleTogglePref('newNoteInTopic')} className="sr-only peer" />
                      <div className="w-11 h-6 bg-[var(--color-border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
                    </label>
                  </div>
                </div>

                <hr className="border-[var(--color-border)]" />

                {/* Email Frequency */}
                <div className="pt-2">
                  <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1">Email Digest Frequency</label>
                  <p className="text-xs text-[var(--color-text-secondary)] mb-3">How often would you like to receive summary emails?</p>
                  <select 
                    value={prefs.digestFrequency}
                    onChange={handleDigestChange}
                    className="w-full sm:w-64 bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-text-secondary)] focus:border-[var(--color-primary)] rounded px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none"
                  >
                    <option value="immediate">Immediate (As they happen)</option>
                    <option value="daily">Daily Digest</option>
                    <option value="weekly">Weekly Digest</option>
                    <option value="off">Off (Don't send summary emails)</option>
                  </select>
                </div>

              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
