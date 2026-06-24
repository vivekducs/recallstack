// frontend/src/hooks/useAuth.js
'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import apiClient from '../services/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync user profile cache and token from localStorage, and verify/update via session check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user');
      const savedToken = localStorage.getItem('token');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          setUser(null);
        }
      }
      if (savedToken) {
        setToken(savedToken);
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
        setToken(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
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
      const { token: receivedToken, userId, role, name, username } = res.data;
      
      const profile = { id: userId, name, username, email, role };
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', receivedToken);
        localStorage.setItem('user', JSON.stringify(profile));
      }
      
      setUser(profile);
      setToken(receivedToken);
      return { success: true, user: profile };
    } catch (err) {
      console.error('Login failed:', err);
      const backendError = err.response?.data?.error || 
                           (err.response?.data?.errors ? err.response.data.errors.join(', ') : null) || 
                           'Invalid email or password';
      return {
        success: false,
        error: backendError
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
      const { token: receivedToken, userId, role } = res.data;
      const profile = { id: userId, name, username, email, role };

      if (typeof window !== 'undefined') {
        localStorage.setItem('token', receivedToken);
        localStorage.setItem('user', JSON.stringify(profile));
      }

      setUser(profile);
      setToken(receivedToken);
      return { success: true, user: profile };
    } catch (err) {
      console.error('Registration failed:', err);
      const backendError = err.response?.data?.error || 
                           (err.response?.data?.errors ? err.response.data.errors.join(', ') : null) || 
                           'Registration failed';
      return {
        success: false,
        error: backendError
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
      localStorage.removeItem('token');
    }
    setUser(null);
    setToken(null);
  };

  const getAuthHeaders = () => {
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        getAuthHeaders,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
