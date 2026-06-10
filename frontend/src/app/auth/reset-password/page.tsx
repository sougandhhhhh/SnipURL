'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { supabase } from '../../../lib/supabase';

function ResetContent() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const done = useRef(false);
  const tokenRef = useRef('');

  useEffect(() => {
    if (done.current) return;
    done.current = true;

    const params = new URLSearchParams(window.location.search);
    const hasCode = params.has('code');
    const customToken = params.get('token') || '';
    tokenRef.current = customToken;

    const maxAttempts = 20;
    let attempts = 0;

    const poll = async () => {
      while (attempts < maxAttempts) {
        attempts++;
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setReady(true);
          setChecking(false);
          return;
        }
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          setReady(true);
          setChecking(false);
          return;
        }
        await new Promise(r => setTimeout(r, 500));
      }
      if (customToken) {
        setReady(true);
        setChecking(false);
      } else if (hasCode) {
        setError('This link was opened on a different device. Please use the same device or request a new reset link.');
        setChecking(false);
      } else {
        setError('Invalid or expired reset link. Request a new one.');
        setChecking(false);
      }
    };

    poll();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!password || !confirm) { setError('All fields required.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);

    const customToken = tokenRef.current;
    if (customToken) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL!.replace(/\/+$/, '');
      try {
        const resp = await fetch(`${apiUrl}/api/v1/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: customToken, password }),
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error || 'Failed to reset password');
        if (data.email) {
          await supabase.auth.signInWithPassword({ email: data.email, password });
        }
      } catch (err: any) {
        setError(err.message || 'Failed to reset password');
        setLoading(false);
        return;
      }
    } else {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) { setError(updateError.message); setLoading(false); return; }
    }

    setSuccess(true);
    setLoading(false);
    setTimeout(() => { window.location.href = '/'; }, 3000);
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
              Password updated successfully! Redirecting...
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
