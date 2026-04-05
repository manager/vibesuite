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
      <div className="text-center">
        <div className="text-2xl mb-2">✉️</div>
        <h3 className="text-lg font-medium mb-1">Check your email</h3>
        <p className="text-sm text-white/50">
          We sent a magic link to <span className="text-white/80">{email}</span>
        </p>
        <button
          onClick={() => setSent(false)}
          className="mt-4 text-xs text-white/30 hover:text-white/60 transition-colors"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-white text-black rounded-lg text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          {loading ? '...' : 'Enter'}
        </button>
      </div>
      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
    </form>
  );
}
