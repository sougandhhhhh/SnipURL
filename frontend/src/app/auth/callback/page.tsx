'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { useSnapStore } from '../../../context/store';

export default function AuthCallback() {
  const router = useRouter();
  const { syncSupabaseUser } = useSnapStore();

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session?.user) {
        router.push('/login');
        return;
      }
      try {
        await syncSupabaseUser(session.user);
        router.push('/dashboard');
      } catch {
        router.push('/login');
      }
    };
    handleCallback();
  }, [router, syncSupabaseUser]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-ecto-green/50 animate-pulse">
        Authenticating...
      </div>
    </div>
  );
}
