'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSnapStore } from '../../context/store';
import Link from 'next/link';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register, signInWithGoogle, loading, user } = useSnapStore();
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
    if (user) router.push('/home');
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('All fields required.'); return; }
    if (choice === 'register' && !name) { setError('Name required.'); return; }
    try {
      const success = choice === 'login' ? await login(email, password) : await register(email, password, name);
      if (success) router.push('/home');
    } catch (err: any) {
      setError(err.message || 'Authentication error.');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed.');
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
            <div className="flex flex-col gap-3">
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

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-glass-border" /></div>
              <div className="relative flex justify-center"><span className="bg-glass-strong px-3 font-mono text-[9px] tracking-[0.15em] uppercase text-ghost-white/30">or</span></div>
            </div>

            <button onClick={handleGoogleSignIn} className="btn-ghost w-full justify-center py-3 text-sm flex items-center gap-2">
              <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>

            <div className="mt-5 border-t border-glass-border pt-4 text-center">
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
