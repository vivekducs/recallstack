// frontend/src/app/(auth)/reset-password/page.js
'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Reset token is missing from the URL.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        password
      });
      setSuccess(res.data.message || 'Your password has been reset successfully.');
      setPassword('');
      setConfirmPassword('');
      
      // Auto redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.response?.data?.errors?.[0] || 'Invalid or expired token.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="w-full text-center py-6">
        <div className="p-4 mb-6 rounded-lg text-sm text-[var(--color-error)] border border-[var(--color-error)]/20 bg-[var(--color-error)]/10">
          Reset token is invalid or missing. Please request a new password reset link.
        </div>
        <Link href="/forgot-password" className="hover:underline font-semibold text-[var(--color-primary)]">
          Request new reset link
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Card variant="standard" className="p-8">
        
        <header className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2 text-[var(--color-text-primary)]">
            Set New Password
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
            Enter and confirm your new password below.
          </p>
        </header>

        {error && (
          <div className="p-4 mb-6 rounded-lg text-sm text-[var(--color-error)] border border-[var(--color-error)]/20 bg-[var(--color-error)]/10">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 mb-6 rounded-lg text-sm text-[var(--color-success)] border border-[var(--color-success)]/20 bg-[var(--color-success)]/10">
            {success} Redirecting to login page...
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password input field */}
            <Input
              id="reset-password"
              type="password"
              label="New Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* Confirm Password input field */}
            <Input
              id="reset-confirm"
              type="password"
              label="Confirm Password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            {/* Action button */}
            <Button
              type="submit"
              loading={loading}
              variant="primary"
              className="w-full mt-4"
            >
              Reset Password
            </Button>
          </form>
        )}

        <footer className="text-center mt-6 text-xs sm:text-sm text-[var(--color-text-secondary)]">
          <Link href="/login" className="hover:underline font-semibold text-[var(--color-primary)]">
            Back to Sign In
          </Link>
        </footer>

      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center p-20 min-h-[300px]">
        <div className="w-[20px] h-[20px] border-2 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin"></div>
        <span className="text-xs font-mono text-[var(--color-text-secondary)] mt-3">Loading page context...</span>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
