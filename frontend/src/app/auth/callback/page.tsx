'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { useSnapStore } from '../../../context/store';

export default function AuthCallback() {
  const router = useRouter();
  const { syncSupabaseUser } = useSnapStore();
  const [status, setStatus] = useState('Authenticating...');

  useEffect(() => {
    const handleCallback = async () => {
      // Extract auth params from URL hash (OAuth redirect)
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken) {
        setStatus('Exchanging token...');
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        });
        if (data?.session?.user) {
          setStatus('Signing in...');
          try {
            await syncSupabaseUser(data.session.user);
            router.push('/dashboard');
            return;
          } catch {
            router.push('/login');
            return;
          }
        }
        if (error) {
          router.push('/login');
          return;
        }
      }

      // Fallback: try getSession
      for (let i = 0; i < 5; i++) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setStatus('Signing in...');
          try {
            await syncSupabaseUser(session.user);
            router.push('/dashboard');
            return;
          } catch {
            router.push('/login');
            return;
          }
        }
        await new Promise(r => setTimeout(r, 600));
      }

      // Last resort: listen for auth state
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          subscription.unsubscribe();
          setStatus('Signing in...');
          try {
            await syncSupabaseUser(session.user);
            router.push('/dashboard');
          } catch {
            router.push('/login');
          }
        }
      });

      setTimeout(() => {
        subscription.unsubscribe();
        router.push('/login');
      }, 10000);
    };
    handleCallback();
  }, [router, syncSupabaseUser]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-ecto-green/50 animate-pulse">
        {status}
      </div>
    </div>
  );
}
