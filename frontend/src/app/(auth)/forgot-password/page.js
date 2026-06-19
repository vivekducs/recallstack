// frontend/src/app/(auth)/forgot-password/page.js
'use client';

import { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/auth/forgot-password`, { email });
      setSuccess(res.data.message || 'Check your inbox for a password reset link.');
      setEmail('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.response?.data?.errors?.[0] || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Card variant="standard" className="p-8">
        
        <header className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2 text-[var(--color-text-primary)]">
            Reset Password
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </header>

        {error && (
          <div className="p-4 mb-6 rounded-lg text-sm text-[var(--color-error)] border border-[var(--color-error)]/20 bg-[var(--color-error)]/10">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="p-4 mb-6 rounded-lg text-sm text-[var(--color-success)] border border-[var(--color-success)]/20 bg-[var(--color-success)]/10">
            ✅ {success}
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email input field */}
            <Input
              id="forgot-email"
              type="email"
              label="Email Address"
              placeholder="e.g. user@recallstack.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {/* Action button */}
            <Button
              type="submit"
              loading={loading}
              variant="primary"
              className="w-full mt-2"
            >
              Send Reset Link
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
