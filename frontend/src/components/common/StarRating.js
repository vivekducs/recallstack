// frontend/src/components/common/StarRating.js
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '@/hooks/useAuth';

export default function StarRating({ noteId, initialAverage = 0, initialCount = 0, readOnly = false }) {
  const { getAuthHeaders, isAuthenticated } = useAuth();
  const [rating, setRating] = useState(0); // user's current rating
  const [hover, setHover] = useState(0);
  const [average, setAverage] = useState(initialAverage);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(!readOnly); // Only load if interactive to fetch user's rating
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!readOnly && isAuthenticated) {
      axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/notes/${noteId}/rating`, {
        headers: getAuthHeaders()
      }).then(res => {
        setAverage(res.data.averageRating || 0);
        setCount(res.data.ratingCount || 0);
        setRating(res.data.userRating || 0);
        setLoading(false);
      }).catch(err => {
        console.error('Failed to load rating', err);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [noteId, readOnly, isAuthenticated]);

  const handleRate = async (value) => {
    if (readOnly || !isAuthenticated || saving) return;
    
    // Toggle off if clicking the same rating
    const isRemoving = rating === value;
    const newValue = isRemoving ? 0 : value;
    
    setRating(newValue);
    setSaving(true);
    
    try {
      if (isRemoving) {
        const res = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/notes/${noteId}/rate`, {
          headers: getAuthHeaders()
        });
        setAverage(res.data.averageRating);
        setCount(res.data.ratingCount);
      } else {
        const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/notes/${noteId}/rate`, 
          { rating: newValue },
          { headers: getAuthHeaders() }
        );
        setAverage(res.data.averageRating);
        setCount(res.data.ratingCount);
      }
    } catch (err) {
      console.error('Failed to save rating', err);
      // Revert optimism if needed (complex, but ignoring for now)
    } finally {
      setSaving(false);
    }
  };

  const displayRating = readOnly ? average : (hover || rating || average);

  return (
    <div className="flex items-center gap-2">
      <div className={`flex ${!readOnly && isAuthenticated ? 'cursor-pointer' : ''}`}>
        {[1, 2, 3, 4, 5].map((star) => {
          let filled = false;
          if (readOnly) {
            filled = star <= Math.round(average);
          } else {
            filled = star <= displayRating;
          }

          return (
            <svg
              key={star}
              className={`w-5 h-5 transition-colors ${filled ? 'text-yellow-400' : 'text-zinc-600'} ${loading || saving ? 'opacity-50' : 'opacity-100'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
              onMouseEnter={() => !readOnly && isAuthenticated && setHover(star)}
              onMouseLeave={() => !readOnly && isAuthenticated && setHover(0)}
              onClick={() => handleRate(star)}
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          );
        })}
      </div>
      
      <div className="text-xs text-zinc-400">
        <span className="font-semibold text-white">{average.toFixed(1)}</span>
        <span className="mx-1">&middot;</span>
        <span>{count} {count === 1 ? 'rating' : 'ratings'}</span>
        
        {!readOnly && !isAuthenticated && (
          <span className="ml-2 text-[var(--color-primary)]">Log in to rate</span>
        )}
      </div>
    </div>
  );
}
