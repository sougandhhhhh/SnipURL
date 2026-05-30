'use client';

import Link from 'next/link';
import { Scissors, ExternalLink, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-16 sm:px-6 lg:px-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="font-display text-2xl sm:text-3xl tracking-[0.05em] text-ghost-white">
          Welcome back
        </h1>
        <p className="font-body text-sm text-ghost-white/40 max-w-md mx-auto">
          Choose a tool to get started.
        </p>
      </div>

      <div className="mx-auto max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Link
          href="/dashboard"
          className="glass rounded-2xl p-8 glow-ecto hover:scale-[1.02] transition-all duration-300 group text-center space-y-4"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-ecto-green/10 border border-ecto-green/20 group-hover:bg-ecto-green/20 transition-colors">
            <Scissors className="h-6 w-6 text-ecto-green" />
          </div>
          <div>
            <h2 className="font-display text-base tracking-[0.05em] text-ghost-white">Shorten URL</h2>
            <p className="font-body text-xs text-ghost-white/40 mt-1">Create a shortened link from a long URL.</p>
          </div>
          <span className="inline-flex items-center gap-1 font-mono text-[9px] tracking-[0.15em] uppercase text-ecto-green/60 group-hover:text-ecto-green transition-colors">
            Open <ArrowRight className="h-3 w-3" />
          </span>
        </Link>

        <Link
          href="/expand"
          className="glass rounded-2xl p-8 glow-ecto hover:scale-[1.02] transition-all duration-300 group text-center space-y-4"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-ecto-green/10 border border-ecto-green/20 group-hover:bg-ecto-green/20 transition-colors">
            <ExternalLink className="h-6 w-6 text-ecto-green" />
          </div>
          <div>
            <h2 className="font-display text-base tracking-[0.05em] text-ghost-white">Expand URL</h2>
            <p className="font-body text-xs text-ghost-white/40 mt-1">Reveal the original destination of a short link.</p>
          </div>
          <span className="inline-flex items-center gap-1 font-mono text-[9px] tracking-[0.15em] uppercase text-ecto-green/60 group-hover:text-ecto-green transition-colors">
            Open <ArrowRight className="h-3 w-3" />
          </span>
        </Link>
      </div>

      <div className="mx-auto max-w-lg text-center">
        <Link href="/dashboard" className="font-mono text-[10px] tracking-[0.15em] uppercase text-ghost-white/30 hover:text-ecto-green/60 transition-colors">
          or go to your link vault &rarr;
        </Link>
      </div>
    </div>
  );
}
