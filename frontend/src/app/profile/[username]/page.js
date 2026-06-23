// frontend/src/app/profile/[username]/page.js
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import Breadcrumb from '@/components/common/Breadcrumb';
import StarRating from '@/components/common/StarRating';

import useAuth from '@/hooks/useAuth';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ProfilePage() {
  const params = useParams();
  const username = params.username;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const currentUserId = user?.id;

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await axios.get(`${API_URL}/profiles/${username}`);
        setProfile(res.data);
        setIsFollowing(res.data.isFollowing);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [username]);

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      alert('Please log in to follow users');
      return;
    }

    setFollowLoading(true);
    try {
      if (isFollowing) {
        await axios.delete(`${API_URL}/profiles/${username}/follow`);
        setIsFollowing(false);
        setProfile(p => ({ ...p, followersCount: Math.max(0, p.followersCount - 1) }));
      } else {
        await axios.post(`${API_URL}/profiles/${username}/follow`, {});
        setIsFollowing(true);
        setProfile(p => ({ ...p, followersCount: p.followersCount + 1 }));
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Action failed');
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 min-h-[300px]">
        <div className="w-[20px] h-[20px] border-2 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin"></div>
        <span className="text-xs font-mono text-[var(--color-text-secondary)] mt-3">Loading profile...</span>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="w-full">
        <Breadcrumb items={[{ name: 'Home', href: '/' }, { name: 'Profile' }]} className="mb-8" />
        <Card variant="standard" className="text-center py-16">
          <h3 className="text-[18px] font-semibold text-[var(--color-text-primary)] mb-1">Error</h3>
          <p className="text-sm text-[var(--color-text-secondary)]">{error || 'Profile not found'}</p>
        </Card>
      </div>
    );
  }

  const isOwnProfile = currentUserId === profile.id;

  return (
    <div className="w-full">
      <Breadcrumb 
        items={[
          { name: 'Home', href: '/' },
          { name: profile.name }
        ]} 
        className="mb-8"
      />

      <Card variant="standard" className="mb-8 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          {profile.avatar ? (
            <img 
              src={profile.avatar} 
              alt={profile.name} 
              className="w-24 h-24 rounded-full object-cover border-4 border-[var(--color-bg-secondary)] shadow-sm"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center text-3xl font-bold border-4 border-[var(--color-bg-secondary)] shadow-sm">
              {profile.name.charAt(0).toUpperCase()}
            </div>
          )}
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{profile.name}</h1>
            <p className="text-[var(--color-text-secondary)] mb-3">@{profile.username}</p>
            
            <div className="flex flex-wrap gap-4 text-sm mb-4">
              <div className="flex flex-col">
                <span className="font-semibold text-[var(--color-text-primary)]">{profile.followersCount}</span>
                <span className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider">Followers</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-[var(--color-text-primary)]">{profile.followingCount}</span>
                <span className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider">Following</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-[var(--color-text-primary)]">{profile.notes?.length || 0}</span>
                <span className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider">Notes</span>
              </div>
            </div>

            {profile.bio && (
              <p className="text-sm text-[var(--color-text-primary)] leading-relaxed max-w-2xl bg-[var(--color-bg-secondary)] p-3 rounded">
                {profile.bio}
              </p>
            )}
          </div>

          <div className="mt-4 sm:mt-0 self-stretch sm:self-center">
            {!isOwnProfile ? (
              <Button 
                variant={isFollowing ? 'secondary' : 'primary'}
                onClick={handleFollowToggle}
                disabled={followLoading}
                className="w-full sm:w-auto px-6 py-2"
              >
                {followLoading ? 'Wait...' : isFollowing ? 'Unfollow' : 'Follow'}
              </Button>
            ) : (
              <Link href="/settings" passHref>
                <Button variant="secondary" className="w-full sm:w-auto px-6 py-2">
                  Edit Profile
                </Button>
              </Link>
            )}
          </div>
        </div>
      </Card>

      <section>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
          Published Notes
        </h2>

        {(!profile.notes || profile.notes.length === 0) ? (
          <Card variant="standard" className="text-center py-12">
            <p className="text-sm text-[var(--color-text-secondary)]">This user hasn't published any notes yet.</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {profile.notes.map((note) => (
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
                        {note.title}
                      </h3>

                      {note.excerpt && (
                        <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] line-clamp-2 mt-3 mb-4">
                          {note.excerpt}
                        </p>
                      )}

                      <div className="flex items-center gap-3 flex-wrap text-[12px] text-[var(--color-text-secondary)] mt-4">
                        <Badge variant={note.difficulty}>{note.difficulty}</Badge>
                        <span className="opacity-50">|</span>
                        <span>{note.views || 0} Views</span>
                        <span className="opacity-50">|</span>
                        <span>{note.helpfulCount || 0} Helpful</span>
                        <span className="opacity-50">|</span>
                        <div onClick={(e) => e.preventDefault()}>
                          <StarRating noteId={note.id} initialAverage={note.averageRating} initialCount={note.ratingCount} readOnly={true} />
                        </div>
                        {note.publishedAt && (
                          <>
                            <span className="opacity-50">|</span>
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
