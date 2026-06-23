// frontend/src/hooks/useAuth.js
'use client';

import { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync user profile cache from localStorage, and verify/update via session check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          setUser(null);
        }
      }
    }

    const checkSession = async () => {
      try {
        const res = await apiClient.get('/auth/me');
        setUser(res.data);
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(res.data));
        }
      } catch (err) {
        setUser(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user');
        }
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      const { userId, role, name, username } = res.data;
      
      const profile = { id: userId, name, username, email, role };
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(profile));
      }
      
      setUser(profile);
      return { success: true, user: profile };
    } catch (err) {
      console.error('Login failed:', err);
      return {
        success: false,
        error: err.response?.data?.error || 'Invalid email or password'
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, username, email, password) => {
    setLoading(true);
    try {
      const res = await apiClient.post('/auth/register', {
        name,
        username,
        email,
        password
      });
      const { userId, role } = res.data;
      const profile = { id: userId, name, username, email, role };

      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(profile));
      }

      setUser(profile);
      return { success: true, user: profile };
    } catch (err) {
      console.error('Registration failed:', err);
      return {
        success: false,
        error: err.response?.data?.error || 'Registration failed'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
      console.error('Logout request failed:', err);
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
    setUser(null);
  };

  const getAuthHeaders = () => {
    return {};
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
    getAuthHeaders,
    isAuthenticated: !!user
  };
}
