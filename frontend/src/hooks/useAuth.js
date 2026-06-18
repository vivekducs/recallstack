// frontend/src/hooks/useAuth.js
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync token & user from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (savedToken && savedUser) {
        setToken(savedToken);
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token: userToken, userId, role, name, username } = res.data;
      
      const profile = { id: userId, name, username, email, role };
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(profile));
      }
      
      setToken(userToken);
      setUser(profile);
      return { success: true };
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
      const res = await axios.post(`${API_URL}/auth/register`, {
        name,
        username,
        email,
        password
      });
      const { token: userToken, userId, role } = res.data;
      const profile = { id: userId, name, username, email, role };

      if (typeof window !== 'undefined') {
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(profile));
      }

      setToken(userToken);
      setUser(profile);
      return { success: true };
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

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    setToken(null);
    setUser(null);
  };

  // Helper to get authenticated headers
  const getAuthHeaders = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  return {
    user,
    token,
    loading,
    login,
    register,
    logout,
    getAuthHeaders,
    isAuthenticated: !!token
  };
}
