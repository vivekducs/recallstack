// frontend/src/app/admin/users/page.js
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '@/hooks/useAuth';
import Card from '@/components/common/Card';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import Table from '@/components/common/Table';
import Badge from '@/components/common/Badge';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ManageUsersPage() {
  const { getAuthHeaders, user: authUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_URL}/admin/users`, {
        params: { page, limit: 10, search },
        headers: getAuthHeaders()
      });
      setUsers(res.data.users);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to load users list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleDeleteUser = async (id, name) => {
    if (id === authUser.id) {
      setError('You cannot delete your own admin account.');
      return;
    }
    if (!window.confirm(`Are you absolutely sure you want to delete user "${name}"? This action will permanently remove their profile and all notes.`)) {
      return;
    }
    setError(''); setSuccess('');
    try {
      await axios.delete(`${API_URL}/admin/users/${id}`, {
        headers: getAuthHeaders()
      });
      setSuccess(`User "${name}" has been deleted.`);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete user.');
    }
  };

  const tableHeaders = [
    { key: 'name', label: 'Name' },
    { key: 'username', label: 'Username' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'joined', label: 'Joined' },
    { key: 'notes', label: 'Notes count' },
    { key: 'actions', label: 'Actions', align: 'right' }
  ];

  const renderCell = (row, key) => {
    if (key === 'name') return <span className="font-semibold">{row.name}</span>;
    if (key === 'username') return <span className="font-mono text-xs">@{row.username}</span>;
    if (key === 'role') {
      return (
        <Badge variant={row.role === 'ADMIN' ? 'PENDING' : 'DEFAULT'}>
          {row.role}
        </Badge>
      );
    }
    if (key === 'joined') return new Date(row.createdAt).toLocaleDateString();
    if (key === 'notes') return row.noteCount || 0;
    if (key === 'actions') {
      return (
        <Button 
          variant="secondary" 
          className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 text-xs px-2.5 py-1"
          onClick={() => handleDeleteUser(row.id, row.name)}
          disabled={row.id === authUser.id}
        >
          Delete
        </Button>
      );
    }
    return row[key];
  };

  return (
    <div>
      <header className="mb-8 border-b border-[var(--color-border)] pb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Manage Users</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Browse registered users, track content production, and moderate accounts.
          </p>
        </div>
      </header>

      {error && (
        <div className="p-4 mb-6 rounded text-sm text-[var(--color-error)] bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 animate-fade-in">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-4 mb-6 rounded text-sm text-[var(--color-success)] bg-[var(--color-success)]/10 border border-[var(--color-success)]/20 animate-fade-in">
          {success}
        </div>
      )}

      {/* Search Header */}
      <Card variant="standard" className="mb-6">
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="flex-1">
            <Input
              id="user-search"
              placeholder="Search by name, email, or username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full"
            />
          </div>
          <Button type="submit" variant="primary" className="px-6">
            Search
          </Button>
        </form>
      </Card>

      {/* Users Table */}
      <Card variant="standard" className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center animate-pulse text-[var(--color-text-secondary)]">
            Loading registered users...
          </div>
        ) : (
          <>
            <Table 
              headers={tableHeaders} 
              data={users} 
              renderCell={renderCell}
            />

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-[var(--color-border)] flex items-center justify-between bg-[var(--color-bg-secondary)]/50">
                <span className="text-xs text-[var(--color-text-secondary)]">
                  Showing Page {page} of {totalPages} ({total} total users)
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="text-xs px-3 py-1.5"
                    disabled={page === 1}
                    onClick={() => setPage(prev => prev - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    className="text-xs px-3 py-1.5"
                    disabled={page === totalPages}
                    onClick={() => setPage(prev => prev + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
