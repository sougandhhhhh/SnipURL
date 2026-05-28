'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSnapStore } from '../../context/store';
import Link from 'next/link';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register, loading, user } = useSnapStore();
  const [choice, setChoice] = useState<'pick' | 'login' | 'register'>('pick');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (searchParams.get('tab') === 'register') setChoice('register');
    else if (searchParams.get('tab') === 'login') setChoice('login');
  }, [searchParams]);

  useEffect(() => {
    if (user) router.push('/dashboard');
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('All fields required.'); return; }
    if (choice === 'register' && !name) { setError('Name required.'); return; }
    try {
      const success = choice === 'login' ? await login(email, 'SaaS Partner') : await register(email, name);
      if (success) router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication error.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 relative">
      <div className="absolute top-1/4 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-ecto-green/3 blur-[120px] pointer-events-none" />

      <div className="glass-strong w-full max-w-md p-8 rounded-3xl glow-ecto">
        {choice === 'pick' ? (
          <>
            <div className="text-center space-y-2 mb-10">
              <img src="/logo.svg" alt="SnipURL" width="56" height="56" className="mx-auto mb-4" />
              <h2 className="font-display text-xl tracking-[0.05em] text-ghost-white">Welcome</h2>
              <p className="font-body text-sm text-ghost-white/40">Choose your path.</p>
            </div>
            <div className="flex flex-col gap-4">
              <button onClick={() => setChoice('login')} className="btn-ghost w-full justify-center py-4 text-sm">Sign In</button>
              <button onClick={() => setChoice('register')} className="btn-ghost w-full justify-center py-4 text-sm">Sign Up</button>
            </div>
            <div className="mt-6 text-center">
              <Link href="/" className="font-mono text-[10px] tracking-[0.15em] uppercase text-ghost-white/30 hover:text-ecto-green/60 transition-colors">
                &larr; Back to home
              </Link>
            </div>
          </>
        ) : (
          <>
            <button onClick={() => { setChoice('pick'); setError(''); setEmail(''); setPassword(''); setName(''); }}
              className="font-mono text-[10px] tracking-[0.15em] uppercase text-ghost-white/30 hover:text-ecto-green/60 transition-colors inline-flex items-center gap-1 mb-6 bg-transparent border-none cursor-pointer">
              &larr; Back
            </button>

            <div className="text-center space-y-2 mb-8">
              <img src="/logo.svg" alt="SnipURL" width="56" height="56" className="mx-auto mb-4" />
              <h2 className="font-display text-xl tracking-[0.05em] text-ghost-white">
                {choice === 'login' ? 'Return' : 'Summon'}
              </h2>
              <p className="font-body text-sm text-ghost-white/40">
                {choice === 'login' ? 'Enter your credentials.' : 'Create your account.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-xl bg-red-400/5 border border-red-400/20 p-3 font-mono text-[10px] text-red-400/80 text-center">
                  {error}
                </div>
              )}

              {choice === 'register' && (
                <input type="text" required value={name} onChange={e => setName(e.target.value)}
                  placeholder="Name"
                  className="w-full h-11 rounded-full bg-white/[0.04] border border-glass-border px-5 text-sm text-ghost-white placeholder-ghost-white/20 focus:border-ecto-green/40 focus:outline-none transition-colors font-body" />
              )}

              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full h-11 rounded-full bg-white/[0.04] border border-glass-border px-5 text-sm text-ghost-white placeholder-ghost-white/20 focus:border-ecto-green/40 focus:outline-none transition-colors font-body" />

              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full h-11 rounded-full bg-white/[0.04] border border-glass-border px-5 text-sm text-ghost-white placeholder-ghost-white/20 focus:border-ecto-green/40 focus:outline-none transition-colors font-body" />

              <button type="submit" disabled={loading} className="btn-ghost w-full justify-center">
                {loading ? 'Summoning...' : choice === 'login' ? 'Enter' : 'Register'}
              </button>
            </form>

            <div className="mt-6 border-t border-glass-border pt-4 text-center">
              <button onClick={() => { setChoice(choice === 'login' ? 'register' : 'login'); setError(''); }}
                className="font-mono text-[10px] tracking-[0.15em] uppercase text-ghost-white/30 hover:text-ecto-green/60 transition-colors bg-transparent border-none cursor-pointer">
                {choice === 'login' ? 'Summon an account' : 'Already summoned'}
              </button>
            </div>

          </>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-ecto-green/50 animate-pulse">Summoning...</div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
