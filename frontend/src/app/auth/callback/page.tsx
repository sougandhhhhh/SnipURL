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
      // Handle PKCE flow (code in query params) or implicit flow (tokens in hash)
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get('code');
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
      } else if (accessToken) {
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        });
      }

      // Now get the session
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setStatus('Signing in...');
        await syncSupabaseUser(session.user);
        router.push('/');
      } else {
        router.push('/login');
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
