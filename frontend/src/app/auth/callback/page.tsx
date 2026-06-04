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
      try {
        const code = new URLSearchParams(window.location.search).get('code');

        if (code) {
          // Browser client reads the PKCE code_verifier from its own localStorage
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error('exchangeCodeForSession error:', error.message);
            router.push('/login?error=' + encodeURIComponent(error.message));
            return;
          }
        }

        // Get the established session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('getSession error:', sessionError.message);
          router.push('/login?error=' + encodeURIComponent(sessionError.message));
          return;
        }

        if (session?.user) {
          setStatus('Signing in...');
          await syncSupabaseUser(session.user);
          router.replace('/');
        } else {
          router.push('/login?error=Session%20not%20found');
        }
      } catch (err: any) {
        console.error('Auth callback error:', err);
        router.push('/login?error=' + encodeURIComponent(err?.message || 'Authentication failed'));
      }
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
