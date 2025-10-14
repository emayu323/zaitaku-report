'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { getAuthClient } from '@/lib/firebase';

export default function LoginClient() {
  const router = useRouter();
  const auth = getAuthClient();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onLogin() {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      router.push('/');
    } catch (e: any) {
      setError(e?.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  async function onSignup() {
    setLoading(true);
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
      router.push('/');
    } catch (e: any) {
      setError(e?.message ?? 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 480, margin: '64px auto', padding: 16 }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Login</h1>

      <label style={{ display: 'block', marginBottom: 8 }}>
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: 8, marginTop: 4 }}
          placeholder="you@example.com"
        />
      </label>

      <label style={{ display: 'block', marginBottom: 16 }}>
        Password
        <input
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          style={{ width: '100%', padding: 8, marginTop: 4 }}
          placeholder="••••••••"
        />
      </label>

      {error && (
        <p style={{ color: 'tomato', marginBottom: 12, whiteSpace: 'pre-wrap' }}>
          {error}
        </p>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onLogin} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
        <button onClick={onSignup} disabled={loading}>
          {loading ? 'Creating...' : 'Create account'}
        </button>
      </div>
    </main>
  );
}
