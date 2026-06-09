'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

function ResetContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;

    (async () => {
      const code = searchParams.get('code');

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          setError(exchangeError.message);
          setChecking(false);
          return;
        }
        setReady(true);
        setChecking(false);
        return;
      }

      setError('Invalid or expired reset link. Request a new one.');
      setChecking(false);
    })();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!password || !confirm) { setError('All fields required.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) { setError(updateError.message); setLoading(false); return; }
    setSuccess(true);
    setLoading(false);
    setTimeout(() => router.push('/login'), 3000);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="glass-strong w-full max-w-md p-8 rounded-3xl glow-ecto">
        <div className="text-center space-y-2 mb-8">
          <img src="/logo.svg" alt="SnipURL" width="56" height="56" className="mx-auto mb-4" />
          <h2 className="font-display text-xl tracking-[0.05em] text-ghost-white">Reset Password</h2>
          <p className="font-body text-sm text-ghost-white/40">
            {checking ? 'Verifying link...' : ready ? 'Enter your new password.' : ''}
          </p>
        </div>

        {success ? (
          <div className="text-center space-y-4">
            <div className="rounded-xl bg-ecto-green/5 border border-ecto-green/20 p-3 font-mono text-[10px] text-ecto-green/80">
              Password updated successfully! Redirecting to login...
            </div>
          </div>
        ) : checking ? (
          <div className="text-center font-mono text-[10px] tracking-[0.2em] uppercase text-ecto-green/50 animate-pulse">Verifying...</div>
        ) : !ready ? (
          <div className="text-center space-y-4">
            <div className="rounded-xl bg-red-400/5 border border-red-400/20 p-3 font-mono text-[10px] text-red-400/80">{error}</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-red-400/5 border border-red-400/20 p-3 font-mono text-[10px] text-red-400/80 text-center">{error}</div>
            )}
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              placeholder="New password"
              className="w-full h-11 rounded-full bg-white/[0.04] border border-glass-border px-5 text-sm text-ghost-white placeholder-ghost-white/20 focus:border-ecto-green/40 focus:outline-none transition-colors font-body" />
            <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)}
              placeholder="Confirm new password"
              className="w-full h-11 rounded-full bg-white/[0.04] border border-glass-border px-5 text-sm text-ghost-white placeholder-ghost-white/20 focus:border-ecto-green/40 focus:outline-none transition-colors font-body" />
            <button type="submit" disabled={loading} className="btn-ghost w-full justify-center">
              {loading ? 'Updating...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-ecto-green/50 animate-pulse">Verifying...</div>
      </div>
    }>
      <ResetContent />
    </Suspense>
  );
}
