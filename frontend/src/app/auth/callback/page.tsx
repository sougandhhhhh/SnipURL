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
      // Try getSession with retries (OAuth needs time to process the URL hash)
      for (let i = 0; i < 10; i++) {
        const { data: { session }, error } = await supabase.auth.getSession();
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
        if (error) {
          router.push('/login');
          return;
        }
        // Wait before retrying
        await new Promise(r => setTimeout(r, 500));
      }

      // Listen for auth state as fallback
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

      // Timeout after 10s
      setTimeout(() => {
        subscription.unsubscribe();
        router.push('/login');
      }, 10000);
    };
    handleCallback();
  }, [router, syncSupabaseUser]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-ecto-green/50 animate-pulse">
          {status}
        </div>
      </div>
    </div>
  );
}
