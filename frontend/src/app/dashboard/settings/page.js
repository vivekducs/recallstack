// frontend/src/app/dashboard/settings/page.js
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import useAuth from '@/hooks/useAuth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ProfileSettingsPage() {
  const { user, token, getAuthHeaders, isAuthenticated, loading: authLoading } = useAuth();
  
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        // Fetch current detailed profile info
        async function fetchProfile() {
          try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/auth/me`, {
              headers: getAuthHeaders(),
            });
            const profile = res.data;
            setName(profile.name || '');
            setBio(profile.bio || '');
            setAvatar(profile.avatar || '');
          } catch (err) {
            console.error('Failed to load profile details:', err);
            setError('Could not load current profile info.');
          } finally {
            setLoading(false);
          }
        }
        fetchProfile();
      } else {
        setLoading(false);
      }
    }
  }, [authLoading, isAuthenticated, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Name is required and cannot be empty.');
      return;
    }

    try {
      setSaving(true);
      const res = await axios.put(`${API_URL}/auth/profile`, 
        { name, bio, avatar },
        { headers: getAuthHeaders() }
      );

      setSuccess('Profile updated successfully.');
      
      // Update localStorage so context updates immediately
      if (typeof window !== 'undefined') {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const profile = JSON.parse(savedUser);
          profile.name = res.data.name;
          profile.bio = res.data.bio;
          profile.avatar = res.data.avatar;
          localStorage.setItem('user', JSON.stringify(profile));
        }
      }
    } catch (err) {
      console.error('Failed to update profile settings:', err);
      setError(err.response?.data?.error || 'Failed to update profile settings. Try again.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="loading-pulse" style={{ color: 'var(--color-text-muted)' }}>Loading settings...</div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-bg)' }}>
        <div className="max-w-md w-full glass-card p-8 text-center">
          <h2 className="text-2xl font-bold mb-3" style={{ color: 'white' }}>Authentication Required</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
            Sign in to access your profile settings.
          </p>
          <Link href="/login" className="btn-primary inline-block">
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-12" style={{ background: 'var(--color-bg)' }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full opacity-[0.03]" style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)' }}></div>
      </div>

      <div className="relative max-w-2xl mx-auto px-6">
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-8" style={{ color: 'var(--color-text-dim)' }}>
          <Link href="/" className="hover:underline" style={{ color: 'var(--color-primary)' }}>Home</Link>
          <span>/</span>
          <Link href="/dashboard" className="hover:underline" style={{ color: 'var(--color-primary)' }}>Dashboard</Link>
          <span>/</span>
          <span style={{ color: 'var(--color-text-muted)' }}>Settings</span>
        </nav>

        <header className="mb-10">
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'white' }}>Profile Settings</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Configure your creator profile, bio, and avatar.
          </p>
        </header>

        {success && (
          <div className="glass-card p-4 mb-6 text-center border-emerald-500/30">
            <p className="text-emerald-400 text-sm font-semibold">{success}</p>
          </div>
        )}

        {error && (
          <div className="glass-card p-4 mb-6 text-center border-red-500/30">
            <p className="text-red-400 text-sm font-semibold">{error}</p>
          </div>
        )}

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>
                Username (read-only)
              </label>
              <input
                type="text"
                id="username"
                className="w-full p-3 rounded border text-zinc-500 cursor-not-allowed text-sm"
                style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
                value={`@${user?.username || 'username'}`}
                disabled
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>
                Email (read-only)
              </label>
              <input
                type="text"
                id="email"
                className="w-full p-3 rounded border text-zinc-500 cursor-not-allowed text-sm"
                style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
                value={user?.email || 'email'}
                disabled
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>
                Display Name
              </label>
              <input
                type="text"
                id="name"
                className="w-full p-3 rounded border text-white text-sm focus:outline-none focus:border-violet-500/50"
                style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="avatar" className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>
                Avatar Image URL
              </label>
              <input
                type="text"
                id="avatar"
                className="w-full p-3 rounded border text-white text-sm focus:outline-none focus:border-violet-500/50"
                style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
                placeholder="https://example.com/avatar.jpg"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
              />
              <span className="text-xs block mt-1.5" style={{ color: 'var(--color-text-dim)' }}>
                Provide a URL for your profile image avatar.
              </span>
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>
                Bio
              </label>
              <textarea
                id="bio"
                rows="4"
                className="w-full p-3 rounded border text-white text-sm focus:outline-none focus:border-violet-500/50"
                style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
                placeholder="Tell others about your learning goals and stack experience..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <div className="pt-4 border-t flex justify-end gap-3" style={{ borderColor: 'var(--color-border)' }}>
              <Link href="/dashboard" className="btn-secondary">
                Cancel
              </Link>
              <button
                type="submit"
                className="btn-primary"
                disabled={saving}
              >
                {saving ? 'Saving Changes...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
