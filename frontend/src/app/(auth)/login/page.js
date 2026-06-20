// frontend/src/app/(auth)/login/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useAuth from '@/hooks/useAuth';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      if (result.user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="w-full">
      <Card variant="standard" className="p-8">
        
        <header className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2 text-[var(--color-text-primary)]">
            Welcome Back
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
            Log in to manage bookmarks, edit notes, and comment.
          </p>
        </header>

        {error && (
          <div className="p-4 mb-6 rounded-lg text-sm text-[var(--color-error)] border border-[var(--color-error)]/20 bg-[var(--color-error)]/10">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email input field */}
          <Input
            id="login-email"
            type="email"
            label="Email Address"
            placeholder="e.g. user@recallstack.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Password input field */}
          <Input
            id="login-password"
            type="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex justify-end text-xs">
            <Link href="/forgot-password" className="hover:underline text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]">
              Forgot Password?
            </Link>
          </div>

          {/* Action button */}
          <Button
            type="submit"
            loading={loading}
            variant="primary"
            className="w-full mt-2"
          >
            Sign In
          </Button>
        </form>

        <footer className="text-center mt-6 text-xs sm:text-sm text-[var(--color-text-secondary)]">
          Don't have an account?{' '}
          <Link href="/register" className="hover:underline font-semibold text-[var(--color-primary)]">
            Create one
          </Link>
        </footer>

      </Card>
    </div>
  );
}
