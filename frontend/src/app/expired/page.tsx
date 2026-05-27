'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';

function ExpiredContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code') || 'link';

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 relative">
      <div className="absolute top-1/4 left-1/2 -z-10 h-80 w-80 -translate-x-1/2 rounded-full bg-ecto-green/3 blur-[100px] pointer-events-none" />

      <div className="glass-strong w-full max-w-md p-8 rounded-3xl text-center space-y-6">
        <img src="/logo.svg" alt="SnipURL" width="56" height="56" className="mx-auto" />

        <div className="space-y-2">
          <h2 className="font-display text-xl tracking-[0.05em] text-ghost-white">Link Expired</h2>
          <p className="font-body text-sm text-ghost-white/40">
            The timer for /{code} has elapsed. Access has been terminated.
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Link href="/" className="btn-outline justify-center text-[10px] py-3">
            <ArrowLeft className="h-3.5 w-3.5" /> Home
          </Link>
          <Link href="/login?tab=register" className="btn-ghost justify-center text-[10px] py-3">
            <Plus className="h-3.5 w-3.5" /> Create Links
          </Link>
        </div>

        <div className="font-mono text-[9px] tracking-[0.15em] uppercase text-ghost-white/20 border-t border-glass-border pt-4">
          SnipURL &middot; Spectral Redirects
        </div>
      </div>
    </div>
  );
}

export default function ExpiredPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[85vh] flex items-center justify-center">
        <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-ecto-green/50 animate-pulse">Loading...</div>
      </div>
    }>
      <ExpiredContent />
    </Suspense>
  );
}
