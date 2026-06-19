// frontend/src/app/(auth)/register/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useAuth from '@/hooks/useAuth';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    const result = await register(name, username, email, password);
    setLoading(false);

    if (result.success) {
      router.push('/');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="w-full">
      <Card variant="standard" className="p-8">
        
        <header className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2 text-[var(--color-text-primary)]">
            Get Started
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
            Create an account to join the RecallStack platform.
          </p>
        </header>

        {error && (
          <div className="p-4 mb-6 rounded-lg text-sm text-[var(--color-error)] border border-[var(--color-error)]/20 bg-[var(--color-error)]/10">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name input field */}
          <Input
            id="register-name"
            type="text"
            label="Full Name"
            placeholder="e.g. Jane Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          {/* Username input field */}
          <Input
            id="register-username"
            type="text"
            label="Username"
            placeholder="e.g. janedoe"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          {/* Email input field */}
          <Input
            id="register-email"
            type="email"
            label="Email Address"
            placeholder="e.g. jane@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Password input field */}
          <Input
            id="register-password"
            type="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Action button */}
          <Button
            type="submit"
            loading={loading}
            variant="primary"
            className="w-full mt-4"
          >
            Create Account
          </Button>
        </form>

        <footer className="text-center mt-6 text-xs sm:text-sm text-[var(--color-text-secondary)]">
          Already have an account?{' '}
          <Link href="/login" className="hover:underline font-semibold text-[var(--color-primary)]">
            Sign in
          </Link>
        </footer>

      </Card>
    </div>
  );
}
