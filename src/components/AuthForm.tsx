'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function AuthForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Dev bypass: skip email auth for dev@localhost
      if (process.env.NODE_ENV === 'development' && email === 'dev@localhost') {
        window.location.href = '/map';
        return;
      }

      const result = await signIn('resend', {
        email,
        callbackUrl: '/map',
        redirect: false,
      });

      if (result?.error) {
        setError('Something went wrong. Please try again.');
      } else {
        setSent(true);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div style={{ textAlign: 'center' }}>
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.25rem',
            marginBottom: '0.5rem',
          }}
        >
          Check your email
        </p>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          We sent a magic link to <span style={{ color: 'var(--text-primary)' }}>{email}</span>
        </p>
        <button
          onClick={() => setSent(false)}
          style={{
            marginTop: '1.5rem',
            fontFamily: 'var(--font-ui)',
            fontSize: '0.7rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
            color: 'var(--text-tertiary)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '360px' }}>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          style={{
            flex: 1,
            fontFamily: 'var(--font-body)',
            fontSize: '0.9rem',
            padding: '0.6rem 1rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.7rem',
            fontWeight: 500,
            letterSpacing: '0.15em',
            textTransform: 'uppercase' as const,
            padding: '0.6rem 1.5rem',
            background: 'transparent',
            border: '1px solid var(--border-strong)',
            color: 'var(--text-primary)',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1,
            whiteSpace: 'nowrap' as const,
          }}
        >
          {loading ? '...' : 'Enter'}
        </button>
      </div>
      {error && (
        <p style={{ color: 'var(--accent)', fontSize: '0.8rem', marginTop: '0.5rem', fontFamily: 'var(--font-body)' }}>
          {error}
        </p>
      )}
    </form>
  );
}
