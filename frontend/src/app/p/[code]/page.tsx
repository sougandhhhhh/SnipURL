'use client';

import { useState, useEffect, use } from 'react';
import { Lock, Unlock, ArrowRight, Link2, AlertCircle } from 'lucide-react';
interface PageProps {
  params: Promise<{ code: string }>;
}

export default function PasswordGatePage({ params }: PageProps) {
  const { code } = use(params);

  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setShaking(false);
    setLoading(true);

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/resolve/${encodeURIComponent(code)}`;
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to unlock');
        if (data.error === 'Incorrect password') { setShaking(true); setTimeout(() => setShaking(false), 500); }
        setPassword('');
        setLoading(false);
        return;
      }

      if (data.longUrl) {
        setIsUnlocked(true);
        setTimeout(() => { window.location.href = data.longUrl; }, 1000);
      }
    } catch {
      setErrorMsg('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 relative">
      <div className="absolute top-1/4 left-1/2 -z-10 h-80 w-80 -translate-x-1/2 rounded-full bg-amber-500/10 blur-[80px] pointer-events-none" />

      <div
        className={`glass-panel w-full max-w-md p-8 rounded-3xl border border-white/[0.08] text-center space-y-6 transition-all light:bg-white light:shadow-xl ${
          shaking ? 'animate-bounce' : ''
        }`}
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
          {isUnlocked ? (
            <Unlock className="h-6 w-6 animate-pulse text-emerald-400" />
          ) : (
            <Lock className="h-6 w-6" />
          )}
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white light:text-zinc-900">Password Protected Link</h2>
          <p className="text-xs text-muted-foreground">
            This short link redirect (`/{code}`) is encrypted. Please provide the authorized credential password to resolve the target destination.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="rounded-lg bg-red-500/10 p-3 text-xs font-semibold text-red-400 border border-red-500/20 flex items-center gap-1.5 justify-center">
              <AlertCircle className="h-4 w-4 shrink-0" /> {errorMsg}
            </div>
          )}

          {isUnlocked ? (
            <div className="rounded-lg bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
              ✓ Unlocked! Forwarding to target destination...
            </div>
          ) : (
            <div className="space-y-4">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter access password"
                className="w-full h-11 rounded-lg border border-white/10 bg-white/5 px-4 text-xs text-center text-white placeholder-muted-foreground outline-none focus:border-amber-500 light:border-zinc-200 light:bg-black/5 light:text-zinc-900"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded-lg bg-amber-500 font-semibold text-xs text-black hover:bg-amber-400 transition-all flex items-center justify-center gap-1 shadow-md shadow-amber-500/20"
              >
                {loading ? 'Verifying...' : 'Unlock Link'} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </form>

        <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground pt-4 border-t border-white/5 light:border-zinc-100">
          <Link2 className="h-3 w-3" /> Secure Redirects by SnapURL
        </div>
      </div>
    </div>
  );
}
